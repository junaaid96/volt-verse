import type { Project } from '../types'

export const gasFireAlert: Project = {
  slug: 'gas-fire-alert',
  categoryId: 'iot',
  title: 'Gas Leakage & Fire Alert',
  tagline: 'LPG/smoke detection with siren, SMS and auto shut-off.',
  difficulty: 'Medium',
  weeks: '2 weeks',
  cost: '৳2,200–3,800',
  boards: ['ESP32', 'Arduino + GSM'],
  skills: ['MQ sensing', 'Flame IR', 'GSM/SMS', 'Safety relays'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32', 'mq2', 'sim800l', 'blynk-docs'],
  rig: { sensor: 'mq', extras: ['buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Local alarm unit',
      level: 'Medium · core build',
      blurb: 'MQ2 + flame sensor with siren, exhaust-fan relay and gas-valve servo shut-off.',
      points: ['Siren + strobe on trigger', 'Auto exhaust fan', 'Servo valve closer'],
      weeks: '1–2 weeks',
      cost: '৳2,200–3,000',
    },
    {
      id: 'b',
      title: 'B. SMS + cloud alerts',
      level: 'Medium+ · best value',
      blurb: 'SIM800L SMS to 2 numbers plus Blynk alerts with sensor graphs.',
      points: ['SMS even without Wi-Fi', 'Call + text escalation', 'Event log in cloud'],
      weeks: '2–3 weeks',
      cost: '৳2,800–3,800',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'MQ2 gas sensor', qty: '1', role: 'LPG/smoke detect', price: '৳180–350' },
    { name: 'Flame sensor (IR)', qty: '1–2', role: 'Fire detect', price: '৳100–250' },
    { name: 'DHT22', qty: '1', role: 'Heat-rise confirm', price: '৳250–450' },
    { name: 'SIM800L + antenna (B)', qty: '1', role: 'SMS alerts', price: '৳700–1,200' },
    { name: 'Siren/buzzer + fan', qty: '1 set', role: 'Local response', price: '৳300–600' },
    { name: 'Servo SG90', qty: '1', role: 'Valve closer demo', price: '৳180–300' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'MQ2 → AO/DO', to: 'GPIO34 / GPIO27' },
        { from: 'Flame → DO', to: 'GPIO25 (×2 zones)' },
        { from: 'DHT22 → DATA', to: 'GPIO4' },
        { from: 'Siren relay →', to: 'GPIO26' },
        { from: 'Fan relay →', to: 'GPIO33' },
        { from: 'Valve servo →', to: 'GPIO13 (PWM)' },
      ],
    },
    {
      id: 'gsm',
      label: 'GSM add-on (B)',
      board: 'SIM800L link',
      pins: [
        { from: 'SIM800L → TX/RX', to: 'GPIO16 / GPIO17 (UART2)' },
        { from: 'SIM800L → VCC', to: '4.0V 2A supply (not ESP 5V!)' },
        { from: 'SIM800L → GND', to: 'Common ground' },
      ],
    },
  ],
  steps: [
    { title: 'Burn in + baseline', detail: 'Run MQ2 for 24h, record clean-air analog baseline. Set gas threshold at ~1.6× baseline.' },
    { title: 'Two-sensor rule', detail: 'Alarm needs gas-high OR flame-low, confirmed by temp rise. Single-sensor alarms false-trigger.' },
    { title: 'Wire the responses', detail: 'Siren relay, exhaust fan relay, valve servo sweep 0→90°. Test each with a button first.' },
    { title: 'Latching alarm', detail: 'Once triggered, alarm latches until a physical reset press — standard fire-panel behavior.' },
    { title: 'SMS path (B)', detail: 'SIM800L on its own 2A supply. Send SMS to 2 numbers + Blynk event. Test with the demo gas puff.' },
    { title: 'Safe live demo', detail: 'Unlit lighter puff near MQ2 from 30cm, candle near flame sensor. Never use real LPG leaks.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: gas above the limit — or flame detected — latches the alarm.',
    sliders: [
      { id: 'gas', label: 'Gas level', unit: '', min: 0, max: 1024, value: 220 },
      { id: 'temp', label: 'Room temp', unit: '°C', min: 20, max: 90, value: 30 },
      { id: 'flame', label: 'Flame signal', unit: '%', min: 0, max: 100, value: 0 },
    ],
    threshold: { id: 'thr', label: 'Gas limit', unit: '', min: 300, max: 900, value: 500 },
    watch: 'gas',
    rule: 'above',
    actuator: 'Alarm',
    onText: 'FIRE/GAS',
    offText: 'safe',
    lcd: ['Gas:{gas} F:{flame}%', 'T:{temp}C {act}'],
    demoSlider: 'gas',
    demoFrom: 200,
    demoTo: 750,
    barLabel: 'Gas level',
  },
  code: [
    {
      id: 'a',
      label: 'A · Alarm logic',
      note: 'Latched alarm: gas OR flame triggers; only RESET clears it.',
      code: `const int GAS_A = 34, GAS_D = 27, FLAME = 25;
const int SIREN = 26, FAN = 33, RESET = 15;
const int GAS_LIMIT = 500;
bool latched = false;

void setup() {
  pinMode(GAS_D, INPUT); pinMode(FLAME, INPUT);
  pinMode(SIREN, OUTPUT); pinMode(FAN, OUTPUT);
  pinMode(RESET, INPUT_PULLUP);
}

void loop() {
  int gas = analogRead(GAS_A);
  bool flame = digitalRead(FLAME) == LOW;
  if (gas > GAS_LIMIT || flame) latched = true;
  if (digitalRead(RESET) == LOW) latched = false;

  digitalWrite(SIREN, latched ? HIGH : LOW);
  digitalWrite(FAN, latched ? HIGH : LOW);
  // servo valve: sweep to 90 on latch
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · SMS alert',
      note: 'SIM800L on UART2. Separate 4V/2A supply mandatory.',
      code: `#include <HardwareSerial.h>
HardwareSerial gsm(2);
const char* NUM1 = "+8801XXXXXXXXX";

void sendSMS(const char* num, String msg) {
  gsm.println("AT+CMGF=1"); delay(300);
  gsm.print("AT+CMGS=\\\""); gsm.print(num); gsm.println("\\\"");
  delay(300);
  gsm.print(msg); delay(300);
  gsm.write(26); delay(3000);
}

void setup() {
  gsm.begin(9600, SERIAL_8N1, 16, 17);
  delay(3000);  // module boot
}

void onAlarm(float gas, float temp) {
  sendSMS(NUM1, "ALERT! Gas=" + String(gas) + " Temp=" + String(temp));
  // escalate: call after 60s unacknowledged
}`,
    },
  ],
  tips: [
    { title: 'Separate GSM power', detail: 'SIM800L bursts 2A — ESP USB power browns out and drops the call.' },
    { title: 'Latch, don’t follow', detail: 'Real panels latch until reset; following-sensor alarms clear while fire spreads.' },
    { title: 'Two-sensor confirm', detail: 'Gas OR flame plus temp-rise kills 90% of false demos.' },
    { title: 'Demo safely', detail: 'Lighter puff + candle only. State your safety plan on slide one.' },
  ],
}
