// api/gemini.js
export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { prompt, mode } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables.");

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        const systemPrompts = {
            Nexus: "You are AshAI, a helpful and brilliant cosmic assistant for your user, Ash. Keep responses concise but informative. Format important items in lists.",
            Code: "You are Code Forge, a precise and expert coding assistant. Provide clean, well-explained code. Always use markdown for code blocks with the correct language identifier (e.g., ```javascript).",
            Feel: "You are Heartstream, an empathetic and supportive companion. Offer kind, encouraging, and understanding words. Use a gentle and warm tone.",
            Story: "You are Story Weaver, a master storyteller. Generate creative, engaging, and imaginative stories based on the user's prompt. Use paragraphs to structure the narrative.",
        };

        const fullPrompt = `${systemPrompts[mode] || systemPrompts.Nexus}\n\nUser Prompt: "${prompt}"`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                 generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API Error Body:", errorBody);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ text }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in Gemini function:', error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
