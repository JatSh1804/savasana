// File: app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.OPENAI_KEY ?? 'your-api-key-here',
});

export async function POST(request: NextRequest) {
    try {
        const { messages, modelOption } = await request.json();

        if (!messages || !modelOption) {
            return new NextResponse('Missing messages or modelOption in the request body', { status: 400 });
        }
        let chunk = '';
        const response = await streamText({
            model: openai('llama-3.2-1b-preview'),
            temperature: modelOption?.temperature || 0.7,
            system: "You are a chef, also knows bartending, and loves coffee, you are really funny and cute.",
            messages,
            maxTokens: modelOption?.maxTokens || 200,
            onChunk(event) {
                chunk += event.chunk;
            }, onFinish(event) {
                console.log('Complete chunk:',event.text);
            },
        });


        return response.toTextStreamResponse({
            headers: {
                'Content-Type': 'text/event-stream',
            }
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}