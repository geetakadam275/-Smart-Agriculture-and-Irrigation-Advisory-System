'use client';

import { useEffect, useState } from 'react';
import { initialState, step } from './simulation';

// Shared hook: runs the simulation clock (1 tick = 15 simulated minutes at 1x).
export function useSim(crop = 'wheat') {
  const [sim, setSim] = useState(() => initialState(crop));
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSim((s) => step(s)), 1000 / speed);
    return () => clearInterval(id);
  }, [running, speed]);

  return { sim, setSim, running, setRunning, speed, setSpeed };
}
