/** An idealized Uno R3 input/output behavior model, not an electrical or C++ simulator. */
export const PINS = Object.freeze({ led: 9, button: 2, knob: 'A0' });
export const DEFAULTS = Object.freeze({ project: 'lighthouse', name: 'Moonbeam lighthouse', cycleMs: 1600, knob: 820 });
export const PROJECTS = Object.freeze({
  lighthouse: { title: 'Lighthouse', number: '01', idea: 'A tiny beacon for a paper harbour.', rule: 'Light for half a cycle. Rest for half. Repeat.', prompt: 'What could your light help someone find?', prediction: 'After half a cycle, what will the light do?', answer: 'off', choices: [['on', 'Stay on'], ['off', 'Switch off']], explain: 'The first half is on; the second half is off. The knob sets how bright “on” is.' },
  signal: { title: 'Secret signal', number: '02', idea: 'Send a hello across your blanket fort.', rule: 'Hold the button to light your signal.', prompt: 'Invent a signal: what could three short flashes mean?', prediction: 'When you hold the button, what will D2 read?', answer: 'low', choices: [['high', 'HIGH'], ['low', 'LOW']], explain: 'INPUT_PULLUP keeps D2 HIGH when released. Pressing connects D2 to ground, so it reads LOW. Our code turns the LED on for LOW.' },
  firefly: { title: 'Firefly', number: '03', idea: 'Give a cardboard creature a glowing heart.', rule: 'Grow brighter, then softer. Repeat.', prompt: 'What creature would you bring to life with a little glow?', prediction: 'At the middle of a cycle, how bright is the light?', answer: 'peak', choices: [['off', 'All the way off'], ['peak', 'At its chosen brightest']], explain: 'The brightness rises to the knob’s limit halfway through the cycle, then falls back to zero. PWM sets the average brightness.' },
});

export function normalizeConfig(input = {}) {
  const project = input.project ?? DEFAULTS.project;
  if (!Object.hasOwn(PROJECTS, project)) throw new RangeError('Choose a known project');
  const cycleMs = input.cycleMs ?? DEFAULTS.cycleMs;
  if (!Number.isInteger(cycleMs) || cycleMs < 600 || cycleMs > 3000 || cycleMs % 2) throw new RangeError('Cycle must be an even integer from 600 to 3000 ms');
  const name = String(input.name ?? DEFAULTS.name).replace(/[\r\n\u2028\u2029\u0000-\u001f]/g, ' ').trim().slice(0, 60) || DEFAULTS.name;
  return { project, cycleMs, name };
}

export function analogToPWM(raw) {
  if (!Number.isInteger(raw) || raw < 0 || raw > 1023) throw new RangeError('Uno analog input must be an integer from 0 to 1023');
  return Math.floor(raw * 255 / 1023);
}

export function evaluate(input = {}, { elapsedMs = 0, knob = DEFAULTS.knob, pressed = false } = {}) {
  const config = normalizeConfig(input);
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new RangeError('Elapsed milliseconds must be finite and nonnegative');
  const maximum = analogToPWM(knob);
  // Match unsigned long millis() on an Uno, including its 32-bit wrap.
  const millis = Math.floor(elapsedMs) >>> 0, phase = millis % config.cycleMs, half = config.cycleMs / 2;
  let pwm = 0;
  if (config.project === 'lighthouse') pwm = phase < half ? maximum : 0;
  else if (config.project === 'signal') pwm = pressed ? maximum : 0;
  else pwm = phase < half ? Math.floor(phase * maximum / half) : Math.floor((config.cycleMs - phase) * maximum / half);
  return { millis, phase, maximum, pwm, duty: pwm / 255, buttonRead: pressed ? 'LOW' : 'HIGH', lit: pwm > 0 };
}

export function createSketch(input = {}) {
  const config = normalizeConfig(input);
  const behavior = config.project === 'lighthouse'
    ? '  brightness = phase < halfCycle ? maximum : 0;'
    : config.project === 'signal'
      ? '  brightness = buttonPressed ? maximum : 0;'
      : '  brightness = phase < halfCycle\n    ? (phase * maximum) / halfCycle\n    : ((CYCLE_MS - phase) * maximum) / halfCycle;';
  return `// SPARK / ${config.name}\n// Board: Arduino Uno R3 (ATmega328P, 5 V).\n// D9 -> 330 ohm resistor -> LED anode (+); LED cathode (-) -> GND.\n// Pushbutton: D2 -> switch -> GND (INPUT_PULLUP).\n// 10k potentiometer: outer pins 5V/GND; centre wiper A0.\n// Disconnect USB before changing wires. Start with an adult helper.\n\nconst byte LED_PIN = ${PINS.led};\nconst byte BUTTON_PIN = ${PINS.button};\nconst byte KNOB_PIN = ${PINS.knob};\nconst unsigned long CYCLE_MS = ${config.cycleMs}UL;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUTTON_PIN, INPUT_PULLUP);\n}\n\nvoid loop() {\n  const int knob = analogRead(KNOB_PIN);\n  const unsigned long maximum = (knob * 255UL) / 1023UL;\n  const bool buttonPressed = digitalRead(BUTTON_PIN) == LOW;\n  const unsigned long phase = millis() % CYCLE_MS;\n  const unsigned long halfCycle = CYCLE_MS / 2UL;\n  int brightness = 0;\n${behavior}\n  analogWrite(LED_PIN, brightness);\n}\n`;
}

export function sketchFilename(input = {}) {
  const config = normalizeConfig(input);
  return `${config.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'my_invention'}.ino`;
}
