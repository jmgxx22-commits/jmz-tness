import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { generateRoutinesWithAI } from '../services/geminiService';
import { GeneratedRoutinePlan } from '../types';
import { Sparkles, Check, ChevronDown, ChevronUp, Loader2, Dumbbell, Clock, Calendar, RefreshCw } from 'lucide-react';

interface RoutineGeneratorTabProps {
  showToast: (msg: string) => void;
  onSelectRoutine: () => void;
}

export const RoutineGeneratorTab: React.FC<RoutineGeneratorTabProps> = ({ showToast, onSelectRoutine }) => {
  const { userProfile } = useAuth();
  const { data, activeRoutine, saveCustomRoutine, setActiveRoutine } = useData();

  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [generatedRoutines, setGeneratedRoutines] = useState<GeneratedRoutinePlan[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await generateRoutinesWithAI(userProfile, preferences);
      if (res && res.routines && res.routines.length > 0) {
        setGeneratedRoutines(res.routines);
        setSelectedPlanIndex(0);
        showToast(`¡Se generaron ${res.routines.length} propuestas de rutina!`);
      } else {
        throw new Error('No se recibieron rutinas válidas del servidor.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error al conectar con Gemini AI.');
      showToast('Error al generar rutinas. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRoutine = (routine: GeneratedRoutinePlan) => {
    saveCustomRoutine(routine);
    setActiveRoutine(routine.id);
    showToast(`Rutina "${routine.title}" activada para tus entrenamientos.`);
    onSelectRoutine();
  };

  return (
    <div className="space-y-4">
      {/* Current Active Routine Header */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#9a958b]">Rutina Actual en Uso</span>
            <h3 className="font-heading text-2xl font-bold text-[#ff7a2f]">{activeRoutine.title}</h3>
            <p className="text-xs text-[#9a958b]">
              {activeRoutine.splitType} · {activeRoutine.targetDays} días por semana · {activeRoutine.days.length} sesiones
            </p>
          </div>
          <span className="px-3 py-1 bg-[#51cf66]/20 text-[#51cf66] text-xs font-semibold rounded-full border border-[#51cf66]/40">
            Activa
          </span>
        </div>
      </div>

      {/* Generator Prompt Box */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#ff7a2f]" size={20} />
          <h3 className="font-heading text-xl font-bold text-[#f2efe9]">Generador de Rutinas con Inteligencia Artificial</h3>
        </div>
        <p className="text-xs text-[#9a958b] leading-relaxed">
          Gemini AI analizará tu perfil ({userProfile.age} años, {userProfile.weight} kg, objetivo: {userProfile.goal}, {userProfile.daysAvailable} días/semana) y creará 3 propuestas de entrenamiento adaptadas a ti.
        </p>

        <div>
          <label className="text-xs text-[#9a958b] block mb-1">
            Preferencias adicionales o enfoque particular (opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Quiero priorizar brazos y hombros, o entrenar 1 hora máximo..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Diseñando tus rutinas personalizadas...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>{generatedRoutines.length > 0 ? 'Volver a generar opciones' : 'Generar 3 propuestas de rutina'}</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Options View */}
      {generatedRoutines.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold text-[#f2efe9]">Opciones Propuestas</h3>
            <span className="text-xs text-[#9a958b]">Selecciona una para verla en detalle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {generatedRoutines.map((routine, idx) => {
              const isSelected = selectedPlanIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPlanIndex(idx);
                    setExpandedDay(0);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-[#ff7a2f] bg-[#2b1d14] text-[#ff7a2f]'
                      : 'border-[#2c2b29] bg-[#1c1c1c] text-[#f2efe9] hover:bg-[#252525]'
                  }`}
                >
                  <div className="text-xs uppercase font-bold text-[#ff7a2f]">Opción {idx + 1}</div>
                  <div className="font-heading text-lg font-bold text-[#f2efe9] truncate mt-0.5">{routine.title}</div>
                  <div className="text-xs text-[#9a958b] mt-1">{routine.splitType} · {routine.targetDays} días</div>
                </button>
              );
            })}
          </div>

          {/* Details of Selected Plan */}
          {generatedRoutines[selectedPlanIndex] && (
            <div className="bg-[#1c1c1c] border border-[#2c2b29] p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2c2b29]">
                <div>
                  <h4 className="font-heading text-2xl font-bold text-[#f2efe9]">
                    {generatedRoutines[selectedPlanIndex].title}
                  </h4>
                  <p className="text-sm text-[#9a958b] mt-1">
                    {generatedRoutines[selectedPlanIndex].description}
                  </p>
                  <p className="text-xs text-amber-400 mt-2">
                    💡 <strong>Progresión:</strong> {generatedRoutines[selectedPlanIndex].progressionStrategy}
                  </p>
                </div>
                <button
                  onClick={() => handleApplyRoutine(generatedRoutines[selectedPlanIndex])}
                  className="px-4 py-2.5 bg-[#51cf66] hover:bg-emerald-600 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 whitespace-nowrap shadow-md cursor-pointer"
                >
                  <Check size={16} />
                  <span>Elegir y Usar Esta Rutina</span>
                </button>
              </div>

              {/* Days Accordion */}
              <div className="space-y-2">
                {generatedRoutines[selectedPlanIndex].days.map((day, dIdx) => (
                  <div key={dIdx} className="border border-[#2c2b29] rounded-xl overflow-hidden bg-[#161616]">
                    <button
                      onClick={() => setExpandedDay(expandedDay === dIdx ? null : dIdx)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#202020] transition cursor-pointer"
                    >
                      <div>
                        <div className="font-heading text-lg font-bold text-[#f2efe9]">{day.dayName}</div>
                        <div className="text-xs text-[#ff7a2f]">{day.focus}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#9a958b]">{day.exercises.length} ejercicios</span>
                        {expandedDay === dIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {expandedDay === dIdx && (
                      <div className="p-3 border-t border-[#2c2b29] space-y-2 bg-[#121212]">
                        {day.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="bg-[#1c1c1c] p-3 rounded-lg border border-[#2c2b29]/60">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm text-[#f2efe9]">{ex.name}</span>
                              <span className="text-xs font-mono font-bold text-[#ff7a2f] bg-[#2b1d14] px-2 py-0.5 rounded">
                                {ex.sets} × {ex.repRange}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#9a958b] mt-1">
                              <span>Músculo: {ex.targetMuscles}</span>
                              <span>·</span>
                              <span>Descanso: {ex.restSeconds}s</span>
                            </div>
                            {ex.technicalTips && (
                              <p className="text-xs text-[#77736b] mt-1.5 italic">
                                Tip: {ex.technicalTips}
                              </p>
                            )}
                            {ex.alternatives && ex.alternatives.length > 0 && (
                              <p className="text-[11px] text-[#77736b] mt-1">
                                Alternativas: {ex.alternatives.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved / Preloaded Routines */}
      <div className="mt-8 pt-4 border-t border-[#2c2b29]">
        <h3 className="font-heading text-lg font-bold text-[#9a958b] uppercase mb-3">Rutinas Guardadas</h3>
        <div className="space-y-2">
          {data.customRoutines.map((r) => (
            <div
              key={r.id}
              className="p-3 bg-[#1c1c1c] border border-[#2c2b29] rounded-xl flex items-center justify-between"
            >
              <div>
                <span className="font-medium text-sm text-[#f2efe9]">{r.title}</span>
                <span className="text-xs text-[#9a958b] block">{r.splitType} ({r.targetDays} días)</span>
              </div>
              {data.activeRoutineId === r.id ? (
                <span className="text-xs text-[#51cf66] font-semibold bg-[#51cf66]/10 px-2.5 py-1 rounded-full">
                  En uso
                </span>
              ) : (
                <button
                  onClick={() => {
                    setActiveRoutine(r.id);
                    showToast(`Se cambió a la rutina: ${r.title}`);
                  }}
                  className="text-xs text-[#ff7a2f] hover:underline cursor-pointer"
                >
                  Activar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
