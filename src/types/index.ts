export type Gender = 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';

export type FitnessGoal =
  | 'hypertrophy' // Hipertrofia (ganancia muscular)
  | 'fat_loss' // Pérdida de grasa
  | 'recomposition' // Recomposición corporal
  | 'strength' // Aumento de fuerza
  | 'endurance' // Resistencia muscular
  | 'general_fitness'; // Acondicionamiento general

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type WorkoutLocation = 'gym' | 'home' | 'calisthenics' | 'mixed';

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  age: number;
  weight: number; // in kg
  targetWeight?: number; // in kg
  nextTargetWeight?: number; // in kg
  height: number; // in cm
  gender?: Gender;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  daysAvailable: number; // 2 - 7
  timePerSession: number; // minutes (e.g. 45, 60, 90)
  workoutLocation: WorkoutLocation;
  equipmentAvailable: string[]; // e.g. ["mancuernas", "barra", "maquinas", "poleas"]
  preferences?: string; // personal preferences or notes
  injuriesOrLimitations?: string; // e.g. "Molestia en hombro izquierdo"
  createdAt?: string;
  updatedAt?: string;
}

export interface SetEntry {
  setNumber: number;
  weight: number | string; // in lbs (or kg if specified)
  reps: number | string;
  completed?: boolean;
}

export interface ExerciseEntry {
  name: string;
  targetSets: string; // e.g. "2 x 6-8"
  notes?: string;
  solidForm?: boolean;
  sets: SetEntry[];
}

export interface CustomExerciseItem {
  name: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  userId?: string;
  routineId?: string; // e.g. "UA", "LA" or custom ID
  routineName: string; // e.g. "Upper A"
  subtitle?: string; // e.g. "Pecho y tríceps"
  date: string; // YYYY-MM-DD
  energy: number; // 1 to 5
  notes: string;
  exercises: ExerciseEntry[];
  customExercises: CustomExerciseItem[];
  createdAt?: string;
}

export interface WeightRecord {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  notes?: string;
  createdAt?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  portion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
}

export interface DayNutritionLog {
  date: string; // YYYY-MM-DD
  items: FoodItem[];
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  nextTargetWeight: number;
}

export interface ProgressPhoto {
  id: string;
  sessionId: string;
  userId?: string;
  angle: 'fr' | 'ff' | 'pi' | 'pd' | 'er' | 'ef' | 'pg' | 'dt'; // Front relaxed, flexed, side left, etc.
  angleLabel?: string;
  zone?: string; // e.g. "Bíceps", "Abdomen", etc.
  notes?: string;
  photoUrl: string; // base64 or remote URL
  date: string;
  weight?: number;
}

export interface PhotoSession {
  id: string;
  userId?: string;
  date: string;
  weight?: number;
  notes?: string;
  targetMuscleGroups: string[];
  photos: ProgressPhoto[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RoutineExercisePlan {
  name: string;
  sets: number;
  repRange: string;
  restSeconds: number;
  targetMuscles: string;
  technicalTips?: string;
  alternatives?: string[];
}

export interface RoutineDayPlan {
  dayName: string; // e.g., "Día 1: Tren Superior"
  focus: string; // e.g., "Pecho, Espalda y Brazos"
  exercises: RoutineExercisePlan[];
}

export interface GeneratedRoutinePlan {
  id: string;
  title: string;
  splitType: 'Full Body' | 'Push / Pull / Legs' | 'Torso / Pierna' | 'Upper / Lower' | 'Otra';
  description: string;
  targetDays: number;
  days: RoutineDayPlan[];
  progressionStrategy: string;
}

export interface UserAppData {
  profile: UserProfile;
  activeRoutineId: string;
  customRoutines: GeneratedRoutinePlan[];
  workoutHistory: WorkoutSession[];
  weightHistory: WeightRecord[];
  nutritionGoals: NutritionGoals;
  nutritionLogs: Record<string, FoodItem[]>;
  photoSessions: PhotoSession[];
  chatHistory: ChatMessage[];
  workoutDraft?: Record<string, any>;
}
