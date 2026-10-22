// Illustrated hardware view: sensors -> Arduino Uno -> relay -> water pump.
// Drawn as inline SVG so no image files or network access are needed.
// Live values come from the simulation state.

const TXT = '#cfe5d6';
const MUTED = '#8fb09c';

export default function Hardware({ sim, running, showTable = true }) {
  const adc = Math.round(1023 * (1 - sim.moisture / 100)); // dry soil -> high reading
  const pumpOn = sim.pump;
  const flow = running ? ' flow' : '';
  const topPins = Array.from({ length: 14 }, (_, i) => i); // D13 ... D0
  const powerLabels = ['', 'RST', '3V3', '5V', 'GND', 'GND', 'VIN', ''];

  return (
    <div>
      <svg className="hw" viewBox="0 0 1000 440" role="img" aria-label="Hardware diagram: sensors connected to Arduino Uno, relay and water pump">
        {/* ---------- WIRES (drawn first so parts sit on top) ---------- */}
        {/* DHT11 data -> D2 */}
        <path d="M156,73 H590 V124" className={'wire' + flow} stroke="#22d3ee" />
        {/* Soil sensor AO -> A0 */}
        <path d="M252,330 H552 V318" className={'wire' + flow} stroke="#facc15" />
        {/* D7 -> relay IN */}
        <path d="M510,124 V100 H720 V170 H744" className={'wire' + (pumpOn && running ? ' flow' : '')} stroke={pumpOn ? '#4ade80' : '#64748b'} />
        {/* 12V supply -> relay COM */}
        <path d="M730,315 H760 V255 H835 V230" className="wirestatic" stroke="#ef4444" />
        {/* relay NO -> pump */}
        <path d="M803,230 V312" className={'wire' + (pumpOn && running ? ' flow' : '')} stroke={pumpOn ? '#fb923c' : '#64748b'} />
        {/* probe -> comparator PCB */}
        <path d="M130,270 H145 V325 H160" className="wirestatic" stroke="#94a3b8" />

        {/* ---------- DHT11 ---------- */}
        <rect x="60" y="30" width="80" height="90" rx="6" fill="#2b8fd6" stroke="#1d6fa8" />
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <circle key={r + '-' + c} cx={74 + c * 13} cy={44 + r * 14} r="3" fill="#0b4a73" />
          ))
        )}
        {[55, 70, 85].map((y) => (
          <rect key={y} x="140" y={y} width="16" height="6" fill="#c0c7cf" />
        ))}
        <text x="40" y="142" fill={TXT} fontSize="13" fontWeight="600">DHT11 Sensor</text>
        <text x="40" y="157" fill={MUTED} fontSize="11">Temperature &amp; Humidity</text>
        <text x="40" y="176" fill="#22d3ee" fontSize="13" fontWeight="600">
          {sim.temp.toFixed(1)} °C · {sim.hum.toFixed(0)} %
        </text>

        {/* ---------- SOIL MOISTURE SENSOR ---------- */}
        <rect x="60" y="235" width="70" height="60" rx="6" fill="#111827" stroke="#374151" />
        <rect x="68" y="293" width="20" height="72" rx="4" fill="#111827" stroke="#374151" />
        <rect x="102" y="293" width="20" height="72" rx="4" fill="#111827" stroke="#374151" />
        <line x1="78" y1="300" x2="78" y2="358" stroke="#d4af37" strokeWidth="2" />
        <line x1="112" y1="300" x2="112" y2="358" stroke="#d4af37" strokeWidth="2" />
        <text x="82" y="270" fill="#6b7280" fontSize="10">PROBE</text>
        {/* comparator PCB */}
        <rect x="160" y="298" width="92" height="64" rx="4" fill="#1d4ed8" stroke="#1e3a8a" />
        <rect x="204" y="306" width="32" height="16" fill="#111827" />
        <text x="208" y="318" fill="#9ca3af" fontSize="7">LM393</text>
        <rect x="170" y="334" width="22" height="20" fill="#60a5fa" />
        <circle cx="181" cy="344" r="6" fill="#e5e7eb" stroke="#6b7280" />
        <circle cx={246} cy={330} r="3" fill="#facc15" />
        <circle cx={246} cy={340} r="3" fill="#ef4444" />
        <circle cx={246} cy={350} r="3" fill="#111827" />
        <text x="40" y="388" fill={TXT} fontSize="13" fontWeight="600">Soil Moisture Sensor</text>
        <text x="40" y="403" fill={MUTED} fontSize="11">YL-69 / FC-28 + LM393 module</text>
        <text x="40" y="422" fill="#facc15" fontSize="13" fontWeight="600">
          {sim.moisture.toFixed(0)} % · A0 = {adc}
        </text>

        {/* ---------- ARDUINO UNO ---------- */}
        <rect x="360" y="120" width="300" height="200" rx="10" fill="#0e7c86" stroke="#0a5a62" strokeWidth="2" />
        {/* USB-B port */}
        <rect x="344" y="150" width="52" height="46" rx="3" fill="#cbd5e1" stroke="#64748b" />
        <rect x="352" y="158" width="36" height="30" fill="#94a3b8" />
        {/* DC jack */}
        <rect x="344" y="248" width="46" height="48" rx="3" fill="#111827" stroke="#374151" />
        <circle cx="366" cy="272" r="8" fill="#0b1220" stroke="#374151" />
        {/* reset button */}
        <circle cx="408" cy="215" r="9" fill="#dc2626" stroke="#7f1d1d" />
        {/* crystal */}
        <rect x="440" y="215" width="24" height="12" rx="6" fill="#d1d5db" stroke="#6b7280" />
        {/* ATmega chip */}
        <rect x="500" y="205" width="116" height="36" fill="#111827" stroke="#374151" />
        <circle cx="508" cy="223" r="3" fill="#374151" />
        <text x="524" y="227" fill="#9ca3af" fontSize="9">ATmega328P</text>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i}>
            <rect x={506 + i * 15} y="199" width="4" height="6" fill="#9ca3af" />
            <rect x={506 + i * 15} y="241" width="4" height="6" fill="#9ca3af" />
          </g>
        ))}
        {/* status LEDs */}
        <circle cx="430" cy="172" r="4" fill="#4ade80" />
        <circle cx="448" cy="172" r="4" fill={pumpOn ? '#fb923c' : '#4b3a2a'} className={pumpOn ? 'led' : ''} />
        <circle cx="466" cy="172" r="4" fill={running ? '#fde047' : '#4b4a2a'} className={running ? 'blink' : ''} />
        <circle cx="484" cy="172" r="4" fill={running ? '#fde047' : '#4b4a2a'} className={running ? 'blink2' : ''} />
        <text x="424" y="186" fill="#d1fae5" fontSize="7">ON  L   TX  RX</text>
        <text x="500" y="168" fill="#ffffff" fontSize="22" fontWeight="700">ARDUINO</text>
        <text x="500" y="186" fill="#d1fae5" fontSize="12" fontWeight="600">UNO R3</text>
        {/* top header D13..D0 */}
        <rect x="406" y="124" width="232" height="14" rx="2" fill="#111827" />
        {topPins.map((i) => (
          <g key={i}>
            <circle cx={414 + i * 16} cy="131" r="2.6" fill="#d4af37" />
            <text x={414 + i * 16} y="152" fill="#d1fae5" fontSize="8" textAnchor="middle">{13 - i}</text>
          </g>
        ))}
        {/* bottom headers: power + analog */}
        <rect x="400" y="302" width="130" height="14" rx="2" fill="#111827" />
        <rect x="544" y="302" width="100" height="14" rx="2" fill="#111827" />
        {powerLabels.map((l, i) => (
          <g key={'p' + i}>
            <circle cx={408 + i * 16} cy="309" r="2.6" fill="#d4af37" />
            <text x={408 + i * 16} y="297" fill="#d1fae5" fontSize="8" textAnchor="middle">{l}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={'a' + i}>
            <circle cx={552 + i * 16} cy="309" r="2.6" fill="#d4af37" />
            <text x={552 + i * 16} y="297" fill="#d1fae5" fontSize="8" textAnchor="middle">A{i}</text>
          </g>
        ))}
        {/* pin call-outs */}
        <text x="596" y="66" fill="#22d3ee" fontSize="11" fontWeight="600">D2 ← DHT11 data</text>
        <text x="516" y="94" fill={pumpOn ? '#4ade80' : MUTED} fontSize="11" fontWeight="600">D7 → relay IN</text>
        <text x="556" y="346" fill="#facc15" fontSize="11" fontWeight="600">A0 ← soil AO</text>
        <text x="360" y="372" fill={TXT} fontSize="13" fontWeight="600">Arduino Uno (ATmega328P)</text>
        <text x="360" y="388" fill={MUTED} fontSize="11">Reads sensors, runs the irrigation logic</text>

        {/* ---------- RELAY MODULE ---------- */}
        <text x="744" y="102" fill={TXT} fontSize="13" fontWeight="600">5V Relay Module</text>
        <rect x="744" y="110" width="160" height="120" rx="6" fill="#2a5cd0" stroke="#1e3a8a" strokeWidth="2" />
        <rect x="790" y="122" width="92" height="64" rx="3" fill="#3b82f6" stroke="#1e3a8a" />
        <text x="798" y="148" fill="#ffffff" fontSize="9" fontWeight="700">SRD-05VDC</text>
        <text x="798" y="161" fill="#dbeafe" fontSize="8">10A 250VAC</text>
        {[143, 155, 167].map((y) => (
          <rect key={y} x="744" y={y} width="10" height="6" fill="#c0c7cf" />
        ))}
        <text x="757" y="149" fill="#dbeafe" fontSize="8">VCC</text>
        <text x="757" y="161" fill="#dbeafe" fontSize="8">GND</text>
        <text x="757" y="173" fill="#dbeafe" fontSize="8">IN</text>
        <circle cx="768" cy="205" r="5" fill="#4ade80" />
        <circle cx="796" cy="205" r="5" fill={pumpOn ? '#ef4444' : '#4a2a2a'} className={pumpOn ? 'led' : ''} />
        {[790, 822, 854].map((x) => (
          <g key={x}>
            <rect x={x} y="196" width="26" height="34" rx="2" fill="#16a34a" stroke="#14532d" />
            <circle cx={x + 13} cy="208" r="6" fill="#d1fae5" stroke="#14532d" />
            <line x1={x + 9} y1="208" x2={x + 17} y2="208" stroke="#14532d" strokeWidth="2" />
          </g>
        ))}
        <text x="803" y="242" fill={MUTED} fontSize="9" textAnchor="middle">NO</text>
        <text x="835" y="242" fill={MUTED} fontSize="9" textAnchor="middle">COM</text>
        <text x="867" y="242" fill={MUTED} fontSize="9" textAnchor="middle">NC</text>

        {/* ---------- 12V SUPPLY ---------- */}
        <rect x="650" y="300" width="80" height="50" rx="5" fill="#374151" stroke="#4b5563" />
        <text x="690" y="322" fill="#f3f4f6" fontSize="12" fontWeight="700" textAnchor="middle">12 V</text>
        <text x="690" y="338" fill="#9ca3af" fontSize="9" textAnchor="middle">Pump supply</text>

        {/* ---------- WATER PUMP ---------- */}
        <rect x="780" y="312" width="86" height="52" rx="8" fill="#64748b" stroke="#475569" strokeWidth="2" />
        <rect x="766" y="330" width="14" height="16" fill="#94a3b8" />
        <rect x="866" y="316" width="44" height="44" rx="10" fill="#0ea5e9" stroke="#0369a1" strokeWidth="2" />
        <circle cx="888" cy="338" r="10" fill="#0284c7" />
        <rect x="910" y="333" width="62" height="10" fill="#7dd3fc" stroke="#0284c7" />
        <rect x="882" y="360" width="12" height="26" fill="#7dd3fc" stroke="#0284c7" />
        <text x="792" y="342" fill="#e2e8f0" fontSize="10" fontWeight="700">DC MOTOR</text>
        {pumpOn && (
          <>
            {[0, 1, 2].map((k) => (
              <circle key={k} cy="338" r="3.5" fill="#38bdf8">
                <animate attributeName="cx" from="914" to="968" dur="0.9s" begin={`${k * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {[0, 1].map((k) => (
              <circle key={'d' + k} cx="968" r="3" fill="#38bdf8">
                <animate attributeName="cy" from="346" to="392" dur="0.7s" begin={`${k * 0.35}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0" dur="0.7s" begin={`${k * 0.35}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </>
        )}
        <text x="780" y="408" fill={TXT} fontSize="13" fontWeight="600">DC Water Pump</text>
        <text x="780" y="424" fill={pumpOn ? '#4ade80' : MUTED} fontSize="13" fontWeight="600">
          {pumpOn ? 'ON · irrigating' : 'OFF'}
        </text>
        <text x="900" y="424" fill={MUTED} fontSize="11">→ drip line</text>
      </svg>

      {showTable && (
      <div className="tablewrap">
        <table className="pins">
          <thead>
            <tr><th>Component</th><th>Pin</th><th>Connects to</th></tr>
          </thead>
          <tbody>
            <tr><td>Soil moisture module</td><td>VCC / GND / AO</td><td>5V / GND / A0</td></tr>
            <tr><td>DHT11</td><td>VCC / GND / DATA</td><td>5V / GND / D2</td></tr>
            <tr><td>Relay module</td><td>VCC / GND / IN</td><td>5V / GND / D7</td></tr>
            <tr><td>Water pump</td><td>+ / −</td><td>12 V supply through relay COM &amp; NO</td></tr>
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
