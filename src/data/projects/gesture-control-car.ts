import type { Project } from '../types'

export const gestureControlCar: Project = {
  slug: 'gesture-control-car',
  categoryId: 'robotics',
  title: 'Gesture Control Car',
  tagline: 'Tilt a sensor glove and the car follows your hand over ESP-NOW.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,400–4,400',
  boards: ['ESP32', 'NodeMCU'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: false,
      reason: 'No Wi-Fi radio, so it cannot do ESP-NOW — the glove-to-car link this build depends on.',
    },
    esp32: { ok: true, note: 'Two ESP32 boards (glove sender + car receiver) talk directly over ESP-NOW on channel 1.' },
    nodemcu: { ok: true, note: 'Two NodeMCU boards work the same way; the car uses D5/D6 for PWM and the on-board LED for alerts.' },
    esp32cam: {
      ok: false,
      reason: 'The glove needs I2C display-free wiring and the car needs 6 motor pins — only 2–4 free GPIO remain after the camera.',
    },
  },
  skills: ['IMU tilt sensing', 'ESP-NOW radio', 'Motor driving', 'Two-unit pairing'],
  scene: 'home',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'mpu6050', 'espnow', 'l298n'],
  rig: { sensor: 'mpu', extras: ['chassis', 'l298n'] },
  options: [
    {
      id: 'a',
      title: 'A. Tilt-to-drive glove car',
      level: 'Medium · core build',
      blurb: 'Glove tilts forward/back/left/right drive the car F/B/L/R over ESP-NOW; flat hand stops.',
      points: ['MPU6050 tilt glove', 'ESP-NOW glove→car link', '20° tilt threshold'],
      weeks: '2 weeks',
      cost: '৳2,400–3,600',
    },
    {
      id: 'b',
      title: 'B. Proportional + e-stop',
      level: 'Medium · full control',
      blurb: 'Adds proportional speed from tilt magnitude, a shake-for-emergency-stop latch and a command buzzer on the car.',
      points: ['Tilt-magnitude speed (PWM 120–255)', 'Shake = emergency STOP latch', 'Command buzzer / LED blink'],
      weeks: '2–3 weeks',
      cost: '৳2,600–4,400',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '2', role: 'Glove sender + car receiver', price: '৳470–850 each', boards: ['esp32'] },
    { name: 'NodeMCU (ESP8266)', qty: '2', role: 'Glove sender + car receiver', price: '৳380–650 each', boards: ['nodemcu'] },
    { name: 'MPU6050 IMU module', qty: '1', role: 'Glove tilt sensor', price: '৳150–320' },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'Glove + elastic strap', qty: '1', role: 'Mounts MPU6050 + sender board', price: '৳50–150' },
    { name: 'Active buzzer 5V', qty: '1', role: 'Command beeps (ESP32 car)', price: '৳25–60', versions: ['b'], boards: ['esp32'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Jumpers + USB cables', qty: '1 set', role: 'Wiring + flashing both units', price: '৳120–280' },
  ],
  wiring: [
    {
      id: 'glove-esp32',
      label: 'Glove unit (ESP32)',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'MPU6050 VCC / GND', to: '3V3 / GND' },
        { from: 'MPU6050 SDA / SCL', to: 'GPIO21 / GPIO22' },
        { from: 'Glove battery pack +/−', to: 'VIN / GND (or USB power bank)' },
      ],
    },
    {
      id: 'glove-nodemcu',
      label: 'Glove unit (NodeMCU)',
      board: 'NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'MPU6050 VCC / GND', to: '3V3 / GND' },
        { from: 'MPU6050 SDA / SCL', to: 'D2 / D1' },
        { from: 'Glove battery pack +/−', to: 'VIN / GND (or USB power bank)' },
      ],
    },
    {
      id: 'car-esp32',
      label: 'Car unit (ESP32)',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'L298N ENA / IN1 / IN2 (left motor)', to: 'GPIO25 / GPIO26 / GPIO27' },
        { from: 'L298N IN3 / IN4 / ENB (right motor)', to: 'GPIO14 / GPIO13 / GPIO23' },
        { from: 'Buzzer +/− (B)', to: 'GPIO18 / GND (beeps on each new command)' },
      ],
    },
    {
      id: 'car-nodemcu',
      label: 'Car unit (NodeMCU)',
      board: 'NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'L298N ENA / IN1 / IN2 (left motor)', to: 'D5 / D7 / D2' },
        { from: 'L298N IN3 / IN4 / ENB (right motor)', to: 'D1 / D0 / D6' },
        { from: 'Command blink (B)', to: 'On-board LED on D4/GPIO2 (active-LOW) — no extra buzzer: D0 is IN4 and TX/GPIO1 would clash with Serial' },
      ],
    },
    {
      id: 'power',
      label: 'Car power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board VIN (battery ≤ 12V only)' },
        { from: 'Common GND', to: 'board GND + L298N GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'assemble-car-chassis',
      title: 'Assemble the car chassis',
      detail: 'Bolt the motors, wheels, caster and top plate together. Mount the L298N and the car board on the plate with the motor wires reaching OUT1–OUT4.',
    },
    {
      id: 'wire-car-driver',
      title: 'Wire the car motor driver',
      detail: 'Left channel ENA/IN1/IN2 → GPIO25/26/27; right channel IN3/IN4/ENB → GPIO14/13/23. Motor leads to OUT1/OUT2 (left) and OUT3/OUT4 (right).',
      boardDetail: {
        nodemcu: 'Left channel ENA/IN1/IN2 → D5/D7/D2; right channel IN3/IN4/ENB → D1/D0/D6. Motor leads to OUT1/OUT2 (left) and OUT3/OUT4 (right).',
      },
    },
    {
      id: 'mount-glove-imu',
      title: 'Mount the MPU6050 on the glove',
      detail: 'Strap the MPU6050 flat on the back of the glove (chip facing up) with the sender board beside it. Wire VCC→3V3, GND→GND, SDA→GPIO21, SCL→GPIO22 — flat hand must read near 0° pitch/roll.',
      boardDetail: {
        nodemcu: 'Strap the MPU6050 flat on the back of the glove (chip facing up) with the sender board beside it. Wire VCC→3V3, GND→GND, SDA→D2, SCL→D1 — flat hand must read near 0° pitch/roll.',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the board package',
      detail: 'Boards Manager → esp32 by Espressif for Wi-Fi + ESP-NOW support. No sensor libraries needed — the MPU6050 is read with raw Wire registers.',
      boardDetail: {
        nodemcu: 'Boards Manager → esp8266 by ESP8266 Community for Wi-Fi + ESP-NOW support. No sensor libraries needed — the MPU6050 is read with raw Wire registers.',
      },
    },
    {
      id: 'flash-glove-read-serial',
      title: 'Flash the glove, check Serial',
      detail: 'Upload the glove sketch and open Serial Monitor at 115200: you should see live pitch/roll values plus the glove MAC. Tilt past 20° and confirm x/y flip to ±1.',
    },
    {
      id: 'flash-car-read-mac',
      title: 'Flash the car, read its MAC',
      detail: 'Upload the car sketch and read the car MAC printed at boot — copy it exactly, you will paste it into the glove sketch next.',
    },
    {
      id: 'paste-peer-mac',
      title: 'Paste the peer MAC into the glove',
      detail: 'Replace the PEER_MAC placeholder bytes in the glove sketch with the car MAC, re-upload the glove. Both boards must stay on ESP-NOW channel 1.',
    },
    {
      id: 'pair-test-bench',
      title: 'Pair test on the bench',
      detail: 'Lift the car wheels off the table, power both units and tilt: forward/back/left/right should spin the wheels F/B/L/R, flat hand stops. If nothing moves, re-check the pasted MAC and that both boards share channel 1.',
    },
    {
      id: 'add-estop-buzzer',
      title: 'Add the e-stop + buzzer (B)',
      detail: 'Wire the buzzer + to GPIO18 (− to GND). A quick double-tilt shake latches emergency STOP; hold the glove flat for 2s to resume. The buzzer beeps on every new command.',
      boardDetail: {
        nodemcu: 'No extra wiring: the on-board LED on D4 (active-LOW) blinks on every new command and stays lit while the shake-triggered emergency STOP latch is active. Hold the glove flat for 2s to resume.',
      },
      versions: ['b'],
    },
    {
      id: 'range-test-demo',
      title: 'Range test and demo',
      detail: 'Walk the glove away from the car: control should survive 20–30m line-of-sight. Film a slalom run — tilt angle vs speed (B) makes an easy report chart.',
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: pitch past +20° drives FWD, below −20° drives BACK, flat stops.',
    sliders: [
      { id: 'pitch', label: 'Pitch', unit: '°', min: -90, max: 90, value: 0 },
      { id: 'roll', label: 'Roll', unit: '°', min: -90, max: 90, value: 0 },
    ],
    threshold: { id: 'tiltThr', label: 'Tilt threshold', unit: '°', min: 10, max: 45, value: 20 },
    watch: 'pitch',
    rule: 'above',
    actuator: 'Car',
    onText: 'FWD',
    offText: 'STOP',
    lcd: ['Pitch:{pitch} Roll:{roll}', 'Car:{act}'],
    demoSlider: 'pitch',
    demoFrom: -60,
    demoTo: 60,
    barLabel: 'Tilt',
  },
  code: [
    {
      id: 'a-glove',
      label: 'A · Glove sender (ESP32)',
      note: 'MPU6050 over raw Wire (SDA GPIO21, SCL GPIO22): wake 0x6B=0, accel from 0x3B, pitch/roll via atan2. Sends {x,y} ±1 over ESP-NOW channel 1 — paste the car MAC into PEER_MAC.',
      board: 'esp32',
      versions: ['a'],
      code: `// Gesture car A, glove (ESP32): MPU6050 tilt -> ESP-NOW {x,y} packet.
// MPU6050: VCC->3V3, GND->GND, SDA->GPIO21, SCL->GPIO22.
// Both boards must stay on ESP-NOW channel 1 (default boot channel).
#include <WiFi.h>
#include <esp_now.h>
#include <Wire.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

// Paste the CAR's MAC here (the car prints it on Serial at boot).
uint8_t PEER_MAC[6] = { 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF };

const int MPU = 0x68;
const float THRESH = 20.0;  // tilt threshold, degrees

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

int16_t mpuRead16(uint8_t reg) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  return ((int16_t)Wire.read() << 8) | Wire.read();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  mpuWrite(0x6B, 0);  // wake the MPU6050
  delay(100);
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != ESP_OK) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, PEER_MAC, 6);
  peer.channel = 1;
  peer.encrypt = false;
  esp_now_add_peer(&peer);
  Serial.print("Glove MAC: ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  int16_t ax = mpuRead16(0x3B), ay = mpuRead16(0x3D), az = mpuRead16(0x3F);
  float pitch = atan2(-(float)ax, sqrt((float)ay * ay + (float)az * az)) * 180.0 / PI;
  float roll = atan2((float)ay, (float)az) * 180.0 / PI;
  Packet p;
  p.x = (roll > THRESH) ? 1 : (roll < -THRESH) ? -1 : 0;
  p.y = (pitch > THRESH) ? 1 : (pitch < -THRESH) ? -1 : 0;
  esp_now_send(PEER_MAC, (uint8_t *)&p, sizeof(p));
  Serial.print("pitch="); Serial.print(pitch);
  Serial.print(" roll="); Serial.print(roll);
  Serial.print(" -> x="); Serial.print(p.x);
  Serial.print(" y="); Serial.println(p.y);
  delay(100);
}`,
    },
    {
      id: 'a-glove-nodemcu',
      label: 'A · Glove sender (NodeMCU)',
      note: 'Same glove logic on ESP8266: raw Wire MPU6050 (SDA D2, SCL D1), esp_now_set_self_role(COMBO) + add_peer on channel 1. Paste the car MAC into PEER_MAC.',
      board: 'nodemcu',
      versions: ['a'],
      code: `// Gesture car A, glove (NodeMCU): MPU6050 tilt -> ESP-NOW {x,y} packet.
// MPU6050: VCC->3V3, GND->GND, SDA->D2, SCL->D1.
// Both boards must stay on ESP-NOW channel 1 (default boot channel).
#include <ESP8266WiFi.h>
#include <espnow.h>
#include <Wire.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

// Paste the CAR's MAC here (the car prints it on Serial at boot).
uint8_t PEER_MAC[6] = { 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF };

const int MPU = 0x68;
const float THRESH = 20.0;  // tilt threshold, degrees

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

int16_t mpuRead16(uint8_t reg) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  return ((int16_t)Wire.read() << 8) | Wire.read();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);
  mpuWrite(0x6B, 0);  // wake the MPU6050
  delay(100);
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != 0) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_set_self_role(ESP_NOW_ROLE_COMBO);
  esp_now_add_peer(PEER_MAC, ESP_NOW_ROLE_COMBO, 1, NULL, 0);
  Serial.print("Glove MAC: ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  int16_t ax = mpuRead16(0x3B), ay = mpuRead16(0x3D), az = mpuRead16(0x3F);
  float pitch = atan2(-(float)ax, sqrt((float)ay * ay + (float)az * az)) * 180.0 / PI;
  float roll = atan2((float)ay, (float)az) * 180.0 / PI;
  Packet p;
  p.x = (roll > THRESH) ? 1 : (roll < -THRESH) ? -1 : 0;
  p.y = (pitch > THRESH) ? 1 : (pitch < -THRESH) ? -1 : 0;
  esp_now_send(PEER_MAC, (uint8_t *)&p, sizeof(p));
  Serial.print("pitch="); Serial.print(pitch);
  Serial.print(" roll="); Serial.print(roll);
  Serial.print(" -> x="); Serial.print(p.x);
  Serial.print(" y="); Serial.println(p.y);
  delay(100);
}`,
    },
    {
      id: 'a-car',
      label: 'A · Car receiver (ESP32)',
      note: 'ESP-NOW receiver driving the L298N (ENA=25,IN1=26,IN2=27,IN3=14,IN4=13,ENB=23). Prints its own MAC at boot for the glove PEER_MAC. Flat glove = STOP.',
      board: 'esp32',
      versions: ['a'],
      code: `// Gesture car A, car (ESP32): ESP-NOW receiver -> L298N drive.
// L298N: ENA=25,IN1=26,IN2=27,IN3=14,IN4=13,ENB=23. Stay on channel 1.
#include <WiFi.h>
#include <esp_now.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int SPEED = 200;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void onRecv(const esp_now_recv_info_t *info, const uint8_t *data, int len) {
  (void)info;  // ESP32 core 3.x passes sender info first; we only need the packet
  if (len < (int)sizeof(Packet)) return;
  Packet p;
  memcpy(&p, data, sizeof(p));
  if (p.y > 0) drive(SPEED, SPEED);        // tilt forward
  else if (p.y < 0) drive(-SPEED, -SPEED); // tilt back
  else if (p.x > 0) drive(SPEED, -SPEED);  // tilt right
  else if (p.x < 0) drive(-SPEED, SPEED);  // tilt left
  else drive(0, 0);                        // flat = STOP
}

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != ESP_OK) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_register_recv_cb(onRecv);
  Serial.print("Car MAC (paste into glove PEER_MAC): ");
  Serial.println(WiFi.macAddress());
}

void loop() { delay(100); }`,
    },
    {
      id: 'a-car-nodemcu',
      label: 'A · Car receiver (NodeMCU)',
      note: 'Same receiver on ESP8266: L298N on ENA=D5,ENB=D6,IN1=D7,IN2=D2,IN3=D1,IN4=D0 with analogWriteRange(255). Prints its MAC at boot for the glove PEER_MAC.',
      board: 'nodemcu',
      versions: ['a'],
      code: `// Gesture car A, car (NodeMCU): ESP-NOW receiver -> L298N drive.
// L298N: ENA=D5,IN1=D7,IN2=D2,IN3=D1,IN4=D0,ENB=D6. Stay on channel 1.
#include <ESP8266WiFi.h>
#include <espnow.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

const int ENA = D5, IN1 = D7, IN2 = D2;  // left motor
const int IN3 = D1, IN4 = D0, ENB = D6;  // right motor
const int SPEED = 200;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void onRecv(uint8_t *mac, uint8_t *data, uint8_t len) {
  if (len < sizeof(Packet)) return;
  Packet p;
  memcpy(&p, data, sizeof(p));
  if (p.y > 0) drive(SPEED, SPEED);        // tilt forward
  else if (p.y < 0) drive(-SPEED, -SPEED); // tilt back
  else if (p.x > 0) drive(SPEED, -SPEED);  // tilt right
  else if (p.x < 0) drive(-SPEED, SPEED);  // tilt left
  else drive(0, 0);                        // flat = STOP
}

void setup() {
  Serial.begin(115200);
  analogWriteRange(255);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != 0) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_set_self_role(ESP_NOW_ROLE_COMBO);
  esp_now_register_recv_cb(onRecv);
  Serial.print("Car MAC (paste into glove PEER_MAC): ");
  Serial.println(WiFi.macAddress());
}

void loop() { delay(100); }`,
    },
    {
      id: 'b-glove',
      label: 'B · Glove sender + e-stop (ESP32)',
      note: 'Same wiring as A. Sends proportional tilt (−100..+100 per axis); a quick double-tilt shake sends x=127 to latch emergency STOP — hold flat 2s to resume.',
      board: 'esp32',
      versions: ['b'],
      code: `// Gesture car B, glove (ESP32): proportional tilt + shake e-stop.
// Same wiring as A. Shake = two fast roll reversals past 45 deg; flat 2s resumes.
#include <WiFi.h>
#include <esp_now.h>
#include <Wire.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

// Paste the CAR's MAC here (the car prints it on Serial at boot).
uint8_t PEER_MAC[6] = { 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF };

const int MPU = 0x68;
const float THRESH = 20.0;  // dead zone, degrees
const float FULL = 60.0;    // tilt that maps to full scale

bool estop = false;
unsigned long flatSince = 0;
int lastRollSign = 0, flips = 0;
unsigned long lastFlip = 0;

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

int16_t mpuRead16(uint8_t reg) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  return ((int16_t)Wire.read() << 8) | Wire.read();
}

int8_t scaleTilt(float deg) {  // dead zone + linear map to -100..100
  if (fabs(deg) < THRESH) return 0;
  float m = (fabs(deg) - THRESH) / (FULL - THRESH);
  if (m > 1) m = 1;
  return (int8_t)((deg > 0 ? 1 : -1) * (int)(m * 100));
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  mpuWrite(0x6B, 0);  // wake the MPU6050
  delay(100);
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != ESP_OK) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, PEER_MAC, 6);
  peer.channel = 1;
  peer.encrypt = false;
  esp_now_add_peer(&peer);
}

void loop() {
  int16_t ax = mpuRead16(0x3B), ay = mpuRead16(0x3D), az = mpuRead16(0x3F);
  float pitch = atan2(-(float)ax, sqrt((float)ay * ay + (float)az * az)) * 180.0 / PI;
  float roll = atan2((float)ay, (float)az) * 180.0 / PI;
  int s = (roll > 45) ? 1 : (roll < -45) ? -1 : 0;  // shake detector
  if (s != 0 && s != lastRollSign) {
    flips = (millis() - lastFlip < 800) ? flips + 1 : 1;
    lastFlip = millis();
    lastRollSign = s;
    if (flips >= 2 && !estop) { estop = true; Serial.println("E-STOP latched!"); }
  }
  Packet p;
  if (estop) {
    p.x = 127; p.y = 0;  // reserved e-stop packet
    if (fabs(pitch) < 10 && fabs(roll) < 10) {  // flat 2s resumes
      if (flatSince == 0) flatSince = millis();
      if (millis() - flatSince > 2000) { estop = false; flatSince = 0; Serial.println("Resumed."); }
    } else flatSince = 0;
  } else {
    p.x = scaleTilt(roll);
    p.y = scaleTilt(pitch);
  }
  esp_now_send(PEER_MAC, (uint8_t *)&p, sizeof(p));
  delay(80);
}`,
    },
    {
      id: 'b-glove-nodemcu',
      label: 'B · Glove sender + e-stop (NodeMCU)',
      note: 'Same B glove logic on ESP8266 (SDA D2, SCL D1): proportional −100..+100 tilt, shake sends x=127 e-stop, flat 2s resumes.',
      board: 'nodemcu',
      versions: ['b'],
      code: `// Gesture car B, glove (NodeMCU): proportional tilt + shake e-stop.
// Same wiring as A. Shake = two fast roll reversals past 45 deg; flat 2s resumes.
#include <ESP8266WiFi.h>
#include <espnow.h>
#include <Wire.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

// Paste the CAR's MAC here (the car prints it on Serial at boot).
uint8_t PEER_MAC[6] = { 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF };

const int MPU = 0x68;
const float THRESH = 20.0;  // dead zone, degrees
const float FULL = 60.0;    // tilt that maps to full scale

bool estop = false;
unsigned long flatSince = 0;
int lastRollSign = 0, flips = 0;
unsigned long lastFlip = 0;

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

int16_t mpuRead16(uint8_t reg) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  return ((int16_t)Wire.read() << 8) | Wire.read();
}

int8_t scaleTilt(float deg) {  // dead zone + linear map to -100..100
  if (fabs(deg) < THRESH) return 0;
  float m = (fabs(deg) - THRESH) / (FULL - THRESH);
  if (m > 1) m = 1;
  return (int8_t)((deg > 0 ? 1 : -1) * (int)(m * 100));
}

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);
  mpuWrite(0x6B, 0);  // wake the MPU6050
  delay(100);
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != 0) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_set_self_role(ESP_NOW_ROLE_COMBO);
  esp_now_add_peer(PEER_MAC, ESP_NOW_ROLE_COMBO, 1, NULL, 0);
}

void loop() {
  int16_t ax = mpuRead16(0x3B), ay = mpuRead16(0x3D), az = mpuRead16(0x3F);
  float pitch = atan2(-(float)ax, sqrt((float)ay * ay + (float)az * az)) * 180.0 / PI;
  float roll = atan2((float)ay, (float)az) * 180.0 / PI;
  int s = (roll > 45) ? 1 : (roll < -45) ? -1 : 0;  // shake detector
  if (s != 0 && s != lastRollSign) {
    flips = (millis() - lastFlip < 800) ? flips + 1 : 1;
    lastFlip = millis();
    lastRollSign = s;
    if (flips >= 2 && !estop) { estop = true; Serial.println("E-STOP latched!"); }
  }
  Packet p;
  if (estop) {
    p.x = 127; p.y = 0;  // reserved e-stop packet
    if (fabs(pitch) < 10 && fabs(roll) < 10) {  // flat 2s resumes
      if (flatSince == 0) flatSince = millis();
      if (millis() - flatSince > 2000) { estop = false; flatSince = 0; Serial.println("Resumed."); }
    } else flatSince = 0;
  } else {
    p.x = scaleTilt(roll);
    p.y = scaleTilt(pitch);
  }
  esp_now_send(PEER_MAC, (uint8_t *)&p, sizeof(p));
  delay(80);
}`,
    },
    {
      id: 'b-car',
      label: 'B · Car receiver + buzzer (ESP32)',
      note: 'Proportional PWM 120–255 from tilt magnitude, buzzer on GPIO18 beeps on each new command, x=127 latches emergency STOP until the glove holds flat 2s.',
      board: 'esp32',
      versions: ['b'],
      code: `// Gesture car B, car (ESP32): proportional speed + command buzzer + e-stop.
// L298N: ENA=25,IN1=26,IN2=27,IN3=14,IN4=13,ENB=23; buzzer GPIO18. Channel 1.
#include <WiFi.h>
#include <esp_now.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int BUZZER = 18;

bool estop = false;
unsigned long flatSince = 0;
int lastCmd = 0;
volatile bool beepReq = false;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void onRecv(const esp_now_recv_info_t *info, const uint8_t *data, int len) {
  (void)info;  // ESP32 core 3.x passes sender info first; we only need the packet
  if (len < (int)sizeof(Packet)) return;
  Packet p;
  memcpy(&p, data, sizeof(p));
  if (p.x == 127) {  // e-stop packet
    if (!estop) { estop = true; beepReq = true; }
    drive(0, 0);
    return;
  }
  if (estop) {  // resume only after glove holds flat ({0,0}) for 2s
    if (p.x == 0 && p.y == 0) {
      if (flatSince == 0) flatSince = millis();
      if (millis() - flatSince > 2000) { estop = false; flatSince = 0; beepReq = true; }
    } else flatSince = 0;
    drive(0, 0);
    return;
  }
  int cmd = (p.y != 0) ? (p.y > 0 ? 1 : 2) : (p.x != 0 ? (p.x > 0 ? 3 : 4) : 0);
  if (cmd != lastCmd) { lastCmd = cmd; beepReq = true; }  // beep on new command
  int mag = max(abs((int)p.x), abs((int)p.y));
  int pwm = (mag == 0) ? 0 : map(mag, 1, 100, 120, 255);  // proportional speed
  if (p.y > 0) drive(pwm, pwm);
  else if (p.y < 0) drive(-pwm, -pwm);
  else if (p.x > 0) drive(pwm, -pwm);
  else if (p.x < 0) drive(-pwm, pwm);
  else drive(0, 0);
}

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != ESP_OK) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_register_recv_cb(onRecv);
  Serial.print("Car MAC (paste into glove PEER_MAC): ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  if (beepReq) {  // beep outside the radio callback
    beepReq = false;
    digitalWrite(BUZZER, HIGH); delay(80); digitalWrite(BUZZER, LOW);
  }
  delay(20);
}`,
    },
    {
      id: 'b-car-nodemcu',
      label: 'B · Car receiver + LED (NodeMCU)',
      note: 'Same B logic on ESP8266 (ENA=D5,ENB=D6,IN1=D7,IN2=D2,IN3=D1,IN4=D0). No spare pin for a buzzer, so the on-board D4 LED (active-LOW) blinks per command and stays lit during e-stop.',
      board: 'nodemcu',
      versions: ['b'],
      code: `// Gesture car B, car (NodeMCU): proportional speed + LED blink + e-stop.
// L298N: ENA=D5,IN1=D7,IN2=D2,IN3=D1,IN4=D0,ENB=D6. On-board LED D4. Channel 1.
#include <ESP8266WiFi.h>
#include <espnow.h>

struct Packet { int8_t x; int8_t y; };  // shared glove<->car packet

const int ENA = D5, IN1 = D7, IN2 = D2;  // left motor
const int IN3 = D1, IN4 = D0, ENB = D6;  // right motor
const int LED = D4;  // on-board LED, active-LOW

bool estop = false;
unsigned long flatSince = 0;
int lastCmd = 0;
volatile bool blinkReq = false;

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void onRecv(uint8_t *mac, uint8_t *data, uint8_t len) {
  if (len < sizeof(Packet)) return;
  Packet p;
  memcpy(&p, data, sizeof(p));
  if (p.x == 127) {  // e-stop packet
    if (!estop) { estop = true; blinkReq = true; }
    drive(0, 0);
    return;
  }
  if (estop) {  // resume only after glove holds flat ({0,0}) for 2s
    if (p.x == 0 && p.y == 0) {
      if (flatSince == 0) flatSince = millis();
      if (millis() - flatSince > 2000) { estop = false; flatSince = 0; blinkReq = true; }
    } else flatSince = 0;
    drive(0, 0);
    return;
  }
  int cmd = (p.y != 0) ? (p.y > 0 ? 1 : 2) : (p.x != 0 ? (p.x > 0 ? 3 : 4) : 0);
  if (cmd != lastCmd) { lastCmd = cmd; blinkReq = true; }  // blink on new command
  int mag = max(abs((int)p.x), abs((int)p.y));
  int pwm = (mag == 0) ? 0 : map(mag, 1, 100, 120, 255);  // proportional speed
  if (p.y > 0) drive(pwm, pwm);
  else if (p.y < 0) drive(-pwm, -pwm);
  else if (p.x > 0) drive(pwm, -pwm);
  else if (p.x < 0) drive(-pwm, pwm);
  else drive(0, 0);
}

void setup() {
  Serial.begin(115200);
  analogWriteRange(255);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(LED, OUTPUT);
  digitalWrite(LED, HIGH);  // LED off (active-LOW)
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != 0) { Serial.println("ESP-NOW init failed"); while (true) delay(100); }
  esp_now_set_self_role(ESP_NOW_ROLE_COMBO);
  esp_now_register_recv_cb(onRecv);
  Serial.print("Car MAC (paste into glove PEER_MAC): ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  if (estop) {
    digitalWrite(LED, LOW);  // solid on while e-stop is latched
  } else if (blinkReq) {  // blink outside the radio callback
    blinkReq = false;
    digitalWrite(LED, LOW); delay(120); digitalWrite(LED, HIGH);
  }
  delay(20);
}`,
    },
  ],
  tips: [
    { title: 'Copy the MAC exactly', detail: 'One wrong hex digit in PEER_MAC and the car never moves — paste from Serial Monitor, never retype.' },
    { title: 'Keep both boards on channel 1', detail: 'If either sketch connects to a Wi-Fi router it can hop channels and ESP-NOW goes silent; neither sketch joins a network, so leave it that way.' },
    { title: 'Mount the IMU flat', detail: 'If the MPU6050 sits tilted on the glove, flat hand reads 10–15° and the car creeps — remount it level or raise THRESH slightly.' },
    { title: 'Shake decisively for e-stop', detail: 'Two fast wrist flicks past 45° within a second latch the stop; slow waves just steer. Hold flat 2s to resume.' },
  ],
}
