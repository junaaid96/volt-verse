import type { Project } from '../types'

export const humanFollowerRobot: Project = {
  slug: 'human-follower-robot',
  categoryId: 'robotics',
  title: 'Human Follower Robot',
  tagline: 'A PIR eye spots you and sonar keeps the robot a polite step behind.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,000–3,800',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Classic build: 6 L298N motor pins plus PIR, sonar trigger/echo and side IRs.' },
    esp32: { ok: true, note: 'Sonar echo and PIR go to input-only GPIO34/35/36/39; speed uses analogWrite().' },
    nodemcu: {
      ok: false,
      reason: '6 motor pins plus PIR, sonar and 2 side IRs exceed the usable GPIO once boot pins D3/D4/D8 are avoided.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only ~4 free GPIO; motors plus PIR and sonar need far more than that.',
    },
  },
  skills: ['PIR motion sensing', 'Ultrasonic ranging', 'Follow control', 'Lost-target search'],
  scene: 'home',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'hcsr04', 'l298n', 'pir', 'tcrt5000'],
  rig: { sensor: 'chassis', extras: ['pir', 'sonic'] },
  options: [
    {
      id: 'a',
      title: 'A. Detect + keep distance',
      level: 'Medium · core build',
      blurb: 'PIR detects a person and the sonar holds a 40–90cm follow window: approach, back off, or hold still.',
      points: ['PIR person detect', 'Sonar 40–90cm window', 'Approach / back-off / hold'],
      weeks: '2 weeks',
      cost: '৳2,000–3,000',
    },
    {
      id: 'b',
      title: 'B. Side tracking + search',
      level: 'Medium · full follower',
      blurb: 'Adds side IR modules that turn toward the person, a slow spin search when the person is lost, and a lock-on chirp.',
      points: ['Side IR steering', 'Lost-person spin search', 'Buzzer lock-on chirp'],
      weeks: '2–3 weeks',
      cost: '৳2,400–3,800',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'HC-SR04 ultrasonic sensor', qty: '1', role: 'Follow distance', price: '৳120–250' },
    { name: 'HC-SR501 PIR module', qty: '1', role: 'Person detect', price: '৳120–250' },
    { name: 'TCRT5000 IR obstacle module', qty: '2', role: 'Side person tracking', price: '৳60–160', versions: ['b'] },
    { name: 'Active buzzer 5V', qty: '1', role: 'Lock-on chirp', price: '৳25–60', versions: ['b'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Jumpers', qty: '1 set', role: 'Wiring', price: '৳80–200' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'L298N ENA / IN1 / IN2 (left motor)', to: 'D5 / D7 / D8' },
        { from: 'L298N IN3 / IN4 / ENB (right motor)', to: 'D9 / D10 / D11' },
        { from: 'HC-SR04 VCC / GND / TRIG / ECHO', to: '5V / GND / D2 / D3' },
        { from: 'PIR VCC / GND / OUT', to: '5V / GND / D4' },
        { from: 'Left IR OUT (B)', to: 'D12 (module VCC 5V, GND shared)' },
        { from: 'Right IR OUT (B)', to: 'A0 as digital input (module VCC 5V, GND shared)' },
        { from: 'Buzzer +/− (B)', to: 'D13 / GND' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'L298N ENA / IN1 / IN2 (left motor)', to: 'GPIO25 / GPIO26 / GPIO27' },
        { from: 'L298N IN3 / IN4 / ENB (right motor)', to: 'GPIO14 / GPIO13 / GPIO23' },
        { from: 'HC-SR04 VCC / GND / TRIG / ECHO', to: '5V / GND / GPIO32 / GPIO34 via 1k/2k divider' },
        { from: 'PIR VCC / GND / OUT', to: '5V / GND / GPIO35 (OUT is 3V3-safe on HC-SR501)' },
        { from: 'Left IR OUT (B)', to: 'GPIO36 (module powered from 3V3, not 5V)' },
        { from: 'Right IR OUT (B)', to: 'GPIO39 (module powered from 3V3, not 5V)' },
        { from: 'Buzzer +/− (B)', to: 'GPIO18 / GND' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V/VIN (battery ≤ 12V only)' },
        { from: 'Common GND', to: 'board GND + L298N GND + sensor GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'assemble-chassis',
      title: 'Assemble the 2WD chassis',
      detail: 'Bolt the motors, wheels, caster and top plate together. Keep the front of the plate clear for the sonar and PIR modules.',
    },
    {
      id: 'wire-motor-driver',
      title: 'Wire the L298N',
      detail: 'Left channel ENA/IN1/IN2 → D5/D7/D8; right channel IN3/IN4/ENB → D9/D10/D11. Motor leads to OUT1/OUT2 (left) and OUT3/OUT4 (right).',
      boardDetail: {
        esp32: 'Left channel ENA/IN1/IN2 → GPIO25/26/27; right channel IN3/IN4/ENB → GPIO14/13/23. Motor leads to OUT1/OUT2 (left) and OUT3/OUT4 (right).',
      },
    },
    {
      id: 'mount-follow-sensors',
      title: 'Mount the sonar + PIR',
      detail: 'Face the HC-SR04 and PIR forward at shin height. Sonar TRIG→D2, ECHO→D3; PIR OUT→D4. Give the PIR 30s to settle before trusting its output.',
      boardDetail: {
        esp32: 'Face the HC-SR04 and PIR forward at shin height. Sonar TRIG→GPIO32, ECHO→GPIO34 through a 1k/2k divider (echo is 5V); PIR OUT→GPIO35. Give the PIR 30s to settle first.',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() support. No extra libraries needed.',
      boards: ['esp32'],
    },
    {
      id: 'power-electronics',
      title: 'Power motors and board',
      detail: 'Battery into the L298N motor supply; L298N 5V (jumper on) feeds the board. Tie all GNDs together or the sonar readings will jitter.',
    },
    {
      id: 'upload-follower',
      title: 'Upload and bench-test',
      detail: 'Upload sketch A, lift the wheels and walk in front: wheels drive forward past 90cm, reverse under 40cm, and stop inside the 40–90cm window or when you step away.',
    },
    {
      id: 'add-side-tracking',
      title: 'Add side IRs + buzzer',
      detail: 'Angle the side IR modules outward at 45°. Left OUT→D12, right OUT→A0 (digital input), buzzer +→D13. Step to one side: the robot should turn toward you and chirp when locked on.',
      boardDetail: {
        esp32: 'Angle the side IR modules outward at 45° (power them from 3V3). Left OUT→GPIO36, right OUT→GPIO39, buzzer +→GPIO18. Step to one side: the robot should turn toward you and chirp when locked on.',
      },
      versions: ['b'],
    },
    {
      id: 'tune-follow-window',
      title: 'Tune the follow window',
      detail: 'Adjust NEAR_CM/FAR_CM if the robot crowds or lags you, and turn the PIR sensitivity pot down if pets or curtains trigger it.',
    },
    {
      id: 'follow-demo',
      title: 'Film the follow demo',
      detail: 'Walk a slow loop while the robot trails you, then hide for 5s (B spins to search). Log gap vs motor action for the report.',
    },
  ],
  simulator: {
    viz: 'rover',
    intro: 'Same rule as the firmware: gap under 40cm backs off, over 90cm approaches, inside the window it holds.',
    sliders: [
      { id: 'gap', label: 'Gap', unit: 'cm', min: 0, max: 200, value: 80 },
      { id: 'speed', label: 'Speed', unit: '%', min: 0, max: 100, value: 60 },
    ],
    threshold: { id: 'nearThr', label: 'Near limit', unit: 'cm', min: 20, max: 80, value: 40 },
    watch: 'gap',
    rule: 'below',
    actuator: 'Mode',
    onText: 'BACK',
    offText: 'FOLLOW',
    lcd: ['Gap:{gap}cm', 'Mode:{act}'],
    demoSlider: 'gap',
    demoFrom: 150,
    demoTo: 10,
    barLabel: 'Gap',
  },
  code: [
    {
      id: 'a',
      label: 'A · Detect + keep distance',
      note: 'PIR on D4 gates everything; sonar TRIG D2 / ECHO D3 holds the 40–90cm window. Motors D5/D7/D8 + D9/D10/D11.',
      board: 'uno',
      versions: ['a'],
      code: `// Human follower A: PIR person detect + sonar keep-distance (40-90cm).
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3, PIR = 4;
const int NEAR_CM = 40, FAR_CM = 90;  // follow window
const int SPEED = 170;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;  // 0 if no echo
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(PIR, INPUT);
  delay(30000);  // let the PIR settle before the demo
}

void loop() {
  if (digitalRead(PIR) == LOW) { drive(0, 0); delay(100); return; }  // no person: stop
  long cm = readCm();
  if (cm <= 0) drive(0, 0);                 // no echo: hold
  else if (cm > FAR_CM) drive(SPEED, SPEED);    // person far: approach
  else if (cm < NEAR_CM) drive(-SPEED, -SPEED); // too close: back off
  else drive(0, 0);                         // in window: hold
  delay(100);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 detect + keep distance',
      note: 'Same logic on ESP32: sonar TRIG GPIO32 / ECHO GPIO34 through a 1k/2k divider, PIR GPIO35, motors GPIO25/26/27 + GPIO14/13/23 via analogWrite().',
      board: 'esp32',
      versions: ['a'],
      code: `// Human follower A (ESP32): PIR person detect + sonar keep-distance (40-90cm).
// Sonar ECHO comes through a 1k/2k divider: the HC-SR04 echo pulse is 5V.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34, PIR = 35;
const int NEAR_CM = 40, FAR_CM = 90;  // follow window
const int SPEED = 170;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;  // 0 if no echo
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(PIR, INPUT);
  delay(30000);  // let the PIR settle before the demo
}

void loop() {
  if (digitalRead(PIR) == LOW) { drive(0, 0); delay(100); return; }  // no person: stop
  long cm = readCm();
  if (cm <= 0) drive(0, 0);                 // no echo: hold
  else if (cm > FAR_CM) drive(SPEED, SPEED);    // person far: approach
  else if (cm < NEAR_CM) drive(-SPEED, -SPEED); // too close: back off
  else drive(0, 0);                         // in window: hold
  delay(100);
}`,
    },
    {
      id: 'b',
      label: 'B · Side tracking + search',
      note: 'Side IRs on D12 (left) and A0 as digital input (right) steer toward the person; 2s after losing the PIR it spins to search; D13 chirps on lock.',
      board: 'uno',
      versions: ['b'],
      code: `// Human follower B: side-IR steering + lost-person spin search + lock chirp.
// IR obstacle modules output LOW when something is near.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3, PIR = 4;
const int IR_L = 12, IR_R = A0;  // A0 used as a digital input
const int BUZZER = 13;
const int NEAR_CM = 40, FAR_CM = 90;  // follow window
const int SPEED = 170;

bool locked = false, everLocked = false;
unsigned long lostSince = 0;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void chirp() {
  for (int i = 0; i < 2; i++) { digitalWrite(BUZZER, HIGH); delay(70); digitalWrite(BUZZER, LOW); delay(70); }
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;  // 0 if no echo
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(PIR, INPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT); pinMode(BUZZER, OUTPUT);
  delay(30000);  // let the PIR settle before the demo
}

void loop() {
  if (digitalRead(PIR) == LOW) {  // nobody in front
    if (locked) { locked = false; lostSince = millis(); }
    if (everLocked && millis() - lostSince > 2000) drive(90, -90);  // slow 360 scan
    else drive(0, 0);
    delay(100);
    return;
  }
  if (!locked) { locked = true; everLocked = true; chirp(); }  // lock-on chirp
  bool sideL = digitalRead(IR_L) == LOW;
  bool sideR = digitalRead(IR_R) == LOW;
  long cm = readCm();
  if (cm > 0 && cm < NEAR_CM) drive(-SPEED, -SPEED);  // too close: back off first
  else if (sideL && !sideR) drive(-120, 120);   // person left: turn left
  else if (sideR && !sideL) drive(120, -120);   // person right: turn right
  else if (cm <= 0) drive(0, 0);                // no echo: hold
  else if (cm > FAR_CM) drive(SPEED, SPEED);    // person far: approach
  else drive(0, 0);                             // in window: hold
  delay(100);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 side tracking + search',
      note: 'Same B logic on ESP32: side IRs on GPIO36/39 (modules on 3V3), buzzer GPIO18, sonar TRIG GPIO32 / ECHO GPIO34 via divider, PIR GPIO35.',
      board: 'esp32',
      versions: ['b'],
      code: `// Human follower B (ESP32): side-IR steering + lost-person spin search + lock chirp.
// IR obstacle modules output LOW when something is near; powered from 3V3.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34, PIR = 35;
const int IR_L = 36, IR_R = 39;
const int BUZZER = 18;
const int NEAR_CM = 40, FAR_CM = 90;  // follow window
const int SPEED = 170;

bool locked = false, everLocked = false;
unsigned long lostSince = 0;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void chirp() {
  for (int i = 0; i < 2; i++) { digitalWrite(BUZZER, HIGH); delay(70); digitalWrite(BUZZER, LOW); delay(70); }
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;  // 0 if no echo
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(PIR, INPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT); pinMode(BUZZER, OUTPUT);
  delay(30000);  // let the PIR settle before the demo
}

void loop() {
  if (digitalRead(PIR) == LOW) {  // nobody in front
    if (locked) { locked = false; lostSince = millis(); }
    if (everLocked && millis() - lostSince > 2000) drive(90, -90);  // slow 360 scan
    else drive(0, 0);
    delay(100);
    return;
  }
  if (!locked) { locked = true; everLocked = true; chirp(); }  // lock-on chirp
  bool sideL = digitalRead(IR_L) == LOW;
  bool sideR = digitalRead(IR_R) == LOW;
  long cm = readCm();
  if (cm > 0 && cm < NEAR_CM) drive(-SPEED, -SPEED);  // too close: back off first
  else if (sideL && !sideR) drive(-120, 120);   // person left: turn left
  else if (sideR && !sideL) drive(120, -120);   // person right: turn right
  else if (cm <= 0) drive(0, 0);                // no echo: hold
  else if (cm > FAR_CM) drive(SPEED, SPEED);    // person far: approach
  else drive(0, 0);                             // in window: hold
  delay(100);
}`,
    },
  ],
  tips: [
    { title: 'Let the PIR settle', detail: 'The firmware waits 30s at boot — stand clear during warm-up or the first lock will be a false one.' },
    { title: 'PIR sees sideways poorly', detail: 'It detects motion across its face best; if the robot loses you when you stand still, wave an arm to re-trigger.' },
    { title: 'Tune the IR range pots', detail: 'Side modules ship at maximum range and will see walls — dial them down until they only fire within ~30cm.' },
    { title: 'Demo on a hard floor', detail: 'Thick carpet slows one wheel and the follow line curves; re-test on the surface you will demo on.' },
  ],
}
