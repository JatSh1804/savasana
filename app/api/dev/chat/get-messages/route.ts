// Function to fetch branches and their messages for a specific chat session

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { StreamData, streamText } from "ai";
import { SupabaseClient } from "@supabase/supabase-js";


const fetchBranchesWithMessages = async (supabase: SupabaseClient, chatSessionId: string) => {
    // const supabase = createClient();
    const { data, error } = await supabase
        .from('user_chat_branches')
        .select(`
        *,
        branch_messages (
          message_id, branch_id, text, sender, other_branches
        )
      `)
        .eq('user_chat_id', chatSessionId)
        .order('message_id', { referencedTable: 'branch_messages', ascending: true });

    if (error) {
        console.error('Error fetching branches and messages:', error);
        return null;
    }
    return data; // This will return an array of branches with their messages
};

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const url = request.nextUrl;
        const sessionId = url.searchParams.get('sessionId');

        if (sessionId) {
            const branchesWithMessages = await fetchBranchesWithMessages(supabase, sessionId);

            if (!branchesWithMessages) return [];

            return NextResponse.json({ branches: branchesWithMessages })
        }
    }
    catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}



const openai = createOpenAI({

    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.OPENAI_KEY ?? 'your-api-key-here',
});

export async function POST(request: NextRequest) {
    const supabase = createClient()
    const { branch_id, messages, modelOption } = await request.json();


    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('auth_id:', user?.id)
        if (authError || !user) { return new NextResponse('Unauthorized', { status: 401 }); }

        const { data: tokenData, error } = await supabase.rpc('check_and_decrement_tokens', { user_auth_id: user.id });



        if (error) {
            console.log(error)
            if (error.message === 'User not found') {
                console.error('Error: The specified user does not exist.');
                return new NextResponse('Unauthorized', { status: 401 });
            } else if (error.message === 'Insufficient tokens') {
                console.error('Error: You do not have enough tokens.');
                return new NextResponse(error.message, { status: 403 }); return;
            } else {
                console.error('An unexpected error occurred:', error.message);
                return new NextResponse('An unexpected error occurred', { status: 405 })
            }
        }
        console.log('Tokens decremented successfully.');

        // Step 1: Fetch all messages in the current branch
        // const { data: branchMessages, error: fetchError } = await supabase
        //     .from('branch_messages')
        //     .select('*')
        //     .eq('branch_id', branchId);
        // if (fetchError) throw fetchError;
        // const messages = [...branchMessages, userMessage]

        // const { messages, branch_id, modelOption }=await request.json

        // const data = new StreamData()

        const response = await streamText({
            model: openai(modelOption?.model || 'llama-3.2-1b-preview'),
            temperature: modelOption?.temperature || 0.7,
            system: modelOption?.system || "You are a chef, also knows bartending, and loves coffee, you are really funny and cute.",
            messages: messages,
            maxTokens: Math.max(modelOption?.maxTokens || 200, 250),

            // onFinish({ text }) {
            //     // Step 6: Add the full LLM response to the database
            //     // console.log("onFinish Text:", text);
            //     // console.log(fullResponse);

            //     // setTimeout(() => {
            //     //     data.append({ branch_id: 'llama-3.2-1b-preview' })
            //     //     data.close();
            //     // }, 2000)

            // },
        });
        // Return the streaming response
        return response.toDataStreamResponse({
            // data,
            headers: {
                'Content-Type': 'text/event-stream',
            }
        })
    }
    catch (error) {
        console.error('Error in sendMessage:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}