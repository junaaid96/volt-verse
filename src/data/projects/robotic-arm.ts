import type { Project } from '../types'

export const roboticArm: Project = {
  slug: 'robotic-arm',
  categoryId: 'robotics',
  title: 'Robotic Arm',
  tagline: 'Potentiometer-driven 4-servo arm with record-and-playback.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,500–4,600',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Classic build: 4 servo pins plus 4 analog pots.' },
    esp32: { ok: true, note: 'Servos on GPIO13/14/16/17 (ESP32Servo), pots on ADC1 GPIO32–35 — recalibrate the limits.' },
    nodemcu: {
      ok: false,
      reason: 'Four pots need 4 ADC pins but the NodeMCU has a single A0; a multiplexer would slow the live control loop.',
    },
    esp32cam: {
      ok: false,
      reason: 'Only 2–4 free GPIO once the camera, flash and SD card are counted; the arm needs 8+ pins for servos and pots.',
    },
  },
  skills: ['Servo control', 'Analog sensing', 'Calibration', 'Motion playback'],
  scene: 'home',
  updated: 'Oct 2026',
  featured: true,
  sheets: ['arduino-uno', 'esp32', 'sg90', 'esp32servo'],
  rig: { sensor: 'arm', extras: ['servo'] },
  options: [
    {
      id: 'a',
      title: 'A. Potentiometer arm',
      level: 'Medium · easiest',
      blurb: 'Four pots drive base/shoulder/elbow/grip SG90s with per-joint travel limits and idle detach.',
      points: ['4x live joint control', 'Min/max calibration', 'Idle detach, no jitter'],
      weeks: '1–2 weeks',
      cost: '৳2,500–4,500',
    },
    {
      id: 'b',
      title: 'B. Record + playback',
      level: 'Medium · best value',
      blurb: 'Adds REC/PLAY buttons: capture up to 30 poses in RAM, then replay the routine hands-free.',
      points: ['30-pose recorder', 'Smooth glide replay', 'Blinking REC status LED'],
      weeks: '2–3 weeks',
      cost: '৳2,600–4,600',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: 'SG90 servo', qty: '4', role: 'Base/shoulder/elbow/grip joints', price: '৳700–1,200' },
    { name: '10k potentiometer + knob', qty: '4', role: 'One live dial per joint', price: '৳100–250' },
    { name: '4-DOF acrylic arm frame kit', qty: '1', role: 'Brackets, gripper + hardware', price: '৳600–1,200' },
    { name: '5V 2A+ supply (servo power)', qty: '1', role: 'Servo power — NEVER the board 5V pin', price: '৳250–450' },
    { name: 'Push button + LED', qty: '2 + 1', role: 'REC/PLAY (INPUT_PULLUP) + status', price: '৳30–80', versions: ['b'] },
    { name: 'Breadboard + jumpers', qty: '1 set', role: 'Pots, buttons + servo rails', price: '৳150–300' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'Servos BASE/SHOULDER/ELBOW/GRIP → signal', to: 'D5 / D6 / D9 / D10' },
        { from: 'Pot wipers (ends 5V/GND)', to: 'A0 / A1 / A2 / A3' },
        { from: 'REC / PLAY buttons (B)', to: 'D2 / D3 to GND (INPUT_PULLUP)' },
        { from: 'Status LED (B)', to: 'D4 via 220Ω to GND' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'Servos BASE/SHOULDER/ELBOW/GRIP → signal', to: 'GPIO13 / GPIO14 / GPIO16 / GPIO17' },
        { from: 'Pot wipers (ends 3V3/GND)', to: 'GPIO32 / GPIO33 / GPIO34 / GPIO35 (ADC1)' },
        { from: 'REC / PLAY buttons (B)', to: 'GPIO18 / GPIO19 to GND (INPUT_PULLUP)' },
        { from: 'Status LED (B)', to: 'GPIO21 via 220Ω to GND' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: '5V supply',
      pins: [
        { from: '5V 2A+ supply → servo V+', to: 'all 4 servo red wires (NOT the board 5V pin)' },
        { from: 'Supply GND →', to: 'all servo brown wires + board GND (common ground)' },
        { from: 'Board power', to: 'USB or barrel jack, separately from the servos' },
      ],
    },
  ],
  steps: [
    {
      id: 'build-arm-frame',
      title: 'Build the arm frame',
      detail: 'Assemble the 4-DOF brackets with the SG90s as base, shoulder, elbow and gripper joints. Leave every horn screw slightly loose until calibration, then tighten.',
    },
    {
      id: 'power-servos-separately',
      title: 'Power the servos separately',
      detail: 'All four servo red wires go to the 5V 2A+ supply — never the board’s 5V pin, or the board resets on every move. Tie the supply GND to the board GND.',
    },
    {
      id: 'wire-servos-pots',
      title: 'Wire servos and pots',
      detail: 'Servo signals → D5/D6/D9/D10 (base/shoulder/elbow/grip); pot wipers → A0–A3 with ends to 5V/GND. Servo power stays on the separate supply rails.',
      boardDetail: {
        esp32: 'Servo signals → GPIO13/14/16/17 (base/shoulder/elbow/grip); pot wipers → GPIO32–35 with ends to 3V3/GND. Servo power stays on the separate supply rails.',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x). Library Manager → ESP32Servo by Kevin Harrington. Select “ESP32 Dev Module”.',
      boards: ['esp32'],
    },
    {
      id: 'upload-pot-control',
      title: 'Upload the pot control sketch',
      detail: 'Upload sketch A: each pot should swing its joint live. If a joint runs backwards, flip its JMIN/JMAX pair instead of rewiring.',
    },
    {
      id: 'calibrate-joints',
      title: 'Calibrate the joint limits',
      detail: 'Edit JMIN/JMAX per joint so nothing grinds at the extremes: base 0–180, shoulder ~15–160, elbow ~10–170, gripper ~20–120. Re-upload and re-check every end.',
    },
    {
      id: 'tune-idle-detach',
      title: 'Check the idle detach',
      detail: 'Leave the pots alone for 2s: the servos detach (silent, cool) and re-attach on the next touch. If a joint buzzes at rest, narrow its limits — it is stalled.',
    },
    {
      id: 'add-record-buttons',
      title: 'Add the record buttons',
      detail: 'Wire REC from D2 to GND, PLAY from D3 to GND (INPUT_PULLUP, no resistors) and the status LED from D4 via 220Ω. Upload sketch B.',
      boardDetail: {
        esp32: 'Wire REC from GPIO18 to GND, PLAY from GPIO19 to GND (INPUT_PULLUP, no resistors) and the status LED from GPIO21 via 220Ω. Upload sketch B.',
      },
      versions: ['b'],
    },
    {
      id: 'record-routine',
      title: 'Record and replay a routine',
      detail: 'Press REC (LED blinks, memory clears), pose the arm for up to ~24s (30 poses at 800ms), press REC to stop, then PLAY to watch the smooth replay.',
      versions: ['b'],
    },
    {
      id: 'demo-pick-place',
      title: 'Demo a pick-and-place',
      detail: 'Film a full cycle: drive to a block (A) or replay a recorded grab-lift-drop routine (B). Log repeat accuracy over 5 replays for the report.',
    },
  ],
  simulator: {
    viz: 'arm',
    intro: 'Same rule as the firmware: a joint driven past its calibrated limit trips a STOP until it returns.',
    sliders: [
      { id: 'wrist', label: 'Wrist angle', unit: 'deg', min: 0, max: 180, value: 90 },
      { id: 'grip', label: 'Grip', unit: '%', min: 0, max: 100, value: 40 },
    ],
    threshold: { id: 'thr', label: 'Limit at', unit: 'deg', min: 150, max: 180, value: 170 },
    watch: 'wrist',
    rule: 'above',
    actuator: 'Joint',
    onText: 'STOP',
    offText: 'OK',
    lcd: ['Wrist:{wrist}deg', 'Joint:{act}'],
    demoSlider: 'wrist',
    demoFrom: 60,
    demoTo: 180,
    barLabel: 'Joint angle',
  },
  code: [
    {
      id: 'a',
      label: 'A · Potentiometer arm',
      note: '4 pots on A0–A3 drive base/shoulder/elbow/grip on D5/D6/D9/D10 with per-joint JMIN/JMAX limits. Servos detach after 2 s idle to stop jitter and heat.',
      board: 'uno',
      versions: ['a'],
      code: `// Robotic arm A: 4 pots drive 4 SG90s (base/shoulder/elbow/grip).
// POWER: servos MUST run from a separate 5V 2A+ supply with common GND —
// never the Uno 5V pin, or the board resets on every move.
// Servos detach after 2 s idle to stop jitter and heat.
#include <Servo.h>

Servo base, shoulder, elbow, grip;
Servo *J[4] = {&base, &shoulder, &elbow, &grip};
const int SRV_PIN[4] = {5, 6, 9, 10};  // BASE, SHOULDER, ELBOW, GRIP
const int POT[4] = {A0, A1, A2, A3};
// Per-joint travel limits: measure your frame and edit these.
const int JMIN[4] = {0, 15, 10, 20};
const int JMAX[4] = {180, 160, 170, 120};
int cur[4] = {90, 90, 90, 90};
unsigned long lastMove = 0;

void attachAll() {
  for (int i = 0; i < 4; i++)
    if (!J[i]->attached()) { J[i]->attach(SRV_PIN[i]); J[i]->write(cur[i]); }
}

void detachAll() {
  for (int i = 0; i < 4; i++)
    if (J[i]->attached()) J[i]->detach();
}

void setup() {
  attachAll();
  lastMove = millis();
}

void loop() {
  bool moved = false;
  for (int i = 0; i < 4; i++) {
    int target = map(analogRead(POT[i]), 0, 1023, JMIN[i], JMAX[i]);
    if (abs(target - cur[i]) > 2) { cur[i] = target; moved = true; }
  }
  if (moved) {
    attachAll();
    for (int i = 0; i < 4; i++) J[i]->write(cur[i]);
    lastMove = millis();
  } else if (millis() - lastMove > 2000) {
    detachAll();  // idle: silent and cool until the next touch
  }
  delay(20);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 potentiometer arm',
      note: 'Same logic as the Uno sketch. Servos on GPIO13/14/16/17 (ESP32Servo 3.x, timers auto-allocated), pots on ADC1 GPIO32–35 with a 12-bit map — recalibrate the limits.',
      board: 'esp32',
      versions: ['a'],
      code: `// Robotic arm A (ESP32): 4 pots drive 4 SG90s (base/shoulder/elbow/grip).
// POWER: servos MUST run from a separate 5V 2A+ supply with common GND —
// never the DevKit 5V pin, or the board resets on every move.
// Pots sit on ADC1 (GPIO32–35, 12-bit), so recalibrate the JMIN/JMAX feel.
#include <ESP32Servo.h>

Servo base, shoulder, elbow, grip;
Servo *J[4] = {&base, &shoulder, &elbow, &grip};
const int SRV_PIN[4] = {13, 14, 16, 17};  // BASE, SHOULDER, ELBOW, GRIP
const int POT[4] = {32, 33, 34, 35};
// Per-joint travel limits: measure your frame and edit these.
const int JMIN[4] = {0, 15, 10, 20};
const int JMAX[4] = {180, 160, 170, 120};
int cur[4] = {90, 90, 90, 90};
unsigned long lastMove = 0;

void attachAll() {
  for (int i = 0; i < 4; i++)
    if (!J[i]->attached()) { J[i]->attach(SRV_PIN[i]); J[i]->write(cur[i]); }
}

void detachAll() {
  for (int i = 0; i < 4; i++)
    if (J[i]->attached()) J[i]->detach();
}

void setup() {
  // ESP32Servo 3.x allocates LEDC timers automatically — no timer setup call needed.
  attachAll();
  lastMove = millis();
}

void loop() {
  bool moved = false;
  for (int i = 0; i < 4; i++) {
    int target = map(analogRead(POT[i]), 0, 4095, JMIN[i], JMAX[i]);  // 12-bit ADC
    if (abs(target - cur[i]) > 2) { cur[i] = target; moved = true; }
  }
  if (moved) {
    attachAll();
    for (int i = 0; i < 4; i++) J[i]->write(cur[i]);
    lastMove = millis();
  } else if (millis() - lastMove > 2000) {
    detachAll();  // idle: silent and cool until the next touch
  }
  delay(20);
}`,
    },
    {
      id: 'b',
      label: 'B · Record + playback',
      note: 'A plus REC (D2) / PLAY (D3) buttons and a status LED (D4): up to 30 poses of 4 bytes in RAM, captured every 800 ms while the LED blinks.',
      board: 'uno',
      versions: ['b'],
      code: `// Robotic arm B: record-and-playback on top of A.
// REC (D2) toggles recording: a 4-byte pose is captured every 800 ms
// (up to 30 in RAM) while the LED (D4) blinks. PLAY (D3) replays the
// routine with smooth glides. Pots still drive the arm live when idle.
#include <Servo.h>

Servo base, shoulder, elbow, grip;
Servo *J[4] = {&base, &shoulder, &elbow, &grip};
const int SRV_PIN[4] = {5, 6, 9, 10};  // BASE, SHOULDER, ELBOW, GRIP
const int POT[4] = {A0, A1, A2, A3};
const int JMIN[4] = {0, 15, 10, 20};
const int JMAX[4] = {180, 160, 170, 120};
const int REC = 2, PLAY = 3, LED = 4;  // buttons wired pin to GND
uint8_t poses[30][4];  // 30 poses x 4 joint angles = 120 bytes of RAM
int poseCount = 0;
int cur[4] = {90, 90, 90, 90};
bool recording = false;
unsigned long lastCap = 0, lastBlink = 0, lastMove = 0;
bool prevRec = false, prevPlay = false;

void attachAll() {
  for (int i = 0; i < 4; i++)
    if (!J[i]->attached()) { J[i]->attach(SRV_PIN[i]); J[i]->write(cur[i]); }
}

void detachAll() {
  for (int i = 0; i < 4; i++)
    if (J[i]->attached()) J[i]->detach();
}

bool edge(int pin, bool &prev) {
  bool now = digitalRead(pin) == LOW;  // INPUT_PULLUP: LOW = pressed
  bool hit = now && !prev;
  prev = now;
  return hit;
}

void capturePose() {
  if (poseCount >= 30) { recording = false; digitalWrite(LED, LOW); return; }
  if (poseCount > 0) {
    bool same = true;
    for (int i = 0; i < 4; i++) same &= (poses[poseCount - 1][i] == cur[i]);
    if (same) return;  // skip duplicates so 30 slots last longer
  }
  for (int i = 0; i < 4; i++) poses[poseCount][i] = (uint8_t)cur[i];
  poseCount++;
}

void playback() {
  if (poseCount == 0 || recording) return;
  attachAll();
  digitalWrite(LED, HIGH);
  for (int p = 0; p < poseCount; p++) {
    bool done = false;
    while (!done) {  // glide 1 deg per tick until the pose is reached
      done = true;
      for (int i = 0; i < 4; i++) {
        if (cur[i] < poses[p][i]) { cur[i]++; done = false; }
        else if (cur[i] > poses[p][i]) { cur[i]--; done = false; }
        J[i]->write(cur[i]);
      }
      delay(15);
    }
    delay(300);  // hold each pose
  }
  digitalWrite(LED, LOW);
  lastMove = millis();
}

void setup() {
  pinMode(REC, INPUT_PULLUP); pinMode(PLAY, INPUT_PULLUP); pinMode(LED, OUTPUT);
  attachAll();
  lastMove = millis();
}

void loop() {
  if (edge(REC, prevRec)) {  // toggle recording
    recording = !recording;
    if (recording) { poseCount = 0; capturePose(); lastCap = millis(); }
    else digitalWrite(LED, LOW);
    delay(50);  // debounce
  }
  if (edge(PLAY, prevPlay)) { playback(); delay(50); }
  if (recording) {
    if (millis() - lastBlink > 150) {  // status LED blinks while recording
      digitalWrite(LED, !digitalRead(LED));
      lastBlink = millis();
    }
    if (millis() - lastCap > 800) { capturePose(); lastCap = millis(); }
  }
  bool moved = false;  // live pot control runs in every mode
  for (int i = 0; i < 4; i++) {
    int target = map(analogRead(POT[i]), 0, 1023, JMIN[i], JMAX[i]);
    if (abs(target - cur[i]) > 2) { cur[i] = target; moved = true; }
  }
  if (moved) {
    attachAll();
    for (int i = 0; i < 4; i++) J[i]->write(cur[i]);
    lastMove = millis();
  } else if (!recording && millis() - lastMove > 2000) {
    detachAll();
  }
  delay(20);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 record + playback',
      note: 'Same logic as the Uno sketch. Servos GPIO13/14/16/17, pots ADC1 GPIO32–35 (12-bit), REC GPIO18 / PLAY GPIO19, status LED GPIO21.',
      board: 'esp32',
      versions: ['b'],
      code: `// Robotic arm B (ESP32): record-and-playback on top of A.
// REC (GPIO18) toggles recording: a 4-byte pose is captured every 800 ms
// (up to 30 in RAM) while the LED (GPIO21) blinks. PLAY (GPIO19) replays
// the routine with smooth glides. Pots still drive the arm live when idle.
#include <ESP32Servo.h>

Servo base, shoulder, elbow, grip;
Servo *J[4] = {&base, &shoulder, &elbow, &grip};
const int SRV_PIN[4] = {13, 14, 16, 17};  // BASE, SHOULDER, ELBOW, GRIP
const int POT[4] = {32, 33, 34, 35};
const int JMIN[4] = {0, 15, 10, 20};
const int JMAX[4] = {180, 160, 170, 120};
const int REC = 18, PLAY = 19, LED = 21;  // buttons wired pin to GND
uint8_t poses[30][4];  // 30 poses x 4 joint angles = 120 bytes of RAM
int poseCount = 0;
int cur[4] = {90, 90, 90, 90};
bool recording = false;
unsigned long lastCap = 0, lastBlink = 0, lastMove = 0;
bool prevRec = false, prevPlay = false;

void attachAll() {
  for (int i = 0; i < 4; i++)
    if (!J[i]->attached()) { J[i]->attach(SRV_PIN[i]); J[i]->write(cur[i]); }
}

void detachAll() {
  for (int i = 0; i < 4; i++)
    if (J[i]->attached()) J[i]->detach();
}

bool edge(int pin, bool &prev) {
  bool now = digitalRead(pin) == LOW;  // INPUT_PULLUP: LOW = pressed
  bool hit = now && !prev;
  prev = now;
  return hit;
}

void capturePose() {
  if (poseCount >= 30) { recording = false; digitalWrite(LED, LOW); return; }
  if (poseCount > 0) {
    bool same = true;
    for (int i = 0; i < 4; i++) same &= (poses[poseCount - 1][i] == cur[i]);
    if (same) return;  // skip duplicates so 30 slots last longer
  }
  for (int i = 0; i < 4; i++) poses[poseCount][i] = (uint8_t)cur[i];
  poseCount++;
}

void playback() {
  if (poseCount == 0 || recording) return;
  attachAll();
  digitalWrite(LED, HIGH);
  for (int p = 0; p < poseCount; p++) {
    bool done = false;
    while (!done) {  // glide 1 deg per tick until the pose is reached
      done = true;
      for (int i = 0; i < 4; i++) {
        if (cur[i] < poses[p][i]) { cur[i]++; done = false; }
        else if (cur[i] > poses[p][i]) { cur[i]--; done = false; }
        J[i]->write(cur[i]);
      }
      delay(15);
    }
    delay(300);  // hold each pose
  }
  digitalWrite(LED, LOW);
  lastMove = millis();
}

void setup() {
  // ESP32Servo 3.x allocates LEDC timers automatically — no timer setup call needed.
  pinMode(REC, INPUT_PULLUP); pinMode(PLAY, INPUT_PULLUP); pinMode(LED, OUTPUT);
  attachAll();
  lastMove = millis();
}

void loop() {
  if (edge(REC, prevRec)) {  // toggle recording
    recording = !recording;
    if (recording) { poseCount = 0; capturePose(); lastCap = millis(); }
    else digitalWrite(LED, LOW);
    delay(50);  // debounce
  }
  if (edge(PLAY, prevPlay)) { playback(); delay(50); }
  if (recording) {
    if (millis() - lastBlink > 150) {  // status LED blinks while recording
      digitalWrite(LED, !digitalRead(LED));
      lastBlink = millis();
    }
    if (millis() - lastCap > 800) { capturePose(); lastCap = millis(); }
  }
  bool moved = false;  // live pot control runs in every mode
  for (int i = 0; i < 4; i++) {
    int target = map(analogRead(POT[i]), 0, 4095, JMIN[i], JMAX[i]);  // 12-bit ADC
    if (abs(target - cur[i]) > 2) { cur[i] = target; moved = true; }
  }
  if (moved) {
    attachAll();
    for (int i = 0; i < 4; i++) J[i]->write(cur[i]);
    lastMove = millis();
  } else if (!recording && millis() - lastMove > 2000) {
    detachAll();
  }
  delay(20);
}`,
    },
  ],
  tips: [
    { title: 'Servos never eat from the board', detail: 'Four SG90s can pull 2A+ on a fast move — board 5V means brownout resets. Separate supply, common GND, always.' },
    { title: 'Calibrate before full sweeps', detail: 'Start with narrow JMIN/JMAX and widen slowly; a horn grinding at an extreme strips the nylon gears in seconds.' },
    { title: 'Idle detach means a relaxed arm', detail: 'Detached servos hold nothing — park the arm low before walking away, and it re-grips the moment you touch a pot.' },
    { title: 'ESP32: 12-bit pots', detail: 'The ESP32 maps 0–4095 (not 0–1023), so re-check the limit feel. ESP32Servo 3.x allocates its LEDC timers automatically — no timer setup call needed.' },
  ],
}
