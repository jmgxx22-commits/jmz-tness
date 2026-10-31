import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { WorkoutTab } from './components/WorkoutTab';
import { RoutineGeneratorTab } from './components/RoutineGeneratorTab';
import { CoachTab } from './components/CoachTab';
import { AIChatTab } from './components/AIChatTab';
import { WeightTab } from './components/WeightTab';
import { NutritionTab } from './components/NutritionTab';
import { EvolutionTab } from './components/EvolutionTab';
import { BackupTab } from './components/BackupTab';
import { ProfileModal } from './components/ProfileModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#f2efe9] antialiased">
      <div className="max-w-[720px] mx-auto px-4 py-3 sm:py-6 pb-20">
        <Header onOpenProfile={() => setIsProfileOpen(true)} />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="transition-all duration-200">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'ent' && <WorkoutTab showToast={showToast} />}
          {activeTab === 'rutinas' && (
            <RoutineGeneratorTab showToast={showToast} onSelectRoutine={() => setActiveTab('ent')} />
          )}
          {activeTab === 'coach' && <CoachTab onNavigate={setActiveTab} />}
          {activeTab === 'ia' && <AIChatTab />}
          {activeTab === 'peso' && <WeightTab showToast={showToast} />}
          {activeTab === 'food' && <NutritionTab showToast={showToast} />}
          {activeTab === 'evo' && <EvolutionTab showToast={showToast} />}
          {activeTab === 'resp' && <BackupTab showToast={showToast} />}
        </main>

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          showToast={showToast}
        />

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#f2efe9] text-[#121212] px-4 py-2.5 rounded-full text-xs font-bold shadow-xl z-50 flex items-center gap-2 animate-bounce">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
