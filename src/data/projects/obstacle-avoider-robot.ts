import type { Project } from '../types'

export const obstacleAvoiderRobot: Project = {
  slug: 'obstacle-avoider-robot',
  categoryId: 'robotics',
  title: 'Obstacle Avoider Robot',
  tagline: 'An ultrasonic bumper that stops, looks and turns away.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,700–3,000',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Classic build: HC-SR04 on D2/D3 plus the 6-pin L298N drive.' },
    esp32: { ok: true, note: 'Sonar ECHO needs a 1k/2k divider; the servo runs on ESP32Servo.' },
    nodemcu: {
      ok: false,
      reason: 'Six motor pins plus sonar, servo and buzzer land on boot-strapping pins D3/D4/D8, so the robot can fail to boot or twitch at reset — build on Uno or ESP32.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only ~4 free GPIO; the 6-wire L298N drive plus sonar and servo need 10.',
    },
  },
  skills: ['Ultrasonic ranging', 'Motor driving', 'Servo scanning', 'Reactive control'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'hcsr04', 'l298n', 'sg90'],
  rig: { sensor: 'chassis', extras: ['sonic', 'servo'] },
  options: [
    {
      id: 'a',
      title: 'A. Stop-and-turn',
      level: 'Basic · easiest',
      blurb: 'Fixed front sonar: drive until something is closer than 30cm, stop and turn right until clear.',
      points: ['Fixed HC-SR04 bumper', '30cm stop rule', 'Turn-right escape'],
      weeks: '1 week',
      cost: '৳1,700–2,300',
    },
    {
      id: 'b',
      title: 'B. Scanning head',
      level: 'Basic · best value',
      blurb: 'Sonar rides an SG90 neck that looks left/right and picks the clearer side, with a reverse beep.',
      points: ['SG90 scanning head', 'Pick-the-clear-side logic', 'Reverse buzzer beep'],
      weeks: '1–2 weeks',
      cost: '৳2,000–3,000',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'HC-SR04 ultrasonic', qty: '1', role: 'Front bumper', price: '৳120–280' },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'ECHO 5V → 3.3V divider', price: '৳10–30', boards: ['esp32'] },
    { name: 'SG90 servo', qty: '1', role: 'Scanning neck', price: '৳180–300', versions: ['b'] },
    { name: 'Active buzzer', qty: '1', role: 'Reverse beep', price: '৳25–60', versions: ['b'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Jumpers + cardboard boxes', qty: '1 set', role: 'Wiring + maze walls', price: '৳100–250' },
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
        { from: 'HC-SR04 → VCC / GND / TRIG / ECHO', to: '5V / GND / D2 / D3' },
        { from: 'SG90 signal (B)', to: 'D4 (servo 5V from supply, not the board)' },
        { from: 'Buzzer + (B)', to: 'D12 (buzzer − to GND)' },
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
        { from: 'HC-SR04 → VCC / GND / TRIG / ECHO', to: '5V / GND / GPIO32 / GPIO34 via 1k/2k divider' },
        { from: 'SG90 signal (B)', to: 'GPIO16 via ESP32Servo (servo 5V from supply)' },
        { from: 'Buzzer + (B)', to: 'GPIO17 (buzzer − to GND)' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V/VIN (battery ≤ 12V only)' },
        { from: 'Servo 5V (B)', to: 'supply 5V — a stalling servo resets the board' },
        { from: 'Common GND', to: 'board GND + L298N GND + sensor GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'assemble-chassis',
      title: 'Assemble the 2WD chassis',
      detail: 'Bolt the motors, wheels, caster and top plate together. Keep the front edge clear for the sonar.',
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
      id: 'mount-wire-sonar',
      title: 'Mount and wire the sonar',
      detail: 'Fix the HC-SR04 at the front, ~10cm off the floor. VCC/GND to 5V/GND, TRIG → D2, ECHO → D3 (direct on Uno).',
      boardDetail: {
        esp32: 'Fix the HC-SR04 at the front, ~10cm off the floor. VCC to 5V, TRIG → GPIO32, ECHO → GPIO34 through a 1k/2k divider (5V echo kills ESP pins).',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x). Libraries: ESP32Servo for version B.',
      boards: ['esp32'],
    },
    {
      id: 'power-electronics',
      title: 'Power motors and board',
      detail: 'Battery into the L298N motor supply; L298N 5V (jumper on) feeds the board. Tie all GNDs together or the motors will stutter.',
    },
    {
      id: 'upload-avoider',
      title: 'Upload and hand-test',
      detail: 'Upload sketch A and hold your hand in front of the sonar: under 30cm it must stop, then turn right until the path clears.',
    },
    {
      id: 'tune-stop-distance',
      title: 'Tune the stop distance',
      detail: 'STOP_CM 30 suits smooth floors; drop to 20 for cluttered rooms. Re-test at full battery — a fast robot needs more braking room.',
    },
    {
      id: 'add-scan-head',
      title: 'Add the scanning head + buzzer',
      detail: 'Mount the sonar on the SG90 horn (signal → D4) and wire the buzzer + to D12. On block it reverses with beeps, scans both sides and turns toward the clearer one.',
      boardDetail: {
        esp32: 'Mount the sonar on the SG90 horn (signal → GPIO16, ESP32Servo) and wire the buzzer + to GPIO17. On block it reverses with beeps, scans both sides and turns toward the clearer one.',
      },
      versions: ['b'],
    },
    {
      id: 'maze-demo',
      title: 'Run the box maze',
      detail: 'Corral cardboard boxes into a lane. Film version A escaping every dead end, then B picking the wider gap — count touches per run for the report.',
    },
  ],
  simulator: {
    viz: 'rover',
    intro: 'Same rule as the firmware: clearance under the stop distance turns the robot, otherwise it drives forward.',
    sliders: [
      { id: 'distance', label: 'Distance', unit: 'cm', min: 2, max: 200, value: 60 },
      { id: 'speed', label: 'Speed', unit: '%', min: 0, max: 100, value: 70 },
    ],
    threshold: { id: 'thr', label: 'Stop under', unit: 'cm', min: 10, max: 80, value: 30 },
    watch: 'distance',
    rule: 'below',
    band: 10,
    actuator: 'Drive',
    onText: 'TURN',
    offText: 'FWD',
    lcd: ['Dist:{distance}cm', 'Drive:{act}'],
    demoSlider: 'distance',
    demoFrom: 120,
    demoTo: 10,
    barLabel: 'Clearance',
  },
  code: [
    {
      id: 'a',
      label: 'A · Stop-and-turn',
      note: 'Fixed front sonar: stop under 30cm, turn right until the path clears. Motors D5/D7/D8 + D9/D10/D11, TRIG/ECHO on D2/D3.',
      board: 'uno',
      versions: ['a'],
      code: `// Obstacle avoider A: fixed HC-SR04, stop and turn right until clear.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3;
const int SPEED = 180, STOP_CM = 30;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long distCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
}

void loop() {
  if (distCm() >= STOP_CM) { drive(SPEED, SPEED); delay(50); return; }
  drive(0, 0); delay(200);
  int tries = 0;
  while (distCm() < STOP_CM + 5 && tries++ < 40) { drive(SPEED, -SPEED); delay(100); }  // turn right until clear
  drive(0, 0);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 stop-and-turn',
      note: 'Same logic as the Uno sketch. Motors GPIO25/26/27 + GPIO14/13/23 via analogWrite(), TRIG GPIO32, ECHO GPIO34 via 1k/2k divider.',
      board: 'esp32',
      versions: ['a'],
      code: `// Obstacle avoider A (ESP32): fixed HC-SR04, stop and turn right until clear.
// ECHO comes through a 1k/2k divider: GPIO34 must never see 5V.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34;
const int SPEED = 180, STOP_CM = 30;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long distCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
}

void loop() {
  if (distCm() >= STOP_CM) { drive(SPEED, SPEED); delay(50); return; }
  drive(0, 0); delay(200);
  int tries = 0;
  while (distCm() < STOP_CM + 5 && tries++ < 40) { drive(SPEED, -SPEED); delay(100); }  // turn right until clear
  drive(0, 0);
}`,
    },
    {
      id: 'b',
      label: 'B · Scanning head',
      note: 'Sonar on an SG90 neck (D4) looks left/right and picks the clearer side; reverses with buzzer beeps (D12) before turning.',
      board: 'uno',
      versions: ['b'],
      code: `#include <Servo.h>
Servo head;
// Obstacle avoider B: scan both sides, head for the clearer one.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3;
const int SERVO_PIN = 4, BUZZER = 12;
const int SPEED = 180, STOP_CM = 30;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long distCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;
}

void turnUntilClear(bool goLeft) {
  int tries = 0;
  while (distCm() < STOP_CM + 5 && tries++ < 30) {
    if (goLeft) drive(-SPEED, SPEED); else drive(SPEED, -SPEED);
    delay(100);
  }
  drive(0, 0);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  head.attach(SERVO_PIN); head.write(90); delay(500);
}

void loop() {
  head.write(90); delay(150);
  if (distCm() >= STOP_CM) { drive(SPEED, SPEED); delay(50); return; }
  drive(0, 0);
  for (int i = 0; i < 4; i++) {  // reverse with beeps
    drive(-150, -150);
    digitalWrite(BUZZER, HIGH); delay(100);
    digitalWrite(BUZZER, LOW); delay(100);
  }
  drive(0, 0);
  head.write(30); delay(450);
  long rightD = distCm();
  head.write(150); delay(550);
  long leftD = distCm();
  head.write(90);
  turnUntilClear(leftD >= rightD);  // head for the clearer side
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 scanning head',
      note: 'Same logic as the Uno sketch. Sonar on an ESP32Servo neck (GPIO16), buzzer GPIO17, TRIG GPIO32, ECHO GPIO34 via divider.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <ESP32Servo.h>
Servo head;
// Obstacle avoider B (ESP32): scan both sides, head for the clearer one.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34;  // ECHO via 1k/2k divider
const int SERVO_PIN = 16, BUZZER = 17;
const int SPEED = 180, STOP_CM = 30;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long distCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;
}

void turnUntilClear(bool goLeft) {
  int tries = 0;
  while (distCm() < STOP_CM + 5 && tries++ < 30) {
    if (goLeft) drive(-SPEED, SPEED); else drive(SPEED, -SPEED);
    delay(100);
  }
  drive(0, 0);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  head.attach(SERVO_PIN); head.write(90); delay(500);
}

void loop() {
  head.write(90); delay(150);
  if (distCm() >= STOP_CM) { drive(SPEED, SPEED); delay(50); return; }
  drive(0, 0);
  for (int i = 0; i < 4; i++) {  // reverse with beeps
    drive(-150, -150);
    digitalWrite(BUZZER, HIGH); delay(100);
    digitalWrite(BUZZER, LOW); delay(100);
  }
  drive(0, 0);
  head.write(30); delay(450);
  long rightD = distCm();
  head.write(150); delay(550);
  long leftD = distCm();
  head.write(90);
  turnUntilClear(leftD >= rightD);  // head for the clearer side
}`,
    },
  ],
  tips: [
    { title: 'Mount high enough', detail: 'Sonar below ~8cm sees the floor as a wall — mount it at 10cm and tilt slightly up.' },
    { title: 'Divide the ECHO', detail: 'HC-SR04 ECHO is a 5V pulse — on the ESP32 a 1k/2k divider is mandatory, not optional.' },
    { title: 'Servo eats current', detail: 'Power the SG90 from the supply, not the board: a scanning servo browns out USB power and reboots mid-turn.' },
    { title: 'Soft walls vanish', detail: 'Curtains and cushions absorb ultrasound — test against hard boxes, and note the blind spot in the report.' },
  ],
}
