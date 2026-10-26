import type { Project } from '../types'

export const lineFollowerRobot: Project = {
  slug: 'line-follower-robot',
  categoryId: 'robotics',
  title: 'Line Follower Robot',
  tagline: 'Two IR eyes steer a 2WD chassis along a black line.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,600–2,800',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Classic build: 6 L298N motor pins plus 2 digital IR sensors.' },
    esp32: { ok: true, note: 'IR outputs go to input-only GPIO34/35; motor speed uses analogWrite().' },
    nodemcu: {
      ok: false,
      reason: 'The 6-wire L298N plus sensors lands on boot-strapping pins D3/D4/D8, so the robot can fail to boot or twitch the motors at reset.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only ~4 free GPIO; the 6-wire L298N drive alone needs more than that.',
    },
  },
  skills: ['Motor driving', 'IR sensing', 'Bang-bang control', 'Track tuning'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'l298n'],
  rig: { sensor: 'chassis', extras: ['l298n', 'ir'] },
  featured: true,
  options: [
    {
      id: 'a',
      title: 'A. Bang-bang follower',
      level: 'Basic · easiest',
      blurb: 'Two digital IR sensors steer a 2WD chassis: centered goes straight, off-center spins back.',
      points: ['2x IR digital sensing', 'L298N tank steering', 'Tape-track racing'],
      weeks: '1 week',
      cost: '৳1,600–2,200',
    },
    {
      id: 'b',
      title: 'B. Smooth + speed dial',
      level: 'Basic · best value',
      blurb: 'Adds a speed potentiometer, start button, calibration check and smooth PWM curve slowdown.',
      points: ['Speed dial + start button', 'Line-check calibration', 'Smooth curve slowdown'],
      weeks: '1–2 weeks',
      cost: '৳1,800–2,800',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'TCRT5000 IR line sensor', qty: '2', role: 'Line eyes', price: '৳60–160' },
    { name: '10k potentiometer + knob', qty: '1', role: 'Speed dial', price: '৳30–80', versions: ['b'] },
    { name: 'Push button', qty: '1', role: 'Start/calibrate (INPUT_PULLUP)', price: '৳10–30', versions: ['b'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Jumpers + black tape', qty: '1 set', role: 'Wiring + track', price: '৳100–250' },
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
        { from: 'Left IR → VCC / GND / OUT', to: '5V / GND / D2' },
        { from: 'Right IR → VCC / GND / OUT', to: '5V / GND / D3' },
        { from: 'Pot ends + wiper (B)', to: '5V / GND / A0' },
        { from: 'Button (B)', to: 'D4 to GND (INPUT_PULLUP)' },
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
        { from: 'Left IR → 3V3 / GND / OUT', to: 'GPIO34 (power the module from 3V3, not 5V)' },
        { from: 'Right IR → 3V3 / GND / OUT', to: 'GPIO35 (power the module from 3V3, not 5V)' },
        { from: 'Pot ends + wiper (B)', to: '3V3 / GND / GPIO36' },
        { from: 'Button (B)', to: 'GPIO16 to GND (INPUT_PULLUP)' },
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
      detail: 'Bolt the motors, wheels, caster and top plate together. Leave the front 5cm of the plate free for the two IR sensors.',
    },
    {
      id: 'mount-line-sensors',
      title: 'Mount the IR sensors',
      detail: 'Fix both sensors under the front edge, ~1cm above the floor and 2–3cm apart. Power them from 5V; OUT goes to D2 (left) and D3 (right).',
      boardDetail: {
        esp32: 'Fix both sensors under the front edge, ~1cm above the floor and 2–3cm apart. Power them from 3V3 (ESP32 pins are not 5V-tolerant); OUT goes to GPIO34 (left) and GPIO35 (right).',
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
      detail: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() support. No extra libraries needed.',
      boards: ['esp32'],
    },
    {
      id: 'power-electronics',
      title: 'Power motors and board',
      detail: 'Battery into the L298N motor supply; L298N 5V (jumper on) feeds the board. Tie all GNDs together or the motors will stutter.',
    },
    {
      id: 'upload-follower',
      title: 'Upload and bench-test',
      detail: 'Upload sketch A, lift the wheels off the table and wave white paper under each sensor: the wheel on the sensing side should spin back toward the line.',
    },
    {
      id: 'build-track',
      title: 'Lay a test track',
      detail: 'Black tape (~2cm wide) on white poster paper: start with gentle curves, then add a sharp S-bend once it laps cleanly.',
    },
    {
      id: 'tune-ir-threshold',
      title: 'Tune the sensor trim-pots',
      detail: 'Turn each module’s trim-pot until its LED lights only over black. Re-tune under demo-day lighting — sunlight shifts the threshold.',
    },
    {
      id: 'add-speed-controls',
      title: 'Add the speed dial + button',
      detail: 'Wire the pot wiper to A0 (ends to 5V/GND) and the button from D4 to GND. Press once to calibrate (a slow spin checks both eyes see the line), press again to race.',
      boardDetail: {
        esp32: 'Wire the pot wiper to GPIO36 (ends to 3V3/GND) and the button from GPIO16 to GND. Press once to calibrate (a slow spin checks both eyes see the line), press again to race.',
      },
      versions: ['b'],
    },
    {
      id: 'race-demo',
      title: 'Race the demo',
      detail: 'Film a timed lap: full speed (A) or one lap per speed setting (B). Log lap times vs speed — an easy chart for the report.',
    },
  ],
  simulator: {
    viz: 'line',
    intro: 'Same rule as the firmware: line error left of center steers LEFT, right of center steers RIGHT.',
    sliders: [
      { id: 'lineError', label: 'Line error', unit: '', min: -50, max: 50, value: 0 },
      { id: 'speed', label: 'Speed', unit: '%', min: 0, max: 100, value: 70 },
    ],
    threshold: { id: 'thr', label: 'Center', unit: '', min: -20, max: 20, value: 0 },
    watch: 'lineError',
    rule: 'below',
    actuator: 'Steering',
    onText: 'LEFT',
    offText: 'RIGHT',
    lcd: ['Err:{lineError} Spd:{speed}', 'Steer:{act}'],
    demoSlider: 'lineError',
    demoFrom: -45,
    demoTo: 45,
    barLabel: 'Line error',
  },
  code: [
    {
      id: 'a',
      label: 'A · Bang-bang follower',
      note: 'Two digital IR eyes: centered goes straight, off-center spins back. Motors D5/D7/D8 + D9/D10/D11, IR on D2/D3.',
      board: 'uno',
      versions: ['a'],
      code: `// Line follower A: bang-bang steering on two digital IR sensors.
// Each module outputs LOW over the black line, HIGH over white.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int IR_L = 2, IR_R = 3;
const int SPEED = 180;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
}

void loop() {
  bool onL = digitalRead(IR_L) == LOW;  // true = eye sees the line
  bool onR = digitalRead(IR_R) == LOW;
  if (onL && onR) drive(SPEED, SPEED);      // centered: straight
  else if (onL) drive(-SPEED, SPEED);       // line on the left: spin left
  else if (onR) drive(SPEED, -SPEED);       // line on the right: spin right
  else drive(0, 0);                         // lost the line: stop
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 bang-bang follower',
      note: 'Same logic as the Uno sketch. Motors GPIO25/26/27 + GPIO14/13/23 via analogWrite(), IR on GPIO34/35 (modules powered from 3V3).',
      board: 'esp32',
      versions: ['a'],
      code: `// Line follower A (ESP32): bang-bang steering on two digital IR sensors.
// IR modules are powered from 3V3 so OUT is safe for GPIO34/35.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int IR_L = 34, IR_R = 35;
const int SPEED = 180;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
}

void loop() {
  bool onL = digitalRead(IR_L) == LOW;  // true = eye sees the line
  bool onR = digitalRead(IR_R) == LOW;
  if (onL && onR) drive(SPEED, SPEED);      // centered: straight
  else if (onL) drive(-SPEED, SPEED);       // line on the left: spin left
  else if (onR) drive(SPEED, -SPEED);       // line on the right: spin right
  else drive(0, 0);                         // lost the line: stop
}`,
    },
    {
      id: 'b',
      label: 'B · Smooth + speed dial',
      note: 'Speed pot on A0, start button on D4 (INPUT_PULLUP), calibration spin checks both eyes, slew-limited PWM eases through curves.',
      board: 'uno',
      versions: ['b'],
      code: `// Line follower B: speed dial, start button, calibration check, smooth curves.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int IR_L = 2, IR_R = 3;
const int POT = A0, BTN = 4;  // button wired D4 to GND

int curL = 0, curR = 0;  // slewed outputs

void writeMotors(int l, int r) {
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void smoothDrive(int l, int r) {  // slew toward targets: no jerky spins
  curL += constrain(l - curL, -8, 8);
  curR += constrain(r - curR, -8, 8);
  writeMotors(curL, curR);
}

void waitPress() {
  while (digitalRead(BTN) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BTN) == LOW) delay(20);   // wait for release
  delay(50);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
  pinMode(BTN, INPUT_PULLUP);
  waitPress();  // press to calibrate
  bool seenL = false, seenR = false;  // slow spin: both eyes must see black
  unsigned long t0 = millis();
  while (millis() - t0 < 3000) {
    writeMotors(120, -120);
    seenL |= digitalRead(IR_L) == LOW;
    seenR |= digitalRead(IR_R) == LOW;
  }
  writeMotors(0, 0);
  if (!seenL || !seenR)  // warning twitch: a sensor never saw the line
    for (int i = 0; i < 3; i++) { writeMotors(150, 150); delay(120); writeMotors(0, 0); delay(150); }
  waitPress();  // press again to race
}

void loop() {
  int base = map(analogRead(POT), 0, 1023, 120, 255);  // speed dial
  bool onL = digitalRead(IR_L) == LOW;
  bool onR = digitalRead(IR_R) == LOW;
  if (onL && onR) smoothDrive(base, base);
  else if (onL) smoothDrive(base * 3 / 10, base);  // ease left
  else if (onR) smoothDrive(base, base * 3 / 10);  // ease right
  else smoothDrive(0, 0);                          // lost: glide to a stop
  delay(10);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 smooth + speed dial',
      note: 'Same logic as the Uno sketch. Pot wiper on GPIO36 (ADC1, ends to 3V3/GND), button GPIO16 to GND, 12-bit ADC map.',
      board: 'esp32',
      versions: ['b'],
      code: `// Line follower B (ESP32): speed dial, start button, calibration, smooth curves.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int IR_L = 34, IR_R = 35;
const int POT = 36, BTN = 16;  // button wired GPIO16 to GND

int curL = 0, curR = 0;  // slewed outputs

void writeMotors(int l, int r) {
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void smoothDrive(int l, int r) {  // slew toward targets: no jerky spins
  curL += constrain(l - curL, -8, 8);
  curR += constrain(r - curR, -8, 8);
  writeMotors(curL, curR);
}

void waitPress() {
  while (digitalRead(BTN) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BTN) == LOW) delay(20);   // wait for release
  delay(50);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
  pinMode(BTN, INPUT_PULLUP);
  waitPress();  // press to calibrate
  bool seenL = false, seenR = false;  // slow spin: both eyes must see black
  unsigned long t0 = millis();
  while (millis() - t0 < 3000) {
    writeMotors(120, -120);
    seenL |= digitalRead(IR_L) == LOW;
    seenR |= digitalRead(IR_R) == LOW;
  }
  writeMotors(0, 0);
  if (!seenL || !seenR)  // warning twitch: a sensor never saw the line
    for (int i = 0; i < 3; i++) { writeMotors(150, 150); delay(120); writeMotors(0, 0); delay(150); }
  waitPress();  // press again to race
}

void loop() {
  int base = map(analogRead(POT), 0, 4095, 120, 255);  // speed dial, 12-bit ADC
  bool onL = digitalRead(IR_L) == LOW;
  bool onR = digitalRead(IR_R) == LOW;
  if (onL && onR) smoothDrive(base, base);
  else if (onL) smoothDrive(base * 3 / 10, base);  // ease left
  else if (onR) smoothDrive(base, base * 3 / 10);  // ease right
  else smoothDrive(0, 0);                          // lost: glide to a stop
  delay(10);
}`,
    },
  ],
  tips: [
    { title: 'Ride low', detail: 'IR modules read best ~1cm off the floor — higher and ambient light drowns the reflection.' },
    { title: 'Tune on the track', detail: 'Set the trim-pots on the actual track surface; a different floor color shifts the threshold.' },
    { title: 'Slow down for S-bends', detail: 'If it overshoots sharp corners, lower SPEED (A) or the dial (B) before changing the track.' },
    { title: 'Fresh cells matter', detail: 'Sagging batteries slow one motor first, so a tuned robot starts missing the same corner — recharge and re-test.' },
  ],
}
