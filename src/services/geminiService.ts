import { UserProfile, WorkoutSession, GeneratedRoutinePlan } from '../types';

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export interface MealItemResponse {
  n: string;
  por: string;
  k: number;
  p: number;
  c: number;
  f: number;
}

export interface MealAnalysisResponse {
  items: MealItemResponse[];
  confidence: string;
  notes: string;
}

export async function askGeminiCoach(
  messages: ChatMessagePayload[],
  userProfile: UserProfile,
  recentWorkouts: any[],
  nutritionSummary: any
): Promise<string> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      userProfile,
      recentWorkouts,
      nutritionSummary
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error del servidor: ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

export async function generateRoutinesWithAI(
  userProfile: UserProfile,
  preferences?: string
): Promise<{ routines: GeneratedRoutinePlan[] }> {
  const response = await fetch('/api/gemini/generate-routine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userProfile,
      preferences
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error al generar rutinas: ${response.status}`);
  }

  return response.json();
}

export async function analyzeMealPhoto(
  imageBase64: string,
  note?: string
): Promise<MealAnalysisResponse> {
  const response = await fetch('/api/gemini/analyze-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64,
      note
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error al analizar imagen: ${response.status}`);
  }

  return response.json();
}
