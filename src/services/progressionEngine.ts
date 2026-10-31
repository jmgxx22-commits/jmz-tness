import { WorkoutSession, ExerciseEntry, SetEntry } from '../types';

export interface ExerciseTarget {
  sets: number;
  minReps: number;
  maxReps: number;
  hasTarget: boolean;
}

export interface ProgressionResult {
  action: 'up' | 'keep' | 'set' | 'down' | 'new' | 'none';
  label: string;
  color: string;
  goal: string;
  explanation: string;
  historySummary: string[];
}

export const ACTION_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  up: { label: 'SUBIR PESO', color: '#51cf66', bg: 'rgba(81, 207, 102, 0.15)' },
  keep: { label: 'MANTENER PESO', color: '#ff7a2f', bg: 'rgba(255, 122, 47, 0.15)' },
  set: { label: 'AGREGAR SERIE', color: '#4c8bf5', bg: 'rgba(76, 139, 245, 0.15)' },
  down: { label: 'REDUCIR CARGA', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  new: { label: 'SIN HISTORIAL', color: '#9a958b', bg: 'rgba(154, 149, 139, 0.15)' },
  none: { label: 'SEGUIR REGISTRANDO', color: '#9a958b', bg: 'rgba(154, 149, 139, 0.15)' }
};

const PAIN_REGEX = /dolor|dol[ií]|duel|molest|lesi|tir[oó]n/i;

export function parseTargetString(targetStr: string): ExerciseTarget {
  if (!targetStr) return { sets: 2, minReps: 6, maxReps: 10, hasTarget: false };
  
  // Format: "2 × 6–8" or "3 x 8-12" or "2 series"
  const matchReps = /(\d+)\s*[xX×]\s*(\d+)(?:[–\-](\d+))?/.exec(targetStr);
  if (matchReps) {
    return {
      sets: parseInt(matchReps[1], 10),
      minReps: parseInt(matchReps[2], 10),
      maxReps: parseInt(matchReps[3] || matchReps[2], 10),
      hasTarget: true
    };
  }
  
  const matchSets = /(\d+)/.exec(targetStr);
  return {
    sets: matchSets ? parseInt(matchSets[1], 10) : 2,
    minReps: 0,
    maxReps: 0,
    hasTarget: false
  };
}

interface ParsedHistoryItem {
  date: string;
  energy: number;
  notes: string;
  techniqueSolid: boolean;
  sets: { weight: number; reps: number }[];
}

function parseHistorySets(exercise: ExerciseEntry): { weight: number; reps: number }[] {
  return exercise.sets
    .filter(s => Number(s.weight) > 0 && Number(s.reps) > 0)
    .map(s => ({ weight: Number(s.weight), reps: Number(s.reps) }));
}

function roundToNearestStep(weight: number): number {
  return Math.round(weight / 2.5) * 2.5;
}

function calculateIncrement(weight: number): number {
  return Math.min(10, Math.max(2.5, roundToNearestStep(weight * 0.05)));
}

function calculateVolume(item: ParsedHistoryItem): number {
  return item.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
}

function getTopWeightAndReps(item: ParsedHistoryItem): { maxWeight: number; repsAtMax: number[] } {
  if (!item.sets.length) return { maxWeight: 0, repsAtMax: [] };
  const maxWeight = Math.max(...item.sets.map(s => s.weight));
  const repsAtMax = item.sets.filter(s => s.weight >= maxWeight).map(s => s.reps);
  return { maxWeight, repsAtMax };
}

function hasProgressionOccurred(prev: ParsedHistoryItem, current: ParsedHistoryItem): boolean {
  const prevTop = getTopWeightAndReps(prev);
  const currTop = getTopWeightAndReps(current);
  return currTop.maxWeight > prevTop.maxWeight || calculateVolume(current) > calculateVolume(prev);
}

/**
 * Analyzes exercise progression based on historical workout logs
 */
export function analyzeExerciseProgression(
  exerciseName: string,
  targetString: string,
  history: WorkoutSession[]
): ProgressionResult {
  const target = parseTargetString(targetString);

  // Extract history for this specific exercise across sessions sorted chronologically
  const sortedSessions = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
  const exerciseHist: ParsedHistoryItem[] = [];

  for (const session of sortedSessions) {
    const foundEx = session.exercises.find(
      e => e.name.toLowerCase().trim() === exerciseName.toLowerCase().trim()
    );
    if (foundEx) {
      const validSets = parseHistorySets(foundEx);
      if (validSets.length > 0) {
        exerciseHist.push({
          date: session.date,
          energy: session.energy || 3,
          notes: session.notes || '',
          techniqueSolid: foundEx.solidForm !== false,
          sets: validSets
        });
      }
    }
  }

  const n = exerciseHist.length;
  if (n === 0) {
    return {
      action: 'new',
      label: ACTION_STYLES.new.label,
      color: ACTION_STYLES.new.color,
      goal: 'Elige un peso inicial con buena técnica',
      explanation: 'Sin historial previo. Empieza con un peso con el que alcances el mínimo de repeticiones sin llegar al fallo total.',
      historySummary: []
    };
  }

  const latest = exerciseHist[n - 1];
  const prev = n >= 2 ? exerciseHist[n - 2] : null;
  const prev2 = n >= 3 ? exerciseHist[n - 3] : null;

  const top = getTopWeightAndReps(latest);
  const avgRepsAtMax = top.repsAtMax.reduce((a, b) => a + b, 0) / (top.repsAtMax.length || 1);
  const lastSetsStr = latest.sets.map(s => `${s.weight}lb×${s.reps}`).join(' · ');

  // Form history summary strings
  const historySummary = exerciseHist
    .slice(-3)
    .reverse()
    .map(h => `${h.date}: ${h.sets.map(s => `${s.weight}lb×${s.reps}`).join(' · ')}`);

  if (!target.hasTarget) {
    return {
      action: 'none',
      label: ACTION_STYLES.none.label,
      color: ACTION_STYLES.none.color,
      goal: `Superar marca anterior (${lastSetsStr})`,
      explanation: `Sin rango de repeticiones fijo. Última vez: ${lastSetsStr}. Intenta superar esa marca manteniendo una técnica impecable.`,
      historySummary
    };
  }

  // Check for pain/discomfort
  if (PAIN_REGEX.test(latest.notes)) {
    return {
      action: 'keep',
      label: ACTION_STYLES.keep.label,
      color: ACTION_STYLES.keep.color,
      goal: `${top.maxWeight} lb · sin subir carga`,
      explanation: 'Registraste una molestia en la última sesión. Mantén o reduce la carga, cuida la técnica y escucha tu cuerpo.',
      historySummary
    };
  }

  const lowReps = avgRepsAtMax < target.minReps;
  const prevLow = prev && getTopWeightAndReps(prev).maxWeight >= top.maxWeight &&
    (getTopWeightAndReps(prev).repsAtMax.reduce((a, b) => a + b, 0) / (getTopWeightAndReps(prev).repsAtMax.length || 1) < target.minReps);
  
  const severeDrop = prev && prev2 &&
    calculateVolume(latest) < 0.9 * calculateVolume(prev) &&
    calculateVolume(prev) < 0.9 * calculateVolume(prev2);

  const tiredDrop = prev && latest.energy <= 2 && prev.energy <= 2 && calculateVolume(latest) < calculateVolume(prev);

  // Need deload / reduce weight
  if ((lowReps && prevLow) || severeDrop || tiredDrop) {
    const deloadWeight = roundToNearestStep(top.maxWeight * 0.9);
    return {
      action: 'down',
      label: ACTION_STYLES.down.label,
      color: ACTION_STYLES.down.color,
      goal: `${deloadWeight} lb × ${target.minReps}–${target.maxReps}`,
      explanation: `Rendimiento disminuido o fatiga acumulada. Descarga a unos ${deloadWeight} lb (~10% menos), enfócate en técnica limpia y recuperación.`,
      historySummary
    };
  }

  // Ready to increase weight
  const hitTopRepsAllSets =
    latest.sets.length >= target.sets &&
    top.repsAtMax.length >= target.sets &&
    top.repsAtMax.every(r => r >= target.maxReps);

  if (hitTopRepsAllSets) {
    if (!latest.techniqueSolid) {
      return {
        action: 'keep',
        label: ACTION_STYLES.keep.label,
        color: ACTION_STYLES.keep.color,
        goal: `${top.maxWeight} lb · afianzar técnica`,
        explanation: `Alcanzaste ${target.maxReps} reps pero la técnica no fue sólida. Mantén el peso hasta dominar el movimiento con control total.`,
        historySummary
      };
    }
    if (latest.energy < 3) {
      return {
        action: 'keep',
        label: ACTION_STYLES.keep.label,
        color: ACTION_STYLES.keep.color,
        goal: `${top.maxWeight} lb · consolidar`,
        explanation: 'Completaste el rango con energía baja. Repite el peso en un día de mayor descanso antes de subir.',
        historySummary
      };
    }

    const nextWeight = top.maxWeight + calculateIncrement(top.maxWeight);
    return {
      action: 'up',
      label: ACTION_STYLES.up.label,
      color: ACTION_STYLES.up.color,
      goal: `${nextWeight} lb × ${target.minReps}–${target.maxReps}`,
      explanation: `¡Objetivo cumplido con buena técnica! Sube a ${nextWeight} lb y busca consolidar ${target.minReps} repeticiones.`,
      historySummary
    };
  }

  // Adding a set opportunity
  if (
    n >= 3 &&
    prev && prev2 &&
    hasProgressionOccurred(prev2, prev) &&
    hasProgressionOccurred(prev, latest) &&
    (prev2.energy + prev.energy + latest.energy) / 3 >= 3.5 &&
    [prev2, prev, latest].every(h => h.techniqueSolid) &&
    latest.sets.length === target.sets &&
    target.sets < 4
  ) {
    return {
      action: 'set',
      label: ACTION_STYLES.set.label,
      color: ACTION_STYLES.set.color,
      goal: `${top.maxWeight} lb · ${target.sets + 1} series`,
      explanation: `Tres sesiones consecutivas con progreso y excelente energía. Puedes tolerar más volumen: agrega 1 serie (${target.sets} → ${target.sets + 1}) con el mismo peso.`,
      historySummary
    };
  }

  // Default: keep weight, attempt more reps
  const targetNextReps = Math.min(target.maxReps, Math.min(...top.repsAtMax) + 1);
  return {
    action: 'keep',
    label: ACTION_STYLES.keep.label,
    color: ACTION_STYLES.keep.color,
    goal: `${top.maxWeight} lb × ${targetNextReps}+ reps`,
    explanation: `${latest.sets.length < target.sets ? `Completa las ${target.sets} series. ` : ''}${lowReps ? `Apunta primero a ${target.minReps} reps. ` : ''}Mantén ${top.maxWeight} lb y busca llegar a ${targetNextReps} reps por serie.`,
    historySummary
  };
}
