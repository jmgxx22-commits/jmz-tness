import { handleChat } from '../../server/geminiBackend';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await handleChat(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error en Gemini Chat:', error);

    return res.status(500).json({
      error: error?.message || 'Error al comunicarse con el entrenador IA'
    });
  }
}
