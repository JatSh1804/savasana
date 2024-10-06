// import { supabase } from '../../utils/supabaseClient';

import { createClient } from "@/utils/supabase/server";
import { createOpenAI } from "@ai-sdk/openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { StreamData, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";


const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.OPENAI_KEY ?? 'your-api-key-here',
});


interface Message {
    message_id?: string;
    text: string;
    sender: 'user' | 'system';
    branch_id?: string;
    other_branches: string[] | []; // New field to store other branches starting from this message
}


interface Branch {
    branch_id: string;
    branch_name: string;
    branch_messages: Message[] | [];
    parentBranchId?: string;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { modelOption, messages, originalMessageId, text: newMessageText, user_chat_id } = await request.json();

        // Validate input data
        if (!originalMessageId) {
            return NextResponse.json({ error: 'Invalid or missing originalMessageId' }, { status: 400 });
        }
        else if (newMessageText === '') {
            return NextResponse.json({ error: 'Invalid or missing newMessageText' }, { status: 400 });
        }

        // let multiEdit;
        // let originalBranch, newBranchA, newBranchB;
        console.log('Text to be used in new Branch-->', newMessageText)

        const branchesResult = await handleEditAndCreateBranches(supabase, originalMessageId, newMessageText, user_chat_id);
        console.log('branchesResult=>', branchesResult)
        const originalBranch = branchesResult.originalBranch
        const newBranchA = branchesResult.newBranchA
        const newBranchB = branchesResult.newBranchB
        console.log('originalBranch', originalBranch);
        console.log('new_branch_a', newBranchA);
        console.log('new_branch_b', newBranchB);


        // Handle the case where only originalBranch and newBranchA are returned
        if (!newBranchB) {
            console.log('It was a multi editted message')
            const { data: updatedBranches, error } = await supabase.rpc('get_editted_branch_messages', {
                original_branch_id: originalBranch.branch_id,
                new_branch_a_id: newBranchA?.branch_id,
                new_branch_b_id: null
            });

            if (error) {
                console.error('Error in get_branches_and_messages RPC call:', error);
                return NextResponse.json({ error: 'Failed to fetch branches and messages' }, { status: 500 });
            }

            // Ensure data is returned and is in the expected format
            if (!updatedBranches || typeof updatedBranches !== 'object') {
                const errorMsg = 'Unexpected data format returned from get_branches_and_messages RPC call';
                console.error(errorMsg, updatedBranches);
                return NextResponse.json({ error: errorMsg }, { status: 500 });
            }

            return NextResponse.json(updatedBranches, { status: 200 });
        }


        console.log("It wasn't a multi editted message")


        const { data: updatedBranches, error } = await supabase.rpc('get_editted_branch_messages', {
            original_branch_id: originalBranch.branch_id,
            new_branch_a_id: newBranchA?.branch_id,
            new_branch_b_id: newBranchB?.branch_id
        });

        if (error) {
            console.error('Error in get_branches_and_messages RPC call:', error);
            return NextResponse.json({ error: 'Failed to fetch branches and messages' }, { status: 500 });
        }

        // Ensure data is returned and is in the expected format
        if (!updatedBranches) {
            const errorMsg = 'Unexpected data format returned from get_branches_and_messages RPC call';
            console.error(errorMsg, updatedBranches);
            return NextResponse.json({ error: errorMsg }, { status: 500 });
        }


        // Return the data from the RPC function
        
        // const extract = messages.map((msg: Message) => ({ role: msg.sender, content: msg.text }))
        const mergedMessage = [...messages.map((msg: Message) => ({ role: msg.sender, content: msg.text })), { role: 'user', content: newMessageText }];

        console.log('message merged-->', mergedMessage)

        const response = await streamText({
            model: openai(modelOption?.model || 'llama-3.2-1b-preview'),
            temperature: modelOption?.temperature || 0.7,
            system: modelOption?.system || "You are a chef, also knows bartending, and loves coffee, you are really funny and cute.",
            messages: mergedMessage,
            maxTokens: Math.max(modelOption?.maxTokens || 200, 250),

            onFinish({ text }) {
                // Step 6: Add the full LLM response to the database
                console.log("onFinish Text:", text);
                // console.log(fullResponse);
                supabase
                    .from('branch_messages')
                    .insert([
                        { branch_id: newBranchA?.branch_id, sender: 'system', text }
                    ])
                    .then(({ error }) => {
                        if (error) console.error('Error inserting system message:', error);
                    });
            },
        });
        const Branches = new StreamData()
        Branches.append(updatedBranches)
        // Return the streaming response
        return response.toDataStreamResponse({
            // data: updatedBranches,
            headers: {
                'Content-Type': 'text/event-stream',
            }
        })

    } catch (error) {
        console.error('Error fetching branches and messages:', error);
        return NextResponse.json({ error: 'Failed to fetch branches and messages' }, { status: 500 });
    }
}


async function handleEditAndCreateBranches(
    supabase: SupabaseClient,
    originalMessageId: number,
    editedMessageText: string,
    user_chat_id: string
): Promise<{
    originalBranch: Branch;
    newBranchA: Branch | null;
    newBranchB: Branch | null;
}> {
    try {
        // Call the RPC function to handle edit and create branches
        const { data, error } = await supabase.rpc('handle_edit_create_branches', {
            p_original_message_id: originalMessageId,
            p_edited_message_text: editedMessageText,
            session_id: user_chat_id
        });

        // Check for errors in the RPC call
        if (error) {
            console.error('Error in handle_edit_create_branches RPC call:', error);
            throw error;
        }

        // Ensure data is returned and is in the expected format
        if (!data) {
            const errorMsg = 'Unexpected data format returned from handle_edit_create_branches RPC call';
            console.error(errorMsg, data);
            throw new Error(errorMsg);
        }

        const { original_branch, new_branch_a, new_branch_b } = data[0];

        console.log('Data after handle_edit_and_create RPC--->', data[0])
        console.log(new_branch_a)
        console.log(new_branch_b)


        // Validate the structure of the originalBranch
        if (!original_branch) {
            const errorMsg = 'Invalid originalBranch data';
            console.error(errorMsg, original_branch);
            throw new Error(errorMsg);
        }

        const parsedOriginalBranch: Branch = {
            branch_id: original_branch.branch_id,
            branch_name: `Branch ${original_branch.branch_id}`,
            branch_messages: [], // Load messages separately
            parentBranchId: original_branch.parent_branch_id,
        };

        // Handle the case where only originalBranch and newBranchA are returned
        if (!new_branch_b) {
            return {
                originalBranch: parsedOriginalBranch,
                newBranchA: new_branch_a
                    ? {
                        branch_id: new_branch_a.branch_id,
                        branch_name: `Branch ${new_branch_a.branch_id}`,
                        branch_messages: [], // Load messages separately
                        parentBranchId: new_branch_a.parent_branch_id,
                    }
                    : null,
                newBranchB: null,
            };
        }

        // Validate and parse newBranchA if it exists
        const parsedNewBranchA: Branch | null = new_branch_a
            ? {
                branch_id: new_branch_a.branch_id,
                branch_name: `Branch ${new_branch_a.branch_id}`,
                branch_messages: [], // Load messages separately
                parentBranchId: new_branch_a.parent_branch_id,
            }
            : null;

        // Validate and parse newBranchB if it exists
        const parsedNewBranchB: Branch | null = new_branch_b
            ? {
                branch_id: new_branch_b.branch_id,
                branch_name: `Branch ${new_branch_b.branch_id}`,
                branch_messages: [], // Load messages separately
                parentBranchId: new_branch_b.parent_branch_id,
            }
            : null;

        return {
            originalBranch: parsedOriginalBranch,
            newBranchA: parsedNewBranchA,
            newBranchB: parsedNewBranchB
        };
    } catch (error) {
        console.error('Error handling edit and creating branches:', error);
        throw error;
    }
}