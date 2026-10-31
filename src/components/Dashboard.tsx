import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { TabType } from './Navigation';
import { 
  Dumbbell, 
  Scale, 
  Utensils, 
  MessageSquare, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  Target,
  Camera
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const { data, activeRoutine } = useData();

  const sortedWorkouts = [...data.workoutHistory].sort((a, b) => b.date.localeCompare(a.date));
  const lastWorkout = sortedWorkouts[0];

  // Calculate next workout in routine rotation
  const routineDays = activeRoutine.days || [];
  let nextDayIndex = 0;
  if (lastWorkout && routineDays.length > 0) {
    const lastIdx = routineDays.findIndex(d => d.dayName === lastWorkout.routineName);
    if (lastIdx >= 0) {
      nextDayIndex = (lastIdx + 1) % routineDays.length;
    }
  }
  const nextWorkout = routineDays[nextDayIndex];

  // Current weight and trend
  const weights = [...data.weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : userProfile.weight;
  const initialWeight = weights.length > 0 ? weights[0].weight : (data.nutritionGoals.startWeight || userProfile.weight);
  const weightChange = (currentWeight - initialWeight).toFixed(1);

  // Weekly workouts count (last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thisWeekWorkouts = data.workoutHistory.filter(w => w.date >= sevenDaysAgo).length;

  // Today nutrition stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = data.nutritionLogs[todayStr] || [];
  const consumedCalories = todayMeals.reduce((sum, item) => sum + item.calories, 0);
  const consumedProtein = todayMeals.reduce((sum, item) => sum + item.protein, 0);
  const targetCalories = data.nutritionGoals.calories || 2500;
  const targetProtein = data.nutritionGoals.protein || 125;
  const caloriesPercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  const goalTranslations: Record<string, string> = {
    hypertrophy: 'Hipertrofia (Ganancia muscular)',
    fat_loss: 'Pérdida de grasa',
    recomposition: 'Recomposición corporal',
    strength: 'Aumento de fuerza',
    endurance: 'Resistencia muscular',
    general_fitness: 'Acondicionamiento físico'
  };

  return (
    <div className="space-y-4">
      {/* Welcome & Goal Banner */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl p-5 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#ff7a2f] uppercase bg-[#ff7a2f]/10 px-2.5 py-1 rounded-full border border-[#ff7a2f]/30">
              {goalTranslations[userProfile.goal] || 'Entrenamiento'}
            </span>
            <h2 className="text-2xl font-bold font-heading tracking-wide mt-2 text-[#f2efe9]">
              HOLA, {userProfile.displayName ? userProfile.displayName.toUpperCase() : 'ATLETA'}
            </h2>
            <p className="text-sm text-[#9a958b] mt-1">
              {activeRoutine.title} ({activeRoutine.targetDays} días/sem)
            </p>
          </div>
          <button
            onClick={() => onNavigate('ia')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white rounded-xl font-semibold text-sm transition shadow-md shadow-[#ff7a2f]/20 cursor-pointer w-full md:w-auto"
          >
            <Sparkles size={16} />
            <span>Consultar Coach IA</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-xl text-center">
          <span className="text-xs text-[#9a958b] font-medium uppercase tracking-wider block">Peso Actual</span>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="font-heading text-3xl font-bold text-[#f2efe9]">{currentWeight}</span>
            <span className="text-xs text-[#9a958b]">kg</span>
          </div>
          <span className={`text-xs font-medium mt-1 inline-block ${Number(weightChange) >= 0 ? 'text-[#51cf66]' : 'text-amber-400'}`}>
            {Number(weightChange) > 0 ? `+${weightChange}` : weightChange} kg total
          </span>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-xl text-center">
          <span className="text-xs text-[#9a958b] font-medium uppercase tracking-wider block">Esta Semana</span>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="font-heading text-3xl font-bold text-[#f2efe9]">{thisWeekWorkouts}</span>
            <span className="text-xs text-[#9a958b]">/ {userProfile.daysAvailable} días</span>
          </div>
          <span className="text-xs text-[#9a958b] mt-1 inline-block">
            {thisWeekWorkouts >= userProfile.daysAvailable ? '🎉 Meta lograda' : 'En camino'}
          </span>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-xl text-center">
          <span className="text-xs text-[#9a958b] font-medium uppercase tracking-wider block">Calorías Hoy</span>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="font-heading text-3xl font-bold text-[#f2efe9]">{consumedCalories}</span>
            <span className="text-xs text-[#9a958b]">/ {targetCalories}</span>
          </div>
          <div className="w-full bg-[#2c2b29] rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-[#ff7a2f] h-full rounded-full transition-all duration-300" style={{ width: `${caloriesPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-xl text-center">
          <span className="text-xs text-[#9a958b] font-medium uppercase tracking-wider block">Proteína Hoy</span>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="font-heading text-3xl font-bold text-[#f2efe9]">{consumedProtein}</span>
            <span className="text-xs text-[#9a958b]">/ {targetProtein} g</span>
          </div>
          <span className="text-xs text-[#9a958b] mt-1 inline-block">
            {Math.max(0, targetProtein - consumedProtein)} g restantes
          </span>
        </div>
      </div>

      {/* Routine next / last card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Next workout */}
        <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#ff7a2f]">Próximo Entrenamiento</span>
              <Dumbbell size={16} className="text-[#ff7a2f]" />
            </div>
            {nextWorkout ? (
              <div>
                <h3 className="text-xl font-bold font-heading text-[#f2efe9] mb-1">{nextWorkout.dayName}</h3>
                <p className="text-sm text-[#9a958b] mb-3">{nextWorkout.focus}</p>
                <div className="text-xs text-[#77736b] space-y-1">
                  {nextWorkout.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{ex.name}</span>
                      <span>{ex.sets} × {ex.repRange}</span>
                    </div>
                  ))}
                  {nextWorkout.exercises.length > 3 && (
                    <p className="text-xs text-[#ff7a2f] mt-1">+ {nextWorkout.exercises.length - 3} ejercicios más</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#9a958b]">No hay rutina seleccionada.</p>
            )}
          </div>

          <button
            onClick={() => onNavigate('ent')}
            className="mt-4 w-full py-2.5 px-4 bg-[#2b1d14] hover:bg-[#ff7a2f]/30 border border-[#ff7a2f]/50 text-[#ff7a2f] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Iniciar Sesión</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Last workout completed */}
        <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9a958b]">Último Registro</span>
              <CheckCircle2 size={16} className="text-[#51cf66]" />
            </div>
            {lastWorkout ? (
              <div>
                <h3 className="text-xl font-bold font-heading text-[#f2efe9] mb-1">{lastWorkout.routineName}</h3>
                <p className="text-sm text-[#9a958b] mb-2">
                  Fecha: {new Date(lastWorkout.date + 'T00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · Energía {lastWorkout.energy}/5
                </p>
                {lastWorkout.notes && (
                  <p className="text-xs text-[#77736b] bg-[#121212] p-2 rounded-lg italic">
                    "{lastWorkout.notes}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#9a958b]">Aún no has registrado ninguna sesión.</p>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onNavigate('coach')}
              className="flex-1 py-2 px-3 bg-[#121212] hover:bg-[#252525] border border-[#2c2b29] text-xs font-semibold rounded-xl transition text-center"
            >
              Ver análisis de sobrecarga
            </button>
            <button
              onClick={() => onNavigate('peso')}
              className="flex-1 py-2 px-3 bg-[#121212] hover:bg-[#252525] border border-[#2c2b29] text-xs font-semibold rounded-xl transition text-center"
            >
              Historial de peso
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          onClick={() => onNavigate('rutinas')}
          className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2b29] p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition"
        >
          <div className="w-10 h-10 rounded-full bg-orange-950/40 text-[#ff7a2f] flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <span className="text-xs font-semibold text-[#f2efe9]">Generar Rutinas</span>
        </button>

        <button
          onClick={() => onNavigate('food')}
          className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2b29] p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-950/40 text-[#51cf66] flex items-center justify-center">
            <Utensils size={20} />
          </div>
          <span className="text-xs font-semibold text-[#f2efe9]">Registrar Comida</span>
        </button>

        <button
          onClick={() => onNavigate('evo')}
          className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2b29] p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition"
        >
          <div className="w-10 h-10 rounded-full bg-sky-950/40 text-sky-400 flex items-center justify-center">
            <Camera size={20} />
          </div>
          <span className="text-xs font-semibold text-[#f2efe9]">Fotos de Progreso</span>
        </button>

        <button
          onClick={() => onNavigate('peso')}
          className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2b29] p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition"
        >
          <div className="w-10 h-10 rounded-full bg-purple-950/40 text-purple-400 flex items-center justify-center">
            <Scale size={20} />
          </div>
          <span className="text-xs font-semibold text-[#f2efe9]">Anotar Peso</span>
        </button>
      </div>
    </div>
  );
};
