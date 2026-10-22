import { CROPS } from '../lib/simulation';

// Simple 5-step flow: Sensors -> Arduino -> Relay -> Pump -> Field (then repeat).
export default function FlowDiagram({ sim, running }) {
  const c = CROPS[sim.crop];
  const raining = sim.rainLeft > 0;
  const stopAt = Math.round(c.min + (c.max - c.min) * 0.75);
  const last = sim.history[sim.history.length - 2];
  const trend = last ? sim.moisture - last.m : 0;

  let decision;
  if (sim.mode === 'manual') decision = sim.pump ? 'Manual mode: farmer switched pump ON' : 'Manual mode: pump is OFF';
  else if (raining) decision = 'Rain detected → keep pump OFF';
  else if (sim.pump) decision = `Soil dry → pump ON until ${stopAt}%`;
  else if (sim.moisture < c.min) decision = 'Soil dry → start pump';
  else decision = `Soil OK (needs ${c.min}–${c.max}%) → pump OFF`;

  const steps = [
    { n: 1, title: 'Sensors measure', live: `Soil ${sim.moisture.toFixed(0)}% · ${sim.temp.toFixed(1)}°C · ${sim.hum.toFixed(0)}% RH`, note: 'Soil moisture + DHT11', active: running },
    { n: 2, title: 'Arduino decides', live: decision, note: 'Compares reading with crop limits', active: running },
    { n: 3, title: 'Relay switches', live: sim.pump ? 'Relay ON (circuit closed)' : 'Relay OFF (circuit open)', note: 'Signal from pin D7', active: sim.pump },
    { n: 4, title: 'Pump runs', live: sim.pump ? 'Pumping water to the field' : 'Pump stopped', note: '12 V motor from tank', active: sim.pump },
    {
      n: 5,
      title: 'Field gets water',
      live: raining ? 'Rain is also wetting the soil' : trend > 0.3 ? 'Soil moisture rising ↑' : trend < -0.02 ? 'Soil slowly drying ↓' : 'Soil moisture steady',
      note: 'Sensors read again → loop repeats',
      active: sim.pump || raining,
    },
  ];

  return (
    <div>
      <div className="flowrow">
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: 'contents' }}>
            <div className={'fstep' + (s.active ? ' active' : '')}>
              <span className="fn">{s.n}</span>
              <b>{s.title}</b>
              <div className="flive">{s.live}</div>
              <div className="sub">{s.note}</div>
            </div>
            {i < steps.length - 1 && <span className={'farrow' + (s.active && running ? ' go' : '')}>➜</span>}
          </div>
        ))}
      </div>
      <div className="sub" style={{ marginTop: 10 }}>
        ↻ This loop runs again and again, all day and night. Sensors → Arduino → Relay → Pump → Field → Sensors.
      </div>
    </div>
  );
}
