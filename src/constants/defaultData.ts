import { GeneratedRoutinePlan, NutritionGoals, UserProfile } from '../types';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user',
  displayName: 'Mi Perfil',
  age: 23,
  height: 177,
  weight: 62.0,
  targetWeight: 66.0,
  nextTargetWeight: 68.0,
  gender: 'masculino',
  goal: 'hypertrophy',
  experienceLevel: 'intermediate',
  daysAvailable: 4,
  timePerSession: 90,
  workoutLocation: 'gym',
  equipmentAvailable: ['Mancuernas', 'Barras', 'Poleas', 'Máquinas de gimnasio'],
  preferences: 'Horario preferente 7:00 pm a 9:00 pm. Dieta casera estilo mexicano.',
  injuriesOrLimitations: '',
  createdAt: new Date().toISOString()
};

export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  calories: 2500,
  protein: 125,
  carbs: 340,
  fat: 70,
  startWeight: 60,
  currentWeight: 62,
  targetWeight: 66,
  nextTargetWeight: 68
};

export const PRESET_FOODS = [
  { name: 'Huevo (1 pieza)', calories: 78, protein: 6, carbs: 1, fat: 5 },
  { name: 'Tortilla de maíz (1 pieza)', calories: 52, protein: 1, carbs: 11, fat: 1 },
  { name: 'Arroz cocido (1 taza)', calories: 205, protein: 4, carbs: 45, fat: 0 },
  { name: 'Frijoles (½ taza)', calories: 114, protein: 8, carbs: 20, fat: 1 },
  { name: 'Pechuga de pollo (150 g)', calories: 250, protein: 46, carbs: 0, fat: 6 },
  { name: 'Carne de res (120 g)', calories: 250, protein: 25, carbs: 0, fat: 16 },
  { name: 'Atún en lata (1 lata)', calories: 120, protein: 26, carbs: 0, fat: 1 },
  { name: 'Leche entera (240 ml)', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: 'Avena (40 g seca)', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: 'Plátano (1 pieza)', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Pan de caja (2 rebanadas)', calories: 160, protein: 6, carbs: 30, fat: 2 },
  { name: 'Queso fresco (50 g)', calories: 130, protein: 9, carbs: 2, fat: 10 },
  { name: 'Aguacate (½ pieza)', calories: 120, protein: 2, carbs: 6, fat: 11 },
  { name: 'Cacahuates (30 g)', calories: 170, protein: 7, carbs: 5, fat: 14 },
  { name: 'Proteína whey (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 2 },
];

export const PHOTO_ANGLES = [
  { id: 'fr', label: 'Frente relajado' },
  { id: 'ff', label: 'Frente flexionado' },
  { id: 'pi', label: 'Perfil izquierdo' },
  { id: 'pd', label: 'Perfil derecho' },
  { id: 'er', label: 'Espalda relajada' },
  { id: 'ef', label: 'Espalda flexionada' },
  { id: 'pg', label: 'Piernas' },
  { id: 'dt', label: 'Detalle muscular' },
] as const;

export const MUSCLE_ZONES = [
  'Bíceps',
  'Tríceps',
  'Antebrazos',
  'Pecho',
  'Hombros',
  'Abdomen',
  'Cuádriceps',
  'Pantorrillas'
];

export const PRIORITY_MUSCLE_GROUPS = [
  'Pecho',
  'Brazos',
  'Espalda',
  'Hombros',
  'Piernas',
  'Abdomen'
];

export const DEFAULT_ROUTINE_PLAN: GeneratedRoutinePlan = {
  id: 'default_upper_lower',
  title: 'Rutina Torso / Pierna Frecuencia 2 (J-MZ Clásica)',
  splitType: 'Torso / Pierna',
  description: 'Rutina balanceada de 4 días enfocada en sobrecarga progresiva y desarrollo equilibrado de masa muscular.',
  targetDays: 4,
  progressionStrategy: 'Registrar pesos en libras y repeticiones. Al completar el rango máximo con técnica sólida, incrementar de 2.5 a 5 lbs.',
  days: [
    {
      dayName: 'Upper A',
      focus: 'Pecho y tríceps (Énfasis empujes y espalda alta)',
      exercises: [
        {
          name: 'Press inclinado con mancuernas',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Pecho superior, Deltoides anterior, Tríceps',
          technicalTips: 'Mantén las escápulas retraídas y baja con control hasta el pecho.',
          alternatives: ['Press de banca plano con mancuernas', 'Press inclinado en máquina Smith']
        },
        {
          name: 'Pec fly',
          sets: 2,
          repRange: '7–10',
          restSeconds: 90,
          targetMuscles: 'Pecho (apertura)',
          technicalTips: 'Ligera flexión en codos, siente el estiramiento pectoral.',
          alternatives: ['Aperturas con mancuernas', 'Cruce de poleas']
        },
        {
          name: 'Jalón al pecho',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Dorsales, Bíceps',
          technicalTips: 'Lleva el pecho hacia la barra y aprieta dorsales abajo.',
          alternatives: ['Dominadas', 'Remo con barra']
        },
        {
          name: 'Elevaciones laterales',
          sets: 2,
          repRange: '8–12',
          restSeconds: 90,
          targetMuscles: 'Deltoides lateral',
          technicalTips: 'Codos ligeramente flexionados, movimiento estricto sin impulso.',
          alternatives: ['Elevaciones laterales en polea', 'Press militar']
        },
        {
          name: 'Extensión unilateral de tríceps',
          sets: 3,
          repRange: '6–10',
          restSeconds: 90,
          targetMuscles: 'Tríceps (cabeza larga/lateral)',
          technicalTips: 'Codo fijo en el espacio, rango completo de extensión.',
          alternatives: ['Fondos en paralelas', 'Press francés']
        },
        {
          name: 'Curl martillo en polea',
          sets: 2,
          repRange: '6–10',
          restSeconds: 90,
          targetMuscles: 'Braquial y braquiorradial',
          technicalTips: 'Agarre neutro con cuerda, contracción máxima arriba.',
          alternatives: ['Curl martillo con mancuernas', 'Curl zottman']
        },
        {
          name: 'Antebrazo',
          sets: 2,
          repRange: '12–15',
          restSeconds: 60,
          targetMuscles: 'Flexores/Extensores de muñeca',
          technicalTips: 'Movimiento pausado y controlado.',
          alternatives: ['Paseo de granjero', 'Flexión de muñeca con barra']
        }
      ]
    },
    {
      dayName: 'Lower A',
      focus: 'Cuádriceps y Pantorrilla',
      exercises: [
        {
          name: 'Sentadilla goblet',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Cuádriceps, Glúteos, Core',
          technicalTips: 'Mancuerna pegada al pecho, espalda recta y profundidad adecuada.',
          alternatives: ['Sentadilla frontal con barra', 'Prensa de piernas']
        },
        {
          name: 'Sentadilla búlgara',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Cuádriceps, Glúteos',
          technicalTips: 'Apoya el empeine trasero en banco, desciende con verticalidad.',
          alternatives: ['Zancadas estáticas', 'Prensa a una pierna']
        },
        {
          name: 'Extensión de cuádriceps',
          sets: 2,
          repRange: '8–10',
          restSeconds: 90,
          targetMuscles: 'Cuádriceps',
          technicalTips: 'Pausa de 1 segundo en contracción arriba.',
          alternatives: ['Sissy squat']
        },
        {
          name: 'Curl femoral acostado',
          sets: 2,
          repRange: '8–10',
          restSeconds: 90,
          targetMuscles: 'Isquiosurales',
          technicalTips: 'Controla la fase excéntrica y evita despegar la cadera.',
          alternatives: ['Curl femoral sentado', 'Peso muerto rumano con mancuernas']
        },
        {
          name: 'Pantorrilla unilateral',
          sets: 3,
          repRange: '8–12',
          restSeconds: 60,
          targetMuscles: 'Gemelos y sóleo',
          technicalTips: 'Estiramiento profundo abajo, pausa arriba.',
          alternatives: ['Elevación de talones de pie']
        },
        {
          name: 'Tibial anterior',
          sets: 2,
          repRange: '15–20',
          restSeconds: 60,
          targetMuscles: 'Tibial anterior',
          technicalTips: 'Flexión dorsal completa con peso o elástico.',
          alternatives: ['Elevaciones de puntas talón apoyado']
        }
      ]
    },
    {
      dayName: 'Upper B',
      focus: 'Brazos y pecho (Énfasis bíceps, dorsal y hombro posterior)',
      exercises: [
        {
          name: 'Press inclinado con mancuernas',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Pectoral mayor, deltoides anterior',
          technicalTips: 'Mismo patrón progresivo que sesión A.',
          alternatives: ['Press de banca plano']
        },
        {
          name: 'Jalón al pecho / dominadas asistidas',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Dorsales, Redondo mayor',
          technicalTips: 'Tracción enfocada en codos hacia las caderas.',
          alternatives: ['Dominadas pronas']
        },
        {
          name: 'Remo en máquina o polea',
          sets: 2,
          repRange: '8–10',
          restSeconds: 90,
          targetMuscles: 'Espalda media, Romboides',
          technicalTips: 'Retracción escapular completa al final del tirón.',
          alternatives: ['Remo con mancuerna a una mano']
        },
        {
          name: 'Curl de bíceps',
          sets: 3,
          repRange: '6–10',
          restSeconds: 90,
          targetMuscles: 'Bíceps braquial',
          technicalTips: 'Codos pegados al torso, supinación controlada.',
          alternatives: ['Curl en banco Scott', 'Curl con barra Z']
        },
        {
          name: 'Extensión de tríceps en polea',
          sets: 3,
          repRange: '6–10',
          restSeconds: 90,
          targetMuscles: 'Tríceps (cabeza lateral y medial)',
          technicalTips: 'Bloqueo controlado en extensión completa.',
          alternatives: ['Press cerrado', 'Fondos']
        },
        {
          name: 'Elevaciones laterales',
          sets: 2,
          repRange: '8–12',
          restSeconds: 90,
          targetMuscles: 'Deltoides lateral',
          technicalTips: 'Eleva controladamente sin encoger los hombros.',
          alternatives: ['Elevación lateral unilateral en polea']
        },
        {
          name: 'Deltoides posterior',
          sets: 2,
          repRange: '10–12',
          restSeconds: 90,
          targetMuscles: 'Deltoides posterior, manguito rotador',
          technicalTips: 'Pájaros con mancuerna o face pulls.',
          alternatives: ['Face pull en polea', 'Reverse peck deck']
        },
        {
          name: 'Antebrazo',
          sets: 2,
          repRange: '12–15',
          restSeconds: 60,
          targetMuscles: 'Antebrazo',
          technicalTips: 'Aguante estático o flexiones de muñeca.',
          alternatives: ['Dead hang en barra']
        }
      ]
    },
    {
      dayName: 'Lower B',
      focus: 'Femoral, Glúteo y Cadena Posterior',
      exercises: [
        {
          name: 'Prensa',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Cuádriceps, glúteos',
          technicalTips: 'Pies a la anchura de hombros, bajar sin despegar la pelvis.',
          alternatives: ['Sentadilla hack', 'Sentadilla trasera']
        },
        {
          name: 'Curl femoral',
          sets: 3,
          repRange: '6–10',
          restSeconds: 90,
          targetMuscles: 'Isquiosurales',
          technicalTips: 'Mantener tensión constante durante toda la repetición.',
          alternatives: ['Curl nórdico asistido']
        },
        {
          name: 'Hip thrust',
          sets: 2,
          repRange: '6–8',
          restSeconds: 120,
          targetMuscles: 'Glúteo mayor',
          technicalTips: 'Pausa de 1 segundo arriba apretando glúteos con fuerza.',
          alternatives: ['Puente de glúteos con mancuerna']
        },
        {
          name: 'Extensión de cuádriceps',
          sets: 2,
          repRange: '8–10',
          restSeconds: 90,
          targetMuscles: 'Cuádriceps',
          technicalTips: 'Buen control excéntrico de 2-3 segundos.',
          alternatives: ['Zancadas búlgaras']
        },
        {
          name: 'Abductores',
          sets: 2,
          repRange: '10–15',
          restSeconds: 60,
          targetMuscles: 'Glúteo medio y tensor de la fascia lata',
          technicalTips: 'En máquina o con elástico, apertura controlada.',
          alternatives: ['Paseo con banda lateral']
        },
        {
          name: 'Pantorrilla',
          sets: 3,
          repRange: '8–12',
          restSeconds: 60,
          targetMuscles: 'Gastrocnemio y sóleo',
          technicalTips: 'Pausa en estiramiento abajo antes de subir.',
          alternatives: ['Elevación sentado de sóleo']
        }
      ]
    }
  ]
};
