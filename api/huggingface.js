// api/huggingface.js
export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }
    
    try {
        const { prompt } = await request.json();
        const apiKey = process.env.HUGGING_FACE_API_KEY;
        if (!apiKey) throw new Error("HUGGING_FACE_API_KEY is not set in environment variables.");
        
        // This is a popular and reliable free model.
        const API_URL = "[https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5](https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5)";

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
             const errorBody = await response.text();
             console.error("Hugging Face API Error Body:", errorBody);
            throw new Error(`Hugging Face API Error: ${response.status}`);
        }

        // The response is the image binary data itself
        const imageBlob = await response.blob();

        return new Response(imageBlob, {
            headers: { 'Content-Type': 'image/jpeg' },
        });

    } catch (error) {
        console.error('Error in Hugging Face function:', error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
