'use client';

import { useState } from 'react';
import { CROPS, TANK_CAP, formatTime } from '../lib/simulation';
import Hardware from './Hardware';

const lerp = (a, b, t) => a + (b - a) * t;
const rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (c1, c2, t) => {
  const a = rgb(c1), b = rgb(c2);
  const k = Math.min(1, Math.max(0, t));
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
};

function skyColors(h) {
  if (h >= 7 && h < 17) return ['#6cb4e4', '#cfe8f5'];
  if (h >= 5 && h < 7) return ['#3b4a7a', '#f2b27a'];
  if (h >= 17 && h < 19.5) return ['#4a4a82', '#f08a5d'];
  return ['#050914', '#101a33'];
}

function Sprout({ x, y, s, color, state }) {
  const h = state === 'dry' ? 0.6 : 1;
  const top = s * 0.9 * h;
  const a = state === 'dry' ? -32 : 26;
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>
      <line x1="0" y1="0" x2="0" y2={-top} stroke="#2d6a2f" strokeWidth={Math.max(1, s * 0.12)} />
      <g transform={`translate(0,${-top})`}>
        <ellipse cx={-s * 0.38} cy="0" rx={s * 0.4} ry={s * 0.15} fill={color} transform={`rotate(${-a})`} />
        <ellipse cx={s * 0.38} cy="0" rx={s * 0.4} ry={s * 0.15} fill={color} transform={`rotate(${a})`} />
        {state !== 'dry' && <ellipse cx="0" cy={-s * 0.18} rx={s * 0.13} ry={s * 0.34} fill={color} />}
      </g>
    </g>
  );
}

function FieldView({ sim, running, night, hour }) {
  const c = CROPS[sim.crop];
  const raining = sim.rainLeft > 0;
  const pumpOn = sim.pump;
  const [top, bottom] = skyColors(hour);
  const soil = mix('#b9915c', '#45301f', sim.moisture / 85);
  const state = sim.moisture < c.min ? 'dry' : sim.moisture > c.max ? 'over' : 'ok';
  const plantColor = state === 'dry' ? '#b9a233' : state === 'over' ? '#2c8f7a' : '#3fae4f';
  const tankPct = (sim.tank / TANK_CAP) * 100;

  const p = Math.min(1, Math.max(0, (hour - 5) / 14.5));
  const sx = 60 + p * 680;
  const sy = 170 - Math.sin(p * Math.PI) * 130;

  const lanes = [-3, -2, -1, 0, 1, 2].map((i) => {
    const m = i + 0.5;
    return { topX: 400 + m * 14, botX: 400 + m * 90 };
  });
  const ts = [0.06, 0.14, 0.25, 0.4, 0.6, 0.85];
  const at = (lane, t) => ({ x: lane.topX + (lane.botX - lane.topX) * t, y: 190 + 260 * t, s: 4 + t * 26 });

  const rain = Array.from({ length: 55 }, (_, i) => ({
    x: (i * 97) % 820,
    dur: 0.7 + (i % 4) * 0.12,
    begin: -(i % 9) * 0.1,
  }));

  return (
    <svg className="field" viewBox="0 0 800 450" role="img" aria-label="Field camera view">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#sky)" />

      {night ? (
        <g>
          <circle cx="660" cy="60" r="18" fill="#e5e7eb" />
          <circle cx="652" cy="55" r="18" fill={top} opacity=".35" />
          {[[90, 40], [200, 80], [310, 30], [430, 70], [520, 25], [740, 110], [150, 130]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" opacity=".8" />
          ))}
        </g>
      ) : (
        <g>
          <circle cx={sx} cy={sy} r={sim.heat ? 30 : 22} fill={sim.heat ? '#ff9f1c' : '#fde047'} />
          {sim.heat && <circle cx={sx} cy={sy} r="46" fill="#ff9f1c" opacity=".25" />}
        </g>
      )}

      {/* clouds */}
      <g opacity={night ? 0.15 : raining ? 0.95 : 0.85} fill={raining ? '#7b8794' : '#ffffff'}>
        <ellipse cx="170" cy="70" rx="60" ry="16" /><ellipse cx="210" cy="60" rx="40" ry="14" />
        <ellipse cx="520" cy="50" rx="70" ry="16" /><ellipse cx="565" cy="42" rx="40" ry="13" />
        {raining && <><ellipse cx="350" cy="90" rx="80" ry="18" /><ellipse cx="660" cy="100" rx="60" ry="16" /></>}
      </g>

      {/* hills + ground */}
      <path d="M0,190 Q120,140 240,178 T480,170 T800,185 V200 H0 Z" fill="#2f5d34" opacity=".9" />
      <rect x="0" y="188" width="800" height="262" fill="#3d6b2e" />
      <polygon points="130,450 670,450 442,190 358,190" fill={soil} />

      {/* crop rows */}
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
        <line key={i} x1={400 + i * 14} y1="190" x2={400 + i * 90} y2="450" stroke="#2b1c10" strokeWidth="2" opacity=".5" />
      ))}

      {/* drip pipes */}
      <path d="M148,372 H160 V436 H670" className={pumpOn ? 'wire' + (running ? ' flow' : '') : 'wirestatic'} stroke={pumpOn ? '#38bdf8' : '#1e293b'} style={{ strokeWidth: 5 }} />
      {lanes.map((l, i) => {
        const bx = l.topX + (l.botX - l.topX) * 0.946;
        return (
          <path key={i} d={`M${bx.toFixed(1)},436 L${l.topX},190`} className={pumpOn ? 'wire' + (running ? ' flow' : '') : 'wirestatic'} stroke={pumpOn ? '#38bdf8' : '#1e293b'} style={{ strokeWidth: 2 }} />
        );
      })}

      {/* plants, far to near */}
      {ts.map((t) =>
        lanes.map((l, i) => {
          const { x, y, s } = at(l, t);
          return <Sprout key={t + '-' + i} x={x} y={y} s={s} color={plantColor} state={state} />;
        })
      )}

      {/* water from emitters */}
      {pumpOn &&
        lanes.map((l, i) =>
          [0.4, 0.85].map((t, k) => {
            const { x, y, s } = at(l, t);
            return (
              <circle key={i + '-' + k} cx={x} cy={y} fill="#7dd3fc">
                <animate attributeName="r" from="1" to={s * 0.9} dur="1s" begin={`${(i + k) * 0.17}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from=".8" to="0" dur="1s" begin={`${(i + k) * 0.17}s`} repeatCount="indefinite" />
              </circle>
            );
          })
        )}

      {/* water tank */}
      <rect x="24" y="230" width="72" height="160" rx="10" fill="#243447" stroke="#4b6a8a" strokeWidth="2" />
      <rect x="29" y={386 - 150 * (tankPct / 100)} width="62" height={150 * (tankPct / 100)} rx="6" fill="#38bdf8" opacity=".85" />
      <text x="60" y="250" fill="#e2e8f0" fontSize="11" fontWeight="700" textAnchor="middle">TANK</text>
      <text x="60" y="310" fill="#082f49" fontSize="13" fontWeight="700" textAnchor="middle">{tankPct.toFixed(0)}%</text>
      <rect x="96" y="368" width="8" height="8" fill="#64748b" />
      {/* pump unit */}
      <rect x="104" y="352" width="44" height="34" rx="5" fill="#475569" stroke="#334155" />
      <circle cx="116" cy="363" r="4" fill={pumpOn ? '#4ade80' : '#ef4444'} />
      <text x="126" y="380" fill="#e2e8f0" fontSize="9" fontWeight="700" textAnchor="middle">PUMP</text>

      {/* soil sensor stake */}
      <line x1="716" y1="335" x2="716" y2="405" stroke="#9ca3af" strokeWidth="4" />
      <rect x="702" y="314" width="30" height="22" rx="3" fill="#111827" stroke="#6b7280" />
      <circle cx="716" cy="325" r="3.5" fill={running ? '#4ade80' : '#1f3a2a'} className={running ? 'blink' : ''} />
      <text x="716" y="306" fill="#e5e7eb" fontSize="11" fontWeight="700" textAnchor="middle">SOIL SENSOR</text>
      {/* DHT pole */}
      <line x1="765" y1="262" x2="765" y2="400" stroke="#9ca3af" strokeWidth="4" />
      <rect x="751" y="240" width="28" height="22" rx="3" fill="#e5e7eb" stroke="#9ca3af" />
      {[245, 250, 255].map((y) => (
        <line key={y} x1="754" x2="776" y1={y} y2={y} stroke="#9ca3af" />
      ))}
      <text x="765" y="232" fill="#e5e7eb" fontSize="11" fontWeight="700" textAnchor="middle">DHT11</text>

      {/* weather overlays */}
      {raining && <rect width="800" height="450" fill="#1b2a41" opacity=".28" />}
      {sim.heat && !night && <rect width="800" height="450" fill="#ff7a00" opacity=".1" />}
      {raining &&
        rain.map((r, i) => (
          <line key={i} x1={r.x} y1="0" x2={r.x - 4} y2="14" stroke="#cfe6ff" strokeWidth="1.2" opacity=".7">
            <animateTransform attributeName="transform" type="translate" from="0 -20" to="-40 470" dur={`${r.dur}s`} begin={`${r.begin}s`} repeatCount="indefinite" />
          </line>
        ))}
    </svg>
  );
}

export default function Cctv({ sim, running }) {
  const [cam, setCam] = useState(1);
  const hour = (sim.minute / 60) % 24;
  const night = hour < 5 || hour >= 19.5;
  const names = { 1: 'FIELD A', 2: 'CONTROL BOX' };

  return (
    <div>
      <div className="cams">
        <button className={'btn' + (cam === 1 ? ' on' : '')} onClick={() => setCam(1)}>CAM 01 · Field</button>
        <button className={'btn' + (cam === 2 ? ' on' : '')} onClick={() => setCam(2)}>CAM 02 · Control box</button>
      </div>
      <div className={'cctv' + (night && cam === 1 ? ' night' : '') + (cam === 2 ? ' cam2' : '')}>
        {cam === 1 ? (
          <FieldView sim={sim} running={running} night={night} hour={hour} />
        ) : (
          <Hardware sim={sim} running={running} showTable={false} />
        )}
        <div className="osd tl"><span className={'rec' + (running ? ' on' : '')} />REC · CAM 0{cam} – {names[cam]}</div>
        <div className="osd tr">{formatTime(sim.minute)}</div>
        <div className="osd bl">SOIL {sim.moisture.toFixed(0)}% · {sim.temp.toFixed(1)}°C · {sim.hum.toFixed(0)}%RH</div>
        <div className="osd br">PUMP {sim.pump ? 'ON' : 'OFF'} · {sim.rainLeft > 0 ? 'RAIN' : night ? 'NIGHT' : 'CLEAR'}</div>
        <div className="scan" />
      </div>
    </div>
  );
}
