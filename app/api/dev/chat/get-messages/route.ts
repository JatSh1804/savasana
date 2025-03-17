// Function to fetch branches and their messages for a specific chat session

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq"
import { streamText } from "ai";
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

            if (!branchesWithMessages) {
                return NextResponse.json({ branches: [] }); // Return an empty array instead of an empty Response
            }

            return NextResponse.json({ branches: branchesWithMessages });
        }

        // Return a default response if sessionId is not provided
        return NextResponse.json({ branches: [] }); // or some meaningful default
    } catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


const openai = createOpenAI({
    baseURL: process.env.OPENAI_URL ?? 'https://api.groq.com/openai/v1',
    apiKey: process.env.OPENAI_KEY ?? 'your-api-key-here',
});
const groq = createGroq({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.OPENAI_KEY
})

// Helper function to transform sheet data to a markdown table for context
function transformSheetDataToMarkdown(sheetData: any) {
    if (!sheetData || !sheetData.headers || !sheetData.rows) return '';

    const { headers, rows } = sheetData;
    let markdown = '| ' + headers.join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

    // Add a limited number of rows to avoid context length issues
    const maxRows = Math.min(rows.length, 100);
    for (let i = 0; i < maxRows; i++) {
        const row = rows[i];
        markdown += '| ' + row.map((cell: any) => cell !== undefined && cell !== null ? cell : '').join(' | ') + ' |\n';
    }

    // Add a note if we're truncating the data
    if (rows.length > maxRows) {
        markdown += `\n*Note: Showing ${maxRows} of ${rows.length} rows*\n`;
    }

    return markdown;
}

export async function POST(request: NextRequest): Promise<Response> {
    const supabase = createClient();
    const requestData = await request.json();
    const { messages, modelOption, isSheetMode, sheetData } = requestData;

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
                return new NextResponse(error.message, { status: 403 });
            } else {
                console.error('An unexpected error occurred:', error.message);
                return new NextResponse('An unexpected error occurred', { status: 405 });
            }
        }
        console.log('Tokens decremented successfully.');

        // Create the system prompt based on mode (regular chat vs sheet analysis)
        let systemPrompt = modelOption?.system || "You are a helpful assistant.";

        if (isSheetMode && sheetData) {
            // Enhanced system prompt for sheet analysis
            systemPrompt = `You are an advanced data analysis assistant specialized in analyzing spreadsheet data.
            
I'm providing you with a spreadsheet that has ${sheetData.rows.length} rows and ${sheetData.headers.length} columns.
The headers for this data are: ${sheetData.headers.join(', ')}.

Your task:
1. Analyze the user's question about this data
2. Provide a clear, concise answer based on the data
3. When appropriate, include data visualizations by outputting chart specifications in the following format:

\`\`\`<chart>
{
  "type": "bar|line|pie|scatter",
  "labels": ["label1", "label2", ...],
  "datasets": [
    {
      "label": "Dataset Label",
      "data": [value1, value2, ...]
    }
  ],
  "title": "Chart Title"
}
</chart>\`\`\`
4. Always output the json for the chart between <chart></chart> tags.

Always explain your data insights in plain language before presenting charts. Be prepared to handle queries about calculations, trends, patterns, outliers, and statistics.

Strict Instruction:
1. Always try to generate graphs and charts for the relevant data of the user prompt.
2. Never uses the context from previous messages to answer regard any data analysis, only use the sample data provided by the user. 
3. Always try to answer only to the prompt asked by the user. Try to directly answer the prompt.
Here's a sample of the data:
${transformSheetDataToMarkdown(sheetData)}`;
        }

        console.log('modelOption--->', modelOption)
        const response = await streamText({
            model: openai("llama3-70b-8192"),
            // model: groq('llama3-70b-8192'),
            temperature: modelOption?.temperature || 0.2,
            system: systemPrompt,
            messages: messages,
            maxTokens: 8192,
        });

        // Return the streaming response
        return response.toDataStreamResponse({
            headers: {
                'Content-Type': 'text/event-stream',
            }
        });
    }
    catch (error) {
        console.error('Error in sendMessage:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}