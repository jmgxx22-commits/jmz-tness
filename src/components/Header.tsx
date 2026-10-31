import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download } from 'lucide-react';
import { downloadProjectZip } from '../services/downloadHelper';

interface HeaderProps {
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile }) => {
  const { userProfile } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await downloadProjectZip();
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <header className="pt-4 pb-3 flex items-center justify-between border-b border-[#2c2b29] mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider font-heading text-[#f2efe9] uppercase m-0 leading-none">
            PROGRESO <span className="text-[#ff7a2f]">J-MZ TNESS</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#9a958b] italic mt-1.5 mb-0">
          Entrena pesado. Registra. Progresa.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-md cursor-pointer"
          title="Descargar código del proyecto en ZIP para Windows/Mac"
        >
          <Download size={14} className={downloading ? 'animate-bounce' : ''} />
          <span className="hidden sm:inline">{downloading ? 'Descargando...' : 'Descargar ZIP'}</span>
          <span className="sm:hidden">{downloading ? '...' : 'ZIP'}</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-3 py-2 bg-[#1c1c1c] border border-[#2c2b29] hover:border-[#ff7a2f] rounded-xl text-xs sm:text-sm font-medium text-[#f2efe9] transition cursor-pointer"
          title="Perfil y configuración"
        >
          <div className="w-6 h-6 rounded-full bg-[#ff7a2f]/20 text-[#ff7a2f] flex items-center justify-center font-bold text-xs">
            {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
          </div>
          <span className="hidden sm:inline font-medium max-w-[100px] truncate">{userProfile.displayName}</span>
        </button>
      </div>
    </header>
  );
};
