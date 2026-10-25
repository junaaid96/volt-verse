import type { Project } from '../types'

export const streetlight: Project = {
  slug: 'smart-streetlight',
  categoryId: 'iot',
  title: 'Smart Streetlight Automation',
  tagline: 'Dim-by-default lamps that brighten for traffic and faults.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,600–2,900',
  boards: ['Arduino Uno', 'ESP32'],
  skills: ['LDR sensing', 'PIR / IR', 'PWM dimming', 'Fault detection'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['esp32', 'acs712'],
  rig: { sensor: 'pir', extras: ['relay'] },
  options: [
    {
      id: 'a',
      title: 'A. Dusk + motion lamp',
      level: 'Basic · easiest',
      blurb: 'LDR enables the lamp at dusk; PIR boosts it to full when motion passes, dims otherwise.',
      points: ['PWM dimming saves ~60% energy', 'Single-pole demo rig', 'LDR + PIR only'],
      weeks: '1 week',
      cost: '৳1,600–2,200',
    },
    {
      id: 'b',
      title: 'B. 3-pole IoT street',
      level: 'Medium · best demo',
      blurb: 'Three ESP32 poles with fault sensing (lamp current) reporting to a dashboard.',
      points: ['Cascading light follows traffic', 'Dead-lamp auto alert', 'Energy dashboard'],
      weeks: '2 weeks',
      cost: '৳2,200–2,900',
    },
  ],
  parts: [
    { name: 'Arduino Uno / ESP32', qty: '1–3', role: 'Pole controllers', price: '৳550–1,800' },
    { name: 'LDR + 10k', qty: '1–3', role: 'Dusk detection', price: '৳30–90' },
    { name: 'PIR / IR obstacle', qty: '1–3', role: 'Traffic detect', price: '৳120–450' },
    { name: '12V LED strip + MOSFET', qty: '1–3', role: 'Dimmable lamp', price: '৳250–700' },
    { name: 'ACS712 current sensor', qty: '1', role: 'Fault detect (B)', price: '৳250–400' },
    { name: 'Pole model (PVC/wood)', qty: '1–3', role: 'Demo street', price: '৳300–600' },
    { name: '12V supply', qty: '1', role: 'Lamp power', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino pole',
      board: 'Arduino Uno',
      pins: [
        { from: 'LDR divider →', to: 'A0' },
        { from: 'PIR → OUT', to: 'D2' },
        { from: 'MOSFET gate →', to: 'D9 (PWM)' },
        { from: 'LED strip →', to: '12V via MOSFET drain' },
        { from: 'ACS712 → OUT', to: 'A1 (version B)' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 pole',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'LDR divider →', to: 'GPIO34' },
        { from: 'PIR → OUT', to: 'GPIO27' },
        { from: 'MOSFET gate →', to: 'GPIO25 (LEDC PWM)' },
        { from: 'Next-pole trigger →', to: 'GPIO26 → neighbor GPIO27' },
      ],
    },
  ],
  steps: [
    { title: 'Prove dusk switching', detail: 'Cover/uncover the LDR and watch the lamp cross the threshold. Add hysteresis so clouds don’t flicker it.' },
    { title: 'Add motion boost', detail: 'PIR hold-time ~30s: full brightness on motion, 30% dim otherwise. Tune with the simulator below.' },
    { title: 'Build the pole model', detail: 'PVC pole + arm + LED strip diffuser. Run wires inside the pole for a clean look.' },
    { title: 'Cascade poles (B)', detail: 'Each pole signals its neighbor so light “walks” with traffic. Test with a toy car.' },
    { title: 'Fault detection (B)', detail: 'ACS712 reads lamp current: commanded ON but ~0A = dead lamp → dashboard alert + buzzer.' },
    { title: 'Measure savings', detail: 'Compare always-on vs dimmed energy over a night cycle. Present kWh + cost saved.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: darkness arms the lamp, motion boosts it from dim to full.',
    sliders: [
      { id: 'ambient', label: 'Ambient light', unit: 'lx', min: 0, max: 1000, value: 90 },
      { id: 'motion', label: 'Motion', unit: '%', min: 0, max: 100, value: 80 },
    ],
    threshold: { id: 'thr', label: 'Dusk below', unit: 'lx', min: 50, max: 500, value: 150 },
    watch: 'ambient',
    rule: 'below',
    actuator: 'Lamp',
    onText: 'FULL',
    offText: 'dim/off',
    lcd: ['Amb:{ambient}lx M:{motion}', 'Lamp:{act}'],
    demoSlider: 'ambient',
    demoFrom: 600,
    demoTo: 30,
    barLabel: 'Darkness',
  },
  code: [
    {
      id: 'a',
      label: 'A · Dusk + motion',
      note: 'PWM dim default 30%, full on motion. LDR high value = dark (tune!).',
      code: `const int LDR = A0, PIR = 2, LAMP = 9;
const int DUSK = 700, DIM = 80, FULL = 255;
unsigned long lastMotion = 0;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LAMP, OUTPUT);
}

void loop() {
  int ambient = analogRead(LDR);
  if (digitalRead(PIR)) lastMotion = millis();
  bool night = ambient > DUSK;
  bool active = millis() - lastMotion < 30000;
  int level = !night ? 0 : (active ? FULL : DIM);
  analogWrite(LAMP, level);
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · Fault detect',
      note: 'ACS712: lamp commanded on but current ~0 means a dead lamp.',
      code: `const int LAMP = 9, ACS = A1;
const float SENS = 0.185;  // 5A module V/A
int lampLevel = 0;

float readAmps() {
  int raw = analogRead(ACS);
  float v = raw * (5.0 / 1023.0);
  return (v - 2.5) / SENS;  // signed current
}

void loop() {
  // ... set lampLevel from dusk/motion logic ...
  analogWrite(LAMP, lampLevel);
  delay(300);
  float amps = abs(readAmps());
  bool commanded = lampLevel > 50;
  bool fault = commanded && amps < 0.05;
  // fault -> raise dashboard alert / buzzer
}`,
    },
  ],
  tips: [
    { title: 'Hysteresis', detail: 'Dusk ON at 700, OFF at 600 — stops flicker on cloudy evenings.' },
    { title: 'Diffuser', detail: 'Frosted acrylic over the strip looks 10× more like a real lamp.' },
    { title: 'Hold time', detail: '30–60s motion hold keeps the lamp calm for slow pedestrians.' },
    { title: 'Count savings', detail: 'Dim 30% for 8 idle hours ≈ 56% energy saved — show the math.' },
  ],
}
