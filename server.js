require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dialogflow = require("@google-cloud/dialogflow");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Load Dialogflow credentials
const CREDENTIALS_PATH = "/etc/secrets/dialogflow-key.json";
console.log("first");
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

const sessionClient = new dialogflow.SessionsClient({ credentials });

// Function to send text to Dialogflow
async function detectIntent(text, sessionId) {
  const sessionPath = sessionClient.projectAgentSessionPath(
    credentials.project_id,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: { text: text, languageCode: "en" },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult.fulfillmentText || null;
}

// Function to get a response from GPT/Mistral AI if Dialogflow fails
async function getAIResponse(prompt) {
  const apiKey = process.env.OPENAI_API_KEY; // Or use Mistral API
  const apiUrl = "https://api.openai.com/v1/chat/completions"; // OpenAI API

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo", // Use "mistral-7b-instruct" for Mistral AI
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Model Error:", error);
    return "I'm sorry, but I couldn't process that.";
  }
}

// API Endpoint to handle voice commands
app.post("/command", async (req, res) => {
  const { voiceText } = req.body;

  try {
    let responseText = await detectIntent(voiceText, "12345");

    if (!responseText || responseText.includes("Sorry, I didn't get that")) {
      responseText = await getAIResponse(voiceText); // Use GPT/Mistral AI
    }

    res.json({ message: responseText });
  } catch (error) {
    console.error("Error processing command:", error);
    res.status(500).json({ message: "Error processing command." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
