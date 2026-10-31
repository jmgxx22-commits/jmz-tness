import { GoogleGenAI, Type } from '@google/genai';

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Resilient caller with fallback across models if high demand (503/429) occurs
async function generateWithFallback(ai: GoogleGenAI, params: any) {
  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} request warning: ${err?.message || err}. Attempting fallback if available...`);
    }
  }
  throw lastError;
}

export async function handleChat(body: any) {
  const { messages, message, userProfile, recentWorkouts, nutritionSummary } = body;
  const ai = getGeminiClient();

  const systemInstruction = `
Eres el Entrenador Personal e Inteligente de la plataforma de entrenamiento "J-MZ Tness".
Tu misión es guiar, motivar y asesorar al usuario con base en sus datos reales, objetivos, experiencia y registros recientes.
Tu tono debe ser profesional, cercano, motivador, conciso y directo (orientado al fitness práctico y realista).

Datos del Usuario:
- Nombre: ${userProfile?.displayName || 'Usuario'}
- Edad: ${userProfile?.age || 'No especificada'} años
- Peso actual: ${userProfile?.weight || 'No especificado'} kg (Meta: ${userProfile?.targetWeight || 'N/A'} kg)
- Estatura: ${userProfile?.height || 'No especificada'} cm
- Nivel: ${userProfile?.experienceLevel || 'Intermedio'}
- Objetivo principal: ${userProfile?.goal || 'Hipertrofia'}
- Días disponibles: ${userProfile?.daysAvailable || 4} días por semana
- Tiempo por sesión: ${userProfile?.timePerSession || 60} minutos
- Lugar de entrenamiento y equipo: ${userProfile?.workoutLocation || 'Gimnasio'} (${userProfile?.equipmentAvailable?.join(', ') || 'Equipamiento completo'})
- Lesiones o limitaciones: ${userProfile?.injuriesOrLimitations || 'Ninguna'}
- Preferencias: ${userProfile?.preferences || 'Ninguna'}

Registro reciente:
- Entrenamientos recientes: ${JSON.stringify(recentWorkouts || [])}
- Estado nutricional actual: ${JSON.stringify(nutritionSummary || {})}

Reglas estrictas:
1. Siempre responde en Español.
2. Si el usuario reporta dolores agudos, lesiones o mareos, aconseja detener el ejercicio y acudir a un médico o especialista.
3. No inventes datos que contradigan el perfil o el historial.
4. Ajusta recomendaciones de volumen, descanso y pesos a su nivel y objetivos.
5. Los pesos de ejercicios en el gimnasio del usuario usualmente están en libras (lb).
`;

  let messageList = messages || [];
  if (messageList.length === 0 && message) {
    messageList = [{ role: 'user', content: message }];
  } else if (messageList.length === 0) {
    messageList = [{ role: 'user', content: 'Hola coach, ¿cómo estás?' }];
  }

  const contents = messageList.map((m: { role: string; content: string }) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content || '' }],
  }));

  const response = await generateWithFallback(ai, {
    contents,
    config: {
      systemInstruction,
    },
  });

  return { reply: response.text };
}

export async function handleGenerateRoutine(body: any) {
  const { userProfile = {}, preferences } = body;
  const ai = getGeminiClient();

  const prompt = `
Diseña 3 alternativas de rutinas de entrenamiento altamente personalizadas para este usuario de J-MZ Tness.
Información del usuario:
- Edad: ${userProfile.age || 25}
- Peso: ${userProfile.weight || 70} kg, Estatura: ${userProfile.height || 175} cm, Sexo: ${userProfile.gender || 'No especificado'}
- Objetivo principal: ${userProfile.goal || 'hypertrophy'}
- Nivel de experiencia: ${userProfile.experienceLevel || 'intermediate'}
- Días disponibles a la semana: ${userProfile.daysAvailable || 4} días
- Tiempo disponible por sesión: ${userProfile.timePerSession || 60} minutos
- Lugar y equipo disponible: ${userProfile.workoutLocation || 'gym'}, equipo: ${userProfile.equipmentAvailable?.join(', ') || 'Completo'}
- Limitaciones o lesiones: ${userProfile.injuriesOrLimitations || 'Ninguna'}
- Preferencias del usuario: ${preferences || userProfile.preferences || 'Ninguna'}

Instrucciones:
Proporciona 3 opciones con enfoques o distribuciones distintas (por ejemplo: si entrena 4 días, Opción 1: Torso/Pierna clásico, Opción 2: Híbrido Empuje/Tirón/Pierna/Fullbody, Opción 3: Alta frecuencia/Especialización según objetivo).
Para cada rutina incluye los días, grupos musculares, ejercicios detallados con series efectivas, rango de repeticiones, tiempo de descanso en segundos, consejos técnicos clave y 1 o 2 ejercicios alternativos por si una máquina está ocupada.
`;

  const response = await generateWithFallback(ai, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          routines: {
            type: Type.ARRAY,
            description: 'Las 3 alternativas de rutina propuestas',
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                splitType: { type: Type.STRING },
                description: { type: Type.STRING },
                targetDays: { type: Type.INTEGER },
                progressionStrategy: { type: Type.STRING },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayName: { type: Type.STRING },
                      focus: { type: Type.STRING },
                      exercises: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            sets: { type: Type.INTEGER },
                            repRange: { type: Type.STRING },
                            restSeconds: { type: Type.INTEGER },
                            targetMuscles: { type: Type.STRING },
                            technicalTips: { type: Type.STRING },
                            alternatives: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                            },
                          },
                          required: ['name', 'sets', 'repRange', 'restSeconds', 'targetMuscles'],
                        },
                      },
                    },
                    required: ['dayName', 'focus', 'exercises'],
                  },
                },
              },
              required: ['id', 'title', 'splitType', 'description', 'targetDays', 'days', 'progressionStrategy'],
            },
          },
        },
        required: ['routines'],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function handleAnalyzeMeal(body: any) {
  const { imageBase64, mimeType = 'image/jpeg', note } = body;
  if (!imageBase64) {
    throw new Error('Falta la imagen a analizar');
  }

  const ai = getGeminiClient();

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
    },
  };

  const promptText = `Eres un nutriólogo deportivo experto. Analiza la fotografía del plato/alimento suministrado.
Identifica cada componente o ingrediente visible y desglosa:
- Nombre del alimento
- Porción estimada (ej: 150g, 1 taza, 2 piezas)
- Calorías (kcal)
- Proteínas (g)
- Carbohidratos (g)
- Grasas (g)
Nota adicional del usuario si la hay: "${note || 'Sin nota adicional'}".
Asegúrate de ser realista considerando aceites de cocción, aderezos y condimentos comunes.
Devuelve el desglose en el formato JSON especificado.`;

  const response = await generateWithFallback(ai, {
    contents: {
      parts: [imagePart, { text: promptText }],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                n: { type: Type.STRING, description: 'Nombre del alimento' },
                por: { type: Type.STRING, description: 'Porción estimada' },
                k: { type: Type.INTEGER, description: 'Calorías estimadas en kcal' },
                p: { type: Type.INTEGER, description: 'Proteína en gramos' },
                c: { type: Type.INTEGER, description: 'Carbohidratos en gramos' },
                f: { type: Type.INTEGER, description: 'Grasa en gramos' },
              },
              required: ['n', 'por', 'k', 'p', 'c', 'f'],
            },
          },
          confidence: { type: Type.STRING, description: 'Alta, Media o Baja' },
          notes: { type: Type.STRING, description: 'Comentario explicativo o consejos sobre la comida' },
        },
        required: ['items', 'confidence', 'notes'],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}
