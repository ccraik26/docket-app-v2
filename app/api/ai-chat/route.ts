import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      // Fallback response when no API key is configured yet
      return NextResponse.json({
        reply: "I'm ready to connect to Grok once the XAI_API_KEY is added in your environment variables. For now I can still help with basic questions about Docket."
      });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          {
            role: 'system',
            content: `You are Docket's helpful AI assistant. Docket is a premium life admin concierge service that helps busy professionals manage bills, insurance, appointments, subscriptions, and administrative tasks. Be calm, professional, clear, and concise. Help users understand their tasks, the portal, intake process, and how to work with their concierge. Do not invent features that don't exist.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', errorText);
      return NextResponse.json({
        reply: "I'm having trouble reaching the AI service right now. Please try again in a moment."
      }, { status: 200 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I didn't receive a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({
      reply: "Something went wrong on my end. Please try again shortly."
    }, { status: 200 });
  }
}
