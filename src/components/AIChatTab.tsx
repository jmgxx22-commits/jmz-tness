import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { askGeminiCoach } from '../services/geminiService';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  '¿Cuántas proteínas necesito al día para ganar músculo?',
  '¿Cómo mejoro mi press inclinado?',
  '¿Qué como antes de entrenar a las 7 pm?',
  '¿Cómo sé si estoy comiendo lo suficiente?',
  '¿Cómo romper un estancamiento en sentadilla?'
];

export const AIChatTab: React.FC = () => {
  const { userProfile } = useAuth();
  const { data, addChatMessage, clearChat } = useData();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data.chatHistory, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    setErrorMessage(null);

    // Save user message
    addChatMessage({
      role: 'user',
      content: text
    });

    setLoading(true);

    try {
      const chatPayload = [
        ...data.chatHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: text }
      ];

      // Prepare recent workouts context
      const recentWorkouts = data.workoutHistory.slice(-5).map(w => ({
        date: w.date,
        routine: w.routineName,
        energy: w.energy,
        notes: w.notes,
        exercises: w.exercises.map(e => ({
          name: e.name,
          sets: e.sets.map(s => `${s.weight}lb x ${s.reps}`).join(', ')
        }))
      }));

      const reply = await askGeminiCoach(
        chatPayload,
        userProfile,
        recentWorkouts,
        data.nutritionGoals
      );

      addChatMessage({
        role: 'assistant',
        content: reply
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'No se pudo obtener respuesta del Coach IA. Revisa tu conexión o intenta en unos momentos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] max-h-[750px] min-h-[500px]">
      <p className="text-sm text-[#9a958b] italic mb-3">
        Pregúntale lo que quieras sobre entrenamiento, técnica y nutrición. Conoce tu perfil, tus metas y tus registros recientes.
      </p>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#161616] border border-[#2c2b29] rounded-2xl">
        {data.chatHistory.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ff7a2f]/10 text-[#ff7a2f] flex items-center justify-center mx-auto">
              <Bot size={24} />
            </div>
            <h4 className="font-heading text-lg font-bold text-[#f2efe9]">¡Hola {userProfile.displayName}!</h4>
            <p className="text-xs text-[#9a958b] max-w-sm mx-auto">
              Soy tu entrenador personal impulsado por Google Gemini. Puedes preguntarme sobre tus rutinas, consejos de técnica o cómo ajustar tus calorías.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2b29] hover:border-[#ff7a2f] text-[#f2efe9] px-3 py-1.5 rounded-full transition cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {data.chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#ff7a2f]/20 text-[#ff7a2f] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={15} />
              </div>
            )}
            <div
              className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#2b1d14] text-[#f2efe9] border border-[#ff7a2f]/30'
                  : 'bg-[#1c1c1c] text-[#f2efe9] border border-[#2c2b29]'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#2c2b29] text-[#9a958b] flex items-center justify-center flex-shrink-0 mt-1">
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#ff7a2f] py-2">
            <Loader2 size={16} className="animate-spin" />
            <span>El coach está pensando...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="mt-3 bg-[#1c1c1c] border border-[#2c2b29] p-2.5 rounded-2xl flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Pregúntale al entrenador de J-MZ Tness..."
            className="flex-1 bg-transparent text-sm text-[#f2efe9] placeholder-[#77736b] resize-none focus:outline-none px-2 py-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 bg-[#ff7a2f] hover:bg-[#fa6c1b] disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl transition cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between px-2 pt-1 border-t border-[#2c2b29]/50 text-[11px] text-[#77736b]">
          <span>Orientación respaldada con IA de Google Gemini</span>
          {data.chatHistory.length > 0 && (
            <button
              onClick={clearChat}
              className="hover:text-red-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Limpiar chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
