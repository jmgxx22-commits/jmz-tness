import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  UserAppData,
  WorkoutSession,
  WeightRecord,
  FoodItem,
  NutritionGoals,
  PhotoSession,
  ChatMessage,
  GeneratedRoutinePlan,
} from '../types';
import { StorageService } from '../services/storage';
import { PhotoStorage, StoredPhoto } from '../services/photoStorage';
import { DEFAULT_ROUTINE_PLAN, DEFAULT_NUTRITION_GOALS } from '../constants/defaultData';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where
} from 'firebase/firestore';

interface DataContextType {
  data: UserAppData;
  activeRoutine: GeneratedRoutinePlan;
  currentWorkoutDay: string;
  isSyncing: boolean;
  setCurrentWorkoutDay: (dayName: string) => void;
  saveWorkoutSession: (session: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteWorkoutSession: (sessionId: string) => Promise<void>;
  saveWorkoutDraft: (routineDay: string, draft: any) => void;
  getWorkoutDraft: (routineDay: string) => any;
  clearWorkoutDraft: (routineDay: string) => void;
  addWeightRecord: (weight: number, date?: string, notes?: string) => Promise<void>;
  deleteWeightRecord: (idOrIndex: string | number) => Promise<void>;
  addFoodItem: (item: Omit<FoodItem, 'id'>, date?: string) => Promise<void>;
  deleteFoodItem: (date: string, itemId: string) => Promise<void>;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  resetNutritionGoals: () => Promise<void>;
  addPhotoSession: (date: string, weight?: number, notes?: string, muscleGroups?: string[], photos?: { dataUrl: string; angle: string; zone?: string; note?: string }[]) => Promise<void>;
  deletePhotoSession: (sessionId: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  replacePhoto: (photoId: string, newFile: File) => Promise<void>;
  updatePhotoAngle: (photoId: string, angle: string, zone?: string) => Promise<void>;
  getPhotosForSession: (sessionId: string) => StoredPhoto[];
  allPhotos: StoredPhoto[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  saveCustomRoutine: (routine: GeneratedRoutinePlan) => Promise<void>;
  setActiveRoutine: (routineId: string) => Promise<void>;
  exportBackup: () => string;
  importBackup: (jsonStr: string) => boolean;
  hasLegacyBackup: boolean;
  importFromExistingLocalStorage: () => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, userProfile } = useAuth();
  const currentUserId = firebaseUser ? firebaseUser.uid : userProfile.id || 'default_user';

  const [data, setData] = useState<UserAppData>(() => StorageService.loadUserData(currentUserId));
  const [currentWorkoutDay, setCurrentWorkoutDay] = useState<string>('Upper A');
  const [allPhotos, setAllPhotos] = useState<StoredPhoto[]>([]);
  const [hasLegacyBackup, setHasLegacyBackup] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Check legacy data on mount
  useEffect(() => {
    setHasLegacyBackup(StorageService.checkHasLegacyData());
    loadPhotos();
  }, []);

  // When user changes, load their data
  useEffect(() => {
    const loadedData = StorageService.loadUserData(currentUserId);
    setData(loadedData);

    if (firebaseUser) {
      // Set up real-time listeners for authenticated user
      setIsSyncing(true);
      const uid = firebaseUser.uid;

      // Workouts listener
      const workoutsRef = collection(db, 'users', uid, 'workouts');
      const unsubWorkouts = onSnapshot(
        query(workoutsRef, where('userId', '==', uid)),
        (snap) => {
          const remoteWorkouts: WorkoutSession[] = [];
          snap.forEach(d => remoteWorkouts.push(d.data() as WorkoutSession));
          if (remoteWorkouts.length > 0) {
            setData(prev => {
              const merged = { ...prev, workoutHistory: remoteWorkouts };
              StorageService.saveUserData(uid, merged);
              return merged;
            });
          }
          setIsSyncing(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, `users/${uid}/workouts`);
          setIsSyncing(false);
        }
      );

      // Weight listener
      const weightsRef = collection(db, 'users', uid, 'weights');
      const unsubWeights = onSnapshot(
        query(weightsRef, where('userId', '==', uid)),
        (snap) => {
          const remoteWeights: WeightRecord[] = [];
          snap.forEach(d => remoteWeights.push(d.data() as WeightRecord));
          if (remoteWeights.length > 0) {
            setData(prev => {
              const sorted = remoteWeights.sort((a, b) => a.date.localeCompare(b.date));
              const merged = { ...prev, weightHistory: sorted };
              StorageService.saveUserData(uid, merged);
              return merged;
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, `users/${uid}/weights`);
        }
      );

      // Routines listener
      const routinesRef = collection(db, 'users', uid, 'routines');
      const unsubRoutines = onSnapshot(
        query(routinesRef, where('userId', '==', uid)),
        (snap) => {
          const remoteRoutines: GeneratedRoutinePlan[] = [];
          snap.forEach(d => {
            const raw = d.data();
            try {
              if (raw.planData) {
                const parsed = JSON.parse(raw.planData);
                remoteRoutines.push(parsed);
              } else {
                remoteRoutines.push(raw as GeneratedRoutinePlan);
              }
            } catch {
              remoteRoutines.push(raw as GeneratedRoutinePlan);
            }
          });
          if (remoteRoutines.length > 0) {
            setData(prev => {
              // Ensure default is included if not present
              const hasDefault = remoteRoutines.some(r => r.id === DEFAULT_ROUTINE_PLAN.id);
              const list = hasDefault ? remoteRoutines : [DEFAULT_ROUTINE_PLAN, ...remoteRoutines];
              const merged = { ...prev, customRoutines: list };
              StorageService.saveUserData(uid, merged);
              return merged;
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, `users/${uid}/routines`);
        }
      );

      return () => {
        unsubWorkouts();
        unsubWeights();
        unsubRoutines();
      };
    }
  }, [firebaseUser, currentUserId]);

  const loadPhotos = async () => {
    try {
      const photos = await PhotoStorage.getAllPhotos();
      setAllPhotos(photos);
    } catch (e) {
      console.warn('Failed to fetch indexedDB photos', e);
    }
  };

  const persist = (updatedData: UserAppData) => {
    setData(updatedData);
    StorageService.saveUserData(currentUserId, updatedData);
  };

  const activeRoutine =
    data.customRoutines.find(r => r.id === data.activeRoutineId) ||
    DEFAULT_ROUTINE_PLAN;

  const saveWorkoutSession = async (sessionData: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>) => {
    const newSession: WorkoutSession = {
      ...sessionData,
      id: 'ses_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      userId: currentUserId,
      createdAt: new Date().toISOString()
    };

    const newHistory = [...data.workoutHistory, newSession];
    const newDrafts = { ...data.workoutDraft };
    delete newDrafts[currentWorkoutDay];

    persist({
      ...data,
      workoutHistory: newHistory,
      workoutDraft: newDrafts
    });

if (firebaseUser) {
  try {
    const docRef = doc(db, 'users', firebaseUser.uid, 'workouts', newSession.id);
    await setDoc(docRef, newSession);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}/workouts/${newSession.id}`);
    throw err;
  }
}

  const deleteWorkoutSession = async (sessionId: string) => {
    const filtered = data.workoutHistory.filter(s => s.id !== sessionId);
    persist({ ...data, workoutHistory: filtered });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'workouts', sessionId);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/workouts/${sessionId}`);
      }
    }
  };

  const saveWorkoutDraft = (routineDay: string, draft: any) => {
    const drafts = { ...data.workoutDraft, [routineDay]: { ...draft, _t: Date.now() } };
    persist({ ...data, workoutDraft: drafts });
  };

  const getWorkoutDraft = (routineDay: string) => {
    return data.workoutDraft?.[routineDay] || null;
  };

  const clearWorkoutDraft = (routineDay: string) => {
    const drafts = { ...data.workoutDraft };
    delete drafts[routineDay];
    persist({ ...data, workoutDraft: drafts });
  };

  const addWeightRecord = async (weight: number, date?: string, notes?: string) => {
    const newDate = date || new Date().toISOString().split('T')[0];
    const newRecord: WeightRecord = {
      id: 'weight_' + Date.now().toString(36),
      userId: currentUserId,
      date: newDate,
      weight,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const withoutExisting = data.weightHistory.filter(w => w.date !== newDate);
    const updated = [...withoutExisting, newRecord].sort((a, b) => a.date.localeCompare(b.date));

    persist({
      ...data,
      weightHistory: updated,
      profile: {
        ...data.profile,
        weight: weight
      },
      nutritionGoals: {
        ...data.nutritionGoals,
        currentWeight: weight
      }
    });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'weights', newRecord.id!);
        await setDoc(docRef, newRecord);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}/weights/${newRecord.id}`);
      }
    }
  };

  const deleteWeightRecord = async (idOrIndex: string | number) => {
    let deletedId: string | null = null;
    let updated: WeightRecord[];
    if (typeof idOrIndex === 'number') {
      deletedId = data.weightHistory[idOrIndex]?.id || null;
      updated = data.weightHistory.filter((_, idx) => idx !== idOrIndex);
    } else {
      deletedId = idOrIndex;
      updated = data.weightHistory.filter(w => w.id !== idOrIndex);
    }
    persist({ ...data, weightHistory: updated });

    if (firebaseUser && deletedId) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'weights', deletedId);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/weights/${deletedId}`);
      }
    }
  };

  const addFoodItem = async (item: Omit<FoodItem, 'id'>, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const newItem: FoodItem = {
      ...item,
      id: 'food_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentLogs = data.nutritionLogs[targetDate] || [];
    const updatedLogs = {
      ...data.nutritionLogs,
      [targetDate]: [...currentLogs, newItem]
    };

    persist({ ...data, nutritionLogs: updatedLogs });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'meals', newItem.id);
        await setDoc(docRef, {
          id: newItem.id,
          userId: firebaseUser.uid,
          date: targetDate,
          name: newItem.name,
          calories: newItem.calories,
          protein: newItem.protein,
          carbs: newItem.carbs,
          fat: newItem.fat,
          portion: newItem.portion || '',
          time: newItem.time || '',
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}/meals/${newItem.id}`);
      }
    }
  };

  const deleteFoodItem = async (date: string, itemId: string) => {
    const currentLogs = data.nutritionLogs[date] || [];
    const updatedLogs = {
      ...data.nutritionLogs,
      [date]: currentLogs.filter(i => i.id !== itemId)
    };
    persist({ ...data, nutritionLogs: updatedLogs });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'meals', itemId);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/meals/${itemId}`);
      }
    }
  };

  const updateNutritionGoals = async (goals: Partial<NutritionGoals>) => {
    const newGoals = { ...data.nutritionGoals, ...goals };
    persist({ ...data, nutritionGoals: newGoals });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'goals', 'current');
        await setDoc(docRef, {
          userId: firebaseUser.uid,
          ...newGoals,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}/goals/current`);
      }
    }
  };

  const resetNutritionGoals = async () => {
    await updateNutritionGoals(DEFAULT_NUTRITION_GOALS);
  };

  const addPhotoSession = async (
    date: string,
    weight?: number,
    notes?: string,
    muscleGroups: string[] = [],
    photosList: { dataUrl: string; angle: string; zone?: string; note?: string }[] = []
  ) => {
    const sessionId = 'ph_ses_' + Date.now().toString(36);
    const photoEntries: StoredPhoto[] = [];

    for (const p of photosList) {
      const pId = 'photo_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const photoRecord: StoredPhoto = {
        id: pId,
        sid: sessionId,
        ang: p.angle,
        z: p.zone || '',
        note: p.note || '',
        dataUrl: p.dataUrl,
        createdAt: new Date().toISOString()
      };
      await PhotoStorage.savePhoto(photoRecord);
      photoEntries.push(photoRecord);

      // Save to Firestore if authenticated
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid, 'photos', pId);
          await setDoc(docRef, {
            id: pId,
            userId: firebaseUser.uid,
            sessionId: sessionId,
            angle: p.angle,
            zone: p.zone || '',
            note: p.note || '',
            photoUrl: p.dataUrl, // compressed jpeg
            date,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}/photos/${pId}`);
        }
      }
    }

    const newSession: PhotoSession = {
      id: sessionId,
      userId: currentUserId,
      date,
      weight,
      notes,
      targetMuscleGroups: muscleGroups,
      photos: photoEntries.map(p => ({
        id: p.id,
        sessionId: p.sid,
        angle: p.ang as any,
        zone: p.z,
        note: p.note,
        photoUrl: p.dataUrl || '',
        date,
        weight
      }))
    };

    if (weight) {
      await addWeightRecord(weight, date, 'Registrado con fotos');
    }

    const updatedSessions = [...data.photoSessions, newSession];
    persist({ ...data, photoSessions: updatedSessions });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'photo_sessions', sessionId);
        await setDoc(docRef, {
          id: sessionId,
          userId: firebaseUser.uid,
          date,
          weight: weight || 0,
          notes: notes || '',
          targetMuscleGroups: muscleGroups,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}/photo_sessions/${sessionId}`);
      }
    }

    await loadPhotos();
  };

  const deletePhotoSession = async (sessionId: string) => {
    await PhotoStorage.deletePhotosForSession(sessionId);
    const updatedSessions = data.photoSessions.filter(s => s.id !== sessionId);
    persist({ ...data, photoSessions: updatedSessions });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'photo_sessions', sessionId);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/photo_sessions/${sessionId}`);
      }
    }

    await loadPhotos();
  };

  const deletePhoto = async (photoId: string) => {
    await PhotoStorage.deletePhoto(photoId);
    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'photos', photoId);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/photos/${photoId}`);
      }
    }
    await loadPhotos();
  };

  const replacePhoto = async (photoId: string, newFile: File) => {
    const dataUrl = await PhotoStorage.compressImage(newFile);
    const existing = allPhotos.find(p => p.id === photoId);
    if (existing) {
      const updated: StoredPhoto = {
        ...existing,
        dataUrl
      };
      await PhotoStorage.savePhoto(updated);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid, 'photos', photoId);
          await setDoc(docRef, { photoUrl: dataUrl }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}/photos/${photoId}`);
        }
      }
      await loadPhotos();
    }
  };

  const updatePhotoAngle = async (photoId: string, angle: string, zone?: string) => {
    const existing = allPhotos.find(p => p.id === photoId);
    if (existing) {
      const updated: StoredPhoto = {
        ...existing,
        ang: angle,
        z: zone ?? existing.z
      };
      await PhotoStorage.savePhoto(updated);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid, 'photos', photoId);
          await setDoc(docRef, { angle, zone: zone || '' }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}/photos/${photoId}`);
        }
      }
      await loadPhotos();
    }
  };

  const getPhotosForSession = (sessionId: string): StoredPhoto[] => {
    return allPhotos.filter(p => p.sid === sessionId);
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'chat_' + Date.now().toString(36),
      timestamp: new Date().toISOString()
    };
    persist({ ...data, chatHistory: [...data.chatHistory, newMsg] });
  };

  const clearChat = () => {
    persist({ ...data, chatHistory: [] });
  };

  const saveCustomRoutine = async (routine: GeneratedRoutinePlan) => {
    const existingIndex = data.customRoutines.findIndex(r => r.id === routine.id);
    let updatedList = [...data.customRoutines];
    if (existingIndex >= 0) {
      updatedList[existingIndex] = routine;
    } else {
      updatedList.push(routine);
    }
    persist({
      ...data,
      customRoutines: updatedList,
      activeRoutineId: routine.id
    });

    if (firebaseUser) {
      try {
        const docRef = doc(db, 'users', firebaseUser.uid, 'routines', routine.id);
        await setDoc(docRef, {
          id: routine.id,
          userId: firebaseUser.uid,
          title: routine.title,
          splitType: routine.splitType,
          description: routine.description,
          targetDays: routine.targetDays,
          progressionStrategy: routine.progressionStrategy,
          planData: JSON.stringify(routine),
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}/routines/${routine.id}`);
      }
    }
  };

  const setActiveRoutine = async (routineId: string) => {
    persist({ ...data, activeRoutineId: routineId });
  };

  const exportBackup = (): string => {
    return JSON.stringify(StorageService.exportToLegacyFormat(data), null, 2);
  };

  const importBackup = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.peso) || !Array.isArray(parsed.ses)) {
        return false;
      }
      const converted = StorageService.convertLegacyData(parsed, currentUserId);
      persist(converted);
      return true;
    } catch {
      return false;
    }
  };

  const importFromExistingLocalStorage = (): boolean => {
    const legacy = StorageService.getRawLegacyData();
    if (legacy) {
      const converted = StorageService.convertLegacyData(legacy, currentUserId);
      persist(converted);
      setHasLegacyBackup(false);
      return true;
    }
    return false;
  };

  return (
    <DataContext.Provider
      value={{
        data,
        activeRoutine,
        currentWorkoutDay,
        isSyncing,
        setCurrentWorkoutDay,
        saveWorkoutSession,
        deleteWorkoutSession,
        saveWorkoutDraft,
        getWorkoutDraft,
        clearWorkoutDraft,
        addWeightRecord,
        deleteWeightRecord,
        addFoodItem,
        deleteFoodItem,
        updateNutritionGoals,
        resetNutritionGoals,
        addPhotoSession,
        deletePhotoSession,
        deletePhoto,
        replacePhoto,
        updatePhotoAngle,
        getPhotosForSession,
        allPhotos,
        addChatMessage,
        clearChat,
        saveCustomRoutine,
        setActiveRoutine,
        exportBackup,
        importBackup,
        hasLegacyBackup,
        importFromExistingLocalStorage
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
