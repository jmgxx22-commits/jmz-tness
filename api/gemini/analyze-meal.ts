import { handleAnalyzeMeal } from '../../server/geminiBackend.ts';
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await handleAnalyzeMeal(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error analyzing meal:', error);

    return res.status(500).json({
      error: error?.message || 'Error al analizar la fotografía'
    });
  }
}
