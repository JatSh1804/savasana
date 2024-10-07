import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Your logic here
    return NextResponse.json({ message: "Success" });
}