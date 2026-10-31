import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { PHOTO_ANGLES, MUSCLE_ZONES, PRIORITY_MUSCLE_GROUPS } from '../constants/defaultData';
import { StoredPhoto, PhotoStorage } from '../services/photoStorage';
import { 
  Camera, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  Plus, 
  Eye, 
  Calendar, 
  ChevronRight, 
  HelpCircle,
  Download
} from 'lucide-react';

interface EvolutionTabProps {
  showToast: (msg: string) => void;
}

export const EvolutionTab: React.FC<EvolutionTabProps> = ({ showToast }) => {
  const { data, allPhotos, addPhotoSession, deletePhotoSession, deletePhoto, updatePhotoAngle } = useData();
  const todayStr = new Date().toISOString().split('T')[0];

  // Views: 'home' | 'session' | 'compare'
  const [view, setView] = useState<'home' | 'session' | 'compare'>('home');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // New session modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState(todayStr);
  const [newWeight, setNewWeight] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newMuscles, setNewMuscles] = useState<string[]>([]);
  const [stagedPhotos, setStagedPhotos] = useState<{ dataUrl: string; angle: string; zone?: string; note?: string }[]>([]);
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Compare mode
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const [compareAngle, setCompareAngle] = useState<string>('fr');
  const [compareMode, setCompareMode] = useState<'side' | 'slider'>('side');
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Zoom lightbox modal
  const [lightboxPhoto, setLightboxPhoto] = useState<StoredPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const sessions = [...data.photoSessions].sort((a, b) => b.date.localeCompare(a.date));

  // Handle files selected for new session
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const existingAngles = stagedPhotos.map(p => p.angle);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await PhotoStorage.compressImage(file);
        // Find first unused angle
        const unused = PHOTO_ANGLES.find(a => !existingAngles.includes(a.id));
        const assignedAngle = unused ? unused.id : 'fr';
        existingAngles.push(assignedAngle);

        setStagedPhotos(prev => [
          ...prev,
          {
            dataUrl: compressed,
            angle: assignedAngle,
            zone: '',
            note: ''
          }
        ]);
      } catch (e) {
        showToast('Error al procesar imagen');
      }
    }
  };

  const handleSaveSession = async () => {
    if (stagedPhotos.length === 0) {
      showToast('Agrega al menos una fotografía a la sesión');
      return;
    }
    setIsSavingSession(true);
    try {
      const weightNum = parseFloat(newWeight) || undefined;
      await addPhotoSession(newDate, weightNum, newNotes, newMuscles, stagedPhotos);
      showToast('¡Sesión fotográfica guardada!');
      setShowAddModal(false);
      setStagedPhotos([]);
      setNewNotes('');
      setNewWeight('');
      setNewMuscles([]);
    } catch (e) {
      showToast('Error al guardar la sesión');
    } finally {
      setIsSavingSession(false);
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const selectedSessionPhotos = selectedSession ? allPhotos.filter(p => p.sid === selectedSession.id) : [];

  const getAngleLabel = (angleId: string) => {
    return PHOTO_ANGLES.find(a => a.id === angleId)?.label || angleId;
  };

  return (
    <div className="space-y-4">
      {/* View: Home */}
      {view === 'home' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#f2efe9]">EVOLUCIÓN FÍSICA</h2>
              <p className="text-xs text-[#9a958b]">Documenta tu progreso visual a lo largo del tiempo.</p>
            </div>
            <div className="flex gap-2">
              {sessions.length >= 2 && (
                <button
                  onClick={() => {
                    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
                    setCompareA(sorted[0].id);
                    setCompareB(sorted[sorted.length - 1].id);
                    setView('compare');
                  }}
                  className="px-3 py-2 bg-[#1c1c1c] border border-[#2c2b29] hover:border-[#ff7a2f] text-xs font-semibold text-[#f2efe9] rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal size={14} />
                  <span>Comparar</span>
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-2 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-xs font-bold text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Nueva Sesión</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Cards if has sessions */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-xl text-center">
                <span className="text-xs text-[#9a958b] block">Total Sesiones</span>
                <span className="font-heading text-2xl font-bold text-[#f2efe9]">{sessions.length}</span>
              </div>
              <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-xl text-center">
                <span className="text-xs text-[#9a958b] block">Total Fotos</span>
                <span className="font-heading text-2xl font-bold text-[#f2efe9]">{allPhotos.length}</span>
              </div>
              <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-xl text-center">
                <span className="text-xs text-[#9a958b] block">Primera Sesión</span>
                <span className="font-semibold text-xs text-[#f2efe9]">
                  {new Date(sessions[sessions.length - 1].date + 'T00:00').toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-xl text-center">
                <span className="text-xs text-[#9a958b] block">Última Sesión</span>
                <span className="font-semibold text-xs text-[#f2efe9]">
                  {new Date(sessions[0].date + 'T00:00').toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          )}

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <div className="bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl p-8 text-center space-y-3">
              <div className="text-4xl">📸</div>
              <h3 className="font-heading text-2xl font-bold text-[#f2efe9]">Tu diario visual comienza aquí</h3>
              <p className="text-xs text-[#9a958b] max-w-sm mx-auto">
                Toma tus primeras fotos hoy desde diferentes ángulos y compáralas a medida que progresas.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white font-bold rounded-xl text-sm transition"
              >
                Crear primera sesión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((ses) => {
                const sPhotos = allPhotos.filter(p => p.sid === ses.id);
                const thumb = sPhotos[0]?.dataUrl;

                return (
                  <div
                    key={ses.id}
                    onClick={() => {
                      setSelectedSessionId(ses.id);
                      setView('session');
                    }}
                    className="bg-[#1c1c1c] border border-[#2c2b29] hover:border-[#ff7a2f]/50 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt="Thumbnail"
                          className="w-16 h-20 object-cover rounded-xl border border-[#2c2b29] bg-black"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-[#121212] rounded-xl flex items-center justify-center text-[#77736b] text-xs">
                          Sin fotos
                        </div>
                      )}
                      <div>
                        <div className="font-heading text-lg font-bold text-[#f2efe9]">
                          {new Date(ses.date + 'T00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-[#9a958b] mt-0.5">
                          {ses.weight ? `${ses.weight} kg · ` : ''}{sPhotos.length} fotos
                        </div>
                        {ses.targetMuscleGroups && ses.targetMuscleGroups.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {ses.targetMuscleGroups.map((g, gi) => (
                              <span key={gi} className="text-[10px] bg-[#252525] text-[#9a958b] px-2 py-0.5 rounded-full">
                                {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#9a958b]" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Guide Tips */}
          <details className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl text-xs text-[#9a958b]">
            <summary className="font-semibold text-[#f2efe9] cursor-pointer">
              📋 Consejos para fotos de progreso consistentes
            </summary>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Usa iluminación constante (la misma luz natural o habitación).</li>
              <li>Mantén la misma distancia del lente y altura del teléfono.</li>
              <li>Fondo neutro y limpio.</li>
              <li>Mismas posturas de frente, perfil y espalda.</li>
              <li>Toma las fotos en ayunas por la mañana para evitar variaciones por retención o comida.</li>
            </ul>
          </details>
        </>
      )}

      {/* View: Single Session Details */}
      {view === 'session' && selectedSession && (
        <div className="space-y-4">
          <button
            onClick={() => setView('home')}
            className="text-xs text-[#ff7a2f] hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Volver a lista de sesiones
          </button>

          <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
            <h3 className="font-heading text-2xl font-bold text-[#f2efe9]">
              {new Date(selectedSession.date + 'T00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            {selectedSession.weight && (
              <p className="text-sm font-semibold text-[#ff7a2f] mt-1">Peso: {selectedSession.weight} kg</p>
            )}
            {selectedSession.notes && (
              <p className="text-xs text-[#9a958b] mt-2 italic bg-[#121212] p-2.5 rounded-xl">
                "{selectedSession.notes}"
              </p>
            )}
            {selectedSession.targetMuscleGroups && selectedSession.targetMuscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedSession.targetMuscleGroups.map((g, i) => (
                  <span key={i} className="text-[10px] bg-[#2b1d14] text-[#ff7a2f] px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  deletePhotoSession(selectedSession.id);
                  setView('home');
                  showToast('Sesión eliminada');
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 p-1"
              >
                <Trash2 size={13} />
                <span>Eliminar sesión completa</span>
              </button>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedSessionPhotos.map((photo) => (
              <div key={photo.id} className="bg-[#1c1c1c] border border-[#2c2b29] p-2.5 rounded-2xl flex flex-col gap-2">
                <div
                  className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.ang}
                    className="w-full h-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Eye size={22} className="text-white" />
                  </div>
                </div>

                <select
                  value={photo.ang}
                  onChange={(e) => updatePhotoAngle(photo.id, e.target.value)}
                  className="bg-[#121212] border border-[#2c2b29] text-xs text-[#f2efe9] rounded-lg p-1.5"
                >
                  {PHOTO_ANGLES.map(a => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>

                <div className="flex justify-between items-center px-1">
                  <a
                    href={photo.dataUrl}
                    download={`progreso_${selectedSession.date}_${photo.ang}.jpg`}
                    className="text-xs text-[#9a958b] hover:text-[#f2efe9]"
                  >
                    <Download size={14} />
                  </a>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: Compare Sessions */}
      {view === 'compare' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('home')}
              className="text-xs text-[#ff7a2f] hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Volver
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setCompareMode('side')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${compareMode === 'side' ? 'bg-[#ff7a2f] text-white' : 'bg-[#1c1c1c] text-[#9a958b]'}`}
              >
                Lado a lado
              </button>
              <button
                onClick={() => setCompareMode('slider')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${compareMode === 'slider' ? 'bg-[#ff7a2f] text-white' : 'bg-[#1c1c1c] text-[#9a958b]'}`}
              >
                Deslizador
              </button>
            </div>
          </div>

          {/* Comparison selectors */}
          <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Antes</label>
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl p-2 text-xs text-[#f2efe9]"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.date} {s.weight ? `(${s.weight} kg)` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Después</label>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl p-2 text-xs text-[#f2efe9]"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.date} {s.weight ? `(${s.weight} kg)` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Ángulo</label>
              <select
                value={compareAngle}
                onChange={(e) => setCompareAngle(e.target.value)}
                className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl p-2 text-xs text-[#f2efe9]"
              >
                {PHOTO_ANGLES.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Display */}
          {(() => {
            const photoA = allPhotos.find(p => p.sid === compareA && p.ang === compareAngle);
            const photoB = allPhotos.find(p => p.sid === compareB && p.ang === compareAngle);
            const sessionA = sessions.find(s => s.id === compareA);
            const sessionB = sessions.find(s => s.id === compareB);

            if (!photoA || !photoB) {
              return (
                <div className="bg-[#1c1c1c] border border-[#2c2b29] p-8 rounded-2xl text-center text-sm text-[#9a958b]">
                  Falta la foto de este ángulo ("{getAngleLabel(compareAngle)}") en alguna de las dos sesiones seleccionadas.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {compareMode === 'side' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1c1c1c] p-2.5 rounded-2xl border border-[#2c2b29]">
                      <div className="aspect-[3/4] bg-black rounded-xl overflow-hidden">
                        <img src={photoA.dataUrl} alt="Antes" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-center mt-2">
                        <div className="text-xs font-bold text-[#ff7a2f] uppercase">Antes</div>
                        <div className="text-xs text-[#f2efe9]">{sessionA?.date}</div>
                        <div className="text-[11px] text-[#9a958b]">{sessionA?.weight ? `${sessionA.weight} kg` : ''}</div>
                      </div>
                    </div>
                    <div className="bg-[#1c1c1c] p-2.5 rounded-2xl border border-[#2c2b29]">
                      <div className="aspect-[3/4] bg-black rounded-xl overflow-hidden">
                        <img src={photoB.dataUrl} alt="Después" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-center mt-2">
                        <div className="text-xs font-bold text-[#51cf66] uppercase">Después</div>
                        <div className="text-xs text-[#f2efe9]">{sessionB?.date}</div>
                        <div className="text-[11px] text-[#9a958b]">{sessionB?.weight ? `${sessionB.weight} kg` : ''}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative aspect-[3/4] max-w-sm mx-auto overflow-hidden rounded-2xl border border-[#2c2b29] bg-black">
                      <img src={photoB.dataUrl} alt="Después" className="absolute inset-0 w-full h-full object-contain" />
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPos}%` }}
                      >
                        <img src={photoA.dataUrl} alt="Antes" className="absolute inset-0 w-full h-full object-contain" />
                      </div>
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#ff7a2f]"
                        style={{ left: `${sliderPos}%` }}
                      />
                      <span className="absolute top-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded">
                        Antes ({sessionA?.date})
                      </span>
                      <span className="absolute top-2 right-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded">
                        Después ({sessionB?.date})
                      </span>
                    </div>
                    <div className="max-w-sm mx-auto mt-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        className="w-full accent-[#ff7a2f] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Add New Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl max-w-md w-full p-5 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-2xl font-bold text-[#f2efe9]">Nueva Sesión Fotográfica</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#9a958b] hover:text-[#f2efe9]">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Fecha</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9]"
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Peso corporal (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="ej: 65.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 py-2.5 bg-[#ff7a2f] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Camera size={15} />
                <span>Tomar Foto</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 bg-[#121212] border border-[#2c2b29] text-[#f2efe9] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                <span>Galería</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* List of staged photos */}
            {stagedPhotos.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#9a958b]">Fotos adjuntas ({stagedPhotos.length})</span>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {stagedPhotos.map((photo, i) => (
                    <div key={i} className="bg-[#121212] p-2 rounded-xl border border-[#2c2b29] space-y-1.5">
                      <img src={photo.dataUrl} alt="" className="aspect-[3/4] object-cover rounded-lg w-full" />
                      <select
                        value={photo.angle}
                        onChange={(e) => {
                          const updated = [...stagedPhotos];
                          updated[i].angle = e.target.value;
                          setStagedPhotos(updated);
                        }}
                        className="w-full bg-[#1c1c1c] border border-[#2c2b29] text-xs text-[#f2efe9] rounded p-1"
                      >
                        {PHOTO_ANGLES.map(a => (
                          <option key={a.id} value={a.id}>{a.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setStagedPhotos(stagedPhotos.filter((_, idx) => idx !== i));
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 w-full text-center"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Notas o sensaciones del progreso</label>
              <textarea
                rows={2}
                placeholder="Ej: Mayor definición en hombros, peso estable..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl p-2.5 text-xs text-[#f2efe9] resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Grupos musculares priorizados</label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_MUSCLE_GROUPS.map((g) => {
                  const active = newMuscles.includes(g);
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => {
                        setNewMuscles(active ? newMuscles.filter(x => x !== g) : [...newMuscles, g]);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${active ? 'bg-[#ff7a2f] border-[#ff7a2f] text-white' : 'bg-[#121212] border-[#2c2b29] text-[#9a958b]'}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSaveSession}
              disabled={isSavingSession}
              className="w-full py-3 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:bg-neutral-800 text-white font-bold rounded-xl text-sm transition cursor-pointer"
            >
              {isSavingSession ? 'Guardando...' : 'Completar y Guardar Sesión'}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-semibold">{getAngleLabel(lightboxPhoto.ang)}</span>
            <button
              onClick={() => setLightboxPhoto(null)}
              className="p-2 text-white/80 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
            <img
              src={lightboxPhoto.dataUrl}
              alt="Detalle"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          </div>
          <div className="text-center text-xs text-[#9a958b]">
            J-MZ Tness · Privacidad protegida en tu dispositivo
          </div>
        </div>
      )}
    </div>
  );
};
