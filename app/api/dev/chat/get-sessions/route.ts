import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

const fetchAllChatSessions = async (supabase: SupabaseClient, userId: string) => {

    const { data, error } = await supabase
        .from('user_chats')
        .select('chat_topic, user_chat_id, default_branch_id, last_branch_created_branch_id, modeloption')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching chat sessions:', error);
        return null;
    }

    return data; // This will return an array of chat session objects
};

// Function to fetch all chat sessions with branches and messages for a user
// const fetchAllChatSessionsWithBranchesAndMessages = async (userId: string) => {
// Fetch all chat sessions for the user


// Iterate over each chat session and fetch branches and messages
// const chatSessionsWithBranches = await Promise.all(chatSessions.map(async (session) => {
//     const branches = await fetchBranchesWithMessages(session.id);

//     return {
//         ...session, // Include chat session details
//         branches // Attach branches with messages
//     };
// }));

//     return chatSessionsWithBranches;
// };


export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        console.log('DEBUG:----> Received a get-sessions request')
        // const { sessionId } = await request.json();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) { return new NextResponse('Unauthorized', { status: 401 }); }


        const chatSessions = await fetchAllChatSessions(supabase, user.id);
        console.log('Debug:---> chatSessions:', chatSessions)

        if (!chatSessions) {
            return NextResponse.json({ sessions: [], status: 'No Active Sessions!' })
        };
        return NextResponse.json({ sessions: chatSessions, status: 'Received Active Sessions!' })

    }
    catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) { return new NextResponse('Unauthorized', { status: 401 }); }
    try {
        const [data] = await createChatSessionWithDefaultBranch(supabase, user.id);
        if (!data) {
            throw new Error('Failed to create chat session');
        }
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error in GET /send-message:', error);
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
    }
}

// const createChatSession = async (supabase: SupabaseClient, userId: string) => {
//     console.log('Debug:-->Creating ChatSession:', userId,)

//     const uniqueChatId = uuidv4();

//     const { data, error } = await supabase
//         .from('user_chats')
//         .insert([{ user_id: userId, user_chat_id: uniqueChatId }])
//         .select('user_chat_id, default_branch_id, chat_topic'); // Specify the fields you want to select


//     console.log('Created ChatSession:', data);

//     if (error) {
//         console.error('Error inserting chat session:', error);
//         throw error;
//     }

//     return data;
// }

const createChatSessionWithDefaultBranch = async (supabase: SupabaseClient, userId: string) => {
    console.log('Debug:-->Creating chat Session UserId:', userId,)

    const chatSessionId = uuidv4();
    const default_branch_id = uuidv4();

    console.log('debug: chatSessionId->', chatSessionId);
    console.log('debug: default_branch_id->', default_branch_id);



    const { data: chatSessionData, error } = await supabase
        .from('user_chats')
        .insert([{ user_id: userId, user_chat_id: chatSessionId, default_branch_id, last_branch_created_branch_id: default_branch_id }])
        .select('user_chat_id, default_branch_id, chat_topic, last_branch_created_branch_id') // Specify the fields you want to select);

    console.log('Created ChatSession:', chatSessionData);

    if (error) {
        console.error('Error inserting chat session:', error);
        throw error;
    }


    // const chatSessionId = chatSessionData[;

    // Step 2: Create a default root branch in user_chats_branches
    const { data: branchData, error: branchError } = await supabase
        .from('user_chat_branches')
        .insert([{ user_chat_id: chatSessionId, branch_id: default_branch_id, branch_name: 'Root Branch' }])
        .select();

    if (branchError) {
        console.error('Error creating root branch:', branchError);
        throw branchError;
    }

    // const branchId = branchData[0].branch_id;

    // Step 3: Update the user_chats table with the default branch ID
    // const { error: updateError } = await supabase
    //     .from('user_chats')
    //     .update({ default_branch_id: branchId })
    //     .eq('id', chatSessionId);

    // if (updateError) {
    //     console.error('Error updating default branch ID:', updateError);
    //     throw updateError;
    // }

    console.log('Chat session and root branch created successfully');
    return chatSessionData;
};
