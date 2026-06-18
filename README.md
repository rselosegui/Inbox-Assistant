# Customer Intelligence Core

An AI-powered customer support and operations intelligence platform that automatically analyzes incoming emails, extracts actionable insights, and generates draft responses using Google's Gemini models.

## Features

- **Automated Analysis**: Categorizes emails by department, urgency, and sentiment.
- **Auto-Response Generation**: Drafts responses in the customer's original language matching a specified tone.
- **PII Redaction**: Automatically strips personally identifiable information from analysis and responses to maintain data privacy.
- **Real-time Web Grounding**: Uses the latest web data to provide accurate and contextual responses.
- **Configurable AI Models**: Configure different system settings to handle different inference strategies.
- **Mock Integrations**: Built-in support for simulated bi-directional CRM syncing (Salesforce) and Slack workspace alerts.

## Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (Icons), and Motion (Animations).
- **Backend**: Express.js server in Node.js.
- **AI Integration**: Powered by the `@google/genai` SDK using Gemini models for robust text classification and response generation.
\`\`\`

4. Build for production:
\`\`\`bash
npm run build
\`\`\`
