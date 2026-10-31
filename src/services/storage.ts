import { UserAppData, UserProfile, NutritionGoals, WorkoutSession, WeightRecord, FoodItem, PhotoSession, ChatMessage, GeneratedRoutinePlan } from '../types';
import { DEFAULT_PROFILE, DEFAULT_NUTRITION_GOALS, DEFAULT_ROUTINE_PLAN } from '../constants/defaultData';

const LEGACY_STORAGE_KEY = 'gymjournal_v1';
const MULTIUSER_PREFIX = 'jmz_tness_user_';
const USERS_LIST_KEY = 'jmz_tness_users';
const ACTIVE_USER_KEY = 'jmz_tness_active_user';

export interface StoredUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  createdAt: string;
}

export function createInitialUserData(profile?: Partial<UserProfile>): UserAppData {
  const mergedProfile: UserProfile = {
    ...DEFAULT_PROFILE,
    ...profile,
    id: profile?.id || 'user_' + Date.now().toString(36)
  };

  return {
    profile: mergedProfile,
    activeRoutineId: DEFAULT_ROUTINE_PLAN.id,
    customRoutines: [DEFAULT_ROUTINE_PLAN],
    workoutHistory: [],
    weightHistory: [],
    nutritionGoals: { ...DEFAULT_NUTRITION_GOALS },
    nutritionLogs: {},
    photoSessions: [],
    chatHistory: [],
    workoutDraft: {}
  };
}

export const StorageService = {
  // Check if legacy data from original version exists
  checkHasLegacyData(): boolean {
    try {
      const item = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!item) return false;
      const parsed = JSON.parse(item);
      return (parsed.ses && parsed.ses.length > 0) || (parsed.peso && parsed.peso.length > 0) || (parsed.food && parsed.food.log && Object.keys(parsed.food.log).length > 0);
    } catch {
      return false;
    }
  },

  // Read raw legacy data
  getRawLegacyData(): any | null {
    try {
      const item = localStorage.getItem(LEGACY_STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  // Convert legacy format to new format
  convertLegacyData(legacyData: any, newUserId: string = 'imported_user'): UserAppData {
    const base = createInitialUserData({ id: newUserId });

    // 1. Weight history
    if (Array.isArray(legacyData.peso)) {
      base.weightHistory = legacyData.peso.map((p: any) => ({
        id: 'weight_' + (p.d || Date.now()) + Math.random().toString(36).slice(2, 5),
        userId: newUserId,
        date: p.d,
        weight: Number(p.k) || 0
      }));
    }

    // 2. Workout sessions
    if (Array.isArray(legacyData.ses)) {
      base.workoutHistory = legacyData.ses.map((s: any, idx: number) => {
        const routinePlanKey = s.t || 'UA';
        const dayInfo = DEFAULT_ROUTINE_PLAN.days.find(d => d.dayName.toLowerCase().includes(routinePlanKey.toLowerCase())) || DEFAULT_ROUTINE_PLAN.days[0];
        
        // Convert exercises
        const exercises = (s.ex || []).map((setArray: any[], exIndex: number) => {
          const exMeta = dayInfo.exercises[exIndex] || { name: `Ejercicio ${exIndex + 1}`, repRange: '8-10', sets: 3 };
          const sets = [];
          for (let i = 0; i < 6; i += 2) {
            const w = setArray[i];
            const r = setArray[i + 1];
            if (w || r) {
              sets.push({
                setNumber: (i / 2) + 1,
                weight: w || '',
                reps: r || '',
                completed: true
              });
            }
          }
          return {
            name: exMeta.name,
            targetSets: exMeta.repRange ? `${sets.length || exMeta.sets} × ${exMeta.repRange}` : '3 x 10',
            solidForm: setArray[6] !== 'x',
            sets
          };
        });

        // Convert custom exercises
        const customExercises = (s.x || []).map((xItem: any) => {
          const sets = [];
          for (let i = 0; i < (xItem.r || []).length; i += 2) {
            const w = xItem.r[i];
            const r = xItem.r[i + 1];
            if (w || r) {
              sets.push({
                setNumber: (i / 2) + 1,
                weight: w || '',
                reps: r || '',
                completed: true
              });
            }
          }
          return {
            name: xItem.n,
            sets
          };
        });

        return {
          id: 'ses_' + (s.d || Date.now()) + '_' + idx,
          userId: newUserId,
          routineId: DEFAULT_ROUTINE_PLAN.id,
          routineName: dayInfo ? dayInfo.dayName : 'Sesión',
          subtitle: dayInfo ? dayInfo.focus : '',
          date: s.d,
          energy: Number(s.e) || 3,
          notes: s.n || '',
          exercises,
          customExercises
        };
      });
    }

    // 3. Nutrition Goals & Log
    if (legacyData.food) {
      if (legacyData.food.g) {
        base.nutritionGoals = {
          calories: Number(legacyData.food.g.kcal) || 2500,
          protein: Number(legacyData.food.g.p) || 125,
          carbs: Number(legacyData.food.g.c) || 340,
          fat: Number(legacyData.food.g.f) || 70,
          startWeight: Number(legacyData.food.g.w0) || 60,
          currentWeight: Number(legacyData.food.g.wn) || 62,
          targetWeight: Number(legacyData.food.g.wm) || 66,
          nextTargetWeight: Number(legacyData.food.g.w2) || 68
        };
        base.profile.weight = Number(legacyData.food.g.wn) || base.profile.weight;
        base.profile.targetWeight = Number(legacyData.food.g.wm) || base.profile.targetWeight;
        base.profile.nextTargetWeight = Number(legacyData.food.g.w2) || base.profile.nextTargetWeight;
      }
      if (legacyData.food.log) {
        base.nutritionLogs = {};
        for (const [date, items] of Object.entries<any[]>(legacyData.food.log)) {
          base.nutritionLogs[date] = items.map((item, idx) => ({
            id: 'food_' + date + '_' + idx,
            name: item.n,
            calories: Number(item.k) || 0,
            protein: Number(item.p) || 0,
            carbs: Number(item.c) || 0,
            fat: Number(item.f) || 0,
            portion: item.por || ''
          }));
        }
      }
    }

    // 4. Photo sessions (metadata)
    if (Array.isArray(legacyData.sess)) {
      base.photoSessions = legacyData.sess.map((s: any) => ({
        id: s.id || ('photo_ses_' + Date.now()),
        userId: newUserId,
        date: s.d,
        weight: s.w ? Number(s.w) : undefined,
        notes: s.n || '',
        targetMuscleGroups: s.m || [],
        photos: [] // Photos stored in IndexedDB separately
      }));
    }

    // 5. Chat History
    if (Array.isArray(legacyData.chat)) {
      base.chatHistory = legacyData.chat.map((m: any, idx: number) => ({
        id: 'msg_' + idx,
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content || '',
        timestamp: new Date().toISOString()
      }));
    }

    return base;
  },

  // Save specific user data
  saveUserData(userId: string, data: UserAppData): void {
    try {
      localStorage.setItem(MULTIUSER_PREFIX + userId, JSON.stringify(data));
      // Also update backup key for offline safety
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(this.exportToLegacyFormat(data)));
    } catch (e) {
      console.error('Error saving user data to localStorage:', e);
    }
  },

  // Load specific user data
  loadUserData(userId: string): UserAppData {
    try {
      const stored = localStorage.getItem(MULTIUSER_PREFIX + userId);
      if (stored) {
        return JSON.parse(stored);
      }
      // If none, check if we have legacy data to migrate automatically
      const legacy = this.getRawLegacyData();
      if (legacy) {
        const converted = this.convertLegacyData(legacy, userId);
        this.saveUserData(userId, converted);
        return converted;
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
    const defaultData = createInitialUserData({ id: userId });
    this.saveUserData(userId, defaultData);
    return defaultData;
  },

  // Export modern state to legacy JSON for 100% backward compatibility
  exportToLegacyFormat(data: UserAppData): any {
    const legacy: any = {
      peso: data.weightHistory.map(w => ({ d: w.date, k: w.weight })),
      ses: data.workoutHistory.map(w => ({
        t: w.routineId || 'UA',
        d: w.date,
        e: String(w.energy),
        n: w.notes,
        ex: w.exercises.map(e => [
          e.sets[0]?.weight ?? '', e.sets[0]?.reps ?? '',
          e.sets[1]?.weight ?? '', e.sets[1]?.reps ?? '',
          e.sets[2]?.weight ?? '', e.sets[2]?.reps ?? '',
          e.solidForm === false ? 'x' : ''
        ]),
        x: w.customExercises.map(cx => ({
          n: cx.name,
          r: [
            cx.sets[0]?.weight ?? '', cx.sets[0]?.reps ?? '',
            cx.sets[1]?.weight ?? '', cx.sets[1]?.reps ?? '',
            cx.sets[2]?.weight ?? '', cx.sets[2]?.reps ?? ''
          ]
        }))
      })),
      sess: data.photoSessions.map(ps => ({
        id: ps.id,
        d: ps.date,
        w: ps.weight ?? '',
        n: ps.notes ?? '',
        m: ps.targetMuscleGroups ?? []
      })),
      food: {
        g: {
          kcal: data.nutritionGoals.calories,
          p: data.nutritionGoals.protein,
          f: data.nutritionGoals.fat,
          c: data.nutritionGoals.carbs,
          w0: data.nutritionGoals.startWeight,
          wn: data.nutritionGoals.currentWeight,
          wm: data.nutritionGoals.targetWeight,
          w2: data.nutritionGoals.nextTargetWeight
        },
        log: {}
      },
      draft: data.workoutDraft || {},
      chat: data.chatHistory.map(m => ({ role: m.role, content: m.content }))
    };

    for (const [date, items] of Object.entries(data.nutritionLogs)) {
      legacy.food.log[date] = items.map(item => ({
        n: item.name,
        k: item.calories,
        p: item.protein,
        c: item.carbs,
        f: item.fat,
        por: item.portion || ''
      }));
    }

    return legacy;
  },

  // Active user management
  getActiveUserId(): string {
    return localStorage.getItem(ACTIVE_USER_KEY) || 'default_user';
  },

  setActiveUserId(id: string): void {
    localStorage.setItem(ACTIVE_USER_KEY, id);
  },

  // List of registered accounts
  getRegisteredUsers(): StoredUser[] {
    try {
      const val = localStorage.getItem(USERS_LIST_KEY);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  saveRegisteredUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
};
