import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

// Only use dotenv in development (not on Render)
if (process.env.NODE_ENV !== 'production') {
    import('dotenv').then(dotenv => dotenv.config());
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/correct-text', async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.API_KEY;
    const prompt = `${process.env.PROMPT}\n"${text}"`;

    if (!apiKey || !prompt) {
        return res.status(500).json({ error: 'API_KEY or PROMPT environment variable not set' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    { parts: [{ text: prompt }] }
                ]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
            res.json({ correctedText: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: 'Unexpected API response', details: data });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from API', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
