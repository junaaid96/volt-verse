import type { Project } from '../types'

export const pickAndPlaceRover: Project = {
  slug: 'pick-and-place-rover',
  categoryId: 'robotics',
  title: 'Pick-and-Place Rover',
  tagline: 'A line-guided rover with a 2-servo arm that picks, carries and places.',
  difficulty: 'Advanced',
  weeks: '3–4 weeks',
  cost: '৳2,800–5,000',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Line eyes on D2/D3, lift + grip servos on D4/D12 via Servo.h, start button on A0.' },
    esp32: { ok: true, note: 'Line eyes on GPIO34/35, servos on GPIO16/17 via ESP32Servo, motor speed via analogWrite().' },
    nodemcu: {
      ok: false,
      reason: 'A alone needs 11 GPIO (6 motor + 2 IR + 2 servo + button) against ~9 usable, and D3/D4/D8 are boot-strapping pins that would twitch the arm and motors at reset.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only ~4 free GPIO; the drive plus arm, eyes, button and buzzer need 11+.',
    },
  },
  skills: ['Line following', 'Servo arms', 'Sensor triggering', 'Pick sequencing'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'hcsr04', 'l298n', 'sg90', 'esp32servo'],
  rig: { sensor: 'chassis', extras: ['arm', 'sonic'] },
  options: [
    {
      id: 'a',
      title: 'A. Button-start pick run',
      level: 'Advanced · core build',
      blurb: 'Follows a line to its end, then a scripted lower → grip → lift → reverse pick with a done-beep.',
      points: ['Line-end detection (both white 500 ms)', '2-servo lift + grip arm', 'Scripted pick + reverse + beep'],
      weeks: '2–3 weeks',
      cost: '৳2,800–4,200',
    },
    {
      id: 'b',
      title: 'B. Auto-grip + place cycle',
      level: 'Advanced · full build',
      blurb: 'Sonar closes the grip under 10 cm, then a place cycle drives to the zone line, lowers, opens and backs away.',
      points: ['HC-SR04 auto-grip under 10 cm', 'Zone place cycle + status LED', 'Beeps confirm pick and place'],
      weeks: '3–4 weeks',
      cost: '৳3,200–5,000',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'TCRT5000 IR line sensor', qty: '2', role: 'Line eyes', price: '৳60–160' },
    { name: 'SG90 servo', qty: '2', role: 'Lift + grip arm', price: '৳140–300' },
    { name: 'Push button', qty: '1', role: 'Start run (INPUT_PULLUP)', price: '৳10–30' },
    { name: 'Active buzzer 5V', qty: '1', role: 'Done beeps (digitalWrite only, never tone())', price: '৳25–60' },
    { name: 'HC-SR04 ultrasonic sensor', qty: '1', role: 'Auto-grip trigger', price: '৳120–250', versions: ['b'] },
    { name: 'LED + 220Ω resistor', qty: '1', role: 'Run status light', price: '৳15–40', versions: ['b'] },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'Sonar ECHO divider', price: '৳10–30', versions: ['b'], boards: ['esp32'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Drive + board power', price: '৳300–600' },
    { name: '4×AA holder + cells', qty: '1 set', role: 'Separate servo 5V supply (common GND)', price: '৳150–300' },
    { name: 'Jumpers + black tape', qty: '1 set', role: 'Wiring + line course', price: '৳100–250' },
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
        { from: 'LIFT servo signal (power from servo pack)', to: 'D4' },
        { from: 'GRIP servo signal (power from servo pack)', to: 'D12' },
        { from: 'Button', to: 'A0 to GND (INPUT_PULLUP)' },
        { from: 'Buzzer +/−', to: 'D13 / GND (active type: digitalWrite only)' },
        { from: 'HC-SR04 VCC / GND / TRIG / ECHO (B)', to: '5V / GND / A1 / A2' },
        { from: 'Status LED + 220Ω (B)', to: 'D6 (LED − to GND)' },
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
        { from: 'Left IR → 3V3 / GND / OUT', to: 'GPIO34 (module from 3V3, not 5V)' },
        { from: 'Right IR → 3V3 / GND / OUT', to: 'GPIO35 (module from 3V3, not 5V)' },
        { from: 'LIFT servo signal (power from servo pack)', to: 'GPIO16' },
        { from: 'GRIP servo signal (power from servo pack)', to: 'GPIO17' },
        { from: 'Button', to: 'GPIO18 to GND (INPUT_PULLUP)' },
        { from: 'Buzzer +/−', to: 'GPIO19 / GND (active type: digitalWrite only)' },
        { from: 'HC-SR04 VCC / TRIG (B)', to: '5V / GPIO32' },
        { from: 'HC-SR04 ECHO → 1k/2k divider → (B)', to: 'GPIO36 (5V echo would kill the pin)' },
        { from: 'Status LED + 220Ω (B)', to: 'GPIO21 (LED − to GND)' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V/VIN (battery ≤ 12V only)' },
        { from: 'Servo pack +/−', to: 'servo 5V / GND — NEVER the board 5V pin (stall current resets the board)' },
        { from: 'Common GND', to: 'board GND + L298N GND + servo pack GND + sensor GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'assemble-rover-chassis',
      title: 'Assemble the rover chassis',
      detail: 'Bolt the motors, wheels, caster and top plate together. Leave the front half of the plate free — the arm mounts ahead of the line eyes so the gripper reaches past them.',
    },
    {
      id: 'mount-guide-sensors',
      title: 'Mount the line eyes',
      detail: 'Fix both IR sensors under the front edge, ~1cm above the floor and 2–3cm apart. Power them from 5V; OUT goes to D2 (left) and D3 (right). They read LOW over black, HIGH over white.',
      boardDetail: {
        esp32: 'Fix both IR sensors under the front edge, ~1cm above the floor and 2–3cm apart. Power them from 3V3 (ESP32 pins are not 5V-tolerant); OUT goes to GPIO34 (left) and GPIO35 (right). They read LOW over black, HIGH over white.',
      },
    },
    {
      id: 'build-lift-grip-arm',
      title: 'Build the lift + grip arm',
      detail: 'Build a 2-servo arm from a bracket kit or stiff card: one SG90 swings the lift boom, the second drives the gripper claws. Fix the servo horns near mid-travel so LIFT_UP/LIFT_DOWN and GRIP_OPEN/GRIP_SHUT in the sketch have room both ways, then fine-tune the angles.',
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
      id: 'wire-arm-button-buzzer',
      title: 'Wire the arm, button and buzzer',
      detail: 'LIFT signal → D4, GRIP signal → D12 (servo power comes from the separate pack, not the board). Button from A0 to GND; buzzer + to D13 (− to GND).',
      boardDetail: {
        esp32: 'LIFT signal → GPIO16, GRIP signal → GPIO17 (servo power comes from the separate pack, not the board). Button from GPIO18 to GND; buzzer + to GPIO19 (− to GND).',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() support, plus the ESP32Servo library (Library Manager → “ESP32Servo”). Servo signals stay on GPIO16/17 — never on input-only pins 34–39.',
      boards: ['esp32'],
    },
    {
      id: 'servo-power-wiring',
      title: 'Wire the separate servo supply',
      detail: 'Servo red/brown leads go to the 4×AA pack +/−, orange leads to the signal pins — never servo power from the board 5V pin, or the first lift stalls the servos and resets the board mid-pick. Tie the pack GND to the board GND or the servos will jitter.',
    },
    {
      id: 'upload-pick-run',
      title: 'Upload and run a pick',
      detail: 'Upload sketch A and press the button: the rover follows the line to its end (both eyes white for 500 ms), stops, lowers, closes, lifts, reverses 1 s and triple-beeps. Tune LIFT_/GRIP_ angles until the cube seats cleanly in the claws.',
    },
    {
      id: 'add-sonar-led',
      title: 'Add the sonar + status LED',
      detail: 'HC-SR04 VCC/GND/TRIG/ECHO → 5V/GND/A1/A2, LED (+220Ω) → D6. Upload sketch B: the grip now closes when the object is under 10 cm, the LED stays lit while running, and beeps confirm the pick and the place.',
      boardDetail: {
        esp32: 'HC-SR04 VCC→5V, TRIG→GPIO32, ECHO → 1k/2k divider → GPIO36; LED (+220Ω) → GPIO21. Upload sketch B: the grip now closes when the object is under 10 cm, the LED stays lit while running, and beeps confirm the pick and the place.',
      },
      versions: ['b'],
    },
    {
      id: 'zone-course-demo',
      title: 'Lay the zone course and demo',
      detail: 'Lay a line with the pick object mid-course and mark 3 drop zones (Z1/Z2/Z3 boxes) past it: each run picks once and places at the zone line, so run once per zone. Film all three runs — pick time vs place accuracy makes an easy report chart.',
    },
  ],
  simulator: {
    viz: 'grip',
    intro: 'Same rule as the firmware: an object closer than the grip range closes the gripper, otherwise it stays open.',
    sliders: [
      { id: 'objDist', label: 'Object', unit: 'cm', min: 2, max: 60, value: 25 },
      { id: 'lift', label: 'Lift', unit: '%', min: 0, max: 100, value: 50 },
    ],
    threshold: { id: 'gripRange', label: 'Grip range', unit: 'cm', min: 5, max: 30, value: 10 },
    watch: 'objDist',
    rule: 'below',
    actuator: 'Grip',
    onText: 'CLOSE',
    offText: 'OPEN',
    lcd: ['Obj:{objDist}cm', 'Grip:{act}'],
    demoSlider: 'objDist',
    demoFrom: 50,
    demoTo: 4,
    barLabel: 'Object',
  },
  code: [
    {
      id: 'a',
      label: 'A · Button-start pick run',
      note: 'Button (A0 to GND) starts the run: line-follow on D2/D3 to the line end (both white 500 ms), scripted lower → grip → lift on D4/D12, reverse 1 s, triple beep on D13. Servo.h leaves PWM on D5/D11 free.',
      board: 'uno',
      versions: ['a'],
      code: `// Pick-and-place rover A: follow the line to its end, then a scripted
// lower -> grip -> lift -> reverse. Press the button (A0 to GND) to run.
// IR modules read LOW over black, HIGH over white; line end = both white
// for 500 ms. POWER: servos on a separate 5V supply with common GND.
// Buzzer is ACTIVE type: beeps are digitalWrite patterns, never tone().
#include <Servo.h>

const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int IR_L = 2, IR_R = 3;
const int LIFT_PIN = 4, GRIP_PIN = 12, BUTTON = A0, BUZZER = 13;

Servo lift, grip;
// Measure your arm and edit these angles.
const int LIFT_UP = 100, LIFT_DOWN = 30;
const int GRIP_OPEN = 100, GRIP_SHUT = 40;
const int SPEED = 170;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void beep(int n) {  // active buzzer: HIGH sings, LOW is silent
  for (int i = 0; i < n; i++) {
    digitalWrite(BUZZER, HIGH); delay(150);
    digitalWrite(BUZZER, LOW); delay(150);
  }
}

void waitPress() {
  while (digitalRead(BUTTON) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BUTTON) == LOW) delay(20);   // wait for release
  delay(50);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
  pinMode(BUTTON, INPUT_PULLUP); pinMode(BUZZER, OUTPUT);
  lift.attach(LIFT_PIN); grip.attach(GRIP_PIN);
  lift.write(LIFT_UP); grip.write(GRIP_OPEN);
}

void loop() {
  waitPress();  // press to start the run
  // 1. follow the line until it ends (both white for 500 ms)
  unsigned long whiteSince = 0;
  while (true) {
    bool onL = digitalRead(IR_L) == LOW;  // true = eye sees the line
    bool onR = digitalRead(IR_R) == LOW;
    if (onL && onR) { drive(SPEED, SPEED); whiteSince = 0; }
    else if (onL) { drive(100, SPEED); whiteSince = 0; }  // veer left
    else if (onR) { drive(SPEED, 100); whiteSince = 0; }  // veer right
    else {
      drive(120, 120);  // creep: may be just a gap in the tape
      if (whiteSince == 0) whiteSince = millis();
      if (millis() - whiteSince > 500) break;  // line end
    }
    delay(20);
  }
  drive(0, 0);
  // 2. scripted pick
  lift.write(LIFT_DOWN); delay(700);
  grip.write(GRIP_SHUT); delay(700);
  lift.write(LIFT_UP); delay(700);
  // 3. back away with the load
  drive(-SPEED, -SPEED); delay(1000);
  drive(0, 0);
  beep(3);  // done
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 button-start pick run',
      note: 'Same logic as the Uno sketch. Line eyes on GPIO34/35 (modules from 3V3), servos on GPIO16/17 via ESP32Servo, button GPIO18 to GND, buzzer GPIO19.',
      board: 'esp32',
      versions: ['a'],
      code: `// Pick-and-place rover A (ESP32): line end -> scripted pick -> reverse.
// Press the button (GPIO18 to GND) to run. IR modules read LOW over black,
// HIGH over white; line end = both white for 500 ms. POWER: servos on a
// separate 5V supply with common GND. Buzzer is ACTIVE type: digitalWrite
// patterns only, never tone().
#include <ESP32Servo.h>

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int IR_L = 34, IR_R = 35;
const int LIFT_PIN = 16, GRIP_PIN = 17, BUTTON = 18, BUZZER = 19;

Servo lift, grip;
// Measure your arm and edit these angles.
const int LIFT_UP = 100, LIFT_DOWN = 30;
const int GRIP_OPEN = 100, GRIP_SHUT = 40;
const int SPEED = 170;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void beep(int n) {  // active buzzer: HIGH sings, LOW is silent
  for (int i = 0; i < n; i++) {
    digitalWrite(BUZZER, HIGH); delay(150);
    digitalWrite(BUZZER, LOW); delay(150);
  }
}

void waitPress() {
  while (digitalRead(BUTTON) == HIGH) delay(20);  // INPUT_PULLUP: LOW = pressed
  delay(50);
  while (digitalRead(BUTTON) == LOW) delay(20);   // wait for release
  delay(50);
}

void setup() {
  // ESP32Servo 3.x allocates LEDC timers automatically — no timer setup call needed.
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
  pinMode(BUTTON, INPUT_PULLUP); pinMode(BUZZER, OUTPUT);
  lift.attach(LIFT_PIN); grip.attach(GRIP_PIN);
  lift.write(LIFT_UP); grip.write(GRIP_OPEN);
}

void loop() {
  waitPress();  // press to start the run
  // 1. follow the line until it ends (both white for 500 ms)
  unsigned long whiteSince = 0;
  while (true) {
    bool onL = digitalRead(IR_L) == LOW;  // true = eye sees the line
    bool onR = digitalRead(IR_R) == LOW;
    if (onL && onR) { drive(SPEED, SPEED); whiteSince = 0; }
    else if (onL) { drive(100, SPEED); whiteSince = 0; }  // veer left
    else if (onR) { drive(SPEED, 100); whiteSince = 0; }  // veer right
    else {
      drive(120, 120);  // creep: may be just a gap in the tape
      if (whiteSince == 0) whiteSince = millis();
      if (millis() - whiteSince > 500) break;  // line end
    }
    delay(20);
  }
  drive(0, 0);
  // 2. scripted pick
  lift.write(LIFT_DOWN); delay(700);
  grip.write(GRIP_SHUT); delay(700);
  lift.write(LIFT_UP); delay(700);
  // 3. back away with the load
  drive(-SPEED, -SPEED); delay(1000);
  drive(0, 0);
  beep(3);  // done
}`,
    },
    {
      id: 'b',
      label: 'B · Auto-grip + place cycle',
      note: 'A plus HC-SR04 auto-grip (TRIG A1, ECHO A2): grip closes under 10 cm, then a place cycle drives to the zone line, lowers, opens and backs away. LED D6 lit while running, beeps confirm pick and place.',
      board: 'uno',
      versions: ['b'],
      code: `// Pick-and-place rover B: sonar auto-grip + zone place cycle.
// Follow the line; the grip closes when the object is under 10 cm (no
// button timing). Then drive forward to the zone line, lower, open, back
// away. LED (D6) stays lit while running; missing object = error beeps.
// Buzzer is ACTIVE type: digitalWrite patterns only, never tone().
#include <Servo.h>

const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int IR_L = 2, IR_R = 3;
const int LIFT_PIN = 4, GRIP_PIN = 12, BUTTON = A0, BUZZER = 13;
const int TRIG = A1, ECHO = A2, LED = 6;

Servo lift, grip;
const int LIFT_UP = 100, LIFT_DOWN = 30;
const int GRIP_OPEN = 100, GRIP_SHUT = 40;
const int SPEED = 170;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void beep(int n) {  // active buzzer: HIGH sings, LOW is silent
  for (int i = 0; i < n; i++) {
    digitalWrite(BUZZER, HIGH); delay(150);
    digitalWrite(BUZZER, LOW); delay(150);
  }
}

void waitPress() {
  while (digitalRead(BUTTON) == HIGH) delay(20);
  delay(50);
  while (digitalRead(BUTTON) == LOW) delay(20);
  delay(50);
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;  // nothing in range
  return us / 58;
}

void followStep(unsigned long &whiteSince) {  // one line-follow tick
  bool onL = digitalRead(IR_L) == LOW;
  bool onR = digitalRead(IR_R) == LOW;
  if (onL && onR) { drive(SPEED, SPEED); whiteSince = 0; }
  else if (onL) { drive(100, SPEED); whiteSince = 0; }
  else if (onR) { drive(SPEED, 100); whiteSince = 0; }
  else {
    drive(120, 120);
    if (whiteSince == 0) whiteSince = millis();
  }
}

bool lineEnded(unsigned long whiteSince) {
  return whiteSince != 0 && millis() - whiteSince > 500;
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
  pinMode(BUTTON, INPUT_PULLUP); pinMode(BUZZER, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(LED, OUTPUT);
  lift.attach(LIFT_PIN); grip.attach(GRIP_PIN);
  lift.write(LIFT_UP); grip.write(GRIP_OPEN);
}

void loop() {
  waitPress();  // press to start the run
  digitalWrite(LED, HIGH);
  // 1. follow the line; auto-grip when the object is under 10 cm
  unsigned long whiteSince = 0;
  bool picked = false;
  while (!picked) {
    if (readCm() < 10) { picked = true; break; }
    followStep(whiteSince);
    if (lineEnded(whiteSince)) break;  // reached the end: no object
    delay(20);
  }
  drive(0, 0);
  if (!picked) { beep(2); digitalWrite(LED, LOW); return; }  // error: retry
  lift.write(LIFT_DOWN); delay(700);
  grip.write(GRIP_SHUT); delay(700);  // auto-grip: sonar said it is there
  lift.write(LIFT_UP); delay(700);
  beep(1);  // picked
  // 2. place cycle: forward to the zone line, lower, open, back away
  whiteSince = 0;
  while (!lineEnded(whiteSince)) { followStep(whiteSince); delay(20); }
  drive(0, 0);
  lift.write(LIFT_DOWN); delay(700);
  grip.write(GRIP_OPEN); delay(700);  // release the load
  lift.write(LIFT_UP); delay(500);
  drive(-SPEED, -SPEED); delay(1000);
  drive(0, 0);
  beep(3);  // placed: done
  digitalWrite(LED, LOW);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 auto-grip + place cycle',
      note: 'Same logic as the Uno sketch. Sonar TRIG GPIO32, ECHO → divider → GPIO36; LED GPIO21 lit while running; servos on GPIO16/17 via ESP32Servo.',
      board: 'esp32',
      versions: ['b'],
      code: `// Pick-and-place rover B (ESP32): sonar auto-grip + zone place cycle.
// Follow the line; the grip closes when the object is under 10 cm (no
// button timing). Then drive forward to the zone line, lower, open, back
// away. LED (GPIO21) stays lit while running; missing object = error beeps.
// Buzzer is ACTIVE type: digitalWrite patterns only, never tone().
#include <ESP32Servo.h>

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int IR_L = 34, IR_R = 35;
const int LIFT_PIN = 16, GRIP_PIN = 17, BUTTON = 18, BUZZER = 19;
const int TRIG = 32, ECHO = 36, LED = 21;  // ECHO via 1k/2k divider

Servo lift, grip;
const int LIFT_UP = 100, LIFT_DOWN = 30;
const int GRIP_OPEN = 100, GRIP_SHUT = 40;
const int SPEED = 170;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void beep(int n) {  // active buzzer: HIGH sings, LOW is silent
  for (int i = 0; i < n; i++) {
    digitalWrite(BUZZER, HIGH); delay(150);
    digitalWrite(BUZZER, LOW); delay(150);
  }
}

void waitPress() {
  while (digitalRead(BUTTON) == HIGH) delay(20);
  delay(50);
  while (digitalRead(BUTTON) == LOW) delay(20);
  delay(50);
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;  // nothing in range
  return us / 58;
}

void followStep(unsigned long &whiteSince) {  // one line-follow tick
  bool onL = digitalRead(IR_L) == LOW;
  bool onR = digitalRead(IR_R) == LOW;
  if (onL && onR) { drive(SPEED, SPEED); whiteSince = 0; }
  else if (onL) { drive(100, SPEED); whiteSince = 0; }
  else if (onR) { drive(SPEED, 100); whiteSince = 0; }
  else {
    drive(120, 120);
    if (whiteSince == 0) whiteSince = millis();
  }
}

bool lineEnded(unsigned long whiteSince) {
  return whiteSince != 0 && millis() - whiteSince > 500;
}

void setup() {
  // ESP32Servo 3.x allocates LEDC timers automatically — no timer setup call needed.
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(IR_L, INPUT); pinMode(IR_R, INPUT);
  pinMode(BUTTON, INPUT_PULLUP); pinMode(BUZZER, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(LED, OUTPUT);
  lift.attach(LIFT_PIN); grip.attach(GRIP_PIN);
  lift.write(LIFT_UP); grip.write(GRIP_OPEN);
}

void loop() {
  waitPress();  // press to start the run
  digitalWrite(LED, HIGH);
  // 1. follow the line; auto-grip when the object is under 10 cm
  unsigned long whiteSince = 0;
  bool picked = false;
  while (!picked) {
    if (readCm() < 10) { picked = true; break; }
    followStep(whiteSince);
    if (lineEnded(whiteSince)) break;  // reached the end: no object
    delay(20);
  }
  drive(0, 0);
  if (!picked) { beep(2); digitalWrite(LED, LOW); return; }  // error: retry
  lift.write(LIFT_DOWN); delay(700);
  grip.write(GRIP_SHUT); delay(700);  // auto-grip: sonar said it is there
  lift.write(LIFT_UP); delay(700);
  beep(1);  // picked
  // 2. place cycle: forward to the zone line, lower, open, back away
  whiteSince = 0;
  while (!lineEnded(whiteSince)) { followStep(whiteSince); delay(20); }
  drive(0, 0);
  lift.write(LIFT_DOWN); delay(700);
  grip.write(GRIP_OPEN); delay(700);  // release the load
  lift.write(LIFT_UP); delay(500);
  drive(-SPEED, -SPEED); delay(1000);
  drive(0, 0);
  beep(3);  // placed: done
  digitalWrite(LED, LOW);
}`,
    },
  ],
  tips: [
    { title: 'Servos get their own pack', detail: 'Two SG90s stalling together brown out the board supply — the separate 4×AA pack plus common GND is what keeps it alive mid-pick.' },
    { title: 'Fix horns at mid-travel', detail: 'Seat both servo horns near 90° before tightening, or LIFT_DOWN/GRIP_SHUT will slam the mechanical end-stop and strip gears.' },
    { title: 'Object goes mid-line', detail: 'B needs line left after the pick for the place drive — an object parked at the line end makes it place on the spot.' },
    { title: 'digitalWrite beeps only', detail: 'The buzzer is the active type: HIGH sings, LOW is silent. tone() on it warbles or stays mute, so the sketches never call it.' },
  ],
}
