require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Mistral API Endpoint & Model
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-tiny"; // or use 'mistral-small', 'mistral-medium'

app.post("/command", async (req, res) => {
  const { voiceText } = req.body;

  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: MISTRAL_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a friendly AI voice assistant named Jarvis.",
          },
          { role: "user", content: voiceText },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ message: reply });
  } catch (error) {
    console.error("Mistral API error:", error?.response?.data || error.message);
    res
      .status(500)
      .json({ message: "Something went wrong while processing your request." });
  }
});

app.listen(PORT, () => {
  console.log(`Mistral-based Jarvis backend running on port ${PORT}`);
});
