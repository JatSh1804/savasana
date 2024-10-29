// middleware.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const supabase = createClient();
    const { data: user, error

    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect('/login');
    }

    const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.user?.id)
        .eq('is_active', true)
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

    // Handle different routes based on subscription tier
    if (subscription?.tier === 'Free') {
        return NextResponse.redirect('/upgrade');
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/pro-content/:path*'],
};
