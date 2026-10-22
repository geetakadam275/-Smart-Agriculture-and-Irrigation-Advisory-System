'use client';

import Link from 'next/link';
import { TANK_CAP } from '../../lib/simulation';
import { useSim } from '../../lib/useSim';
import Hardware from '../../components/Hardware';
import Cctv from '../../components/Cctv';
import FlowDiagram from '../../components/FlowDiagram';

const PARTS = [
  { name: 'Arduino Uno R3', role: 'The brain. Reads the sensors and decides when to start or stop the pump.', spec: 'ATmega328P · 5 V · USB powered' },
  { name: 'Soil moisture sensor', role: 'Measures how wet the soil is. Probe goes in the soil.', spec: 'YL-69 / FC-28 + LM393 · output to A0' },
  { name: 'DHT11 sensor', role: 'Measures air temperature and humidity.', spec: 'Digital data pin to D2' },
  { name: '5V relay module', role: 'An electric switch. Lets the small Arduino signal turn the bigger pump on and off.', spec: '1-channel · signal from D7' },
  { name: 'DC water pump (motor)', role: 'Pushes water from the tank to the crop through the pipe.', spec: '12 V mini submersible pump' },
  { name: '12 V power supply', role: 'Gives the pump its own power so the Arduino is not overloaded.', spec: 'Adapter or battery · through relay COM / NO' },
  { name: 'Water tank, pipe and drip line', role: 'Stores water and carries it to the plants.', spec: 'Tank + hose + drip emitters' },
  { name: 'Jumper wires and breadboard', role: 'Connect everything together.', spec: 'Male-male / male-female wires' },
];

export default function HardwarePage() {
  const { sim, setSim, running, setRunning, speed, setSpeed } = useSim('wheat');
  const set = (patch) => setSim((s) => ({ ...s, ...patch }));

  return (
    <div className="wrap">
      <header>
        <h1>📹 Hardware &amp; Live Camera View</h1>
        <p>
          <Link className="btn" href="/">← Back to dashboard</Link>
        </p>
      </header>

      <div className="bar">
        <button className={'btn' + (running ? ' on' : '')} onClick={() => setRunning((r) => !r)}>
          {running ? '⏸ Pause' : '▶ Play'}
        </button>
        <select className="btn" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Speed">
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={5}>5×</option>
          <option value={10}>10×</option>
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
        <button className={'btn danger' + (sim.rainLeft > 0 ? ' on' : '')} onClick={() => set({ rainLeft: 10 })}>🌧 Trigger rain</button>
        <button className={'btn danger' + (sim.heat ? ' on' : '')} onClick={() => set({ heat: !sim.heat })}>🔥 Heatwave</button>
        <button className="btn" onClick={() => set({ tank: TANK_CAP })}>🚰 Refill tank</button>
      </div>

      <div className="grid">
        <div className="card c12">
          <h3>Live camera (CCTV)</h3>
          <Cctv sim={sim} running={running} />
        </div>

        <div className="card c12">
          <h3>How it works – the flow</h3>
          <FlowDiagram sim={sim} running={running} />
        </div>

        <div className="card c12">
          <h3>Hardware used</h3>
          <div className="parts">
            {PARTS.map((p, i) => (
              <div className="part" key={p.name}>
                <span className="fn">{i + 1}</span>
                <b>{p.name}</b>
                <div>{p.role}</div>
                <div className="sub">{p.spec}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card c12">
          <h3>Wiring diagram</h3>
          <Hardware sim={sim} running={running} />
        </div>
      </div>
    </div>
  );
}
