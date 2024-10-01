// File: app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from '@/utils/supabase/server';

const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.OPENAI_KEY ?? 'your-api-key-here',
});

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    // supabase.auth.admin.deleteUser()

    if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('user authId-->', user.id)
    // const token=await supabase.
    try {
        const { messages, modelOption } = await request.json();
        console.log("Configure Model---->")
        console.log(modelOption)
        console.log(Math.min(modelOption?.maxTokens || 200, 250))

        if (!messages || !modelOption) {
            return new NextResponse('Missing messages or modelOption in the request body', { status: 400 });
        }


        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('tokens')
            .eq('id', user.id)
            .single();


        console.log(userProfile)
        if (profileError || !userProfile) {
            console.log(profileError)
            return new NextResponse('User profile not found', { status: 404 });
        }

        // Check if the user has enough tokens
        if (userProfile.tokens > 0) {
            // Deduct 1 token
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ tokens: userProfile.tokens - 1 })
                .eq('id', user.id);

            if (updateError) {
                return new NextResponse('Failed to update token count', { status: 500 });
            }


            let chunk = '';
            const response = await streamText({
                model: openai(modelOption?.model || 'llama-3.2-1b-preview'),
                temperature: modelOption?.temperature || 0.7,
                system: modelOption?.system || "You are a chef, also knows bartending, and loves coffee, you are really funny and cute.",
                messages,
                maxTokens: Math.min(modelOption?.maxTokens || 200, 250),
                onChunk(event) {
                    chunk += event.chunk;
                    console.log(chunk)
                }, onFinish(event) {
                    console.log('Complete chunk:', event.text);
                },
            });


            return response.toTextStreamResponse({
                headers: {
                    'Content-Type': 'text/event-stream',
                }
            });
        } else {
            return new NextResponse("You don't have enough tokens", { status: 403 });
        }
    } catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}