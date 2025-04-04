require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dialogflow = require("@google-cloud/dialogflow");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Load Dialogflow credentials
const CREDENTIALS_PATH = path.join(__dirname, "apiKey", "dialogflow-key.json");
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const sessionClient = new dialogflow.SessionsClient({ credentials });

// Function to send user input to Dialogflow
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
  return responses[0].queryResult.fulfillmentText;
}

// API Endpoint to handle voice commands
app.post("/command", async (req, res) => {
  const { voiceText } = req.body;

  try {
    const responseText = await detectIntent(voiceText, "12345");
    res.json({ message: responseText });
  } catch (error) {
    console.error("Dialogflow error:", error);
    res.status(500).json({ message: "Error processing command." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
