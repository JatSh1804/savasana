// app/api/subscription/upgrade/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const supabase = createClient();
    console.log('Debug:--> Received a upgrade request')
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newTier } = await req.json(); // Accepts 'Pro' or 'Plus'
    if (!['Pro', 'Plus'].includes(newTier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }
    console.log('Debug:  user_id-->', user.id, newTier)

    const { data, error } = await supabase.rpc('handle_subscription_upgrade', {
        p_user_id: user.id,
        new_tier: newTier,
    });

    if (error) {
        console.log('Debug:: Upgradation Error:-->', error)
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Subscription upgraded successfully' });
}
