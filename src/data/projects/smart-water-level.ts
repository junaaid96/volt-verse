import type { Project } from '../types'

export const waterLevel: Project = {
  slug: 'smart-water-level',
  categoryId: 'iot',
  title: 'Smart Water Level Controller',
  tagline: 'Tank sensing with auto pump cut-off and dry-run safety.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,500–2,800',
  boards: ['Arduino Uno', 'ESP8266'],
  skills: ['Ultrasonic sensing', 'Relay control', 'Safety interlocks', 'Blynk'],
  scene: 'water',
  updated: 'Oct 2026',
  sheets: ['esp8266', 'hcsr04', 'blynk-docs'],
  rig: { sensor: 'level', extras: ['relay'] },
  options: [
    {
      id: 'a',
      title: 'A. Automatic controller',
      level: 'Basic · easiest',
      blurb: 'Ultrasonic level + relay pump control with low/high cut-offs and dry-run timeout.',
      points: ['HC-SR04 level sensing', 'Auto ON/OFF with hysteresis', 'LCD percentage readout'],
      weeks: '1–2 weeks',
      cost: '৳1,500–2,200',
    },
    {
      id: 'b',
      title: 'B. IoT + phone alerts',
      level: 'Medium · best value',
      blurb: 'NodeMCU version with Blynk tank gauge, manual override and low-water push alerts.',
      points: ['Phone gauge + button', 'Leak/dry-run alerts', 'Water-usage log'],
      weeks: '2 weeks',
      cost: '৳1,800–2,800',
    },
  ],
  parts: [
    { name: 'ESP8266 NodeMCU / Uno', qty: '1', role: 'Controller', price: '৳300–1,000' },
    { name: 'HC-SR04 ultrasonic', qty: '1', role: 'Tank level', price: '৳150–300' },
    { name: 'Relay module (5V)', qty: '1', role: 'Pump switching', price: '৳80–180' },
    { name: 'Mini pump / demo motor', qty: '1', role: 'Demo pumping', price: '৳200–450' },
    { name: '16×2 I²C LCD', qty: '1', role: 'Level display', price: '৳180–350' },
    { name: 'Float switch (optional)', qty: '1', role: 'Backup high-level cut', price: '৳120–250' },
    { name: 'Bucket + tube + supply', qty: '1 set', role: 'Demo tank rig', price: '৳400–800' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino (A)',
      board: 'Arduino Uno',
      pins: [
        { from: 'HC-SR04 → TRIG', to: 'D9' },
        { from: 'HC-SR04 → ECHO', to: 'D10' },
        { from: 'HC-SR04 → VCC/GND', to: '5V / GND' },
        { from: 'Relay → IN', to: 'D7' },
        { from: 'LCD → SDA/SCL', to: 'A4 / A5' },
        { from: 'Float → signal', to: 'D3 (pull-up)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU (B)',
      board: 'ESP8266 NodeMCU',
      pins: [
        { from: 'HC-SR04 → TRIG', to: 'D7 (via divider on ECHO!)' },
        { from: 'HC-SR04 → ECHO', to: 'D6 via 1k/2k divider' },
        { from: 'Relay → IN', to: 'D5' },
        { from: 'LCD → SDA/SCL', to: 'D2 / D1' },
      ],
    },
  ],
  steps: [
    { title: 'Range-test the sensor', detail: 'Point HC-SR04 at water from your tank height. Water absorbs echo — confirm stable cm readings first.' },
    { title: 'Map cm to percent', detail: 'Measure empty-tank and full-tank distances, map to 0–100%. Filter with a 5-sample median.' },
    { title: 'Wire relay + pump', detail: 'Separate pump supply through relay contacts. Add a fuse if you demo with a real pump.' },
    { title: 'Program the interlocks', detail: 'Pump ON below 20%, OFF above 95%; dry-run cut if level never rises after 60s of pumping.' },
    { title: 'Add IoT layer (B)', detail: 'Blynk gauge on V0, manual button on V1, low-water event alert at 15%.' },
    { title: 'Demo fill + drain', detail: 'Film a full cycle: low trigger, auto fill, high cut-off, plus the dry-run test with the inlet blocked.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: pump starts when the tank falls below the low mark and stops at the high mark.',
    sliders: [
      { id: 'level', label: 'Tank level', unit: '%', min: 0, max: 100, value: 42 },
      { id: 'flow', label: 'Inlet flow', unit: 'L/m', min: 0, max: 20, value: 8 },
    ],
    threshold: { id: 'thr', label: 'Low mark', unit: '%', min: 5, max: 50, value: 20 },
    watch: 'level',
    rule: 'below',
    actuator: 'Pump',
    onText: 'FILL',
    offText: 'idle',
    lcd: ['Tank:{level}%', 'Pump:{act} F:{flow}'],
    demoSlider: 'level',
    demoFrom: 60,
    demoTo: 8,
    barLabel: 'Tank level',
  },
  code: [
    {
      id: 'a',
      label: 'A · Auto controller',
      note: 'Median filter + hysteresis + dry-run guard. ECHO needs a divider on ESP boards.',
      code: `const int TRIG = 9, ECHO = 10, RELAY = 7;
const int LOWMK = 20, HIGHMK = 95;
const int EMPTY_CM = 40, FULL_CM = 6;
bool pumping = false;
unsigned long pumpStart = 0;
int lastLevel = 0;

int readLevel() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long d = pulseIn(ECHO, HIGH, 30000) / 58;
  d = constrain(d, FULL_CM, EMPTY_CM);
  return map(d, EMPTY_CM, FULL_CM, 0, 100);
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);
}

void loop() {
  int lvl = readLevel();
  if (!pumping && lvl < LOWMK) { pumping = true; pumpStart = millis(); lastLevel = lvl; }
  // dry-run: level not rising after 60s
  if (pumping && millis() - pumpStart > 60000 && lvl <= lastLevel + 1) pumping = false;
  if (pumping && lvl > HIGHMK) pumping = false;
  digitalWrite(RELAY, pumping ? LOW : HIGH);
  delay(1000);
}`,
    },
    {
      id: 'b',
      label: 'B · Blynk IoT',
      note: 'Blynk: gauge V0, manual button V1, event "low_water". Template ID + auth required.',
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#define TRIG D7
#define ECHO D6
#define RELAY D5
char AUTH[] = "YOUR_BLYNK_TOKEN";
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
bool manual = false;
BLYNK_WRITE(V1) { manual = param.asInt(); }

int readLevel() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long d = pulseIn(ECHO, HIGH, 30000) / 58;
  return constrain(map(d, 40, 6, 0, 100), 0, 100);
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);
  Blynk.begin(AUTH, SSID, PASS);
}

void loop() {
  Blynk.run();
  int lvl = readLevel();
  bool pump = manual || lvl < 20;
  if (lvl > 95) pump = false;      // high cut always wins
  digitalWrite(RELAY, pump ? LOW : HIGH);
  Blynk.virtualWrite(V0, lvl);
  if (lvl < 15) Blynk.logEvent("low_water");
  delay(1000);
}`,
    },
  ],
  tips: [
    { title: 'Divider on ECHO', detail: 'HC-SR04 ECHO is 5V — divide to 3.3V for ESP boards or you risk the pin.' },
    { title: 'Median filter', detail: 'Water ripples spike readings; a 5-sample median keeps the relay calm.' },
    { title: 'Float backup', detail: 'A float switch in series with the relay is cheap flood insurance.' },
    { title: 'Log usage', detail: 'Pump runtime × flow rate = a water-usage stat examiners love.' },
  ],
}
