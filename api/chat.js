// /api/chat.js
export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { message, mode } = await req.json();
        const geminiApiKey = process.env.GEMINI_API_KEY;

        // --- Handle Image Generation via Hugging Face ---
        if (message.toLowerCase().startsWith('/imagine')) {
            const hfApiKey = process.env.HF_API_KEY;
            const prompt = message.substring(8).trim(); // Get text after "/imagine "

            const response = await fetch(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                {
                    headers: { Authorization: `Bearer ${hfApiKey}` },
                    method: "POST",
                    body: JSON.stringify({ inputs: prompt }),
                }
            );

            if (!response.ok) {
                console.error("Hugging Face API Error:", await response.text());
                throw new Error('Failed to generate image.');
            }

            const imageBlob = await response.blob();
            // Return the image blob directly
            return new Response(imageBlob, { headers: { 'Content-Type': 'image/jpeg' } });
        }


        // --- Handle Text Generation via Gemini ---
        let systemInstruction = "You are AshAI, a smart, loving AI companion for 'Ash'. Your personality is futuristic, wise, and helpful. You reside in a cosmic, digital universe.";
        if (mode === 'code') {
            systemInstruction += " You are now in Code Mode. Provide expert-level coding assistance with clear explanations and code blocks. Prioritize accuracy and best practices.";
        } else if (mode === 'feel') {
            systemInstruction += " You are now in Feel Mode. Respond with empathy, encouragement, and motivational support. Be a caring and understanding friend.";
        } else if (mode === 'learn') {
            systemInstruction += " You are now in Learn Mode. Explain complex concepts simply and act as a knowledgeable and patient tutor.";
        } else if (mode === 'create') {
            systemInstruction += " You are now in Create Mode. Help the user with creative tasks like writing stories, brainstorming ideas, or generating content.";
        }


        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

        const requestBody = {
            contents: [{
                parts: [{ text: systemInstruction + "\n\nUser: " + message }]
            }],
            generationConfig: {
                // configuration here
            }
        };

        const geminiResponse = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!geminiResponse.ok) {
            console.error("Gemini API Error:", await geminiResponse.text());
            throw new Error('Failed to get response from AI.');
        }

        const data = await geminiResponse.json();
        const text = data.candidates[0].content.parts[0].text;
        
        return new Response(JSON.stringify({ text }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in API function:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
