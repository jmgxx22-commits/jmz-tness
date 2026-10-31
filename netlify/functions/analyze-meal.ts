import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleAnalyzeMeal } from '../../server/geminiBackend';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const result = await handleAnalyzeMeal(body);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error('Error in netlify function analyze-meal:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error?.message || 'Error analyzing meal photo with Gemini AI' }),
    };
  }
};
