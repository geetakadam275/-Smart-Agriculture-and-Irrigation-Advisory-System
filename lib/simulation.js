// Pure simulation engine for the Smart Agriculture and Irrigation Advisory System.
// One step = 15 simulated minutes.

export const STEP_MIN = 15;
export const TANK_CAP = 20000; // litres
export const PUMP_L = 300; // litres used per step while pump runs
export const PUMP_GAIN = 1.6; // soil moisture % gained per step while pump runs
export const HISTORY_LEN = 192; // 2 simulated days

// min/max = ideal soil moisture band (%), et = relative evapotranspiration
export const CROPS = {
  wheat: { name: 'Wheat', min: 30, max: 55, et: 1.0 },
  rice: { name: 'Rice', min: 55, max: 85, et: 1.4 },
  cotton: { name: 'Cotton', min: 35, max: 60, et: 1.1 },
  sugarcane: { name: 'Sugarcane', min: 45, max: 75, et: 1.3 },
  tomato: { name: 'Tomato', min: 40, max: 65, et: 1.2 },
  soybean: { name: 'Soybean', min: 35, max: 60, et: 1.0 },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const noise = (a) => (Math.random() - 0.5) * 2 * a;

export function weather(minute, heat, raining, noisy = true) {
  const hour = (minute / 60) % 24;
  let temp = 27 + 7 * Math.sin((2 * Math.PI * (hour - 9)) / 24) + (heat ? 8 : 0);
  if (raining) temp -= 4;
  const hum = 70 - (temp - 20) * 1.8 + (raining ? 25 : 0);
  const n = noisy ? 1 : 0; // no random noise for the very first (server-rendered) reading
  return { temp: temp + n * noise(0.3), hum: clamp(hum + n * noise(1.5), 15, 99) };
}

export function initialState(crop = 'wheat') {
  const c = CROPS[crop];
  const start = Math.round((c.min + c.max) / 2);
  const w = weather(6 * 60, false, false, false);
  return {
    crop,
    mode: 'auto', // 'auto' | 'manual'
    minute: 6 * 60,
    moisture: start,
    temp: w.temp,
    hum: w.hum,
    pump: false,
    heat: false,
    rainLeft: 0,
    tank: TANK_CAP,
    waterUsed: 0,
    pumpSteps: 0,
    // traditional timer-based field (fixed schedule, ignores sensors)
    tradMoisture: start,
    tradPump: false,
    tradWater: 0,
    tradOverSteps: 0,
    history: [],
  };
}

export function step(s) {
  const crop = CROPS[s.crop];
  const minute = s.minute + STEP_MIN;

  // weather & rain
  let rainLeft = s.rainLeft;
  if (rainLeft === 0 && Math.random() < 0.004) rainLeft = 6 + Math.floor(Math.random() * 6);
  const raining = rainLeft > 0;
  if (raining) rainLeft -= 1;
  const { temp, hum } = weather(minute, s.heat, raining);

  // soil physics
  const loss = crop.et * (0.03 + Math.max(0, temp - 15) * 0.006) * (1 - hum / 140) * 2.2;
  const rainGain = raining ? 0.7 : 0;

  // smart controller
  let pump = s.pump;
  if (s.mode === 'auto') {
    const stopAt = crop.min + (crop.max - crop.min) * 0.75;
    if (raining) pump = false;
    else if (s.moisture < crop.min) pump = true;
    else if (s.moisture >= stopAt) pump = false;
  }
  if (s.tank < PUMP_L) pump = false;

  const moisture = clamp(
    s.moisture - loss + rainGain + (pump ? PUMP_GAIN : 0) + noise(0.05),
    0,
    100
  );
  const used = pump ? PUMP_L : 0;

  // traditional field: waters 06:00–08:00 and 18:00–20:00 every day
  const hour = (minute / 60) % 24;
  const tradPump = (hour >= 6 && hour < 8) || (hour >= 18 && hour < 20);
  const tradMoisture = clamp(
    s.tradMoisture - loss + rainGain + (tradPump ? PUMP_GAIN : 0) + noise(0.05),
    0,
    100
  );

  const history = s.history.concat({
    t: minute,
    m: moisture,
    tm: tradMoisture,
    temp,
    hum,
    pump,
    rain: raining,
  });
  if (history.length > HISTORY_LEN) history.shift();

  return {
    ...s,
    minute,
    moisture,
    temp,
    hum,
    pump,
    rainLeft,
    tank: s.tank - used,
    waterUsed: s.waterUsed + used,
    pumpSteps: s.pumpSteps + (pump ? 1 : 0),
    tradMoisture,
    tradPump,
    tradWater: s.tradWater + (tradPump ? PUMP_L : 0),
    tradOverSteps: s.tradOverSteps + (tradMoisture > crop.max ? 1 : 0),
    history,
  };
}

// Rule-based irrigation advisory (the "advisory" part of the system).
export function advise(s) {
  const c = CROPS[s.crop];
  const out = [];
  const raining = s.rainLeft > 0;

  if (s.tank < PUMP_L) out.push({ level: 'bad', text: 'Water tank is empty. Refill the tank before irrigation can resume.' });
  else if (s.tank < TANK_CAP * 0.2) out.push({ level: 'warn', text: 'Water tank is below 20%. Plan a refill soon.' });

  if (s.moisture < c.min * 0.8) out.push({ level: 'bad', text: `Soil is critically dry for ${c.name} (${s.moisture.toFixed(0)}%). Irrigate immediately.` });
  else if (s.moisture < c.min) out.push({ level: 'warn', text: `Soil moisture is below the ${c.name} range (${c.min}–${c.max}%). Irrigation is required.` });
  else if (s.moisture > c.max) out.push({ level: 'warn', text: 'Soil is over-saturated. Stop irrigation to avoid waterlogging and root damage.' });
  else out.push({ level: 'ok', text: `Soil moisture is within the ideal range for ${c.name}.` });

  if (raining) out.push({ level: 'info', text: 'Rain detected. Automatic irrigation is paused to save water.' });
  if (s.temp > 35) out.push({ level: 'warn', text: 'High temperature: evaporation is fast. Prefer irrigating early morning or evening.' });
  if (s.hum < 35) out.push({ level: 'info', text: 'Low humidity: expect faster soil drying today.' });
  if (s.mode === 'manual' && s.pump && s.moisture > c.max - 3) out.push({ level: 'warn', text: 'Manual pump is running near the upper limit. Consider switching it off.' });
  if (s.mode === 'auto' && s.pump) out.push({ level: 'info', text: 'Auto mode: pump is ON until soil reaches the target level.' });
  return out;
}

export function formatTime(minute) {
  const day = Math.floor(minute / 1440) + 1;
  const h = Math.floor((minute % 1440) / 60);
  const m = minute % 60;
  return `Day ${day}, ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
