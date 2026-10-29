import type { Project } from '../types'

export const miniSumoRobot: Project = {
  slug: 'mini-sumo-robot',
  categoryId: 'robotics',
  title: 'Mini Sumo Robot',
  tagline: 'An autonomous pusher that hunts opponents and guards the ring edge.',
  difficulty: 'Advanced',
  weeks: '2–3 weeks',
  cost: '৳2,200–4,000',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Sonar on D2/D3, edge eyes on D4/D12, start button on A0.' },
    esp32: { ok: true, note: 'Sonar TRIG/ECHO on GPIO32/34 (echo divided), edge eyes on GPIO35/36, button on GPIO18.' },
    nodemcu: {
      ok: false,
      reason: 'A alone needs 11 GPIO (6 motor + sonar + 2 edge eyes + button) against ~9 usable, and boot-strapping pins wired to the driver can stall boot or spin the wheels at reset.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only ~4 free GPIO; the drive plus sonar, edge eyes and button need 11+.',
    },
  },
  skills: ['Opponent sensing', 'Edge detection', 'Bout state machines', 'Match strategy'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'hcsr04', 'l298n', 'tcrt5000', 'ir-obstacle'],
  rig: { sensor: 'sonic', extras: ['chassis', 'ir'] },
  options: [
    {
      id: 'a',
      title: 'A. Seek + push',
      level: 'Advanced · core build',
      blurb: 'Scan-spins until the opponent is under 40 cm, then full-speed push; the white border triggers retreat + turn.',
      points: ['40 cm sonar seek + ram', 'White-border retreat + turn', 'Mandatory silent 5 s start'],
      weeks: '2 weeks',
      cost: '৳2,200–3,400',
    },
    {
      id: 'b',
      title: 'B. Flank + strategy',
      level: 'Advanced · full build',
      blurb: 'Adds a side-IR flank attack, an aggressive/defensive strategy switch and buzzer countdown + attack beeps.',
      points: ['Side-IR flank attack', 'Aggressive vs edge-guard switch', 'Buzzer countdown + attack beep'],
      weeks: '2–3 weeks',
      cost: '৳2,600–4,000',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'HC-SR04 ultrasonic sensor', qty: '1', role: 'Front opponent seeker', price: '৳120–250' },
    { name: 'TCRT5000 IR line sensor', qty: '2', role: 'Ring edge eyes', price: '৳60–160' },
    { name: 'Push button', qty: '1', role: 'Start bout (INPUT_PULLUP)', price: '৳10–30' },
    { name: 'Black chart paper + white tape', qty: '1 set', role: '77 cm sumo ring', price: '৳80–200' },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'Sonar ECHO divider', price: '৳10–30', boards: ['esp32'] },
    { name: 'IR obstacle module (HW-201)', qty: '1', role: 'Side flank eye', price: '৳70–180', versions: ['b'] },
    { name: 'SPDT slide switch', qty: '1', role: 'Strategy select (5V/GND wiper)', price: '৳20–50', versions: ['b'] },
    { name: 'Active buzzer 5V', qty: '1', role: 'Countdown + attack beeps', price: '৳25–60', versions: ['b'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Jumpers', qty: '1 set', role: 'Wiring', price: '৳60–150' },
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
        { from: 'EDGE_L → VCC / GND / OUT', to: '5V / GND / D4' },
        { from: 'EDGE_R → VCC / GND / OUT', to: '5V / GND / D12' },
        { from: 'Button', to: 'A0 to GND (INPUT_PULLUP)' },
        { from: 'Side IR → VCC / GND / OUT (B)', to: '5V / GND / A1 (LOW = flank opponent)' },
        { from: 'Strategy switch outer legs + wiper (B)', to: '5V / GND + wiper → A2 (HIGH = aggressive)' },
        { from: 'Buzzer +/− (B)', to: 'D6 / GND (active type: digitalWrite only)' },
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
        { from: 'HC-SR04 VCC / TRIG', to: '5V / GPIO32 (3.3V logic triggers it)' },
        { from: 'HC-SR04 ECHO → 1k/2k divider', to: 'GPIO34 (5V echo would kill the pin)' },
        { from: 'EDGE_L → 3V3 / GND / OUT', to: 'GPIO35 (module from 3V3, not 5V)' },
        { from: 'EDGE_R → 3V3 / GND / OUT', to: 'GPIO36 (module from 3V3, not 5V)' },
        { from: 'Button', to: 'GPIO18 to GND (INPUT_PULLUP)' },
        { from: 'Side IR → 3V3 / GND / OUT (B)', to: 'GPIO39 (LOW = flank opponent)' },
        { from: 'Strategy switch outer legs + wiper (B)', to: '3V3 / GND (never 5V!) + wiper → GPIO19' },
        { from: 'Buzzer +/− (B)', to: 'GPIO21 / GND (active type: digitalWrite only)' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V/VIN (battery ≤ 12V only)' },
        { from: 'Sonar VCC', to: '5V (it needs the full 5V to ping)' },
        { from: 'Common GND', to: 'board GND + L298N GND + sensor GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'build-sumo-ring',
      title: 'Build the sumo ring',
      detail: 'Mini-sumo fights on a black circle ~77 cm across with a white border ~2–3 cm wide. DIY version: tape black chart paper into a ~77 cm disc on the floor and ring it with white tape — close enough for practice, and the edge eyes only care about black vs white.',
    },
    {
      id: 'assemble-sumo-chassis',
      title: 'Assemble a low sumo stance',
      detail: 'Bolt the motors, wheels and plate into a low, wide stance with the battery slung low and forward — weight wins pushing matches. Add a cardboard scoop wedge at the front to slide under the opponent.',
    },
    {
      id: 'mount-edge-eyes',
      title: 'Mount the edge eyes',
      detail: 'Fix both IR modules low (~1cm off the floor) ahead of the wheels, pointing down. Power them from 5V; OUT goes to D4 (left) and D12 (right). They read LOW over black, HIGH over the white border — white means retreat.',
      boardDetail: {
        esp32: 'Fix both IR modules low (~1cm off the floor) ahead of the wheels, pointing down. Power them from 3V3 (ESP32 pins are not 5V-tolerant); OUT goes to GPIO35 (left) and GPIO36 (right). They read LOW over black, HIGH over the white border — white means retreat.',
      },
    },
    {
      id: 'mount-front-sonar',
      title: 'Mount the front sonar',
      detail: 'Face the HC-SR04 forward at opponent height (~5–8 cm), clear of the scoop. VCC/GND → 5V/GND, TRIG → D2, ECHO → D3. It must see a cereal-box opponent at 40 cm — test with your hand before the first bout.',
      boardDetail: {
        esp32: 'Face the HC-SR04 forward at opponent height (~5–8 cm), clear of the scoop. VCC → 5V, TRIG ← GPIO32, ECHO → 1k/2k divider → GPIO34. It must see a cereal-box opponent at 40 cm — test with your hand before the first bout.',
      },
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
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() support. No extra libraries needed — sonar and IR eyes use plain digital I/O.',
      boards: ['esp32'],
    },
    {
      id: 'wire-start-button-rule',
      title: 'Wire the start button + 5 s rule',
      detail: 'Button from A0 to GND (INPUT_PULLUP). Sumo rules demand a mandatory 5 s countdown after you press start before the bot may move — sketch A waits in silence, B beeps the countdown. Starting early is a forfeit, so the delay is the rule, not a bug.',
      boardDetail: {
        esp32: 'Button from GPIO18 to GND (INPUT_PULLUP). Sumo rules demand a mandatory 5 s countdown after you press start before the bot may move — sketch A waits in silence, B beeps the countdown. Starting early is a forfeit, so the delay is the rule, not a bug.',
      },
    },
    {
      id: 'upload-seek-push',
      title: 'Upload and test seek + push',
      detail: 'Upload sketch A, press start and wait out the silent 5 s: sliding a box in front under 40 cm must trigger a full-speed ram, and pushing the bot toward the white border must trigger back-up + turn. Hold the button to stop a bout.',
    },
    {
      id: 'add-flank-strategy',
      title: 'Add flank eye + strategy + buzzer',
      detail: 'Side IR OUT → A1 (mount it on the right flank; LOW = opponent), strategy switch outer legs → 5V/GND with wiper → A2, buzzer + → D6. Upload sketch B: HIGH = aggressive chase, LOW = defensive edge-guard that sits mid-ring and pushes only under 20 cm.',
      boardDetail: {
        esp32: 'Side IR OUT → GPIO39 (mount it on the right flank; LOW = opponent), strategy switch outer legs → 3V3/GND with wiper → GPIO19, buzzer + → GPIO21. Upload sketch B: HIGH = aggressive chase, LOW = defensive edge-guard that sits mid-ring and pushes only under 20 cm.',
      },
      versions: ['b'],
    },
    {
      id: 'sumo-match-demo',
      title: 'Fight matches and demo',
      detail: 'Fight real bouts: box-opponent first, then a second bot if the class built one. Run one match per strategy (B) with the 5 s rule enforced and film both — aggressive wins fast or self-outs, defensive wins slow. Log wins by strategy for the report.',
    },
  ],
  simulator: {
    viz: 'rover',
    intro: 'Same rule as the firmware: an opponent inside the attack range rams, otherwise the bot keeps scanning.',
    sliders: [
      { id: 'oppDist', label: 'Opponent', unit: 'cm', min: 2, max: 100, value: 40 },
      { id: 'edge', label: 'Edge', unit: '%', min: 0, max: 100, value: 80 },
    ],
    threshold: { id: 'atkRange', label: 'Attack range', unit: 'cm', min: 10, max: 60, value: 30 },
    watch: 'oppDist',
    rule: 'below',
    actuator: 'Attack',
    onText: 'RAM',
    offText: 'SCAN',
    lcd: ['Opp:{oppDist}cm', 'Attack:{act}'],
    demoSlider: 'oppDist',
    demoFrom: 90,
    demoTo: 5,
    barLabel: 'Opponent',
  },
  code: [
    {
      id: 'a',
      label: 'A · Seek + push',
      note: 'BTN (A0 to GND) starts a mandatory silent 5 s countdown, then scan-spin until the sonar (TRIG D2, ECHO D3) sees under 40 cm and ram. Either edge eye (D4/D12) on white = back up + turn; hold BTN to stop.',
      board: 'uno',
      versions: ['a'],
      code: `// Mini sumo A: scan-spin until the opponent is under 40 cm, then ram.
// BTN (A0 to GND) starts a MANDATORY silent 5 s countdown (sumo rules)
// before the bot may move. Either edge eye on white = retreat + turn.
// IR eyes read LOW over black, HIGH over the white border.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3, EDGE_L = 4, EDGE_R = 12, BTN = A0;
const int PUSH_DIST = 40;  // ram when the opponent is closer than this (cm)

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;  // nothing in range
  return us / 58;
}

void waitPress() {
  while (digitalRead(BTN) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BTN) == LOW) delay(20);   // wait for release
  delay(50);
}

void retreat(bool edgeL, bool edgeR) {  // back off the white border + turn
  drive(-220, -220); delay(400);
  if (edgeL && !edgeR) { drive(200, -200); delay(350); }       // veer right
  else if (edgeR && !edgeL) { drive(-200, 200); delay(350); }  // veer left
  else { drive(220, -220); delay(600); }                       // both: spin round
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(EDGE_L, INPUT); pinMode(EDGE_R, INPUT);
  pinMode(BTN, INPUT_PULLUP);
}

void loop() {
  waitPress();
  delay(5000);  // MANDATORY countdown: silent here, B adds beeps
  while (true) {  // one bout; hold BTN to stop
    if (digitalRead(BTN) == LOW) { drive(0, 0); delay(300); return; }
    bool edgeL = digitalRead(EDGE_L) == HIGH;  // HIGH = white border
    bool edgeR = digitalRead(EDGE_R) == HIGH;
    if (edgeL || edgeR) { retreat(edgeL, edgeR); continue; }  // edges first
    if (readCm() < PUSH_DIST) drive(255, 255);  // opponent ahead: RAM
    else drive(150, -150);                      // seek: scan-spin
    delay(20);
  }
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 seek + push',
      note: 'Same logic as the Uno sketch. Sonar TRIG GPIO32, ECHO → divider → GPIO34; edge eyes GPIO35/36 (modules from 3V3); button GPIO18 to GND.',
      board: 'esp32',
      versions: ['a'],
      code: `// Mini sumo A (ESP32): scan-spin until the opponent is under 40 cm, then ram.
// BTN (GPIO18 to GND) starts a MANDATORY silent 5 s countdown (sumo rules)
// before the bot may move. Either edge eye on white = retreat + turn.
// IR eyes read LOW over black, HIGH over the white border.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34, EDGE_L = 35, EDGE_R = 36, BTN = 18;  // ECHO via divider
const int PUSH_DIST = 40;  // ram when the opponent is closer than this (cm)

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;  // nothing in range
  return us / 58;
}

void waitPress() {
  while (digitalRead(BTN) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BTN) == LOW) delay(20);   // wait for release
  delay(50);
}

void retreat(bool edgeL, bool edgeR) {  // back off the white border + turn
  drive(-220, -220); delay(400);
  if (edgeL && !edgeR) { drive(200, -200); delay(350); }       // veer right
  else if (edgeR && !edgeL) { drive(-200, 200); delay(350); }  // veer left
  else { drive(220, -220); delay(600); }                       // both: spin round
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(EDGE_L, INPUT); pinMode(EDGE_R, INPUT);
  pinMode(BTN, INPUT_PULLUP);
}

void loop() {
  waitPress();
  delay(5000);  // MANDATORY countdown: silent here, B adds beeps
  while (true) {  // one bout; hold BTN to stop
    if (digitalRead(BTN) == LOW) { drive(0, 0); delay(300); return; }
    bool edgeL = digitalRead(EDGE_L) == HIGH;  // HIGH = white border
    bool edgeR = digitalRead(EDGE_R) == HIGH;
    if (edgeL || edgeR) { retreat(edgeL, edgeR); continue; }  // edges first
    if (readCm() < PUSH_DIST) drive(255, 255);  // opponent ahead: RAM
    else drive(150, -150);                      // seek: scan-spin
    delay(20);
  }
}`,
    },
    {
      id: 'b',
      label: 'B · Flank + strategy',
      note: 'A plus right-flank IR (A1, LOW = opponent: spin into it), strategy switch (A2: HIGH = aggressive chase, LOW = sit mid-ring and push only under 20 cm) and buzzer (D6) countdown + attack beep.',
      board: 'uno',
      versions: ['b'],
      code: `// Mini sumo B: flank attack + strategy switch + buzzer countdown.
// Side IR on the right flank (LOW = opponent: spin right into it).
// Strategy switch: HIGH = aggressive chase, LOW = defensive edge-guard
// (sit in the middle, push only under 20 cm). Buzzer beeps the 5 s
// countdown plus one attack beep each time a push starts. Active buzzer:
// digitalWrite patterns only, never tone().
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3, EDGE_L = 4, EDGE_R = 12, BTN = A0;
const int IR_SIDE = A1, STRAT = A2, BUZZER = 6;
const int PUSH_DIST = 40;   // aggressive ram range (cm)
const int GUARD_DIST = 20;  // defensive push range (cm)

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;  // nothing in range
  return us / 58;
}

void waitPress() {
  while (digitalRead(BTN) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BTN) == LOW) delay(20);   // wait for release
  delay(50);
}

void retreat(bool edgeL, bool edgeR) {  // back off the white border + turn
  drive(-220, -220); delay(400);
  if (edgeL && !edgeR) { drive(200, -200); delay(350); }       // veer right
  else if (edgeR && !edgeL) { drive(-200, 200); delay(350); }  // veer left
  else { drive(220, -220); delay(600); }                       // both: spin round
}

void countdown() {  // 5 beeps + GO double-beep (active buzzer)
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER, HIGH); delay(150);
    digitalWrite(BUZZER, LOW); delay(850);
  }
  digitalWrite(BUZZER, HIGH); delay(100); digitalWrite(BUZZER, LOW); delay(100);
  digitalWrite(BUZZER, HIGH); delay(300); digitalWrite(BUZZER, LOW);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(EDGE_L, INPUT); pinMode(EDGE_R, INPUT);
  pinMode(BTN, INPUT_PULLUP);
  pinMode(IR_SIDE, INPUT); pinMode(STRAT, INPUT); pinMode(BUZZER, OUTPUT);
}

void loop() {
  waitPress();
  countdown();  // mandatory 5 s, beeped
  bool aggressive = digitalRead(STRAT) == HIGH;  // read once per bout
  bool pushing = false;
  while (true) {  // one bout; hold BTN to stop
    if (digitalRead(BTN) == LOW) { drive(0, 0); delay(300); return; }
    bool edgeL = digitalRead(EDGE_L) == HIGH;  // HIGH = white border
    bool edgeR = digitalRead(EDGE_R) == HIGH;
    if (edgeL || edgeR) { retreat(edgeL, edgeR); pushing = false; continue; }
    bool flank = digitalRead(IR_SIDE) == LOW;  // LOW = flank opponent
    long d = readCm();
    bool wantPush = aggressive ? (d < PUSH_DIST) : (d < GUARD_DIST);
    if (flank && !wantPush) { drive(200, -200); delay(250); pushing = false; continue; }  // face the flank
    if (wantPush) {
      if (!pushing) {  // attack beep, once per acquisition
        digitalWrite(BUZZER, HIGH); delay(120); digitalWrite(BUZZER, LOW);
      }
      pushing = true;
      drive(255, 255);
    } else {
      pushing = false;
      if (aggressive) drive(150, -150);  // seek: scan-spin
      else drive(0, 0);                  // guard: sit in the middle
    }
    delay(20);
  }
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 flank + strategy',
      note: 'Same logic as the Uno sketch. Flank IR on GPIO39, strategy wiper on GPIO19 (switch between 3V3/GND), buzzer on GPIO21, sonar TRIG/ECHO on GPIO32/34.',
      board: 'esp32',
      versions: ['b'],
      code: `// Mini sumo B (ESP32): flank attack + strategy switch + buzzer countdown.
// Side IR on the right flank (LOW = opponent: spin right into it).
// Strategy switch: HIGH = aggressive chase, LOW = defensive edge-guard
// (sit in the middle, push only under 20 cm). Buzzer beeps the 5 s
// countdown plus one attack beep each time a push starts. Active buzzer:
// digitalWrite patterns only, never tone().
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34, EDGE_L = 35, EDGE_R = 36, BTN = 18;  // ECHO via divider
const int IR_SIDE = 39, STRAT = 19, BUZZER = 21;
const int PUSH_DIST = 40;   // aggressive ram range (cm)
const int GUARD_DIST = 20;  // defensive push range (cm)

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;  // nothing in range
  return us / 58;
}

void waitPress() {
  while (digitalRead(BTN) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BTN) == LOW) delay(20);   // wait for release
  delay(50);
}

void retreat(bool edgeL, bool edgeR) {  // back off the white border + turn
  drive(-220, -220); delay(400);
  if (edgeL && !edgeR) { drive(200, -200); delay(350); }       // veer right
  else if (edgeR && !edgeL) { drive(-200, 200); delay(350); }  // veer left
  else { drive(220, -220); delay(600); }                       // both: spin round
}

void countdown() {  // 5 beeps + GO double-beep (active buzzer)
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER, HIGH); delay(150);
    digitalWrite(BUZZER, LOW); delay(850);
  }
  digitalWrite(BUZZER, HIGH); delay(100); digitalWrite(BUZZER, LOW); delay(100);
  digitalWrite(BUZZER, HIGH); delay(300); digitalWrite(BUZZER, LOW);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(EDGE_L, INPUT); pinMode(EDGE_R, INPUT);
  pinMode(BTN, INPUT_PULLUP);
  pinMode(IR_SIDE, INPUT); pinMode(STRAT, INPUT); pinMode(BUZZER, OUTPUT);
}

void loop() {
  waitPress();
  countdown();  // mandatory 5 s, beeped
  bool aggressive = digitalRead(STRAT) == HIGH;  // read once per bout
  bool pushing = false;
  while (true) {  // one bout; hold BTN to stop
    if (digitalRead(BTN) == LOW) { drive(0, 0); delay(300); return; }
    bool edgeL = digitalRead(EDGE_L) == HIGH;  // HIGH = white border
    bool edgeR = digitalRead(EDGE_R) == HIGH;
    if (edgeL || edgeR) { retreat(edgeL, edgeR); pushing = false; continue; }
    bool flank = digitalRead(IR_SIDE) == LOW;  // LOW = flank opponent
    long d = readCm();
    bool wantPush = aggressive ? (d < PUSH_DIST) : (d < GUARD_DIST);
    if (flank && !wantPush) { drive(200, -200); delay(250); pushing = false; continue; }  // face the flank
    if (wantPush) {
      if (!pushing) {  // attack beep, once per acquisition
        digitalWrite(BUZZER, HIGH); delay(120); digitalWrite(BUZZER, LOW);
      }
      pushing = true;
      drive(255, 255);
    } else {
      pushing = false;
      if (aggressive) drive(150, -150);  // seek: scan-spin
      else drive(0, 0);                  // guard: sit in the middle
    }
    delay(20);
  }
}`,
    },
  ],
  tips: [
    { title: 'Ring first, robot second', detail: 'Tune the edge trim-pots on the real taped ring — tape-white and paper-white trip at different thresholds.' },
    { title: 'Respect the 5 s', detail: 'Real rules forfeit early starters, so test every change through the full countdown, not by resetting mid-ring.' },
    { title: 'Weight wins pushes', detail: 'Battery low and forward keeps the scoop down — a tail-heavy bot wheelies and gets slid sideways out of the ring.' },
    { title: 'Sunlight blinds IR', detail: 'Edge and flank eyes false-trigger in direct sun — fight in shade or re-tune the trim-pots under match lighting.' },
  ],
}
