# Setting Up Google Gemini AI Integration

This application uses Google's Gemini AI for evaluating tender submissions. Follow these steps to set up the integration:

## 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Get API key" or "Create API key"
4. Copy the generated API key

## 2. Configure Environment Variables

1. Make a copy of the `config/env.example` file and name it `.env` in the server root directory
2. Update the `GEMINI_API_KEY` value with your copied API key:

```
GEMINI_API_KEY=your_api_key_here
```

## 3. Install Dependencies

Make sure to install the required dependencies:

```bash
npm install
```

This will install the `@google/generative-ai` package that's needed to communicate with the Gemini API.

## 4. Verify Integration

To verify that the integration works:

1. Start the server: `npm run dev`
2. Try using the AI evaluation feature through the frontend interface
3. Check the server logs for any errors

## Troubleshooting

### API Key Issues

If you see errors like "API key not configured" or "Error with AI evaluation":

1. Verify that your API key is correctly set in the `.env` file
2. Make sure there are no spaces or quotes around the API key
3. Restart the server after changing the environment variables

### Response Format Issues

If the AI is not returning properly formatted responses:

1. Check the server logs for details about the response
2. There may be rate limiting or service availability issues with the Gemini API
3. Try again later or adjust the prompts if needed

## Documentation

For more information on working with the Gemini API, see:

- [Google AI for Developers](https://ai.google.dev/)
- [Generative AI SDK](https://github.com/google/generative-ai-js) 