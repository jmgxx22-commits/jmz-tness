import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { analyzeExerciseProgression, ACTION_STYLES } from '../services/progressionEngine';
import { TabType } from './Navigation';
import { TrendingUp, Dumbbell, Award, AlertCircle, ArrowRight } from 'lucide-react';

interface CoachTabProps {
  onNavigate: (tab: TabType) => void;
}

export const CoachTab: React.FC<CoachTabProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const { data, activeRoutine, setCurrentWorkoutDay } = useData();

  // Selected sub-tab for routine day
  const [selectedDay, setSelectedDay] = useState<string>(activeRoutine.days[0]?.dayName || 'Upper A');

  // Stats calculation
  const history = data.workoutHistory;
  const numSessions = history.length;

  const sortedWorkouts = [...history].sort((a, b) => b.date.localeCompare(a.date));
  const lastWorkout = sortedWorkouts[0];

  // Rotation next
  const routineDays = activeRoutine.days || [];
  let nextDayIndex = 0;
  if (lastWorkout && routineDays.length > 0) {
    const lastIdx = routineDays.findIndex(d => d.dayName === lastWorkout.routineName);
    if (lastIdx >= 0) {
      nextDayIndex = (lastIdx + 1) % routineDays.length;
    }
  }
  const nextDay = routineDays[nextDayIndex];

  // Days since last workout
  let daysSinceLast = null;
  if (lastWorkout) {
    const today = new Date();
    const lastDate = new Date(lastWorkout.date + 'T00:00');
    daysSinceLast = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Energy average last 3 workouts
  const last3 = sortedWorkouts.slice(0, 3);
  const avgEnergy = last3.length > 0
    ? (last3.reduce((acc, curr) => acc + (curr.energy || 3), 0) / last3.length).toFixed(1)
    : '0';

  // Workouts in last 7 days
  const now = new Date();
  const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const countThisWeek = history.filter(w => w.date >= past7Days).length;

  // Rate of weight change in kg / week
  const weights = [...data.weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  let weightRate: number | null = null;
  if (weights.length >= 2) {
    const firstW = weights[0];
    const lastW = weights[weights.length - 1];
    const daysDiff = (new Date(lastW.date).getTime() - new Date(firstW.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff >= 7) {
      weightRate = ((lastW.weight - firstW.weight) / (daysDiff / 7));
    }
  }

  // Active day details
  const activeDayPlan = activeRoutine.days.find(d => d.dayName === selectedDay) || activeRoutine.days[0];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-[#9a958b] italic mb-3">
          Tu coach analiza tus registros para indicarte qué hacer en tu próximo entrenamiento basándose en sobrecarga progresiva.
        </p>
      </div>

      {numSessions === 0 ? (
        <div className="bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl p-8 text-center space-y-3">
          <div className="text-4xl">🏋️</div>
          <h3 className="font-heading text-2xl font-bold text-[#f2efe9]">Aún no hay entrenos registrados</h3>
          <p className="text-sm text-[#9a958b] max-w-md mx-auto">
            Guarda tu primera sesión en la pestaña <strong>Entrenar</strong> y aquí verás los análisis automáticos de sobrecarga progresiva.
          </p>
          <button
            onClick={() => onNavigate('ent')}
            className="px-6 py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white font-semibold rounded-xl text-sm transition"
          >
            Ir a entrenar
          </button>
        </div>
      ) : (
        <>
          {/* Next Recommended Session Banner */}
          <div className="bg-[#1c1c1c] border border-[#2c2b29] p-5 rounded-2xl">
            <span className="text-xs uppercase tracking-wider text-[#9a958b] font-medium">Siguiente sesión sugerida</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1 mb-3">
              <div>
                <h3 className="font-heading text-2xl font-bold text-[#f2efe9]">
                  {nextDay?.dayName} · <span className="text-[#ff7a2f]">{nextDay?.focus}</span>
                </h3>
                <p className="text-xs text-[#9a958b] mt-1">
                  Tu última sesión fue <strong>{lastWorkout.routineName}</strong> ({daysSinceLast === 0 ? 'hoy' : `hace ${daysSinceLast} día${daysSinceLast === 1 ? '' : 's'}`}).
                  {daysSinceLast && daysSinceLast >= 4 ? ' Llevas varios días sin entrenar: retoma sin intentar sobrecompensar.' : ''}
                  {daysSinceLast === 0 ? ' ¡Gran trabajo hoy! Descansa y come bien para sintetizar masa muscular.' : ' Sigue la rotación para estimular cada grupo muscular de manera balanceada.'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (nextDay) setCurrentWorkoutDay(nextDay.dayName);
                  onNavigate('ent');
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white rounded-xl font-bold text-sm whitespace-nowrap shadow-md shadow-[#ff7a2f]/20 cursor-pointer"
              >
                <span>Entrenar ahora</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#2c2b29]">
              <div className="text-center p-2 rounded-xl bg-[#121212]">
                <span className="block font-heading text-2xl font-bold text-[#f2efe9]">
                  {countThisWeek}/{userProfile.daysAvailable}
                </span>
                <span className="text-[11px] text-[#9a958b] uppercase">Esta semana</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-[#121212]">
                <span className="block font-heading text-2xl font-bold text-[#f2efe9]">
                  {avgEnergy}
                </span>
                <span className="text-[11px] text-[#9a958b] uppercase">Energía prom.</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-[#121212]">
                <span className="block font-heading text-2xl font-bold text-[#f2efe9]">
                  {weightRate !== null ? (weightRate > 0 ? `+${weightRate.toFixed(2)}` : weightRate.toFixed(2)) : '—'}
                </span>
                <span className="text-[11px] text-[#9a958b] uppercase">kg / semana</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Routine Tabs for recommendations */}
      <h2 className="text-xl font-bold font-heading text-[#f2efe9] uppercase pt-2">Recomendaciones por ejercicio</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {activeRoutine.days.map((day) => {
          const isSelected = day.dayName === selectedDay;
          return (
            <button
              key={day.dayName}
              onClick={() => setSelectedDay(day.dayName)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'border-[#ff7a2f] bg-[#2b1d14] text-[#ff7a2f]'
                  : 'border-[#2c2b29] bg-[#1c1c1c] text-[#f2efe9] hover:bg-[#252525]'
              }`}
            >
              <div className="font-heading text-base font-bold truncate">{day.dayName}</div>
              <div className="text-xs text-[#9a958b] truncate">{day.focus}</div>
            </button>
          );
        })}
      </div>

      {/* List of exercise guidelines */}
      <div className="space-y-3">
        {activeDayPlan && activeDayPlan.exercises.map((ex, idx) => {
          const prog = analyzeExerciseProgression(ex.name, ex.repRange, data.workoutHistory);
          const style = ACTION_STYLES[prog.action];

          return (
            <div key={idx} className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-lg font-bold text-[#f2efe9]">{ex.name}</h4>
                  <div className="text-xs text-[#9a958b]">Objetivo: {ex.sets} × {ex.repRange}</div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: style.bg, color: style.color }}
                >
                  {style.label}
                </span>
              </div>

              {prog.action !== 'new' && (
                <div className="text-sm font-semibold text-[#f2efe9]">
                  Próxima meta: <span className="text-[#ff7a2f]">{prog.goal}</span>
                </div>
              )}

              <p className="text-xs text-[#dcdad5] leading-relaxed">
                {prog.explanation}
              </p>

              {prog.historySummary.length > 0 && (
                <div className="bg-[#121212] p-2.5 rounded-xl text-xs text-[#9a958b] space-y-1">
                  <div className="font-semibold text-[#f2efe9]">Historial reciente:</div>
                  {prog.historySummary.map((item, hi) => (
                    <div key={hi} className="flex justify-between font-mono text-[11px]">
                      <span>{item.split(':')[0]}</span>
                      <span className="text-[#f2efe9]">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-[#1c1c1c]/50 border border-[#2c2b29] rounded-xl text-xs text-[#77736b]">
        El motor de progresión de J-MZ Tness analiza series, repeticiones y sensaciones. Si experimentas dolor o molestias, prioriza la recuperación y consulta a un especialista.
      </div>
    </div>
  );
};
