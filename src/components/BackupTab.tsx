import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, Upload, Copy, Database, RefreshCw, CheckCircle, ShieldAlert, Cloud } from 'lucide-react';
import { downloadProjectZip } from '../services/downloadHelper';

interface BackupTabProps {
  showToast: (msg: string) => void;
}

export const BackupTab: React.FC<BackupTabProps> = ({ showToast }) => {
  const { exportBackup, importBackup, hasLegacyBackup, importFromExistingLocalStorage } = useData();
  const { firebaseUser, userProfile } = useAuth();

  const [jsonText, setJsonText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerate = () => {
    const data = exportBackup();
    setJsonText(data);
    showToast('Copia de seguridad generada');
  };

  const handleCopy = () => {
    if (!jsonText) {
      handleGenerate();
    }
    navigator.clipboard.writeText(jsonText || exportBackup());
    setCopySuccess(true);
    showToast('Copiado al portapapeles');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleImport = () => {
    if (!jsonText.trim()) {
      showToast('Pega los datos del respaldo primero');
      return;
    }
    const success = importBackup(jsonText.trim());
    if (success) {
      showToast('¡Datos restaurados con éxito!');
      setJsonText('');
    } else {
      showToast('Error: Formato de respaldo no válido');
    }
  };

  const handleMigrateLegacy = () => {
    const ok = importFromExistingLocalStorage();
    if (ok) {
      showToast('¡Datos anteriores de gymjournal_v1 importados con éxito!');
    } else {
      showToast('No se encontraron datos anteriores para importar');
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Account Banner */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-[#9a958b] flex items-center gap-1.5">
            {firebaseUser ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Cloud size={13} /> Sincronizado en la Nube (Firebase)
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <Database size={13} /> Almacenamiento Local (Dispositivo)
              </span>
            )}
          </div>
          <div className="text-base font-bold text-[#f2efe9] mt-0.5">
            {firebaseUser?.email || userProfile.displayName}
          </div>
          <div className="text-xs text-[#77736b] mt-0.5">
            ID: <span className="font-mono text-[11px]">{userProfile.id}</span>
          </div>
        </div>
      </div>

      {/* Migration Alert if legacy data exists */}
      {hasLegacyBackup && (
        <div className="bg-[#2b1d14] border border-[#ff7a2f] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-heading text-lg font-bold text-[#ff7a2f] flex items-center gap-2">
              <CheckCircle size={18} />
              Datos Anteriores Detectados
            </h4>
            <p className="text-xs text-[#f2efe9]">
              Se encontró historial previo de gymjournal_v1 en este dispositivo. Puedes incorporarlo a tu cuenta actual en 1 clic.
            </p>
          </div>
          <button
            onClick={handleMigrateLegacy}
            className="px-4 py-2 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer shadow transition"
          >
            Importar Datos Anteriores
          </button>
        </div>
      )}

      {/* Download Complete Project ZIP */}
      <div className="bg-[#1c1c1c] border border-[#ff7a2f]/40 p-4 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Download size={20} className="text-[#ff7a2f]" />
            <div>
              <h3 className="font-heading text-lg font-bold text-[#f2efe9] uppercase leading-tight">
                Descargar Proyecto Completo (ZIP)
              </h3>
              <p className="text-xs text-[#9a958b]">
                Incluye todos los archivos, backend seguro, funciones de Netlify, reglas de Firebase y PWA.
              </p>
            </div>
          </div>
          <button
            onClick={() => downloadProjectZip((msg) => showToast(msg))}
            className="px-4 py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg"
          >
            <Download size={15} />
            <span>Descargar ZIP (235 KB)</span>
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-[#ff7a2f]" />
          <h3 className="font-heading text-lg font-bold text-[#f2efe9] uppercase">Copia de Seguridad y Migración</h3>
        </div>
        <p className="text-xs text-[#9a958b] leading-relaxed">
          Genera un archivo o texto JSON con todo tu historial de entrenamientos, pesos, comidas y rutinas. También puedes importar un respaldo para transferirlo entre dispositivos o navegadores.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-[#2b1d14] border border-[#ff7a2f]/50 hover:bg-[#ff7a2f]/30 text-[#ff7a2f] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
          >
            <RefreshCw size={14} />
            <span>Generar Respaldo</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
          >
            <Copy size={14} />
            <span>{copySuccess ? '¡Copiado!' : 'Copiar al Portapapeles'}</span>
          </button>
        </div>

        <textarea
          rows={5}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Aquí aparecerá el código de respaldo generado, o pega aquí el código para restaurar..."
          className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl p-3 text-xs text-[#f2efe9] font-mono focus:outline-none focus:border-[#ff7a2f]"
        />

        <div className="flex justify-end">
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-[#252525] hover:bg-[#2c2b29] text-[#f2efe9] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer border border-[#3c3b39] transition"
          >
            <Upload size={14} />
            <span>Restaurar desde Respaldo</span>
          </button>
        </div>
      </div>

      <div className="p-3 bg-[#1c1c1c]/50 border border-[#2c2b29] rounded-xl text-xs text-[#77736b]">
        🔒 Privacidad garantizada: tus datos se guardan en tu base de datos privada en Firebase con reglas de seguridad estrictas que impiden el acceso a otros usuarios.
      </div>
    </div>
  );
};
