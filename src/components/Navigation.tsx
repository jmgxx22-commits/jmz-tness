import React from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Scale, 
  Utensils, 
  Camera, 
  Database 
} from 'lucide-react';

export type TabType = 'dashboard' | 'ent' | 'rutinas' | 'coach' | 'ia' | 'peso' | 'food' | 'evo' | 'resp';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={15} /> },
    { id: 'ent', label: 'Entrenar', icon: <Dumbbell size={15} /> },
    { id: 'rutinas', label: 'Rutinas IA', icon: <Sparkles size={15} /> },
    { id: 'coach', label: 'Coach', icon: <TrendingUp size={15} /> },
    { id: 'ia', label: 'Pregunta', icon: <MessageSquare size={15} /> },
    { id: 'peso', label: 'Peso', icon: <Scale size={15} /> },
    { id: 'food', label: 'Comida', icon: <Utensils size={15} /> },
    { id: 'evo', label: 'Evolución', icon: <Camera size={15} /> },
    { id: 'resp', label: 'Respaldo', icon: <Database size={15} /> },
  ];

  return (
    <nav className="flex overflow-x-auto no-scrollbar gap-1.5 bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl p-1.5 mb-5 shadow-sm scroll-smooth">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer select-none ${
              isActive
                ? 'bg-[#ff7a2f] text-white shadow-sm'
                : 'text-[#9a958b] hover:text-[#f2efe9] hover:bg-[#252525]'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
