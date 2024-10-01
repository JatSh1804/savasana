// File: app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    // supabase.auth.admin.deleteUser()

    if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('user authId-->', user.id)
    // const token=await supabase.
    try {
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

        return new NextResponse(JSON.stringify({ tokens: userProfile.tokens }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}