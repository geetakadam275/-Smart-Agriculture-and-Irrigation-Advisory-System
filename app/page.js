'use client';

import { useEffect, useState } from 'react';
import {
  CROPS, TANK_CAP, HISTORY_LEN, STEP_MIN,
  initialState, step, advise, formatTime,
} from '../lib/simulation';
import Hardware from '../components/Hardware';
import Cctv from '../components/Cctv';
import Link from 'next/link';

function Chart({ history, crop }) {
  const W = 760, H = 260, L = 38, R = 10, T = 10, B = 26;
  const pw = W - L - R, ph = H - T - B;
  const x = (i) => L + (i / (HISTORY_LEN - 1)) * pw;
  const y = (v) => T + ph - (v / 100) * ph;
  const line = (key) =>
    history.map((p, i) => `${i ? 'L' : 'M'}${x(i + HISTORY_LEN - history.length).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
  const off = HISTORY_LEN - history.length;

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Soil moisture over time">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke="#2a4a38" strokeWidth="1" />
          <text x={L - 6} y={y(g) + 4} fill="#8fb09c" fontSize="11" textAnchor="end">{g}%</text>
        </g>
      ))}
      <rect x={L} y={y(crop.max)} width={pw} height={y(crop.min) - y(crop.max)} fill="rgba(74,222,128,.14)" />
      {history.map((p, i) =>
        p.pump ? <rect key={'p' + i} x={x(i + off) - 2} y={T + ph - 6} width="4" height="6" fill="#4ade80" /> : null
      )}
      {history.map((p, i) =>
        p.rain ? <rect key={'r' + i} x={x(i + off) - 2} y={T} width="4" height="6" fill="#38bdf8" opacity=".7" /> : null
      )}
      {history.length > 1 && (
        <>
          <path d={line('tm')} fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="5 4" />
          <path d={line('m')} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        </>
      )}
      <text x={L} y={H - 6} fill="#8fb09c" fontSize="11">older</text>
      <text x={W - R} y={H - 6} fill="#8fb09c" fontSize="11" textAnchor="end">now</text>
    </svg>
  );
}

export default function Page() {
  const [sim, setSim] = useState(() => initialState('wheat'));
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSim((s) => step(s)), 1000 / speed);
    return () => clearInterval(id);
  }, [running, speed]);

  const crop = CROPS[sim.crop];
  const advice = advise(sim);
  const raining = sim.rainLeft > 0;
  const tankPct = (sim.tank / TANK_CAP) * 100;
  const saved = sim.tradWater > 0 ? ((sim.tradWater - sim.waterUsed) / sim.tradWater) * 100 : 0;

  const set = (patch) => setSim((s) => ({ ...s, ...patch }));
  const reset = (cropKey = sim.crop) => setSim({ ...initialState(cropKey), mode: sim.mode });

  return (
    <div className="wrap">
      <header>
        <h1>🌾 Smart Agriculture and Irrigation Advisory System</h1>
        <p><Link className="btn" href="/hardware">📹 Hardware &amp; live camera view →</Link></p>
        <p>Live IoT simulation: soil moisture, temperature and humidity sensors drive an automatic pump and an advisory engine.</p>
      </header>

      <div className="bar">
        <button className={'btn' + (running ? ' on' : '')} onClick={() => setRunning((r) => !r)}>
          {running ? '⏸ Pause' : '▶ Play'}
        </button>
        <select className="btn" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Speed">
          <option value={1}>1× (15 min / sec)</option>
          <option value={2}>2×</option>
          <option value={5}>5×</option>
          <option value={10}>10×</option>
        </select>
        <select className="btn" value={sim.crop} onChange={(e) => reset(e.target.value)} aria-label="Crop">
          {Object.entries(CROPS).map(([k, c]) => (
            <option key={k} value={k}>{c.name} ({c.min}–{c.max}%)</option>
          ))}
        </select>
        <button className={'btn' + (sim.mode === 'auto' ? ' on' : '')} onClick={() => set({ mode: sim.mode === 'auto' ? 'manual' : 'auto' })}>
          Mode: {sim.mode === 'auto' ? 'Automatic' : 'Manual'}
        </button>
        {sim.mode === 'manual' && (
          <button className={'btn' + (sim.pump ? ' on' : '')} onClick={() => set({ pump: !sim.pump })}>
            Pump {sim.pump ? 'ON' : 'OFF'}
          </button>
        )}
        <span className="sp" />
        <button className={'btn danger' + (raining ? ' on' : '')} onClick={() => set({ rainLeft: 10 })}>🌧 Trigger rain</button>
        <button className={'btn danger' + (sim.heat ? ' on' : '')} onClick={() => set({ heat: !sim.heat })}>🔥 Heatwave</button>
        <button className="btn" onClick={() => set({ tank: TANK_CAP })}>🚰 Refill tank</button>
        <button className="btn" onClick={() => reset()}>↺ Reset</button>
        <span className="clock">{formatTime(sim.minute)}</span>
      </div>

      <div className="grid">
        <div className="card c3">
          <h3>Soil moisture</h3>
          <div className="big">{sim.moisture.toFixed(1)}<small>%</small></div>
          <div className="meter">
            <div className="band" style={{ left: crop.min + '%', width: crop.max - crop.min + '%' }} />
            <div className="fill" style={{ width: sim.moisture + '%' }} />
          </div>
          <div className="sub">Ideal for {crop.name}: {crop.min}–{crop.max}%</div>
        </div>

        <div className="card c3">
          <h3>Temperature</h3>
          <div className="big">{sim.temp.toFixed(1)}<small>°C</small></div>
          <div className="sub">{raining ? 'Rain cooling the field' : sim.heat ? 'Heatwave active' : 'Normal day/night cycle'}</div>
        </div>

        <div className="card c3">
          <h3>Humidity</h3>
          <div className="big">{sim.hum.toFixed(0)}<small>%</small></div>
          <div className="sub">{raining ? 'Raining' : 'No rainfall'}</div>
        </div>

        <div className="card c3">
          <h3>Water pump</h3>
          <div className="pump">
            <span className={'dot' + (sim.pump ? ' on' : '')} />
            <div className="big">{sim.pump ? 'ON' : 'OFF'}</div>
          </div>
          <div className="meter" title="Tank level">
            <div className="fill" style={{ width: tankPct + '%', background: tankPct < 20 ? 'var(--red)' : 'var(--blue)' }} />
          </div>
          <div className="sub">Tank {(sim.tank / 1000).toFixed(1)} / {TANK_CAP / 1000} kL</div>
        </div>

        <div className="card c8">
          <h3>Soil moisture – smart system vs traditional timer</h3>
          <Chart history={sim.history} crop={crop} />
          <div className="legend">
            <span><i style={{ background: '#38bdf8' }} />Smart (sensor-based)</span>
            <span><i style={{ background: '#fb923c' }} />Traditional (fixed 06–08, 18–20 h)</span>
            <span><i style={{ background: 'rgba(74,222,128,.5)' }} />Ideal band / pump-on ticks</span>
          </div>
        </div>

        <div className="card c4">
          <h3>Water usage</h3>
          <div className="cmp">
            <div><span className="sub">Smart system</span><b>{sim.waterUsed.toLocaleString()} L</b></div>
            <div><span className="sub">Traditional</span><b>{sim.tradWater.toLocaleString()} L</b></div>
          </div>
          <div className="save">
            Water saved<br /><b>{saved > 0 ? saved.toFixed(0) : 0}%</b>
            <div className="sub">Traditional field was above the ideal band for {(sim.tradOverSteps * STEP_MIN / 60).toFixed(1)} h (over-watering).</div>
          </div>
        </div>

        <div className="card c12">
          <h3>Live camera (CCTV)</h3>
          <Cctv sim={sim} running={running} />
        </div>

        <div className="card c12">
          <h3>Hardware setup – Arduino Uno, sensors, relay and pump</h3>
          <Hardware sim={sim} running={running} />
        </div>

        <div className="card c6">
          <h3>Irrigation advisory</h3>
          <ul className="adv">
            {advice.map((a, i) => <li key={i} className={a.level}>{a.text}</li>)}
          </ul>
        </div>

        <div className="card c6">
          <h3>System flow</h3>
          <div className="arch">
            <span>Soil / temp / humidity sensors</span><em>→</em>
            <span>Microcontroller</span><em>→</em>
            <span>Decision logic</span><em>→</em>
            <span>Pump relay</span><em>→</em>
            <span>Crop</span>
          </div>
          <div className="sub" style={{ marginTop: 12 }}>
            Auto mode turns the pump on when moisture drops below the crop minimum, stops at 75% of the ideal band, and pauses during rain.
            Future scope: AI/ML crop recommendation and irrigation forecasting.
          </div>
        </div>
      </div>

      <footer>
        Simulation of the “Smart Agriculture and Irrigation Advisory System” — Gita Kadam, Asmita Raut, Keshav Rajurkar, Vaibhav Nandedkar.
        Sensor values are simulated; no hardware is connected.
      </footer>
    </div>
  );
}
