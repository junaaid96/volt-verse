import type { Project } from '../types'

export const bluetoothRcCar: Project = {
  slug: 'bluetooth-rc-car',
  categoryId: 'robotics',
  title: 'Bluetooth RC Car',
  tagline: 'Drive a 2WD car from your phone over HC-05.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,900–3,200',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'HC-05 on SoftwareSerial D2/D3 at 9600 baud; RX through a 1k/2k divider.' },
    esp32: { ok: true, note: 'HC-05 on Serial2 (GPIO16/17); RX through a 1k/2k divider, USB Serial stays free.' },
    nodemcu: {
      ok: false,
      reason: 'HC-05 needs a hardware UART and NodeMCU’s only full UART is shared with USB — the Bluetooth link would collide with flashing and the Serial monitor.',
    },
    esp32cam: {
      ok: false,
      reason: 'The CAM’s single UART is the flashing/debug port and only ~4 GPIO are free; the 6-wire L298N drive plus HC-05 and failsafe parts need 10+.',
    },
  },
  skills: ['Bluetooth SPP', 'Motor driving', 'Battery failsafe', 'Phone control'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'l298n', 'hc05'],
  rig: { sensor: 'chassis', extras: ['l298n', 'hc05'] },
  options: [
    {
      id: 'a',
      title: 'A. Phone tank drive',
      level: 'Basic · easiest',
      blurb: 'HC-05 + L298N tank drive on single-char commands (F/B/L/R/S) from a Bluetooth RC app at 9600 baud.',
      points: ['HC-05 at 9600 baud', 'F/B/L/R/S commands', 'Phone app driving'],
      weeks: '1 week',
      cost: '৳1,900–2,500',
    },
    {
      id: 'b',
      title: 'B. Speeds + failsafe',
      level: 'Basic · best value',
      blurb: 'Adds 0–9 speed levels, a headlight toggle, a low-battery motor cutout with beep and disconnect auto-stop.',
      points: ['0–9 speed levels', 'Headlight + low-battery cutout', '300ms disconnect auto-stop'],
      weeks: '1–2 weeks',
      cost: '৳2,100–3,200',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'HC-05 Bluetooth module', qty: '1', role: 'Phone link (9600 baud)', price: '৳280–450' },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'HC-05 RX divider', price: '৳10–30' },
    { name: 'White LED + 220Ω', qty: '1', role: 'Headlight', price: '৳15–40', versions: ['b'] },
    { name: '100k + 47k resistors', qty: '1 + 1', role: 'Battery sense divider', price: '৳10–30', versions: ['b'] },
    { name: 'Active buzzer', qty: '1', role: 'Failsafe alarm', price: '৳25–60', versions: ['b'] },
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
        { from: 'HC-05 VCC / GND / TX', to: '5V / GND / D2 (SoftwareSerial RX)' },
        { from: 'D3 (SoftwareSerial TX) → 1k/2k divider', to: 'HC-05 RX (3.3V only!)' },
        { from: 'Headlight LED + 220Ω (B)', to: 'D12 (LED − to GND)' },
        { from: 'Battery + → 100k/47k divider → (B)', to: 'A0 (divider GND to battery −)' },
        { from: 'Buzzer + (B)', to: 'D4 (buzzer − to GND)' },
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
        { from: 'HC-05 VCC / GND / TX', to: '5V / GND / GPIO16 (Serial2 RX)' },
        { from: 'GPIO17 (Serial2 TX) → 1k/2k divider', to: 'HC-05 RX (3.3V only!)' },
        { from: 'Headlight LED + 220Ω (B)', to: 'GPIO18 (LED − to GND)' },
        { from: 'Battery + → 100k/47k divider → (B)', to: 'GPIO36 ADC1 (divider GND to battery −)' },
        { from: 'Buzzer + (B)', to: 'GPIO19 (buzzer − to GND)' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V/VIN (battery ≤ 12V only)' },
        { from: 'HC-05 VCC', to: '5V (the module regulates to 3.3V itself)' },
        { from: 'Common GND', to: 'board GND + L298N GND + HC-05 GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'assemble-chassis',
      title: 'Assemble the 2WD chassis',
      detail: 'Bolt the motors, wheels, caster and top plate together. Mount the L298N low and the HC-05 upright for range.',
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
      id: 'wire-hc05',
      title: 'Wire the HC-05',
      detail: 'HC-05 VCC/GND to 5V/GND, TX → D2, and D3 → 1k/2k divider → RX (the RX pin is 3.3V-only). Leave it unplugged while uploading over USB.',
      boardDetail: {
        esp32: 'HC-05 VCC/GND to 5V/GND, TX → GPIO16 (Serial2 RX), and GPIO17 → 1k/2k divider → RX (the RX pin is 3.3V-only). USB Serial stays free for debugging.',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() and Serial2 support. No extra libraries needed.',
      boards: ['esp32'],
    },
    {
      id: 'pair-phone-app',
      title: 'Pair the phone + app',
      detail: 'Power the car, pair “HC-05” in Android Bluetooth settings (PIN 1234), then open the “Bluetooth RC Controller” app and connect at 9600 baud.',
    },
    {
      id: 'upload-drive-test',
      title: 'Upload and drive',
      detail: 'Upload sketch A and press F/B/L/R/S in the app: forward, back, spin left, spin right, stop. If a side runs backwards, swap its motor leads.',
    },
    {
      id: 'add-failsafe-parts',
      title: 'Add headlight + battery sense + buzzer',
      detail: 'LED (+220Ω) → D12, battery + through the 100k/47k divider → A0, buzzer + → D4. Upload sketch B: W toggles the light, 0–9 set speed.',
      boardDetail: {
        esp32: 'LED (+220Ω) → GPIO18, battery + through the 100k/47k divider → GPIO36 (ADC1), buzzer + → GPIO19. Upload sketch B: W toggles the light, 0–9 set speed.',
      },
      versions: ['b'],
    },
    {
      id: 'test-failsafes',
      title: 'Test both failsafes',
      detail: 'Hold F and kill the app: the car must stop within ~300ms. Then run the pack down: under 6.6V the motors cut and the buzzer beeps.',
      versions: ['b'],
    },
    {
      id: 'slalom-demo',
      title: 'Film the slalom demo',
      detail: 'Line up bottles as gates and film a clean run with a speed change and headlight toggle mid-course (B). Log top speed per level for the report.',
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: battery under the cutoff kills the drive — otherwise throttle passes through.',
    sliders: [
      { id: 'battV', label: 'Battery', unit: 'V', min: 5, max: 8.4, value: 7.4 },
      { id: 'throttle', label: 'Throttle', unit: '%', min: 0, max: 100, value: 60 },
    ],
    threshold: { id: 'thr', label: 'Cutoff', unit: 'V', min: 6, max: 7.4, value: 6.6 },
    watch: 'battV',
    rule: 'below',
    actuator: 'Drive',
    onText: 'CUT',
    offText: 'OK',
    lcd: ['Bat:{battV}V Thr:{throttle}', 'Drive:{act}'],
    demoSlider: 'battV',
    demoFrom: 8.2,
    demoTo: 5.8,
    barLabel: 'Battery',
  },
  code: [
    {
      id: 'a',
      label: 'A · Phone tank drive',
      note: 'F/B/L/R/S from the Bluetooth RC Controller app at 9600 baud. HC-05 TX → D2, D3 → divider → HC-05 RX; motors D5/D7/D8 + D9/D10/D11.',
      board: 'uno',
      versions: ['a'],
      code: `#include <SoftwareSerial.h>
SoftwareSerial bt(2, 3);  // RX=D2 <- HC-05 TX, TX=D3 -> divider -> HC-05 RX
// Bluetooth RC car A: single-char tank drive from the phone.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int SPEED = 200;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  bt.begin(9600);  // HC-05 default baud
}

void loop() {
  if (!bt.available()) return;
  char c = bt.read();
  if (c >= 'a' && c <= 'z') c -= 32;  // tolerate lowercase
  switch (c) {
    case 'F': drive(SPEED, SPEED); break;      // forward
    case 'B': drive(-SPEED, -SPEED); break;    // back
    case 'L': drive(-SPEED, SPEED); break;     // spin left
    case 'R': drive(SPEED, -SPEED); break;     // spin right
    case 'S': drive(0, 0); break;              // stop
  }
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 phone tank drive',
      note: 'Same commands as the Uno sketch on Serial2: HC-05 TX → GPIO16, GPIO17 → divider → HC-05 RX; motors GPIO25/26/27 + GPIO14/13/23.',
      board: 'esp32',
      versions: ['a'],
      code: `// Bluetooth RC car A (ESP32): single-char tank drive on Serial2.
const int BT_RX = 16, BT_TX = 17;  // RX <- HC-05 TX, TX -> divider -> HC-05 RX
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int SPEED = 200;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  Serial2.begin(9600, SERIAL_8N1, BT_RX, BT_TX);  // HC-05 default baud
}

void loop() {
  if (!Serial2.available()) return;
  char c = Serial2.read();
  if (c >= 'a' && c <= 'z') c -= 32;  // tolerate lowercase
  switch (c) {
    case 'F': drive(SPEED, SPEED); break;      // forward
    case 'B': drive(-SPEED, -SPEED); break;    // back
    case 'L': drive(-SPEED, SPEED); break;     // spin left
    case 'R': drive(SPEED, -SPEED); break;     // spin right
    case 'S': drive(0, 0); break;              // stop
  }
}`,
    },
    {
      id: 'b',
      label: 'B · Speeds + failsafe',
      note: '0–9 speed levels, W headlight toggle, 6.6V battery cutout with beep, 300ms disconnect auto-stop. LED D12, battery A0 via 100k/47k, buzzer D4.',
      board: 'uno',
      versions: ['b'],
      code: `#include <SoftwareSerial.h>
SoftwareSerial bt(2, 3);  // RX=D2 <- HC-05 TX, TX=D3 -> divider -> HC-05 RX
// Bluetooth RC car B: speed levels, headlight, battery failsafe, auto-stop.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int LED = 12, BATT = A0, BUZZER = 4;
const float CUT_V = 6.6;
int speedVal = 200;
char motion = 'S';  // last drive command
unsigned long lastCmd = 0;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

float battV() {  // 100k/47k divider on the 2S pack
  return analogRead(BATT) * 5.0 / 1023.0 * (100.0 + 47.0) / 47.0;
}

void applyMotion() {
  switch (motion) {
    case 'F': drive(speedVal, speedVal); break;
    case 'B': drive(-speedVal, -speedVal); break;
    case 'L': drive(-speedVal, speedVal); break;
    case 'R': drive(speedVal, -speedVal); break;
    default: drive(0, 0); break;
  }
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(LED, OUTPUT); pinMode(BUZZER, OUTPUT);
  bt.begin(9600);
}

void loop() {
  while (bt.available()) {
    lastCmd = millis();
    char c = bt.read();
    if (c >= 'a' && c <= 'z') c -= 32;  // tolerate lowercase
    if (c >= '0' && c <= '9') speedVal = map(c - '0', 0, 9, 120, 255);  // speed level
    else if (c == 'W') digitalWrite(LED, !digitalRead(LED));            // headlight toggle
    else if (c == 'F' || c == 'B' || c == 'L' || c == 'R' || c == 'S') motion = c;
  }
  if (battV() < CUT_V) {  // battery failsafe: cut motors, beep
    drive(0, 0);
    digitalWrite(BUZZER, millis() % 400 < 200);
  } else {
    digitalWrite(BUZZER, LOW);
    if (millis() - lastCmd > 300) drive(0, 0);  // disconnect auto-stop
    else applyMotion();
  }
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 speeds + failsafe',
      note: 'Same logic as the Uno sketch on Serial2. LED GPIO18, battery GPIO36 (ADC1) via 100k/47k, buzzer GPIO19, 12-bit ADC math.',
      board: 'esp32',
      versions: ['b'],
      code: `// Bluetooth RC car B (ESP32): speed levels, headlight, battery failsafe, auto-stop.
const int BT_RX = 16, BT_TX = 17;  // Serial2 RX <- HC-05 TX, TX -> divider -> HC-05 RX
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int LED = 18, BATT = 36, BUZZER = 19;
const float CUT_V = 6.6;
int speedVal = 200;
char motion = 'S';  // last drive command
unsigned long lastCmd = 0;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

float battV() {  // 100k/47k divider, 12-bit ADC, ~3.3V full scale
  return analogRead(BATT) * 3.3 / 4095.0 * (100.0 + 47.0) / 47.0;
}

void applyMotion() {
  switch (motion) {
    case 'F': drive(speedVal, speedVal); break;
    case 'B': drive(-speedVal, -speedVal); break;
    case 'L': drive(-speedVal, speedVal); break;
    case 'R': drive(speedVal, -speedVal); break;
    default: drive(0, 0); break;
  }
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(LED, OUTPUT); pinMode(BUZZER, OUTPUT);
  Serial2.begin(9600, SERIAL_8N1, BT_RX, BT_TX);
}

void loop() {
  while (Serial2.available()) {
    lastCmd = millis();
    char c = Serial2.read();
    if (c >= 'a' && c <= 'z') c -= 32;  // tolerate lowercase
    if (c >= '0' && c <= '9') speedVal = map(c - '0', 0, 9, 120, 255);  // speed level
    else if (c == 'W') digitalWrite(LED, !digitalRead(LED));            // headlight toggle
    else if (c == 'F' || c == 'B' || c == 'L' || c == 'R' || c == 'S') motion = c;
  }
  if (battV() < CUT_V) {  // battery failsafe: cut motors, beep
    drive(0, 0);
    digitalWrite(BUZZER, millis() % 400 < 200);
  } else {
    digitalWrite(BUZZER, LOW);
    if (millis() - lastCmd > 300) drive(0, 0);  // disconnect auto-stop
    else applyMotion();
  }
}`,
    },
  ],
  tips: [
    { title: 'Divider before RX', detail: 'HC-05 RX is 3.3V-only — a direct 5V TX wire works for a day, then the module dies quietly.' },
    { title: 'Unplug to upload', detail: 'On the Uno, unplug the HC-05 TX wire (D2) during USB upload or avrdude will fail to sync.' },
    { title: 'App sends repeats', detail: 'The RC app re-sends the held button — that stream is what the 300ms auto-stop watches, so test with the real app, not a terminal.' },
    { title: 'Calibrate the cutoff', detail: 'Measure the pack with a multimeter and tweak the divider math — resistor tolerance shifts the 6.6V trip by ±0.3V.' },
  ],
}
