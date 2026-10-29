import type { Project } from '../types'

export const smartDustbin: Project = {
  slug: 'smart-dustbin',
  categoryId: 'iot',
  title: 'IoT Smart Dustbin',
  tagline: 'Fill-level sensing with auto lid and collection alerts.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,700–3,000',
  boards: ['Arduino Uno', 'ESP8266', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: {
      ok: true,
      note: 'Version A runs as-is. Version B needs an ESP-01 Wi-Fi link (Blynk ESP8266-shield mode) — or build B on NodeMCU/ESP32.',
    },
    esp32: { ok: true, note: 'HC-SR04 ECHO pins need 1k/2k dividers; the servo needs its own 5V.' },
    nodemcu: {
      ok: true,
      note: 'Tight on pins: two fill LEDs use D3/D4 wired active-LOW and one uses TX, so the final sketch can’t use Serial.',
    },
    esp32cam: {
      ok: false,
      reason: 'Two HC-SR04s, a servo, 4 LEDs and a buzzer need 10 GPIO; the ESP32-CAM has only 2–4 free pins.',
    },
  },
  skills: ['Ultrasonic sensing', 'Servo control', 'Blynk', 'Route logic'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp8266', 'esp32', 'hcsr04', 'sg90', 'mq135', 'esp-01', 'blynk-docs'],
  rig: { sensor: 'sonic', extras: ['sonic', 'servo'] },
  options: [
    {
      id: 'a',
      title: 'A. Auto-lid bin',
      level: 'Basic · easiest',
      blurb: 'Hand-approach servo lid + interior fill sensor with LED bar. Great tabletop demo.',
      points: ['Touch-free lid', '4-LED fill bar', 'Overflow buzzer'],
      weeks: '1 week',
      cost: '৳1,700–2,300',
    },
    {
      id: 'b',
      title: 'B. Fleet + alerts',
      level: 'Medium · best value',
      blurb: 'Wi-Fi bins report fill % to Blynk; full bins trigger collection alerts + route list.',
      points: ['Multi-bin dashboard', 'FULL push alerts', 'Collection route order'],
      weeks: '2 weeks',
      cost: '৳2,200–3,000',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳380–550', boards: ['nodemcu'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    {
      name: 'ESP-01 + 5V adapter + USB programmer',
      qty: '1',
      role: 'Wi-Fi link for Blynk',
      price: '৳350–600',
      boards: ['uno'],
      versions: ['b'],
    },
    { name: 'HC-SR04 ultrasonic', qty: '2', role: 'Fill + hand sense', price: '৳150–500' },
    { name: '1k + 2k resistors', qty: '2 + 2', role: 'ECHO 5V → 3.3V dividers', price: '৳10–30', boards: ['esp32', 'nodemcu'] },
    { name: 'SG90 servo', qty: '1', role: 'Lid actuator', price: '৳180–300' },
    { name: 'LED bar / 4 LEDs + buzzer', qty: '1 set', role: 'Fill display + overflow alarm', price: '৳60–150' },
    { name: 'MQ135 (optional)', qty: '1', role: 'Odor index', price: '৳180–350', versions: ['b'] },
    { name: 'Bin + lid hinge', qty: '1', role: 'Demo body', price: '৳300–500' },
    { name: '5V 2A supply + jumpers', qty: '1 set', role: 'Servo + board power', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'Fill HC-SR04 → TRIG/ECHO', to: 'D9 / D10' },
        { from: 'Hand HC-SR04 → TRIG/ECHO', to: 'D5 / D6' },
        { from: 'Servo → signal', to: 'D3' },
        { from: 'LED bar (25/50/75/90%) →', to: 'D7, D8, D11, D12 via 220Ω' },
        { from: 'Buzzer →', to: 'D4' },
        { from: 'MQ135 → AO (B)', to: 'A2' },
        { from: 'ESP-01 adapter TX → (B)', to: 'A0 (SoftwareSerial RX)' },
        { from: 'A1 → 1k/2k divider → (B)', to: 'ESP-01 adapter RX' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'Fill HC-SR04 → TRIG / ECHO', to: 'GPIO26 / GPIO27 (1k/2k divider)' },
        { from: 'Hand HC-SR04 → TRIG / ECHO', to: 'GPIO32 / GPIO33 (1k/2k divider)' },
        { from: 'Servo → signal', to: 'GPIO13 (ESP32Servo)' },
        { from: 'LED bar (25/50/75/90%) →', to: 'GPIO16, 17, 18, 19 via 220Ω' },
        { from: 'Buzzer →', to: 'GPIO23 via NPN transistor' },
        { from: 'MQ135 → AO (B)', to: '10k/20k divider → GPIO34 (ADC1)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'Fill HC-SR04 → TRIG / ECHO', to: 'D7 / D6 (1k/2k divider!)' },
        { from: 'Hand HC-SR04 → TRIG / ECHO', to: 'D1 / D2 (1k/2k divider!)' },
        { from: 'Servo → signal', to: 'D5' },
        { from: 'LED 25% / 90% →', to: 'D8 / TX via 220Ω to GND' },
        { from: 'LED 50% / 75% →', to: 'D3 / D4, wired 3V3 → 220Ω → LED → pin (active-LOW keeps boot HIGH)' },
        { from: 'Buzzer →', to: 'D0 via NPN transistor' },
        { from: 'MQ135 → AO (B)', to: '10k/20k divider → A0' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: '5V supply',
      pins: [
        { from: '5V supply → servo V+', to: 'servo red wire (not the board’s 5V pin)' },
        { from: '5V supply → HC-SR04 VCC', to: 'both sensors (5V parts)' },
        { from: 'Supply GND →', to: 'board GND (common ground)' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-board-core',
      title: 'Install the board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x). Libraries: ESP32Servo, Blynk.',
      boardDetail: {
        nodemcu: 'Boards Manager → esp8266 by ESP8266 Community, board “NodeMCU 1.0”. Library: Blynk (Servo ships with the core).',
      },
      boards: ['esp32', 'nodemcu'],
    },
    {
      id: 'wire-sensors',
      title: 'Wire sensors and lid',
      detail: 'Fill TRIG/ECHO→D9/D10, hand TRIG/ECHO→D5/D6, servo signal→D3, LEDs→D7/D8/D11/D12 via 220Ω, buzzer→D4. HC-SR04s connect directly.',
      boardDetail: {
        esp32: 'Fill TRIG→GPIO26, ECHO→27; hand TRIG→32, ECHO→33 — both ECHOs via 1k/2k dividers. Servo→GPIO13, LEDs→16/17/18/19, buzzer→23.',
        nodemcu: 'Fill TRIG→D7, ECHO→D6; hand TRIG→D1, ECHO→D2 — both ECHOs via 1k/2k dividers. Servo→D5, buzzer→D0, LEDs on D8/D3/D4/TX.',
      },
    },
    {
      id: 'power-servo',
      title: 'Power the servo separately',
      detail: 'Servo and HC-SR04s run from the 5V 2A supply; tie its GND to the board GND. A stalling SG90 on the board’s 5V pin causes resets.',
    },
    { id: 'mount-fill-sensor', title: 'Mount the fill sensor', detail: 'HC-SR04 under the lid pointing down. Map empty/full distances to 0–100%.' },
    {
      id: 'hand-approach-lid',
      title: 'Hand-approach lid',
      detail: 'Second sensor outside: hand within 25cm → servo opens, closes 3s after the hand leaves. A missed echo counts as “no hand”, so it doesn’t flap.',
    },
    { id: 'led-fill-bar', title: 'LED fill bar', detail: '4 LEDs at 25/50/75/90%. Buzzer chirp at 90%, solid tone at 100%.' },
    {
      id: 'lid-safety',
      title: 'Lid safety',
      detail: 'Lid never closes while a hand is present; the SG90’s low torque keeps fingers safe — don’t swap in a metal-gear MG996R.',
    },
    {
      id: 'link-esp01-wifi',
      title: 'Add the ESP-01 Wi-Fi link',
      detail: 'Set the ESP-01 AT firmware to 9600 baud (AT+UART_DEF=9600,8,1,0,0), then use Blynk’s ESP8266_Lib + BlynkSimpleShieldEsp8266 on SoftwareSerial A0/A1.',
      boards: ['uno'],
      versions: ['b'],
    },
    {
      id: 'cloud-fleet',
      title: 'Cloud fleet',
      detail: 'Each bin posts fill% to Blynk (V0); a bin_full event fires once per fill. The dashboard sorts bins by fill for the truck route.',
      versions: ['b'],
    },
    {
      id: 'demo-the-cycle',
      title: 'Demo the cycle',
      detail: 'Film: approach → lid opens → fill rises → LED bar climbs → buzzer at 90% (A) / FULL alert on the phone (B).',
    },
  ],
  simulator: {
    viz: 'tank',
    intro: 'Same rule as the firmware: fill above the limit flags the bin FULL and alerts collection.',
    sliders: [
      { id: 'fill', label: 'Fill level', unit: '%', min: 0, max: 100, value: 62 },
      { id: 'odor', label: 'Odor index', unit: '', min: 0, max: 500, value: 150 },
    ],
    threshold: { id: 'thr', label: 'FULL above', unit: '%', min: 60, max: 95, value: 85 },
    watch: 'fill',
    rule: 'above',
    actuator: 'Status',
    onText: 'FULL',
    offText: 'ok',
    lcd: ['Fill:{fill}% O:{odor}', 'Bin:{act}'],
    demoSlider: 'fill',
    demoFrom: 40,
    demoTo: 98,
    barLabel: 'Fill level',
  },
  code: [
    {
      id: 'a',
      label: 'A · Lid + fill bar',
      note: 'Two HC-SR04: one for the hand, one for fill (median of 5). Servo detaches when the lid is shut.',
      board: 'uno',
      versions: ['a'],
      code: `#include <Servo.h>
Servo lid;
const int F_TRIG = 9, F_ECHO = 10, H_TRIG = 5, H_ECHO = 6;
const int SERVO_PIN = 3, BUZZER = 4;
const int LEDS[4] = {7, 8, 11, 12};
const int STEPS[4] = {25, 50, 75, 90};
unsigned long lastHand = 0, lastFill = 0;
int fill = 0;

long dist(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long us = pulseIn(echo, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

int readFill() {  // median of 5 ignores spiky echoes
  long d[5];
  for (int i = 0; i < 5; i++) { d[i] = dist(F_TRIG, F_ECHO); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && d[j] < d[j - 1]; j--) { long t = d[j]; d[j] = d[j - 1]; d[j - 1] = t; }
  return constrain(map(d[2], 30, 5, 0, 100), 0, 100);  // 30cm empty, 5cm full
}

void checkLid() {
  if (dist(H_TRIG, H_ECHO) < 25) lastHand = millis();
  bool open = lastHand && millis() - lastHand < 3000;  // stays open while a hand is there
  if (open && !lid.attached()) { lid.attach(SERVO_PIN); lid.write(90); }
  if (!open && lid.attached()) { lid.write(0); delay(400); lid.detach(); }
}

void setup() {
  pinMode(F_TRIG, OUTPUT); pinMode(F_ECHO, INPUT);
  pinMode(H_TRIG, OUTPUT); pinMode(H_ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  for (int l : LEDS) pinMode(l, OUTPUT);
  lid.attach(SERVO_PIN); lid.write(0); delay(400); lid.detach();
}

void loop() {
  checkLid();
  if (!lid.attached() && millis() - lastFill > 1000) { fill = readFill(); lastFill = millis(); }
  for (int i = 0; i < 4; i++) digitalWrite(LEDS[i], fill >= STEPS[i]);
  digitalWrite(BUZZER, fill >= 100 || (fill >= 90 && millis() % 2000 < 100));
  delay(50);
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · NodeMCU lid + fill bar',
      note: 'Same logic as the Uno sketch. Fill D7/D6, hand D1/D2 (ECHOs via 1k/2k), servo D5, buzzer D0 (NPN). LEDs D8/TX normal, D3/D4 active-LOW — TX is an LED, so no Serial.',
      board: 'nodemcu',
      versions: ['a'],
      code: `#include <Servo.h>
Servo lid;
const int F_TRIG = D7, F_ECHO = D6, H_TRIG = D1, H_ECHO = D2;
const int SERVO_PIN = D5, BUZZER = D0;
const int LEDS[4] = {D8, D3, D4, 1};  // 25/50/75/90 %; 1 = TX, so no Serial
const bool ACTIVE_LOW[4] = {false, true, true, false};
const int STEPS[4] = {25, 50, 75, 90};
unsigned long lastHand = 0, lastFill = 0;
int fill = 0;

long dist(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long us = pulseIn(echo, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

int readFill() {  // median of 5 ignores spiky echoes
  long d[5];
  for (int i = 0; i < 5; i++) { d[i] = dist(F_TRIG, F_ECHO); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && d[j] < d[j - 1]; j--) { long t = d[j]; d[j] = d[j - 1]; d[j - 1] = t; }
  return constrain(map(d[2], 30, 5, 0, 100), 0, 100);  // 30cm empty, 5cm full
}

void checkLid() {
  if (dist(H_TRIG, H_ECHO) < 25) lastHand = millis();
  bool open = lastHand && millis() - lastHand < 3000;  // stays open while a hand is there
  if (open && !lid.attached()) { lid.attach(SERVO_PIN); lid.write(90); }
  if (!open && lid.attached()) { lid.write(0); delay(400); lid.detach(); }
}

void setup() {
  pinMode(F_TRIG, OUTPUT); pinMode(F_ECHO, INPUT);
  pinMode(H_TRIG, OUTPUT); pinMode(H_ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  for (int i = 0; i < 4; i++) {
    pinMode(LEDS[i], OUTPUT);
    digitalWrite(LEDS[i], ACTIVE_LOW[i]);  // all LEDs off
  }
  lid.attach(SERVO_PIN); lid.write(0); delay(400); lid.detach();
}

void loop() {
  checkLid();
  if (!lid.attached() && millis() - lastFill > 1000) { fill = readFill(); lastFill = millis(); }
  for (int i = 0; i < 4; i++) digitalWrite(LEDS[i], (fill >= STEPS[i]) != ACTIVE_LOW[i]);
  digitalWrite(BUZZER, fill >= 100 || (fill >= 90 && millis() % 2000 < 100));
  delay(50);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 lid + fill bar',
      note: 'Same logic as the Uno sketch. Fill GPIO26/27, hand GPIO32/33 (ECHOs via 1k/2k), servo GPIO13 (ESP32Servo), LEDs GPIO16–19, buzzer GPIO23 via NPN.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <ESP32Servo.h>
Servo lid;
const int F_TRIG = 26, F_ECHO = 27, H_TRIG = 32, H_ECHO = 33;
const int SERVO_PIN = 13, BUZZER = 23;
const int LEDS[4] = {16, 17, 18, 19};
const int STEPS[4] = {25, 50, 75, 90};
unsigned long lastHand = 0, lastFill = 0;
int fill = 0;

long dist(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long us = pulseIn(echo, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

int readFill() {  // median of 5 ignores spiky echoes
  long d[5];
  for (int i = 0; i < 5; i++) { d[i] = dist(F_TRIG, F_ECHO); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && d[j] < d[j - 1]; j--) { long t = d[j]; d[j] = d[j - 1]; d[j - 1] = t; }
  return constrain(map(d[2], 30, 5, 0, 100), 0, 100);  // 30cm empty, 5cm full
}

void checkLid() {
  if (dist(H_TRIG, H_ECHO) < 25) lastHand = millis();
  bool open = lastHand && millis() - lastHand < 3000;  // stays open while a hand is there
  if (open && !lid.attached()) { lid.attach(SERVO_PIN); lid.write(90); }
  if (!open && lid.attached()) { lid.write(0); delay(400); lid.detach(); }
}

void setup() {
  pinMode(F_TRIG, OUTPUT); pinMode(F_ECHO, INPUT);
  pinMode(H_TRIG, OUTPUT); pinMode(H_ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  for (int l : LEDS) pinMode(l, OUTPUT);
  lid.attach(SERVO_PIN); lid.write(0); delay(400); lid.detach();
}

void loop() {
  checkLid();
  if (!lid.attached() && millis() - lastFill > 1000) { fill = readFill(); lastFill = millis(); }
  for (int i = 0; i < 4; i++) digitalWrite(LEDS[i], fill >= STEPS[i]);
  digitalWrite(BUZZER, fill >= 100 || (fill >= 90 && millis() % 2000 < 100));
  delay(50);
}`,
    },
    {
      id: 'b',
      label: 'B · Blynk fleet',
      note: 'Full A logic + fill% on V0, MQ135 raw on V1, one bin_full event per fill. Bin ID per device.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#define BLYNK_TEMPLATE_NAME "Smart Dustbin"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <Servo.h>
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
const int F_TRIG = D7, F_ECHO = D6, H_TRIG = D1, H_ECHO = D2;
const int SERVO_PIN = D5, BUZZER = D0;
const int LEDS[4] = {D8, D3, D4, 1};  // 25/50/75/90 %; 1 = TX, so no Serial
const bool ACTIVE_LOW[4] = {false, true, true, false};
const int STEPS[4] = {25, 50, 75, 90};
const int BIN_ID = 1, FULL_AT = 85;
Servo lid;
BlynkTimer timer;
unsigned long lastHand = 0;
int fill = 0;
bool alerted = false;

long dist(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long us = pulseIn(echo, HIGH, 30000);
  return us ? us / 58 : 999;
}

int readFill() {
  long d[5];
  for (int i = 0; i < 5; i++) { d[i] = dist(F_TRIG, F_ECHO); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && d[j] < d[j - 1]; j--) { long t = d[j]; d[j] = d[j - 1]; d[j - 1] = t; }
  return constrain(map(d[2], 30, 5, 0, 100), 0, 100);
}

void report() {
  if (lid.attached()) return;  // sensor tilts with the open lid
  fill = readFill();
  Blynk.virtualWrite(V0, fill);
  Blynk.virtualWrite(V1, analogRead(A0));
  if (fill > FULL_AT && !alerted) {
    String msg = "Bin " + String(BIN_ID) + " needs collection";
    Blynk.logEvent("bin_full", msg.c_str());
    alerted = true;
  }
  if (fill < 50) alerted = false;  // re-arm after emptying
}

void setup() {
  pinMode(F_TRIG, OUTPUT); pinMode(F_ECHO, INPUT);
  pinMode(H_TRIG, OUTPUT); pinMode(H_ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  for (int l : LEDS) pinMode(l, OUTPUT);
  lid.attach(SERVO_PIN); lid.write(0); delay(400); lid.detach();
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
  timer.setInterval(2000L, report);
}

void loop() {
  Blynk.run(); timer.run();
  if (dist(H_TRIG, H_ECHO) < 25) lastHand = millis();
  bool open = lastHand && millis() - lastHand < 3000;
  if (open && !lid.attached()) { lid.attach(SERVO_PIN); lid.write(90); }
  if (!open && lid.attached()) { lid.write(0); delay(400); lid.detach(); }
  for (int i = 0; i < 4; i++) digitalWrite(LEDS[i], (fill >= STEPS[i]) != ACTIVE_LOW[i]);
  digitalWrite(BUZZER, fill >= 100 || (fill >= 90 && millis() % 2000 < 100));
  delay(50);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 Blynk fleet',
      note: 'Full A logic + fill% on V0, MQ135 raw (0–4095) on V1 from GPIO34 (ADC1, via 10k/20k divider), one bin_full event per fill. Pins as the ESP32 map; Serial is free.',
      board: 'esp32',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#define BLYNK_TEMPLATE_NAME "Smart Dustbin"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <ESP32Servo.h>
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
const int F_TRIG = 26, F_ECHO = 27, H_TRIG = 32, H_ECHO = 33;
const int SERVO_PIN = 13, BUZZER = 23, MQ135 = 34;  // GPIO34 = ADC1, works with Wi-Fi
const int LEDS[4] = {16, 17, 18, 19};  // 25/50/75/90 %
const int STEPS[4] = {25, 50, 75, 90};
const int BIN_ID = 1, FULL_AT = 85;
Servo lid;
BlynkTimer timer;
unsigned long lastHand = 0;
int fill = 0;
bool alerted = false;

long dist(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long us = pulseIn(echo, HIGH, 30000);
  return us ? us / 58 : 999;
}

int readFill() {
  long d[5];
  for (int i = 0; i < 5; i++) { d[i] = dist(F_TRIG, F_ECHO); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && d[j] < d[j - 1]; j--) { long t = d[j]; d[j] = d[j - 1]; d[j - 1] = t; }
  return constrain(map(d[2], 30, 5, 0, 100), 0, 100);
}

void report() {
  if (lid.attached()) return;  // sensor tilts with the open lid
  fill = readFill();
  Blynk.virtualWrite(V0, fill);
  Blynk.virtualWrite(V1, analogRead(MQ135));
  if (fill > FULL_AT && !alerted) {
    String msg = "Bin " + String(BIN_ID) + " needs collection";
    Blynk.logEvent("bin_full", msg.c_str());
    alerted = true;
  }
  if (fill < 50) alerted = false;  // re-arm after emptying
}

void setup() {
  pinMode(F_TRIG, OUTPUT); pinMode(F_ECHO, INPUT);
  pinMode(H_TRIG, OUTPUT); pinMode(H_ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  for (int l : LEDS) pinMode(l, OUTPUT);
  lid.attach(SERVO_PIN); lid.write(0); delay(400); lid.detach();
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
  timer.setInterval(2000L, report);
}

void loop() {
  Blynk.run(); timer.run();
  if (dist(H_TRIG, H_ECHO) < 25) lastHand = millis();
  bool open = lastHand && millis() - lastHand < 3000;
  if (open && !lid.attached()) { lid.attach(SERVO_PIN); lid.write(90); }
  if (!open && lid.attached()) { lid.write(0); delay(400); lid.detach(); }
  for (int i = 0; i < 4; i++) digitalWrite(LEDS[i], fill >= STEPS[i]);
  digitalWrite(BUZZER, fill >= 100 || (fill >= 90 && millis() % 2000 < 100));
  delay(50);
}`,
    },
  ],
  tips: [
    { title: 'Aim the sensor', detail: 'Fill sensor must see trash, not the bin wall — center it under the lid.' },
    { title: 'Median filter', detail: 'Uneven trash spikes echoes; median of 5 keeps the bar steady.' },
    { title: 'Servo saver', detail: 'Detach the servo when idle so it doesn’t jitter and strip gears.' },
    { title: 'Divide the ECHO', detail: 'HC-SR04 ECHO is a 5V pulse — on ESP boards use a 1k/2k divider or you’ll slowly kill the pin.' },
    { title: 'Route math', detail: 'Sort bins by fill% for the truck list — simple, and examiners love it.' },
  ],
}
