import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { analyzeExerciseProgression, ACTION_STYLES } from '../services/progressionEngine';
import { ExerciseEntry, SetEntry, CustomExerciseItem } from '../types';
import { Check, Plus, Trash2, HelpCircle, History, Sparkles } from 'lucide-react';

interface WorkoutTabProps {
  showToast: (msg: string) => void;
  onNavigateToAI?: (prompt: string) => void;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({ showToast, onNavigateToAI }) => {
  const {
    data,
    activeRoutine,
    currentWorkoutDay,
    setCurrentWorkoutDay,
    saveWorkoutSession,
    saveWorkoutDraft,
    getWorkoutDraft,
    clearWorkoutDraft
  } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [energy, setEnergy] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [customExercises, setCustomExercises] = useState<CustomExerciseItem[]>([]);
  const [activeAlternativeModal, setActiveAlternativeModal] = useState<{ exerciseName: string; alternatives: string[] } | null>(null);

  // Find the selected routine day
  const currentDayPlan = activeRoutine.days.find(d => d.dayName === currentWorkoutDay) || activeRoutine.days[0];

  // Find previous session for this routine day
  const previousSessions = data.workoutHistory
    .filter(s => s.routineName === currentWorkoutDay)
    .sort((a, b) => a.date.localeCompare(b.date));
  const lastSession = previousSessions.length > 0 ? previousSessions[previousSessions.length - 1] : null;

  // Load draft or initialize from routine template
  useEffect(() => {
    if (!currentDayPlan) return;

    const draft = getWorkoutDraft(currentWorkoutDay);
    if (draft && Date.now() - (draft._t || 0) < 1000 * 60 * 60 * 24 * 3) { // 3 days valid
      setDate(draft.d || todayStr);
      setEnergy(Number(draft.e) || 3);
      setNotes(draft.n || '');
      setExercises(draft.exercises || initExercises(currentDayPlan));
      setCustomExercises(draft.customExercises || []);
    } else {
      setDate(todayStr);
      setEnergy(3);
      setNotes('');
      setExercises(initExercises(currentDayPlan));
      setCustomExercises([]);
    }
  }, [currentWorkoutDay, activeRoutine]);

  function initExercises(dayPlan: typeof currentDayPlan): ExerciseEntry[] {
    return dayPlan.exercises.map(ex => ({
      name: ex.name,
      targetSets: `${ex.sets} × ${ex.repRange}`,
      notes: '',
      solidForm: true,
      sets: Array.from({ length: 3 }, (_, idx) => ({
        setNumber: idx + 1,
        weight: '',
        reps: '',
        completed: false
      }))
    }));
  }

  // Handle draft changes
  const updateDraft = (updated = {}) => {
    saveWorkoutDraft(currentWorkoutDay, {
      d: date,
      e: energy,
      n: notes,
      exercises,
      customExercises,
      ...updated
    });
  };

  const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', val: string) => {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      [field]: val
    };
    setExercises(updated);
    updateDraft({ exercises: updated });
  };

  const handleCustomSetChange = (cIndex: number, setIndex: number, field: 'weight' | 'reps', val: string) => {
    const updated = [...customExercises];
    updated[cIndex].sets[setIndex] = {
      ...updated[cIndex].sets[setIndex],
      [field]: val
    };
    setCustomExercises(updated);
    updateDraft({ customExercises: updated });
  };

  const handleToggleForm = (exIndex: number) => {
    const updated = [...exercises];
    updated[exIndex].solidForm = !updated[exIndex].solidForm;
    setExercises(updated);
    updateDraft({ exercises: updated });
  };

  const addCustomExercise = () => {
    const newCustom: CustomExerciseItem = {
      name: '',
      sets: [
        { setNumber: 1, weight: '', reps: '' },
        { setNumber: 2, weight: '', reps: '' },
        { setNumber: 3, weight: '', reps: '' }
      ]
    };
    const updated = [...customExercises, newCustom];
    setCustomExercises(updated);
    updateDraft({ customExercises: updated });
  };

  const removeCustomExercise = (index: number) => {
    const updated = customExercises.filter((_, i) => i !== index);
    setCustomExercises(updated);
    updateDraft({ customExercises: updated });
  };

  const onSave = () => {
    let hasAnySet = false;
    for (const ex of exercises) {
      for (const s of ex.sets) {
        if (s.weight && s.reps) hasAnySet = true;
      }
    }
    for (const cx of customExercises) {
      for (const s of cx.sets) {
        if (s.weight && s.reps) hasAnySet = true;
      }
    }

    if (!hasAnySet) {
      showToast('Anota al menos una serie con peso y repeticiones');
      return;
    }

    saveWorkoutSession({
      routineId: activeRoutine.id,
      routineName: currentDayPlan.dayName,
      subtitle: currentDayPlan.focus,
      date,
      energy,
      notes,
      exercises,
      customExercises
    });

    clearWorkoutDraft(currentWorkoutDay);
    showToast('¡Sesión guardada con éxito! 💪');

    // Reset fields for current day
    setExercises(initExercises(currentDayPlan));
    setCustomExercises([]);
    setNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Routine Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {activeRoutine.days.map((day) => {
          const isSelected = day.dayName === currentWorkoutDay;
          return (
            <button
              key={day.dayName}
              onClick={() => setCurrentWorkoutDay(day.dayName)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'border-[#ff7a2f] bg-[#2b1d14] text-[#ff7a2f]'
                  : 'border-[#2c2b29] bg-[#1c1c1c] text-[#f2efe9] hover:bg-[#252525]'
              }`}
            >
              <div className="font-heading text-lg font-bold truncate">{day.dayName}</div>
              <div className="text-xs text-[#9a958b] truncate">{day.focus}</div>
            </button>
          );
        })}
      </div>

      {/* Session Metadata Header */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                updateDraft({ d: e.target.value });
              }}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
            />
          </div>
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Nivel de Energía (1-5)</label>
            <select
              value={energy}
              onChange={(e) => {
                setEnergy(Number(e.target.value));
                updateDraft({ e: Number(e.target.value) });
              }}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
            >
              <option value={1}>1 - Muy baja / Fatigado</option>
              <option value={2}>2 - Regular</option>
              <option value={3}>3 - Normal / Aceptable</option>
              <option value={4}>4 - Buena energía</option>
              <option value={5}>5 - Óptima / Máximo rendimiento</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-[#9a958b] mt-3">
          {lastSession ? (
            <span>
              Última vez: <strong className="text-[#f2efe9]">{new Date(lastSession.date + 'T00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</strong>. Los números grises son tu marca anterior. Pesos en libras (lb).
            </span>
          ) : (
            'Aún no tienes registros de esta sesión en tu historial.'
          )}
        </p>
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        {currentDayPlan.exercises.map((templateEx, exIdx) => {
          const exState = exercises[exIdx] || { name: templateEx.name, sets: [], solidForm: true };
          const prog = analyzeExerciseProgression(templateEx.name, templateEx.repRange, data.workoutHistory);
          const lastExLogged = lastSession?.exercises.find(e => e.name === templateEx.name);

          return (
            <div key={exIdx} className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#f2efe9] tracking-wide">{templateEx.name}</h3>
                  <div className="text-xs text-[#ff7a2f] font-semibold">{templateEx.sets} × {templateEx.repRange} · Descanso: {templateEx.restSeconds}s</div>
                </div>

                {templateEx.alternatives && templateEx.alternatives.length > 0 && (
                  <button
                    onClick={() => setActiveAlternativeModal({ exerciseName: templateEx.name, alternatives: templateEx.alternatives || [] })}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#252525] hover:bg-[#2c2b29] text-[#9a958b] flex items-center gap-1"
                  >
                    <HelpCircle size={13} />
                    <span>Variantes</span>
                  </button>
                )}
              </div>

              {/* Coach Feedback Badge */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                  style={{ backgroundColor: ACTION_STYLES[prog.action]?.bg || '#252525', color: ACTION_STYLES[prog.action]?.color || '#fff' }}
                >
                  {prog.label}
                </span>
                <span className="text-[#9a958b] truncate">{prog.goal}</span>
              </div>

              {/* Set entries */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((sIdx) => {
                  const setVal = exState.sets[sIdx] || { weight: '', reps: '' };
                  const prevWeight = lastExLogged?.sets[sIdx]?.weight || '';
                  const prevReps = lastExLogged?.sets[sIdx]?.reps || '';

                  return (
                    <div key={sIdx} className="bg-[#121212] p-2.5 rounded-xl border border-[#2c2b29]/50 flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#9a958b] tracking-wider">Serie {sIdx + 1}</span>
                      <input
                        type="number"
                        step="0.5"
                        placeholder={prevWeight ? `${prevWeight} lb` : 'lb'}
                        value={setVal.weight}
                        onChange={(e) => handleSetChange(exIdx, sIdx, 'weight', e.target.value)}
                        className="bg-[#1c1c1c] text-center font-bold text-[#f2efe9] border border-[#2c2b29] rounded-lg py-1.5 text-sm focus:outline-none focus:border-[#ff7a2f]"
                      />
                      <input
                        type="number"
                        placeholder={prevReps ? `${prevReps} reps` : 'reps'}
                        value={setVal.reps}
                        onChange={(e) => handleSetChange(exIdx, sIdx, 'reps', e.target.value)}
                        className="bg-[#1c1c1c] text-center text-[#f2efe9] border border-[#2c2b29] rounded-lg py-1.5 text-sm focus:outline-none focus:border-[#ff7a2f]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Technique Checkbox */}
              <label className="flex items-center gap-2 text-xs text-[#9a958b] cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={exState.solidForm ?? true}
                  onChange={() => handleToggleForm(exIdx)}
                  className="rounded bg-[#121212] border-[#2c2b29] text-[#ff7a2f] focus:ring-0"
                />
                <span className={exState.solidForm ? 'text-[#51cf66]' : 'text-amber-500'}>
                  Técnica sólida y controlada (sin balanceo)
                </span>
              </label>
            </div>
          );
        })}
      </div>

      {/* Custom Exercises Section */}
      {customExercises.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold font-heading text-[#f2efe9] uppercase">Ejercicios Adicionales</h2>
          {customExercises.map((cx, i) => (
            <div key={i} className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Nombre del ejercicio (Ej: Elevaciones laterales)"
                  value={cx.name}
                  onChange={(e) => {
                    const updated = [...customExercises];
                    updated[i].name = e.target.value;
                    setCustomExercises(updated);
                    updateDraft({ customExercises: updated });
                  }}
                  className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-1.5 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
                />
                <button
                  onClick={() => removeCustomExercise(i)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Eliminar ejercicio"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {cx.sets.map((set, sIdx) => (
                  <div key={sIdx} className="bg-[#121212] p-2.5 rounded-xl border border-[#2c2b29]/50 flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#9a958b]">Serie {sIdx + 1}</span>
                    <input
                      type="number"
                      placeholder="lb"
                      value={set.weight}
                      onChange={(e) => handleCustomSetChange(i, sIdx, 'weight', e.target.value)}
                      className="bg-[#1c1c1c] text-center font-bold text-[#f2efe9] border border-[#2c2b29] rounded-lg py-1.5 text-sm focus:outline-none focus:border-[#ff7a2f]"
                    />
                    <input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) => handleCustomSetChange(i, sIdx, 'reps', e.target.value)}
                      className="bg-[#1c1c1c] text-center text-[#f2efe9] border border-[#2c2b29] rounded-lg py-1.5 text-sm focus:outline-none focus:border-[#ff7a2f]"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Button to add extra exercise */}
      <button
        type="button"
        onClick={addCustomExercise}
        className="w-full py-3 border border-dashed border-[#2c2b29] hover:border-[#ff7a2f] text-[#9a958b] hover:text-[#f2efe9] rounded-xl flex items-center justify-center gap-2 text-sm transition cursor-pointer"
      >
        <Plus size={16} />
        <span>+ Agregar ejercicio o variante extra</span>
      </button>

      {/* Session Notes */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
        <label className="text-xs text-[#9a958b] block mb-2">Notas de la sesión (sueño, sensaciones, molestias, qué mejorar)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            updateDraft({ n: e.target.value });
          }}
          placeholder="Ejemplo: Buena congestión en pecho, descanso de 7 horas, subir peso en press la próxima sesión..."
          className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl p-3 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f] resize-none"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="w-full py-3.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white font-bold rounded-xl shadow-lg shadow-[#ff7a2f]/20 text-base transition cursor-pointer"
      >
        Guardar sesión
      </button>

      <p className="text-center text-xs text-[#9a958b]">
        Total de sesiones guardadas: {data.workoutHistory.length}
      </p>

      {/* Alternatives Modal */}
      {activeAlternativeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-heading text-xl font-bold text-[#f2efe9]">
              Alternativas para {activeAlternativeModal.exerciseName}
            </h3>
            <p className="text-xs text-[#9a958b]">
              Si la máquina está ocupada o no tienes el equipo, puedes sustituirlo por:
            </p>
            <ul className="space-y-2">
              {activeAlternativeModal.alternatives.map((alt, i) => (
                <li key={i} className="bg-[#121212] p-2.5 rounded-xl border border-[#2c2b29] text-sm text-[#f2efe9] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a2f]"></span>
                  {alt}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setActiveAlternativeModal(null)}
              className="w-full py-2 bg-[#252525] hover:bg-[#2c2b29] text-white font-semibold text-sm rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
