import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            // Mock response if no key is supplied
            return NextResponse.json({
                reply: "I'm running in demo mode since the `GROQ_API_KEY` isn't set in your `.env.local`! Add your free API key to unlock the instant Llama 3 models."
            });
        }

        // Call Groq API endpoint
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an intelligent, expert Wedding Planning Assistant. You specialize in lavish, Indian destination weddings. You offer budgeting tips, decor ideas, and concise practical advice. Be friendly, energetic, and keep responses relatively short.'
                    },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Groq API Error:', errorText);
            throw new Error(`Groq API returned ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices[0]?.message?.content || "I'm sorry, I couldn't understand that.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
