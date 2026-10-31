import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Scale, Trash2, TrendingDown, TrendingUp, Calendar } from 'lucide-react';

interface WeightTabProps {
  showToast: (msg: string) => void;
}

export const WeightTab: React.FC<WeightTabProps> = ({ showToast }) => {
  const { data, addWeightRecord, deleteWeightRecord } = useData();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [weightInput, setWeightInput] = useState('');

  const pts = [...data.weightHistory].sort((a, b) => a.date.localeCompare(b.date));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      showToast('Por favor introduce un peso válido.');
      return;
    }

    addWeightRecord(Math.round(val * 10) / 10, date);
    setWeightInput('');
    showToast('Peso guardado correctamente');
  };

  const initialWeight = pts.length > 0 ? pts[0].weight : null;
  const currentWeight = pts.length > 0 ? pts[pts.length - 1].weight : null;
  const weightDiff = (initialWeight !== null && currentWeight !== null)
    ? (currentWeight - initialWeight).toFixed(1)
    : null;

  // SVG Chart rendering
  const renderChart = () => {
    if (pts.length < 2) {
      return (
        <div className="py-12 text-center text-sm text-[#9a958b]">
          Agrega al menos 2 registros de peso para visualizar tu gráfica de progreso y tendencia.
        </div>
      );
    }

    const W = 600;
    const H = 200;
    const pad = 36;
    const weightsArr = pts.map(p => p.weight);
    let minWeight = Math.min(...weightsArr);
    let maxWeight = Math.max(...weightsArr);

    if (minWeight === maxWeight) {
      minWeight -= 1;
      maxWeight += 1;
    }

    const getX = (i: number) => pad + (i * (W - pad * 2)) / (pts.length - 1);
    const getY = (w: number) => H - pad - ((w - minWeight) / (maxWeight - minWeight)) * (H - pad * 2);

    const pointsStr = pts.map((p, i) => `${getX(i)},${getY(p.weight)}`).join(' ');
    const areaPoints = `${pad},${H - pad} ${pointsStr} ${getX(pts.length - 1)},${H - pad}`;

    const formatDateShort = (d: string) => {
      try {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`;
      } catch {
        return d;
      }
    };

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 320 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7a2f" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff7a2f" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#chartGradient)" />

          {/* Grid lines */}
          <line x1={pad} y1={pad} x2={W - pad} y2={pad} stroke="#2c2b29" strokeDasharray="3 3" />
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#2c2b29" />

          {/* Polyline */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke="#ff7a2f"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(p.weight)}
                r="4.5"
                fill="#1c1c1c"
                stroke="#ff7a2f"
                strokeWidth="2.5"
              />
            </g>
          ))}

          {/* Axis Labels */}
          <text x={pad} y={H - 12} fontSize="12" fill="#9a958b">
            {formatDateShort(pts[0].date)}
          </text>
          <text x={W - pad} y={H - 12} fontSize="12" fill="#9a958b" textAnchor="end">
            {formatDateShort(pts[pts.length - 1].date)}
          </text>

          <text x={pad} y={20} fontSize="12" fill="#9a958b">
            {maxWeight.toFixed(1)} kg máx
          </text>
          <text x={W - pad} y={20} fontSize="12" fill="#9a958b" textAnchor="end">
            {minWeight.toFixed(1)} kg mín
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Input Card */}
      <form onSubmit={handleAdd} className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
            />
          </div>
          <div>
            <label className="text-xs text-[#9a958b] block mb-1">Peso en kg (ej: 68.5)</label>
            <input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full bg-[#121212] border border-[#2c2b29] rounded-xl px-3 py-2 text-sm text-[#f2efe9] focus:outline-none focus:border-[#ff7a2f]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-3 w-full py-2.5 bg-[#ff7a2f] hover:bg-[#fa6c1b] text-white font-bold rounded-xl text-sm transition cursor-pointer"
        >
          Agregar peso
        </button>
      </form>

      {/* Stats Summary */}
      {pts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-xl text-center">
            <span className="block font-heading text-2xl font-bold text-[#f2efe9]">{initialWeight} kg</span>
            <span className="text-[11px] text-[#9a958b] uppercase tracking-wider">Inicial</span>
          </div>
          <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-xl text-center">
            <span className="block font-heading text-2xl font-bold text-[#f2efe9]">{currentWeight} kg</span>
            <span className="text-[11px] text-[#9a958b] uppercase tracking-wider">Actual</span>
          </div>
          <div className="bg-[#1c1c1c] border border-[#2c2b29] p-3 rounded-xl text-center">
            <span className={`block font-heading text-2xl font-bold ${Number(weightDiff) >= 0 ? 'text-[#51cf66]' : 'text-amber-400'}`}>
              {Number(weightDiff) > 0 ? `+${weightDiff}` : weightDiff} kg
            </span>
            <span className="text-[11px] text-[#9a958b] uppercase tracking-wider">Cambio</span>
          </div>
        </div>
      )}

      {/* Chart Card */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
        <h3 className="font-heading text-base font-bold text-[#f2efe9] uppercase mb-2">Tendencia Corporal</h3>
        {renderChart()}
      </div>

      {/* History List */}
      <div className="bg-[#1c1c1c] border border-[#2c2b29] p-4 rounded-2xl">
        <h3 className="font-heading text-base font-bold text-[#f2efe9] uppercase mb-2">Historial Reciente</h3>
        {pts.length === 0 ? (
          <p className="text-xs text-[#9a958b]">
            Pésate en ayunas por la mañana, después de ir al baño, y fíjate en el promedio semanal para ajustar tu progreso.
          </p>
        ) : (
          <div className="divide-y divide-[#2c2b29]">
            {pts.slice().reverse().map((item) => (
              <div key={item.id || item.date} className="py-2.5 flex items-center justify-between">
                <span className="text-sm text-[#9a958b]">
                  {new Date(item.date + 'T00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-[#f2efe9]">{item.weight} kg</span>
                  <button
                    onClick={() => deleteWeightRecord(item.id || '')}
                    className="text-[#9a958b] hover:text-red-400 p-1"
                    title="Eliminar registro"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
