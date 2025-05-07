# Capillary AI Challenge – Slack + JIRA Bot (TypeScript)

## Features
- Slash command to create JIRA tickets
- Detects duplicate tickets using OpenAI Embeddings
- Summarizes similar tickets via GPT

## Setup

1. Clone this repo
2. Run `npm install`
3. Create a `.env` file (see `.env.example`)
4. Run the bot:

```
npm run start
```

## Deploy

You can deploy on Render, Railway, or any Node.js server that supports environment variables.