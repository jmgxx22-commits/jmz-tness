import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { PRESET_FOODS } from '../constants/defaultData';
import { analyzeMealPhoto, MealAnalysisResponse } from '../services/geminiService';
import { PhotoStorage } from '../services/photoStorage';
import { Plus, Trash2, Camera, ChevronDown, ChevronUp, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface NutritionTabProps {
  showToast: (msg: string) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({ showToast }) => {
  const { data, addFoodItem, deleteFoodItem, updateNutritionGoals, resetNutritionGoals } = useData();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // AI Photo Analysis State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState('');
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResponse | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const dayLogs = data.nutritionLogs[selectedDate] || [];

  // Sums for selected day
  const totals = dayLogs.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      carbs: acc.carbs + curr.carbs,
      fat: acc.fat + curr.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goals = data.nutritionGoals;
  const calPercent = goals.calories > 0 ? totals.calories / goals.calories : 0;
  const remainingCals = goals.calories - totals.calories;

  // Ring circular calculations
  const R = 54;
  const C = 2 * Math.PI * R;
  const strokeDashoffset = C * (1 - Math.min(calPercent, 1));
  const isOverCal = calPercent > 1.1;

  // Macro progress helper
  const renderMacroBar = (label: string, current: number, target: number, color: string) => {
    const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    return (
      <div className="my-2.5">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#9a958b]">{label}</span>
          <span>
            <strong className="text-[#f2efe9]">{Math.round(current)}</strong> / {target} g · {pct}%
          </span>
        </div>
        <div className="h-2 w-full bg-[#2c2b29] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  const handleAddPreset = (food: typeof PRESET_FOODS[0]) => {
    addFoodItem(
      {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      },
      selectedDate
    );
    showToast(`Agregado: ${food.name}`);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cals = parseInt(customKcal, 10);
    if (isNaN(cals) || cals <= 0) {
      showToast('Por favor escribe las calorías');
      return;
    }

    addFoodItem(
      {
        name: customName.trim() || 'Comida',
        calories: cals,
        protein: parseFloat(customProt) || 0,
        carbs: parseFloat(customCarbs) || 0,
        fat: parseFloat(customFat) || 0,
      },
      selectedDate
    );

    setCustomName('');
    setCustomKcal('');
    setCustomProt('');
    setCustomCarbs('');
    setCustomFat('');
    showToast('Comida registrada');
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await PhotoStorage.compressImage(file, 1200, 0.85);
      setPhotoPreview(compressedDataUrl);
      setAnalysisResult(null);
      setPhotoError(null);
    } catch (err) {
      showToast('Error procesando la imagen');
    }
  };

  const runAnalysis = async () => {
    if (!photoPreview) return;
    setAnalyzingPhoto(true);
    setPhotoError(null);
    try {
      const res = await analyzeMealPhoto(photoPreview, photoNote);
      setAnalysisResult(res);
      showToast('¡Plato analizado con éxito!');
    } catch (err: any) {
      setPhotoError(err.message || 'Error al comunicarse con la IA de Gemini.');
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  const confirmAddPhotoFoods = () => {
    if (!analysisResult?.items) return;
    analysisResult.items.forEach(item => {
      addFoodItem(
        {
          name: `${item.n}${item.por ? ` (${item.por})` : ''}`,
          calories: item.k,
          protein: item.p,
          carbs: item.c,
          fat: item.f,
          portion: item.por
        },
        selectedDate
      );
    });
    setPhotoPreview(null);
    setAnalysisResult(null);
    setPhotoNote('');
    showToast('Alimentos añadidos al registro del día');
  };

  const isGoalMet = calPercent >= 0.9 && totals.protein >= goals.protein * 0.9;

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-2xl flex items-center justify-between">
        <label className="text-xs text-[#9a958b] font-medium">Seleccionar Día:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-1.5 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
        />
      </div>

      {/* Main Calories & Macros Summary Card */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Calorie Ring */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke="#2c2b29"
                strokeWidth="12"
              />
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={isOverCal ? '#ef4444' : '#ff7a2f'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-heading text-3xl font-extrabold text-[#f2efe9]">
                {Math.round(calPercent * 100)}%
              </span>
              <span className="text-[10px] uppercase text-[#9a958b] tracking-wider">de tu meta</span>
            </div>
          </div>

          {/* Calorie Numbers */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex justify-between py-1.5 border-b border-[#2c2b29]">
              <span className="text-sm text-[#9a958b]">Consumidas</span>
              <span className="font-bold text-sm text-[#f2efe9]">{totals.calories} kcal</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2c2b29]">
              <span className="text-sm text-[#9a958b]">Meta Diaria</span>
              <span className="font-bold text-sm text-[#f2efe9]">{goals.calories} kcal</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2c2b29]">
              <span className="text-sm text-[#9a958b]">
                {remainingCals >= 0 ? 'Restantes' : 'Excedente'}
              </span>
              <span className={`font-bold text-sm ${remainingCals < 0 ? 'text-red-400' : 'text-[#51cf66]'}`}>
                {Math.abs(remainingCals)} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="mt-4 pt-3 border-t border-[#2c2b29]">
          {renderMacroBar('Proteínas', totals.protein, goals.protein, '#ff7a2f')}
          {renderMacroBar('Carbohidratos', totals.carbs, goals.carbs, '#38bdf8')}
          {renderMacroBar('Grasas', totals.fat, goals.fat, '#eab308')}
        </div>

        <div className="mt-3 text-xs">
          {isGoalMet ? (
            <span className="text-[#51cf66] font-medium flex items-center gap-1.5">
              ✓ Día completado: calorías y proteínas sobre el 90%.
            </span>
          ) : (
            <span className="text-[#9a958b]">
              Te faltan {Math.max(remainingCals, 0)} kcal y {Math.max(0, Math.round(goals.protein - totals.protein))} g de proteína para tu objetivo.
            </span>
          )}
        </div>
      </div>

      {/* AI Photo Calorie Estimation */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="text-[#ff7a2f]" size={18} />
            <h3 className="font-heading text-lg font-bold text-[#f2efe9]">Calcular Plato con Foto (IA)</h3>
          </div>
          <span className="text-[10px] font-semibold bg-[#ff7a2f]/20 text-[#ff7a2f] px-2 py-0.5 rounded">
            Gemini Vision
          </span>
        </div>
        <p className="text-xs text-[#9a958b]">
          Toma o sube una foto de tu comida. La IA identificará los ingredientes, porciones y calorías estimadas.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-2.5 px-3 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Camera size={14} />
            <span>Tomar Foto</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-3 bg-[#121212] hover:bg-[#252525] border border-[#2c2b29] text-[#f2efe9] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Subir Imagen</span>
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelected}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelected}
          />
        </div>

        {photoPreview && (
          <div className="space-y-3 pt-2">
            <div className="relative rounded-xl overflow-hidden bg-black max-h-60 flex items-center justify-center">
              <img src={photoPreview} alt="Plato" className="max-h-60 object-contain w-full" />
            </div>
            <input
              type="text"
              placeholder="Detalles opcionales (ej: son 2 tazas de arroz, carne asada con poco aceite)"
              value={photoNote}
              onChange={(e) => setPhotoNote(e.target.value)}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-xs text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
            />
            <div className="flex gap-2">
              <button
                onClick={runAnalysis}
                disabled={analyzingPhoto}
                className="flex-1 py-2 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:bg-neutral-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {analyzingPhoto ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analizando con Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{analysisResult ? 'Analizar de nuevo' : 'Analizar foto'}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setPhotoPreview(null);
                  setAnalysisResult(null);
                }}
                className="px-3 py-2 bg-transparent text-xs text-[#9a958b] hover:text-[#f2efe9]"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {photoError && (
          <p className="text-xs text-red-400 mt-2">{photoError}</p>
        )}

        {analysisResult && (
          <div className="mt-3 p-3 bg-[#121212] border border-[#2c2b29] rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#f2efe9]">Resultados del análisis</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#2c2b29] text-[#9a958b]">
                Confianza: {analysisResult.confidence}
              </span>
            </div>
            <div className="divide-y divide-[#2c2b29]">
              {analysisResult.items.map((item, idx) => (
                <div key={idx} className="py-2 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-medium text-[#f2efe9]">{item.n}</span>
                    {item.por && <span className="text-[#9a958b] ml-1">({item.por})</span>}
                  </div>
                  <div className="font-mono text-[#9a958b]">
                    {item.k} kcal | P: {item.p}g C: {item.c}g G: {item.f}g
                  </div>
                </div>
              ))}
            </div>
            {analysisResult.notes && (
              <p className="text-xs text-[#9a958b] italic pt-1 border-t border-[#2c2b29]">
                Nota IA: {analysisResult.notes}
              </p>
            )}
            <button
              onClick={confirmAddPhotoFoods}
              className="w-full mt-2 py-2 bg-[#51cf66] hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Agregar estos alimentos al día
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Presets */}
      <div>
        <h3 className="font-heading text-lg font-bold text-[#f2efe9] uppercase mb-2">Agregar Rápido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_FOODS.map((food, i) => (
            <button
              key={i}
              onClick={() => handleAddPreset(food)}
              className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2b29] hover:border-[#ff7a2f] p-2.5 rounded-xl text-left transition cursor-pointer"
            >
              <div className="font-medium text-xs text-[#f2efe9] truncate">{food.name}</div>
              <div className="text-[11px] text-[#9a958b] mt-0.5">
                {food.calories} kcal · {food.protein}g prot
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Item Form */}
      <form onSubmit={handleAddCustom} className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl space-y-3">
        <h3 className="font-heading text-lg font-bold text-[#f2efe9] uppercase">Registrar Alimento Personalizado</h3>
        <div>
          <label className="text-xs text-[#9a958b] block mb-1">Nombre</label>
          <input
            type="text"
            placeholder="Ej: Licuado de plátano con avena"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Calorías</label>
            <input
              type="number"
              placeholder="kcal"
              value={customKcal}
              onChange={(e) => setCustomKcal(e.target.value)}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-2 py-1.5 text-sm text-[#f2efe9] text-center"
            />
          </div>
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Prot (g)</label>
            <input
              type="number"
              step="0.1"
              placeholder="g"
              value={customProt}
              onChange={(e) => setCustomProt(e.target.value)}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-2 py-1.5 text-sm text-[#f2efe9] text-center"
            />
          </div>
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Carbs (g)</label>
            <input
              type="number"
              step="0.1"
              placeholder="g"
              value={customCarbs}
              onChange={(e) => setCustomCarbs(e.target.value)}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-2 py-1.5 text-sm text-[#f2efe9] text-center"
            />
          </div>
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Grasa (g)</label>
            <input
              type="number"
              step="0.1"
              placeholder="g"
              value={customFat}
              onChange={(e) => setCustomFat(e.target.value)}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-2 py-1.5 text-sm text-[#f2efe9] text-center"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-[#2b1d14] hover:bg-[#ff7a2f]/20 border border-[#ff7a2f]/50 text-[#ff7a2f] font-semibold rounded-xl text-sm transition cursor-pointer"
        >
          Agregar al día
        </button>
      </form>

      {/* Consumed Food List */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
        <h3 className="font-heading text-lg font-bold text-[#f2efe9] uppercase mb-2">Comidas de Hoy</h3>
        {dayLogs.length === 0 ? (
          <p className="text-xs text-[#9a958b]">Aún no has registrado alimentos para esta fecha.</p>
        ) : (
          <div className="divide-y divide-[#2c2b29]">
            {dayLogs.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#f2efe9]">{item.name}</span>
                  <div className="text-xs text-[#9a958b]">
                    {item.calories} kcal · P: {item.protein}g | C: {item.carbs}g | G: {item.fat}g
                  </div>
                </div>
                <button
                  onClick={() => deleteFoodItem(selectedDate, item.id)}
                  className="text-[#9a958b] hover:text-red-400 p-1"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal configuration */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#202020] transition cursor-pointer"
        >
          <span className="font-heading text-lg font-bold text-[#f2efe9]">⚙️ Configuración y Metas de Nutrición</span>
          {showConfig ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showConfig && (
          <div className="p-4 pt-0 space-y-3 border-t border-[#2c2b29] bg-[#161616]">
            <p className="text-xs text-[#9a958b]">
              Los valores calculados son orientativos para apoyar tu objetivo y entrenamiento.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-[#9a958b]">Calorías</label>
                <input
                  type="number"
                  value={goals.calories}
                  onChange={(e) => updateNutritionGoals({ calories: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] rounded-lg p-2 text-sm text-[#f2efe9]"
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b]">Proteínas (g)</label>
                <input
                  type="number"
                  value={goals.protein}
                  onChange={(e) => updateNutritionGoals({ protein: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] rounded-lg p-2 text-sm text-[#f2efe9]"
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b]">Carbohidratos (g)</label>
                <input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) => updateNutritionGoals({ carbs: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] rounded-lg p-2 text-sm text-[#f2efe9]"
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b]">Grasas (g)</label>
                <input
                  type="number"
                  value={goals.fat}
                  onChange={(e) => updateNutritionGoals({ fat: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] rounded-lg p-2 text-sm text-[#f2efe9]"
                />
              </div>
            </div>
            <button
              onClick={resetNutritionGoals}
              className="text-xs text-[#9a958b] hover:text-[#ff7a2f] underline cursor-pointer pt-1"
            >
              Restablecer valores predeterminados
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
