import type { Project } from '../types'

export const smartDustbin: Project = {
  slug: 'smart-dustbin',
  categoryId: 'iot',
  title: 'IoT Smart Dustbin',
  tagline: 'Fill-level sensing with auto lid and collection alerts.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,700–3,000',
  boards: ['Arduino Uno', 'ESP8266'],
  skills: ['Ultrasonic sensing', 'Servo control', 'Blynk', 'Route logic'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['esp8266', 'hcsr04', 'blynk-docs'],
  rig: { sensor: 'sonic', extras: ['sonic'] },
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
      blurb: 'NodeMCU bins report fill % to Blynk; full bins trigger collection alerts + route list.',
      points: ['Multi-bin dashboard', 'FULL push alerts', 'Collection route order'],
      weeks: '2 weeks',
      cost: '৳2,200–3,000',
    },
  ],
  parts: [
    { name: 'Arduino Uno / NodeMCU', qty: '1', role: 'Controller', price: '৳300–1,000' },
    { name: 'HC-SR04 ultrasonic', qty: '1–2', role: 'Fill + hand sense', price: '৳150–500' },
    { name: 'SG90 servo', qty: '1', role: 'Lid actuator', price: '৳180–300' },
    { name: 'LED bar / 4 LEDs', qty: '1 set', role: 'Fill display', price: '৳60–150' },
    { name: 'MQ135 (B, optional)', qty: '1', role: 'Odor index', price: '৳180–350' },
    { name: 'Bin + lid hinge', qty: '1', role: 'Demo body', price: '৳300–500' },
    { name: '5V supply + jumpers', qty: '1 set', role: 'Power', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino (A)',
      board: 'Arduino Uno',
      pins: [
        { from: 'Fill HC-SR04 → TRIG/ECHO', to: 'D9 / D10' },
        { from: 'Hand HC-SR04 → TRIG/ECHO', to: 'D5 / D6' },
        { from: 'Servo → signal', to: 'D3 (PWM)' },
        { from: 'LED bar →', to: 'D7,D8,D11,D12 via 220Ω' },
        { from: 'Buzzer →', to: 'D4' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU (B)',
      board: 'ESP8266 NodeMCU',
      pins: [
        { from: 'Fill HC-SR04 → TRIG/ECHO', to: 'D7 / D6 (divider!)' },
        { from: 'Servo →', to: 'D5' },
        { from: 'LED bar →', to: 'D0,D1,D2,D8' },
        { from: 'MQ135 → AO', to: 'A0' },
      ],
    },
  ],
  steps: [
    { title: 'Mount the fill sensor', detail: 'HC-SR04 under the lid pointing down. Map empty/full distances to 0–100%.' },
    { title: 'Hand-approach lid', detail: 'Second sensor outside: hand within 25cm → servo opens 3s. Debounce so it doesn’t flap.' },
    { title: 'LED fill bar', detail: '4 LEDs at 25/50/75/90%. Buzzer chirp at 90%, solid tone at 100%.' },
    { title: 'Lid safety', detail: 'Lid never closes while hand present; servo torque limited so fingers are safe.' },
    { title: 'Cloud fleet (B)', detail: 'Each bin posts fill% to Blynk/ThingSpeak; dashboard sorts bins by fill for the truck route.' },
    { title: 'Demo the cycle', detail: 'Film: approach → lid opens → fill rises → FULL alert fires on the phone.' },
  ],
  simulator: {
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
      note: 'Two HC-SR04: one for the hand, one for fill. Median-filter the fill.',
      code: `#include <Servo.h>
Servo lid;
const int F_TRIG = 9, F_ECHO = 10, H_TRIG = 5, H_ECHO = 6;
const int LEDS[4] = {7, 8, 11, 12};

long dist(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  return pulseIn(echo, HIGH, 30000) / 58;
}

void setup() {
  pinMode(F_TRIG, OUTPUT); pinMode(F_ECHO, INPUT);
  pinMode(H_TRIG, OUTPUT); pinMode(H_ECHO, INPUT);
  for (int l : LEDS) pinMode(l, OUTPUT);
  lid.attach(3); lid.write(0);
}

void loop() {
  if (dist(H_TRIG, H_ECHO) < 25) {  // hand present
    lid.write(90); delay(3000); lid.write(0);
  }
  int fill = constrain(map(dist(F_TRIG, F_ECHO), 30, 5, 0, 100), 0, 100);
  for (int i = 0; i < 4; i++) digitalWrite(LEDS[i], fill > 20 * (i + 1));
  delay(300);
}`,
    },
    {
      id: 'b',
      label: 'B · Blynk fleet',
      note: 'Fill% on V0, FULL event alert. Bin ID per device.',
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
char AUTH[] = "YOUR_BLYNK_TOKEN";
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
#define TRIG D7
#define ECHO D6
const int BIN_ID = 1;

int readFill() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long d = pulseIn(ECHO, HIGH, 30000) / 58;
  return constrain(map(d, 30, 5, 0, 100), 0, 100);
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  Blynk.begin(AUTH, SSID, PASS);
}

void loop() {
  Blynk.run();
  int fill = readFill();
  Blynk.virtualWrite(V0, fill);
  if (fill > 85) Blynk.logEvent("bin_full", "Bin " + String(BIN_ID) + " needs collection");
  delay(5000);
}`,
    },
  ],
  tips: [
    { title: 'Aim the sensor', detail: 'Fill sensor must see trash, not the bin wall — center it under the lid.' },
    { title: 'Median filter', detail: 'Uneven trash spikes echoes; median of 5 keeps the bar steady.' },
    { title: 'Servo saver', detail: 'Detach the servo when idle so it doesn’t jitter and strip gears.' },
    { title: 'Route math', detail: 'Sort bins by fill% for the truck list — simple, and examiners love it.' },
  ],
}
