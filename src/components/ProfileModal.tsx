import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FitnessGoal, ExperienceLevel, WorkoutLocation, Gender } from '../types';
import { X, LogIn, UserPlus, LogOut, KeyRound, Cloud, ShieldCheck, Save, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const EQUIPMENT_OPTIONS = [
  'Mancuernas',
  'Barras y discos',
  'Banca plana/inclinada',
  'Poleas / Cables',
  'Máquinas de gimnasio',
  'Barra de dominadas',
  'Bandas elásticas',
  'Solo peso corporal'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, showToast }) => {
  const {
    firebaseUser,
    userProfile,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    updateProfile
  } = useAuth();

  const [authMode, setAuthMode] = useState<'profile' | 'login' | 'register' | 'forgot'>(
    firebaseUser ? 'profile' : 'profile'
  );

  const [formData, setFormData] = useState({ ...userProfile });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync formData when userProfile updates
  React.useEffect(() => {
    setFormData({ ...userProfile });
  }, [userProfile]);

  if (!isOpen) return null;

  const handleEquipmentToggle = (item: string) => {
    const curr = formData.equipmentAvailable || [];
    if (curr.includes(item)) {
      setFormData({ ...formData, equipmentAvailable: curr.filter(x => x !== item) });
    } else {
      setFormData({ ...formData, equipmentAvailable: [...curr, item] });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      showToast('Perfil actualizado correctamente');
      onClose();
    } catch (err: any) {
      showToast('Error al guardar perfil: ' + (err?.message || 'Error desconocido'));
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      showToast('Sesión iniciada con Google');
      setAuthMode('profile');
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('La ventana de Google se cerró antes de completar.');
      } else {
        setAuthError(err?.message || 'Error al conectar con Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(emailInput.trim(), passwordInput);
      showToast('¡Bienvenido de nuevo!');
      setAuthMode('profile');
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        setAuthError('Correo o contraseña incorrectos.');
      } else if (err?.code === 'auth/too-many-requests') {
        setAuthError('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setAuthError(err?.message || 'Error al iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passwordInput.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerWithEmail(emailInput.trim(), passwordInput, nameInput.trim());
      showToast('¡Cuenta creada y sincronizada!');
      setAuthMode('profile');
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setAuthError('Este correo ya está registrado. Inicia sesión en su lugar.');
      } else if (err?.code === 'auth/invalid-email') {
        setAuthError('El formato de correo no es válido.');
      } else {
        setAuthError(err?.message || 'Error al crear la cuenta.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!emailInput.trim()) {
      setAuthError('Introduce tu correo electrónico.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(emailInput.trim());
      showToast('Enlace de recuperación enviado a tu correo');
      setAuthMode('login');
    } catch (err: any) {
      setAuthError(err?.message || 'Error al enviar recuperación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sesión cerrada');
      setAuthMode('profile');
    } catch (err: any) {
      showToast('Error al cerrar sesión: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1c1c1c] border border-[#2c2b29] rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 my-8 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#2c2b29]">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl font-bold text-[#f2efe9] uppercase">
              {authMode === 'profile' && 'Perfil de Atleta'}
              {authMode === 'login' && 'Iniciar Sesión'}
              {authMode === 'register' && 'Crear Cuenta'}
              {authMode === 'forgot' && 'Recuperar Contraseña'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9a958b] hover:text-[#f2efe9] p-1 rounded-lg hover:bg-[#252525] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Account Status Badge */}
        <div className="bg-[#121212] p-3 rounded-xl border border-[#2c2b29] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              firebaseUser ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#ff7a2f]/20 text-[#ff7a2f]'
            }`}>
              {firebaseUser ? (
                <ShieldCheck size={16} />
              ) : (
                userProfile.displayName ? userProfile.displayName[0].toUpperCase() : 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs">
                {firebaseUser ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Cloud size={12} /> Sincronizado en la Nube
                  </span>
                ) : (
                  <span className="text-[#9a958b]">Modo Local / Dispositivo</span>
                )}
              </div>
              <div className="font-semibold text-sm text-[#f2efe9] truncate max-w-[220px]">
                {firebaseUser?.email || userProfile.displayName || 'Atleta J-MZ'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {firebaseUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 bg-[#252525] hover:bg-rose-950/40 text-rose-300 border border-[#2c2b29] hover:border-rose-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Cerrar sesión</span>
              </button>
            ) : (
              authMode === 'profile' ? (
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs px-3 py-1.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <LogIn size={13} />
                  <span>Sincronizar / Entrar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthMode('profile')}
                  className="text-xs px-3 py-1.5 bg-[#252525] text-[#9a958b] hover:text-[#f2efe9] rounded-lg transition"
                >
                  Volver a datos
                </button>
              )
            )}
          </div>
        </div>

        {/* Error notification */}
        {authError && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs">
            {authError}
          </div>
        )}

        {/* VIEW: LOGIN */}
        {authMode === 'login' && (
          <div className="space-y-4">
            <p className="text-xs text-[#9a958b]">
              Inicia sesión para sincronizar tus rutinas, pesos y fotos en todos tus dispositivos (iPhone, Android, PC).
            </p>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#252525] hover:bg-[#2c2b29] border border-[#3c3b39] text-[#f2efe9] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="h-[1px] bg-[#2c2b29] flex-1" />
              <span className="text-[11px] text-[#9a958b] uppercase tracking-wider">o con tu correo</span>
              <div className="h-[1px] bg-[#2c2b29] flex-1" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-[#9a958b]">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => { setAuthError(null); setAuthMode('forgot'); }}
                    className="text-xs text-[#ff7a2f] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition mt-2 cursor-pointer"
              >
                {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#2c2b29] flex justify-between items-center text-xs">
              <span className="text-[#9a958b]">¿No tienes cuenta?</span>
              <button
                type="button"
                onClick={() => { setAuthError(null); setAuthMode('register'); }}
                className="text-[#ff7a2f] font-semibold hover:underline"
              >
                Crear una gratis
              </button>
            </div>
          </div>
        )}

        {/* VIEW: REGISTER */}
        {authMode === 'register' && (
          <div className="space-y-4">
            <p className="text-xs text-[#9a958b]">
              Crea tu cuenta gratuita. Tus datos y rutinas estarán seguros y aislados de otros usuarios.
            </p>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#252525] hover:bg-[#2c2b29] border border-[#3c3b39] text-[#f2efe9] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Registrarse con Google</span>
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="h-[1px] bg-[#2c2b29] flex-1" />
              <span className="text-[11px] text-[#9a958b] uppercase tracking-wider">o crea con correo</span>
              <div className="h-[1px] bg-[#2c2b29] flex-1" />
            </div>

            <form onSubmit={handleEmailRegister} className="space-y-3">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Nombre o Apodo</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ej: Marcos Z."
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Contraseña (mínimo 6 caracteres)</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition mt-2 cursor-pointer"
              >
                {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#2c2b29] flex justify-between items-center text-xs">
              <span className="text-[#9a958b]">¿Ya tienes cuenta?</span>
              <button
                type="button"
                onClick={() => { setAuthError(null); setAuthMode('login'); }}
                className="text-[#ff7a2f] font-semibold hover:underline"
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        )}

        {/* VIEW: FORGOT PASSWORD */}
        {authMode === 'forgot' && (
          <div className="space-y-4">
            <p className="text-xs text-[#9a958b]">
              Introduce tu correo registrado y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition mt-2 cursor-pointer"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar correo de recuperación'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#2c2b29]">
              <button
                type="button"
                onClick={() => { setAuthError(null); setAuthMode('login'); }}
                className="text-xs text-[#9a958b] hover:text-[#f2efe9]"
              >
                ← Volver a inicio de sesión
              </button>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE DATA FORM */}
        {authMode === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Nombre o Apodo</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Edad</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Meta (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetWeight || ''}
                  onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Estatura (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Sexo (opcional)</label>
                <select
                  value={formData.gender || 'masculino'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Nivel de experiencia</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                >
                  <option value="beginner">Principiante (0-1 años)</option>
                  <option value="intermediate">Intermedio (1-3 años)</option>
                  <option value="advanced">Avanzado (3+ años)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Objetivo Físico</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as FitnessGoal })}
                className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
              >
                <option value="hypertrophy">Hipertrofia (Ganancia muscular)</option>
                <option value="fat_loss">Pérdida de grasa</option>
                <option value="recomposition">Recomposición corporal</option>
                <option value="strength">Aumento de fuerza</option>
                <option value="endurance">Resistencia muscular</option>
                <option value="general_fitness">Acondicionamiento físico general</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Días disponibles</label>
                <select
                  value={formData.daysAvailable}
                  onChange={(e) => setFormData({ ...formData, daysAvailable: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                >
                  <option value={2}>2 días por semana</option>
                  <option value={3}>3 días por semana</option>
                  <option value={4}>4 días por semana</option>
                  <option value={5}>5 días por semana</option>
                  <option value={6}>6 días por semana</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#9a958b] block mb-1">Tiempo x sesión (min)</label>
                <input
                  type="number"
                  step="15"
                  value={formData.timePerSession}
                  onChange={(e) => setFormData({ ...formData, timePerSession: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Lugar de entrenamiento</label>
              <select
                value={formData.workoutLocation}
                onChange={(e) => setFormData({ ...formData, workoutLocation: e.target.value as WorkoutLocation })}
                className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
              >
                <option value="gym">Gimnasio comercial completo</option>
                <option value="home">En casa (con mancuernas/básicos)</option>
                <option value="calisthenics">Parque / Calistenia</option>
                <option value="mixed">Mixto (Casa y Gimnasio)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Equipamiento disponible</label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#121212] p-2.5 rounded-xl border border-[#2c2b29]">
                {EQUIPMENT_OPTIONS.map((item) => {
                  const isChecked = (formData.equipmentAvailable || []).includes(item);
                  return (
                    <label key={item} className="flex items-center gap-2 text-xs text-[#dcdad5] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleEquipmentToggle(item)}
                        className="rounded bg-[#1c1c1c] border-[#3c3b39] text-[#ff7a2f] focus:ring-0"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Lesiones o limitaciones físicas</label>
              <input
                type="text"
                placeholder="Ej: Molestia en hombro izquierdo al press militar..."
                value={formData.injuriesOrLimitations || ''}
                onChange={(e) => setFormData({ ...formData, injuriesOrLimitations: e.target.value })}
                className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#9a958b] block mb-1">Preferencias de entrenamiento</label>
              <input
                type="text"
                placeholder="Ej: Prefiero mancuernas a barras, énfasis en deltoides..."
                value={formData.preferences || ''}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                className="w-full bg-[#121212] border border-[#2c2b29] focus:border-[#ff7a2f] rounded-xl px-3 py-2 text-sm text-[#f2efe9] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white font-bold rounded-xl text-sm transition mt-3 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Save size={16} />
              <span>Guardar Perfil de Atleta</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
