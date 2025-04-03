require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/command', async (req, res) => {
    const { voiceText } = req.body;

    try {
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: voiceText }]
        });

        const responseText = aiResponse.choices[0]?.message?.content || "I didn't understand that.";
        res.json({ message: responseText });
        console.log("Rsponse::",responseText);

    } catch (error) {
        console.error("AI processing error:", error);
        res.status(500).json({ message: "Error processing command." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
