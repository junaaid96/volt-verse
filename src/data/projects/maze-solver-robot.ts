import type { Project } from '../types'

export const mazeSolverRobot: Project = {
  slug: 'maze-solver-robot',
  categoryId: 'robotics',
  title: 'Maze Solver Robot',
  tagline: 'Right-hand wall follower that counts dead ends and finds the exit.',
  difficulty: 'Medium',
  weeks: '2 weeks',
  cost: '৳2,000–4,000',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Classic build: 6 motor pins, front sonar and 2 digital IR eyes.' },
    esp32: { ok: true, note: 'Sonar ECHO on input-only GPIO34 via divider; side IRs on GPIO35/36.' },
    nodemcu: {
      ok: false,
      reason: '6 motor pins plus 4 sensor pins exceed the usable GPIO once boot-strapping pins are avoided.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only 2–4 free GPIO; the drive plus 3 sensors need 10.',
    },
  },
  skills: ['Wall following', 'Sensor fusion', 'OLED display', 'Maze strategy'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'hcsr04', 'l298n'],
  rig: { sensor: 'chassis', extras: ['sonic', 'ir'] },
  options: [
    {
      id: 'a',
      title: 'A. Wall follower',
      level: 'Medium · easiest',
      blurb: 'Front sonar plus 2 side IR eyes run a right-hand rule: blocked ahead turns left, open right turns right.',
      points: ['3-sensor right-hand rule', 'L298N tank steering', 'Cardboard-maze ready'],
      weeks: '1–2 weeks',
      cost: '৳2,000–3,600',
    },
    {
      id: 'b',
      title: 'B. Solver + OLED timer',
      level: 'Medium · best value',
      blurb: 'Adds dead-end U-turns, exit detection with finish stop and victory spin, plus an OLED run timer.',
      points: ['Dead-end U-turns', 'Exit detect + victory spin', 'OLED time + status'],
      weeks: '2 weeks',
      cost: '৳2,300–4,000',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'HC-SR04 ultrasonic', qty: '1', role: 'Front wall eye', price: '৳120–250' },
    { name: 'TCRT5000 IR sensor module', qty: '2', role: 'Side wall eyes', price: '৳60–160' },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'ECHO 5V → 3.3V divider', price: '৳10–30', boards: ['esp32'] },
    { name: '0.96" OLED (I2C SSD1306)', qty: '1', role: 'Run timer + status', price: '৳280–450', versions: ['b'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Jumpers + cardboard', qty: '1 set', role: 'Wiring + maze walls', price: '৳100–250' },
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
        { from: 'HC-SR04 → TRIG / ECHO', to: 'D2 / D3' },
        { from: 'IR right / IR left → OUT', to: 'D4 / D12 (VCC 5V, LOW = wall)' },
        { from: 'OLED → SDA / SCL (B)', to: 'A4 / A5 (VCC 5V, addr 0x3C)' },
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
        { from: 'HC-SR04 → TRIG / ECHO', to: 'GPIO32 / GPIO34 via 1k/2k divider' },
        { from: 'IR right / IR left → OUT', to: 'GPIO35 / GPIO36 (modules on 3V3, LOW = wall)' },
        { from: 'OLED → SDA / SCL (B)', to: 'GPIO21 / GPIO22 (addr 0x3C)' },
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
      detail: 'Bolt the motors, wheels, caster and top plate together. Leave the nose of the plate free for the forward-facing sonar.',
    },
    {
      id: 'mount-maze-sensors',
      title: 'Mount the three wall eyes',
      detail: 'Sonar faces forward (TRIG→D2, ECHO→D3); the two IR modules point left and right at wall height, OUT to D12 (left) and D4 (right). Power all three from 5V.',
      boardDetail: {
        esp32: 'Sonar faces forward (TRIG→GPIO32, ECHO→GPIO34 via divider); the two IR modules point left and right at wall height, OUT to GPIO36 (left) and GPIO35 (right). Power the IR modules from 3V3.',
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
      detail: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() support. Sketch B also needs the Adafruit SSD1306 + GFX libraries.',
      boards: ['esp32'],
    },
    {
      id: 'power-electronics',
      title: 'Power motors and board',
      detail: 'Battery into the L298N motor supply; L298N 5V (jumper on) feeds the board. Tie all GNDs together or the sonar readings jitter.',
    },
    {
      id: 'upload-follower',
      title: 'Upload and bench-test',
      detail: 'Upload sketch A and hold a book ahead: closer than 20cm the robot spins left; with the front clear, uncover the right eye and it spins right.',
    },
    {
      id: 'build-test-maze',
      title: 'Build a cardboard maze',
      detail: 'Light-colored cardboard walls ~15cm tall, corridors 30–40cm wide. Start with one right turn and one dead end before building the full maze.',
    },
    {
      id: 'tune-turn-timing',
      title: 'Tune speed and turn timing',
      detail: 'Adjust SPEED and the 450ms spin delays on the real floor — wheel slip changes every turn. Slower and square beats fast and wall-scraping.',
    },
    {
      id: 'add-oled-exit',
      title: 'Add the OLED + exit logic',
      detail: 'Library Manager → Adafruit SSD1306 + Adafruit GFX. Wire the OLED SDA/SCL → A4/A5 and upload sketch B: dead ends trigger a U-turn, and 3s of wide-open space (armed after 10s) ends the run with a victory spin.',
      boardDetail: {
        esp32: 'Library Manager → Adafruit SSD1306 + Adafruit GFX. Wire the OLED SDA/SCL → GPIO21/GPIO22 and upload sketch B: dead ends trigger a U-turn, and 3s of wide-open space (armed after 10s) ends the run with a victory spin.',
      },
      versions: ['b'],
    },
    {
      id: 'timed-runs',
      title: 'Run timed trials',
      detail: 'Film three full runs: the OLED shows time, state and dead-end count for each. Compare A vs B on the same maze for the report.',
    },
  ],
  simulator: {
    viz: 'rover',
    intro: 'Same rule as the firmware: a wall closer than the limit ahead triggers a TURN instead of driving forward.',
    sliders: [
      { id: 'front', label: 'Front clearance', unit: 'cm', min: 2, max: 200, value: 80 },
      { id: 'side', label: 'Side opening', unit: '%', min: 0, max: 100, value: 40 },
    ],
    threshold: { id: 'thr', label: 'Turn under', unit: 'cm', min: 10, max: 50, value: 20 },
    watch: 'front',
    rule: 'below',
    actuator: 'Turn',
    onText: 'TURN',
    offText: 'FWD',
    lcd: ['Front:{front}cm', 'Turn:{act}'],
    demoSlider: 'front',
    demoFrom: 150,
    demoTo: 5,
    barLabel: 'Front clearance',
  },
  code: [
    {
      id: 'a',
      label: 'A · Wall follower',
      note: 'Right-hand rule on front sonar (D2/D3) + side IR eyes (right D4, left D12, LOW = wall): blocked ahead turns left, open right turns right, else forward.',
      board: 'uno',
      versions: ['a'],
      code: `// Maze solver A: right-hand wall follower.
// Front HC-SR04 + 2 side IR modules (OUT LOW = wall seen, HIGH = open).
// Rule: front blocked (<20 cm) -> turn left; right open -> turn right;
// else drive forward.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3;
const int IR_R = 4, IR_L = 12;
const int SPEED = 170;
const int FRONT_BLOCKED = 20;  // cm

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long frontCm() {
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
  pinMode(IR_R, INPUT); pinMode(IR_L, INPUT);
}

void loop() {
  bool blocked = frontCm() < FRONT_BLOCKED;
  bool rightOpen = digitalRead(IR_R) == HIGH;
  if (blocked) { drive(-SPEED, SPEED); delay(450); }        // turn left
  else if (rightOpen) { drive(SPEED, -SPEED); delay(450); }  // turn right
  else drive(SPEED, SPEED);                                 // forward
  delay(30);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 wall follower',
      note: 'Same logic as the Uno sketch. Motors GPIO25/26/27 + GPIO14/13/23 via analogWrite(), sonar TRIG GPIO32 / ECHO GPIO34 (divider), IR right GPIO35 / left GPIO36 (3V3-powered).',
      board: 'esp32',
      versions: ['a'],
      code: `// Maze solver A (ESP32): right-hand wall follower.
// Front HC-SR04 + 2 side IR modules (OUT LOW = wall seen, HIGH = open).
// Rule: front blocked (<20 cm) -> turn left; right open -> turn right;
// else drive forward.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34;  // ECHO via 1k/2k divider (GPIO34 is 3.3V max)
const int IR_R = 35, IR_L = 36;  // modules powered from 3V3
const int SPEED = 170;
const int FRONT_BLOCKED = 20;  // cm

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long frontCm() {
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
  pinMode(IR_R, INPUT); pinMode(IR_L, INPUT);
}

void loop() {
  bool blocked = frontCm() < FRONT_BLOCKED;
  bool rightOpen = digitalRead(IR_R) == HIGH;
  if (blocked) { drive(-SPEED, SPEED); delay(450); }        // turn left
  else if (rightOpen) { drive(SPEED, -SPEED); delay(450); }  // turn right
  else drive(SPEED, SPEED);                                 // forward
  delay(30);
}`,
    },
    {
      id: 'b',
      label: 'B · Solver + OLED timer',
      note: 'A plus dead-end U-turn, exit detect (3 s wide open, armed after 10 s) with finish stop + victory spin, and a 128x64 SSD1306 OLED (SDA A4, SCL A5, 0x3C) showing state, time and dead ends.',
      board: 'uno',
      versions: ['b'],
      code: `// Maze solver B: A + dead-end U-turn, exit detect and OLED run timer.
// Dead end (front + both sides blocked) -> 180-degree U-turn.
// Exit = wide-open space for 3 s (front > 60 cm, both sides open), armed
// 10 s after reset -> finish stop + victory spin. The 128x64 I2C OLED
// (SSD1306, 0x3C) shows state, run time, front clearance and dead ends.
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_W 128
#define SCREEN_H 64
Adafruit_SSD1306 display(SCREEN_W, SCREEN_H, &Wire, -1);

const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int TRIG = 2, ECHO = 3;
const int IR_R = 4, IR_L = 12;  // LOW = wall seen
const int SPEED = 170;
const int FRONT_BLOCKED = 20;  // cm

int deadEnds = 0;
unsigned long t0, openSince = 0;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long frontCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

void show(const char *state, long front) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(state);
  display.setTextSize(1);
  display.setCursor(0, 22);
  display.print(F("t=")); display.print((millis() - t0) / 1000); display.print(F("s d="));
  display.print(front); display.print(F("cm"));
  display.setCursor(0, 34);
  display.print(F("dead-ends: ")); display.print(deadEnds);
  display.setCursor(0, 46);
  display.print(F("L:")); display.print(digitalRead(IR_L));
  display.print(F(" R:")); display.print(digitalRead(IR_R));
  display.print(F(" (0=wall)"));
  display.display();
}

void victory() {
  show("DONE!", 999);
  for (int i = 0; i < 3; i++) {  // victory spin: alternate spins
    drive(SPEED, -SPEED); delay(400);
    drive(-SPEED, SPEED); delay(400);
  }
  drive(0, 0);
  show("DONE!", 999);
  while (true) delay(1000);  // finished: press reset to run again
}

void setup() {
  Serial.begin(9600);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(IR_R, INPUT); pinMode(IR_L, INPUT);
  Wire.begin();  // Uno: SDA=A4, SCL=A5
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
    Serial.println(F("OLED missing: running blind"));
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  t0 = millis();
}

void loop() {
  long front = frontCm();
  bool blocked = front < FRONT_BLOCKED;
  bool leftWall = digitalRead(IR_L) == LOW;
  bool rightWall = digitalRead(IR_R) == LOW;
  if (blocked && leftWall && rightWall) {  // dead end: U-turn
    deadEnds++;
    show("UTURN", front);
    drive(-SPEED, SPEED); delay(900);
  } else if (blocked) {
    show("LEFT", front);
    drive(-SPEED, SPEED); delay(450);
  } else if (!rightWall) {
    show("RIGHT", front);
    drive(SPEED, -SPEED); delay(450);
  } else {
    show("FWD", front);
    drive(SPEED, SPEED);
  }
  if (millis() - t0 > 10000 && front > 60 && !leftWall && !rightWall) {
    if (!openSince) openSince = millis();  // exit signature holding...
    if (millis() - openSince > 3000) victory();
  } else {
    openSince = 0;
  }
  delay(30);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 solver + OLED timer',
      note: 'Same logic as the Uno sketch. Motors GPIO25/26/27 + GPIO14/13/23, sonar TRIG GPIO32 / ECHO GPIO34 (divider), IR right GPIO35 / left GPIO36, OLED SDA GPIO21 / SCL GPIO22 (0x3C).',
      board: 'esp32',
      versions: ['b'],
      code: `// Maze solver B (ESP32): A + dead-end U-turn, exit detect and OLED timer.
// Dead end (front + both sides blocked) -> 180-degree U-turn.
// Exit = wide-open space for 3 s (front > 60 cm, both sides open), armed
// 10 s after reset -> finish stop + victory spin. The 128x64 I2C OLED
// (SSD1306, 0x3C) shows state, run time, front clearance and dead ends.
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_W 128
#define SCREEN_H 64
Adafruit_SSD1306 display(SCREEN_W, SCREEN_H, &Wire, -1);

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int TRIG = 32, ECHO = 34;  // ECHO via 1k/2k divider (GPIO34 is 3.3V max)
const int IR_R = 35, IR_L = 36;  // modules powered from 3V3, LOW = wall seen
const int OLED_SDA = 21, OLED_SCL = 22;
const int SPEED = 170;
const int FRONT_BLOCKED = 20;  // cm

int deadEnds = 0;
unsigned long t0, openSince = 0;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

long frontCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

void show(const char *state, long front) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(state);
  display.setTextSize(1);
  display.setCursor(0, 22);
  display.print(F("t=")); display.print((millis() - t0) / 1000); display.print(F("s d="));
  display.print(front); display.print(F("cm"));
  display.setCursor(0, 34);
  display.print(F("dead-ends: ")); display.print(deadEnds);
  display.setCursor(0, 46);
  display.print(F("L:")); display.print(digitalRead(IR_L));
  display.print(F(" R:")); display.print(digitalRead(IR_R));
  display.print(F(" (0=wall)"));
  display.display();
}

void victory() {
  show("DONE!", 999);
  for (int i = 0; i < 3; i++) {  // victory spin: alternate spins
    drive(SPEED, -SPEED); delay(400);
    drive(-SPEED, SPEED); delay(400);
  }
  drive(0, 0);
  show("DONE!", 999);
  while (true) delay(1000);  // finished: press reset to run again
}

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(IR_R, INPUT); pinMode(IR_L, INPUT);
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
    Serial.println(F("OLED missing: running blind"));
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  t0 = millis();
}

void loop() {
  long front = frontCm();
  bool blocked = front < FRONT_BLOCKED;
  bool leftWall = digitalRead(IR_L) == LOW;
  bool rightWall = digitalRead(IR_R) == LOW;
  if (blocked && leftWall && rightWall) {  // dead end: U-turn
    deadEnds++;
    show("UTURN", front);
    drive(-SPEED, SPEED); delay(900);
  } else if (blocked) {
    show("LEFT", front);
    drive(-SPEED, SPEED); delay(450);
  } else if (!rightWall) {
    show("RIGHT", front);
    drive(SPEED, -SPEED); delay(450);
  } else {
    show("FWD", front);
    drive(SPEED, SPEED);
  }
  if (millis() - t0 > 10000 && front > 60 && !leftWall && !rightWall) {
    if (!openSince) openSince = millis();  // exit signature holding...
    if (millis() - openSince > 3000) victory();
  } else {
    openSince = 0;
  }
  delay(30);
}`,
    },
  ],
  tips: [
    { title: 'Build light-colored walls', detail: 'TCRT5000 eyes see reflected IR — matte white or beige cardboard reads as wall, dark or glossy walls read as open.' },
    { title: 'Tune turns on the real floor', detail: 'Tile, carpet and wood slip differently: set SPEED and the 450/900ms spin times on the exact demo surface.' },
    { title: 'Respect the 10s exit arm', detail: 'Place the robot facing into the maze at reset — starting in the open triggers the DONE state 13s later.' },
    { title: 'Keep the sonar level', detail: 'Tilted or loose sensors echo off the floor; soft fabrics absorb pings, so keep blankets and curtains out of the maze.' },
  ],
}
