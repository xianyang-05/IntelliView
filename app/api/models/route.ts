import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/models');

        if (!response.ok) {
            return NextResponse.json({ models: [], default: "claude-sonnet-4" }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Models proxy error:", error);
        return NextResponse.json({ models: [], default: "claude-sonnet-4" }, { status: 500 });
    }
}
