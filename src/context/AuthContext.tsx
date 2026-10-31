import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DEFAULT_PROFILE } from '../constants/defaultData';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../services/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { StorageService } from '../services/storage';

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: UserProfile;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Sync profile from Firestore when user changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        StorageService.setActiveUserId(user.uid);
        const userDocRef = doc(db, 'users', user.uid);
        
        // Listen to live updates from Firestore
        const unsubProfile = onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as UserProfile;
              setUserProfile(data);
              StorageService.saveUserData(user.uid, {
                ...StorageService.loadUserData(user.uid),
                profile: data
              });
            } else {
              // Create initial profile in Firestore
              const initProf: UserProfile = {
                ...DEFAULT_PROFILE,
                id: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'Atleta J-MZ',
                createdAt: new Date().toISOString()
              };
              setDoc(userDocRef, initProf).catch((err) => {
                handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
              });
              setUserProfile(initProf);
            }
            setIsLoading(false);
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
            setIsLoading(false);
          }
        );

        return () => unsubProfile();
      } else {
        // Fallback to local guest profile
        const localActiveId = StorageService.getActiveUserId();
        const localData = StorageService.loadUserData(localActiveId);
        setUserProfile(localData.profile);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const newProf: UserProfile = {
        ...DEFAULT_PROFILE,
        id: cred.user.uid,
        email: email,
        displayName: name || email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newProf);
      setUserProfile(newProf);
    } catch (err: any) {
      console.error('Registration Error:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setFirebaseUser(null);
      setUserProfile(DEFAULT_PROFILE);
    } catch (err: any) {
      console.error('Logout Error:', err);
      throw err;
    }
  };

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    const newProfile = {
      ...userProfile,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    setUserProfile(newProfile);

    // Save to local cache
    const currentId = firebaseUser?.uid || userProfile.id;
    const localData = StorageService.loadUserData(currentId);
    localData.profile = newProfile;
    if (updatedFields.weight) {
      localData.nutritionGoals.currentWeight = updatedFields.weight;
    }
    if (updatedFields.targetWeight) {
      localData.nutritionGoals.targetWeight = updatedFields.targetWeight;
    }
    StorageService.saveUserData(currentId, localData);

    // Save to Firestore if user logged in
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, newProfile, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
