import type { Project } from '../types'

export const fireFighterRobot: Project = {
  slug: 'fire-fighter-robot',
  categoryId: 'robotics',
  title: 'Fire Fighter Robot',
  tagline: 'Three flame eyes hunt a candle while a fan and pump put it out.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,400–4,600',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Classic build: 6 motor pins plus 3 flame inputs, fan/pump relays and a buzzer.' },
    esp32: { ok: true, note: 'Flame DO lines go to input-only GPIO34/35/36; B adds a Wi-Fi status page on port 80.' },
    nodemcu: {
      ok: false,
      reason: '6 motor pins plus 3 flame sensors, 2 relays and a buzzer exceed the usable GPIO once boot pins are avoided.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only ~4 free GPIO; motors plus flame sensors and relays need far more than that.',
    },
  },
  skills: ['Flame sensing', 'Relay switching', 'Seek steering', 'Pump control'],
  scene: 'home',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'l298n', 'flame-sensor', 'relay-5v'],
  rig: { sensor: 'chassis', extras: ['flame', 'pump'] },
  options: [
    {
      id: 'a',
      title: 'A. Seek + fan attack',
      level: 'Medium · core build',
      blurb: 'Three flame sensors steer toward the candle, the robot stops close in and a relay fan blows it out with a buzzer alarm.',
      points: ['3-way flame seeking', 'Relay-driven 5V fan', 'Buzzer alarm while fighting'],
      weeks: '2 weeks',
      cost: '৳2,400–3,600',
    },
    {
      id: 'b',
      title: 'B. Pump + status page',
      level: 'Medium · full attack',
      blurb: 'Adds a water pump on a second relay firing in 2s bursts, plus a Wi-Fi status page (ESP32) or coded buzzer alarm (Uno).',
      points: ['Pump bursts 2s on / 3s off', 'ESP32 Wi-Fi status page', 'Uno coded buzzer alarm'],
      weeks: '2–3 weeks',
      cost: '৳2,900–4,600',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'Flame sensor module (DO output)', qty: '3', role: 'Left/center/right flame eyes', price: '৳70–150' },
    { name: '5V relay module', qty: '1', role: 'Fan switch (active-LOW)', price: '৳90–180' },
    { name: '5V relay module', qty: '1', role: 'Pump switch (active-LOW)', price: '৳90–180', versions: ['b'] },
    { name: '5V DC fan', qty: '1', role: 'Blows out the candle', price: '৳120–250' },
    { name: 'Mini 5V water pump + tube', qty: '1', role: 'Water attack', price: '৳180–350', versions: ['b'] },
    { name: 'Active buzzer 5V', qty: '1', role: 'Fire alarm', price: '৳25–60' },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Candle + water bowl', qty: '1 set', role: 'Safe fire demo target', price: '৳50–120' },
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
        { from: 'Flame L / C / R → VCC / GND / DO', to: '5V / GND / D2 / D3 / D4 (LOW = flame seen)' },
        { from: 'Fan relay VCC / GND / IN', to: '5V / GND / D12 (fan across NO + 5V supply)' },
        { from: 'Pump relay VCC / GND / IN (B)', to: '5V / GND / A0 (pump across NO + 5V supply)' },
        { from: 'Buzzer +/−', to: 'D13 / GND' },
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
        { from: 'Flame L / C / R → 3V3 / GND / DO', to: 'GPIO34 / GPIO35 / GPIO36 (LOW = flame seen)' },
        { from: 'Fan relay VCC / GND / IN', to: 'GPIO18 (needs a 3V3-trigger relay module or NPN driver, fan across NO + 5V supply)' },
        { from: 'Pump relay IN (B)', to: 'GPIO21 (same 3V3-trigger relay or NPN driver note)' },
        { from: 'Buzzer +/−', to: 'GPIO19 / GND' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V/VIN (battery ≤ 12V only)' },
        { from: 'Fan + pump supply', to: 'Separate 5V pack switched through relay NO contacts — never from a board pin' },
        { from: 'Common GND', to: 'board GND + L298N GND + relay GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'fire-safety-setup',
      title: 'Set up the fire-safe demo zone',
      detail: 'Candle demos only with a water bowl within arm’s reach, on a metal tray away from paper and curtains. Never leave the pump running unattended, and keep all electronics away from water.',
    },
    {
      id: 'assemble-chassis',
      title: 'Assemble the 2WD chassis',
      detail: 'Bolt the motors, wheels, caster and top plate together. Mount the fan at the front aiming slightly down at candle height.',
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
      id: 'mount-flame-sensors',
      title: 'Mount the 3 flame sensors',
      detail: 'Fan the modules left/center/right across the front bumper. VCC→5V, GND→GND, DO→D2/D3/D4. Turn each sensitivity trim-pot until the LED fires only at a real flame, not room light.',
      boardDetail: {
        esp32: 'Fan the modules left/center/right across the front bumper. VCC→3V3, GND→GND, DO→GPIO34/35/36. Turn each sensitivity trim-pot until the LED fires only at a real flame, not room light.',
      },
    },
    {
      id: 'wire-fan-relay',
      title: 'Wire the fan relay + buzzer',
      detail: 'Relay VCC→5V, GND→GND, IN→D12; fan + through the NO contact to its own 5V pack. Buzzer +→D13. Relay modules are active-LOW: IN LOW clicks the relay on.',
      boardDetail: {
        esp32: 'Use a 3V3-trigger relay module or an NPN driver (a plain 5V relay may not click from GPIO18). IN→GPIO18; fan + through NO to its own 5V pack. Buzzer +→GPIO19.',
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
      detail: 'Battery into the L298N motor supply; L298N 5V (jumper on) feeds the board. Keep the fan/pump supply separate from the board — motors and pump share GND only.',
    },
    {
      id: 'upload-firefighter',
      title: 'Upload and bench-test',
      detail: 'Upload sketch A, light the candle 1m ahead: the robot should veer toward it, stop close in, and run the fan + buzzer until the flame dies.',
    },
    {
      id: 'add-pump-status',
      title: 'Add the pump + status output',
      detail: 'Wire the pump relay IN→A0 (B) and aim the nozzle forward. Uno has no Wi-Fi, so sketch B sounds a coded 3-beep alarm instead of a status page — the beeps repeat while fighting.',
      boardDetail: {
        esp32: 'Wire the pump relay IN→GPIO21 (B) and aim the nozzle forward. Set SSID/PASS in sketch B, open the Serial IP on port 80, and watch flame + pump states live while the pump fires in 2s bursts with 3s pauses.',
      },
      versions: ['b'],
    },
    {
      id: 'fire-demo',
      title: 'Run the fire drill demo',
      detail: 'Place the candle, start the robot 1.5m away and time the kill. Log seek time vs distance — and blow the candle out yourself if the robot stalls.',
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: flame reading past 60% starts the pump attack, below it the robot keeps seeking.',
    sliders: [
      { id: 'flame', label: 'Flame', unit: '%', min: 0, max: 100, value: 20 },
      { id: 'temp', label: 'Temp', unit: '°C', min: 20, max: 80, value: 35 },
    ],
    threshold: { id: 'fireThr', label: 'Attack level', unit: '%', min: 30, max: 90, value: 60 },
    watch: 'flame',
    rule: 'above',
    actuator: 'Pump',
    onText: 'ON',
    offText: 'OFF',
    lcd: ['Flame:{flame}%', 'Pump:{act}'],
    demoSlider: 'flame',
    demoFrom: 10,
    demoTo: 95,
    barLabel: 'Flame',
  },
  code: [
    {
      id: 'a',
      label: 'A · Seek + fan attack',
      note: 'Flame DO lines on D2/D3/D4 (LOW = flame): steer toward the triggered side, stop when centered, fan relay D12 + buzzer D13 run while fighting.',
      board: 'uno',
      versions: ['a'],
      code: `// Fire fighter A: seek the flame with 3 sensors, blow it out with a relay fan.
// Flame modules output LOW on DO when they see a flame; relay is active-LOW.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int FL_L = 2, FL_C = 3, FL_R = 4;
const int FAN = 12, BUZZER = 13;
const int RELAY_ON = LOW, RELAY_OFF = HIGH;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(FL_L, INPUT); pinMode(FL_C, INPUT); pinMode(FL_R, INPUT);
  pinMode(FAN, OUTPUT); pinMode(BUZZER, OUTPUT);
  digitalWrite(FAN, RELAY_OFF);
}

void loop() {
  bool fl = digitalRead(FL_L) == LOW;
  bool fc = digitalRead(FL_C) == LOW;
  bool fr = digitalRead(FL_R) == LOW;
  bool fighting = fl || fc || fr;
  digitalWrite(FAN, fighting ? RELAY_ON : RELAY_OFF);
  digitalWrite(BUZZER, fighting ? HIGH : LOW);  // alarm while fighting
  if (!fighting) drive(0, 0);
  else if (fc) drive(0, 0);       // centered: stop at close range and blow
  else if (fl) drive(100, 200);   // steer toward the left flame
  else drive(200, 100);           // steer toward the right flame
  delay(100);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 seek + fan attack',
      note: 'Same logic on ESP32: flame DO on GPIO34/35/36 (modules on 3V3), fan relay GPIO18 (3V3-trigger relay or NPN driver), buzzer GPIO19.',
      board: 'esp32',
      versions: ['a'],
      code: `// Fire fighter A (ESP32): seek the flame with 3 sensors, blow it out with a fan.
// Flame modules on 3V3 output LOW on DO when they see a flame; relay is active-LOW.
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int FL_L = 34, FL_C = 35, FL_R = 36;
const int FAN = 18, BUZZER = 19;  // FAN needs a 3V3-trigger relay or NPN driver
const int RELAY_ON = LOW, RELAY_OFF = HIGH;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(FL_L, INPUT); pinMode(FL_C, INPUT); pinMode(FL_R, INPUT);
  pinMode(FAN, OUTPUT); pinMode(BUZZER, OUTPUT);
  digitalWrite(FAN, RELAY_OFF);
}

void loop() {
  bool fl = digitalRead(FL_L) == LOW;
  bool fc = digitalRead(FL_C) == LOW;
  bool fr = digitalRead(FL_R) == LOW;
  bool fighting = fl || fc || fr;
  digitalWrite(FAN, fighting ? RELAY_ON : RELAY_OFF);
  digitalWrite(BUZZER, fighting ? HIGH : LOW);  // alarm while fighting
  if (!fighting) drive(0, 0);
  else if (fc) drive(0, 0);       // centered: stop at close range and blow
  else if (fl) drive(100, 200);   // steer toward the left flame
  else drive(200, 100);           // steer toward the right flame
  delay(100);
}`,
    },
    {
      id: 'b',
      label: 'B · Pump bursts + coded alarm',
      note: 'No Wi-Fi on the Uno: pump relay on A0 fires in 2s bursts with 3s pauses while fighting, and D13 sounds a coded 3-beep alarm instead of a status page.',
      board: 'uno',
      versions: ['b'],
      code: `// Fire fighter B: pump bursts + coded buzzer alarm (Uno has no Wi-Fi, so no status page).
// Pump runs 2s on / 3s off while fighting to avoid flooding; buzzer beeps 3x coded.
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int FL_L = 2, FL_C = 3, FL_R = 4;
const int FAN = 12, BUZZER = 13, PUMP = A0;
const int RELAY_ON = LOW, RELAY_OFF = HIGH;

unsigned long fightSince = 0;
bool wasFighting = false;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(FL_L, INPUT); pinMode(FL_C, INPUT); pinMode(FL_R, INPUT);
  pinMode(FAN, OUTPUT); pinMode(BUZZER, OUTPUT); pinMode(PUMP, OUTPUT);
  digitalWrite(FAN, RELAY_OFF); digitalWrite(PUMP, RELAY_OFF);
}

void loop() {
  bool fl = digitalRead(FL_L) == LOW;
  bool fc = digitalRead(FL_C) == LOW;
  bool fr = digitalRead(FL_R) == LOW;
  bool fighting = fl || fc || fr;
  if (fighting && !wasFighting) fightSince = millis();  // restart burst cycle
  wasFighting = fighting;
  digitalWrite(FAN, fighting ? RELAY_ON : RELAY_OFF);
  bool pumpOn = fighting && ((millis() - fightSince) % 5000 < 2000);  // 2s on / 3s off
  digitalWrite(PUMP, pumpOn ? RELAY_ON : RELAY_OFF);
  unsigned long t = millis() % 1500;  // coded 3-beep alarm while fighting
  bool beep = t < 120 || (t > 240 && t < 360) || (t > 480 && t < 600);
  digitalWrite(BUZZER, (fighting && beep) ? HIGH : LOW);
  if (!fighting) drive(0, 0);
  else if (fc) drive(0, 0);       // centered: stop at close range and attack
  else if (fl) drive(100, 200);   // steer toward the left flame
  else drive(200, 100);           // steer toward the right flame
  delay(50);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · Pump bursts + Wi-Fi status',
      note: 'Pump relay on GPIO21 fires in 2s bursts with 3s pauses; plain WebServer.h page on port 80 shows flame states + pump state. Set SSID/PASS first.',
      board: 'esp32',
      versions: ['b'],
      code: `// Fire fighter B (ESP32): pump bursts + Wi-Fi status page on port 80.
// Pump runs 2s on / 3s off while fighting; open the printed IP to see live states.
#include <WiFi.h>
#include <WebServer.h>

const char *SSID = "YOUR_WIFI";
const char *PASS = "YOUR_PASSWORD";

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int FL_L = 34, FL_C = 35, FL_R = 36;
const int FAN = 18, BUZZER = 19, PUMP = 21;  // relays need 3V3 trigger or NPN driver
const int RELAY_ON = LOW, RELAY_OFF = HIGH;

WebServer server(80);
unsigned long fightSince = 0;
bool wasFighting = false, gL = false, gC = false, gR = false, gPump = false;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

const char *state(bool v) { return v ? "FIRE" : "clear"; }

void handleRoot() {
  String s = "<h1>Fire Fighter</h1><p>Left: ";
  s += state(gL);
  s += "<br>Center: ";
  s += state(gC);
  s += "<br>Right: ";
  s += state(gR);
  s += "<br>Pump: ";
  s += gPump ? "ON" : "OFF";
  s += "</p>";
  server.send(200, "text/html", s);
}

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(FL_L, INPUT); pinMode(FL_C, INPUT); pinMode(FL_R, INPUT);
  pinMode(FAN, OUTPUT); pinMode(BUZZER, OUTPUT); pinMode(PUMP, OUTPUT);
  digitalWrite(FAN, RELAY_OFF); digitalWrite(PUMP, RELAY_OFF);
  WiFi.begin(SSID, PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 12000) delay(250);
  Serial.print("Status page: http://");
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
  gL = digitalRead(FL_L) == LOW;
  gC = digitalRead(FL_C) == LOW;
  gR = digitalRead(FL_R) == LOW;
  bool fighting = gL || gC || gR;
  if (fighting && !wasFighting) fightSince = millis();  // restart burst cycle
  wasFighting = fighting;
  digitalWrite(FAN, fighting ? RELAY_ON : RELAY_OFF);
  digitalWrite(BUZZER, fighting ? HIGH : LOW);  // alarm while fighting
  gPump = fighting && ((millis() - fightSince) % 5000 < 2000);  // 2s on / 3s off
  digitalWrite(PUMP, gPump ? RELAY_ON : RELAY_OFF);
  if (!fighting) drive(0, 0);
  else if (gC) drive(0, 0);       // centered: stop at close range and attack
  else if (gL) drive(100, 200);   // steer toward the left flame
  else drive(200, 100);           // steer toward the right flame
  delay(50);
}`,
    },
  ],
  tips: [
    { title: 'Water bowl first', detail: 'Keep a full water bowl within arm’s reach for every candle demo, and keep all electronics away from water.' },
    { title: 'Trim-pot in real light', detail: 'Set each flame module’s sensitivity under the actual demo lighting — sunlight and tube lights shift the trip point.' },
    { title: 'Never park the pump on', detail: 'The 2s-on/3s-off bursts exist to avoid flooding; kill power immediately if the pump sticks on.' },
    { title: 'Fan before pump', detail: 'Test the fan-only A build first — if the fan alone kills the candle at close range, the pump is a bonus, not a rescue.' },
  ],
}
