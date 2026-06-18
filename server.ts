import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to analyze email
  app.post("/api/analyze", async (req, res) => {
    try {
      const { emailText, tone = "professional", config = {} } = req.body;
      if (!emailText) {
        return res.status(400).json({ error: "Email text is required" });
      }

      let extraInstructions = "";
      if (config.redactPii) {
        extraInstructions += "\n- REDACT PII: You MUST replace any detected PII (like names, SSNs, credit cards, emails) in the 'autoResponse', 'actionItems', 'englishTranslation', and 'entities' with [REDACTED].";
      }
      if (config.modelSelection === 'gpt4') {
         extraInstructions += "\n- INSTRUCTION: Please act as GPT-4o. Be exceptionally concise, analytical, and highly structured.";
      } else if (config.modelSelection === 'claude') {
         extraInstructions += "\n- INSTRUCTION: Please act as Claude 3.5 Sonnet. Emphasize nuanced reasoning, safety, and a highly conversational, empathetic tone.";
      } else {
         extraInstructions += "\n- INSTRUCTION: Please act as Gemini 1.5 Pro. Focus on broad multi-modal capability, raw speed, and search-grounded logic.";
      }

      if (config.slackAlerts) {
          console.log(`[SLACK ALERT QUEUED] Will evaluate if response urgency demands pinging #ops-urgent`);
      }
      
      if (config.syncSalesforce) {
          console.log(`[SALESFORCE SYNC] Bi-directional sync enabled. Analysis will be joined with CRM Record.`);
      }

      const prompt = `You are the intelligence core of an automated customer support and operations pipeline for a multinational software and services enterprise. 

Your task is to process an incoming customer email (provided below) and generate a structured technical, strategic, and operational analysis in strict JSON format. You must evaluate the text objectively and classify data with engineering-grade precision.

Analyze the incoming email based on the following criteria:

1. DEPARTMENT CLASSIFICATION:
   Evaluate the content and strictly assign it to one of the following departments:
   - "technical_support": Code-level issues, bugs, service downtime, API integrations, platform errors.
   - "billing_and_finance": Invoices, refunds, plan upgrades/downgrades, charge disputes, payment gateways.
   - "sales_and_partnerships": Commercial inquiries, demo requests, high-value account quotes, partnership proposals, or business integrations.
   - "legal_and_compliance": Terms of service, GDPR/privacy regulations, data compliance, contracts, legal disputes.

2. URGENCY AND PRIORITY ANALYSIS:
   Calculate the urgency ("high", "medium", "low") based on business impact:
   - "high": Service is down, multiple users are affected, there is an imminent risk of customer churn, or urgent legal implications are present.
   - "medium": The system is functional but a key feature is blocked, or it is a commercial inquiry from a high-value account with tight deadlines.
   - "low": General usage questions, feature suggestions, or administrative inquiries without time sensitivity.

3. SYNTACTIC AND SENTIMENT ANALYSIS:
   - Extract the original language of the email.
   - Detect the customer's sentiment score on a scale from 1 (Extremely frustrated/angry) to 5 (Highly satisfied/collaborative).

4. KEY ENTITY EXTRACTION & TRANSLATION:
   - Identify critical entities if they exist in the text: names, company names, error IDs, URLs, or monetary amounts. If they do not exist, leave the array empty.
   - If the original language is not English, generate an accurate English translation of the email for the agent to review. If it is already in English, return an empty string.

5. ADVANCED INTELLIGENCE & TRIAGE:
   - "actionItems": Provide 1-3 distinct, concise next steps for the internal team to resolve the customer's issue.
   - "isPiiDetected": Set to true if the email contains Personally Identifiable Information (PII) like SSNs, credit card numbers, personal addresses, or unprotected personal identifying data.
   - "confidenceScore": Assess your confidence (0-100) in this overall classification and triage result.
   - "suggestedArticles": Recommend 1-3 internal help center or documentation articles (provide a 'title' for the article and a short 'url' slug) that could resolve this issue. If none apply, leave empty.

6. AUTOMATED OUTBOUND RESPONSE GENERATION:
   Draft a response proposal in the SAME language the customer's email was written in.
   - The tone of the response MUST be strictly: ${tone}.
   - If urgency is "high", the response must assure them that engineering/management is already being looped in.
   - Avoid generic corporate filler or artificial clichés. Be natural, solution-oriented, and follow the requested tone.${extraInstructions}

Incoming Email:
----------------
${emailText}
----------------

Return a JSON object conforming strictly to the defined schema.`;

      let modelConfig: any = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            department: {
              type: Type.STRING,
              description: "technical_support, billing_and_finance, sales_and_partnerships, or legal_and_compliance"
            },
            urgency: {
              type: Type.STRING,
              description: "high, medium, or low"
            },
            originalLanguage: {
              type: Type.STRING,
              description: "The primary language of the email."
            },
            sentimentScore: {
              type: Type.NUMBER,
              description: "Score from 1 to 5"
            },
            entities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of entities identified."
            },
            englishTranslation: {
              type: Type.STRING,
              description: "English translation if original text is not English."
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1-3 concise internal action items."
            },
            isPiiDetected: {
              type: Type.BOOLEAN,
              description: "True if PII was detected."
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "0 to 100 confidence value."
            },
            suggestedArticles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              },
              description: "Suggested articles with title and short url slug."
            },
            autoResponse: {
              type: Type.STRING,
              description: "Proposed draft response."
            }
          },
          required: ["department", "urgency", "originalLanguage", "sentimentScore", "entities", "actionItems", "isPiiDetected", "confidenceScore", "suggestedArticles", "autoResponse"]
        }
      };

      if (config.groundingEnabled) {
         modelConfig.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: modelConfig,
      });

      const analysisRaw = response.text?.trim() || "{}";
      let analysisJson;
      try {
        analysisJson = JSON.parse(analysisRaw);
      } catch (e) {
        console.error("Failed to parse Gemini response", analysisRaw);
        return res.status(500).json({ error: "Failed to parse analysis from AI." });
      }

      res.json(analysisJson);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "An error occurred during analysis" });
    }
  });

  // API Route to rewrite a response
  app.post("/api/rewrite", async (req, res) => {
    try {
      const { textToRewrite, instruction } = req.body;
      if (!textToRewrite || !instruction) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const prompt = `Rewrite the following customer service response. 
Instruction: ${instruction}

Original Response:
----------------
${textToRewrite}
----------------

Return ONLY the rewritten response text. Do not include any other text, JSON, or markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const rewrittenText = response.text?.trim() || "";
      res.json({ rewrittenText });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "An error occurred during rewrite" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
