import type { Project } from '../types'

const alarmLogic = `const bool RELAY_ON = HIGH;  // LOW for low-trigger relay modules
DHT dht(DHT_PIN, DHT22);
Servo valve;
bool latched = false;
int gasHits = 0, flameHits = 0;
float baseTemp = NAN;

void setup() {
  pinMode(FLAME1, INPUT); pinMode(FLAME2, INPUT);
  pinMode(SIREN, OUTPUT); pinMode(FAN, OUTPUT);
  pinMode(RESET_BTN, INPUT_PULLUP);
  digitalWrite(SIREN, !RELAY_ON); digitalWrite(FAN, !RELAY_ON);
  dht.begin();
  valve.attach(VALVE);
  valve.write(0);  // valve open
}

void loop() {
  int gas = analogRead(GAS_A);
  bool flame = digitalRead(FLAME1) == LOW || digitalRead(FLAME2) == LOW;
  float t = dht.readTemperature();
  if (isnan(baseTemp) && !isnan(t)) baseTemp = t;
  bool heatRise = !isnan(t) && t > baseTemp + 5;

  gasHits = gas > GAS_LIMIT ? gasHits + 1 : 0;  // 3 reads ≈ 0.6s
  flameHits = flame ? flameHits + 1 : 0;        // 5 reads ≈ 1s
  if (gasHits >= 3 || flameHits >= 5 || (flame && heatRise)) latched = true;
  if (digitalRead(RESET_BTN) == LOW && gas < GAS_LIMIT && !flame) latched = false;

  digitalWrite(SIREN, latched ? RELAY_ON : !RELAY_ON);
  digitalWrite(FAN, latched ? RELAY_ON : !RELAY_ON);
  valve.write(latched ? 90 : 0);  // 90° = valve closed
  delay(200);
}`

const smsHelpers = `const char* NUMBERS[] = {"+8801XXXXXXXXX", "+8801YYYYYYYYY"};

void sendSMS(const char* num, const String& msg) {
  gsm.println("AT+CMGF=1"); delay(300);
  gsm.print("AT+CMGS=\\""); gsm.print(num); gsm.println("\\"");
  delay(300);
  gsm.print(msg); delay(300);
  gsm.write(26); delay(5000);
}

void callNumber(const char* num) {  // escalation: ring for 20s
  gsm.print("ATD"); gsm.print(num); gsm.println(";");
  delay(20000);
  gsm.println("ATH");
}`

export const gasFireAlert: Project = {
  slug: 'gas-fire-alert',
  categoryId: 'iot',
  title: 'Gas Leakage & Fire Alert',
  tagline: 'LPG/smoke detection with siren, SMS and auto shut-off.',
  difficulty: 'Medium',
  weeks: '1–3 weeks',
  cost: '৳2,200–4,600',
  boards: ['ESP32', 'Arduino Uno + GSM'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Runs A and B’s SMS path natively (5V sensors, SIM800L on SoftwareSerial). B’s Blynk events need an ESP-01 serial link.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'Needs 7 digital I/O plus a serial port for the SIM800L; the NodeMCU has ~5 safe GPIO and a single ADC — use the ESP32 or Uno.',
    },
    esp32cam: {
      ok: false,
      reason: 'Only ~4 free pins and all are ADC2, so the MQ2 can’t be read with Wi-Fi on — the build needs 7 I/O plus a UART.',
    },
  },
  skills: ['MQ sensing', 'Flame IR', 'GSM/SMS', 'Safety relays'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32', 'arduino-uno', 'mq2', 'dht22', 'flame-sensor', 'relay-5v', 'sg90', 'esp-01', 'sim800l', 'tp4056', 'blynk-docs'],
  rig: { sensor: 'flame', extras: ['mq', 'buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Local alarm unit',
      level: 'Medium · core build',
      blurb: 'MQ2 + flame sensors with siren, exhaust-fan relay and gas-valve servo shut-off.',
      points: ['Siren + strobe on trigger', 'Auto exhaust fan', 'Servo valve closer'],
      weeks: '1–2 weeks',
      cost: '৳2,200–3,400',
    },
    {
      id: 'b',
      title: 'B. SMS + cloud alerts',
      level: 'Medium+ · best value',
      blurb: 'SIM800L SMS to 2 numbers plus Blynk alert events.',
      points: ['SMS even without Wi-Fi', 'Call + text escalation', 'Event log in cloud'],
      weeks: '2–3 weeks',
      cost: '৳3,100–4,600',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳650–1,100', boards: ['uno'] },
    { name: 'MQ2 gas sensor', qty: '1', role: 'LPG/smoke detect', price: '৳180–350' },
    { name: 'Flame sensor (IR)', qty: '2', role: 'Fire detect (2 zones)', price: '৳200–500' },
    { name: 'DHT22', qty: '1', role: 'Heat-rise confirm', price: '৳250–450' },
    { name: '2-ch relay module', qty: '1', role: 'Siren + fan switching', price: '৳150–250' },
    { name: 'Siren/buzzer + fan', qty: '1 set', role: 'Local response', price: '৳300–600' },
    { name: 'Servo SG90', qty: '1', role: 'Valve closer demo', price: '৳180–300' },
    { name: '5V 2A adapter', qty: '1', role: 'MQ2 heater, relays, servo', price: '৳250–400' },
    { name: 'Resistors + push button', qty: '1 set', role: 'Dividers + alarm reset', price: '৳30–60' },
    { name: 'SIM800L + antenna', qty: '1', role: 'SMS alerts', price: '৳700–1,200', versions: ['b'] },
    { name: 'SIM800L power kit', qty: '1 set', role: '18650 + holder + TP4056 + 1000µF cap', price: '৳250–400', versions: ['b'] },
    { name: 'ESP-01 + 3V3 adapter', qty: '1', role: 'Wi-Fi link for Blynk events', price: '৳250–400', boards: ['uno'], versions: ['b'] },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'MQ2 → VCC / GND', to: '5V (VIN) / GND' },
        { from: 'MQ2 → AO', to: '10k/20k divider → GPIO34 (ADC1)' },
        { from: 'Flame 1 / 2 → DO', to: 'GPIO25 / GPIO32 (modules on 3V3)' },
        { from: 'DHT22 → DATA', to: 'GPIO4 + 10k pull-up to 3V3' },
        { from: 'Siren / fan relay → IN', to: 'GPIO26 / GPIO33' },
        { from: 'Relay module → VCC / JD-VCC', to: '3V3 / 5V adapter (jumper removed)' },
        { from: 'Valve servo → signal', to: 'GPIO13 (servo on the 5V adapter, common GND)' },
        { from: 'Reset button →', to: 'GPIO23 to GND (INPUT_PULLUP)' },
        { from: 'SIM800L → TXD / RXD (B)', to: 'GPIO16 (RX2) / GPIO17 (TX2)' },
      ],
    },
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'MQ2 → VCC / AO', to: '5V / A0 (direct, 5V ADC)' },
        { from: 'Flame 1 / 2 → DO', to: 'D2 / D3' },
        { from: 'DHT22 → DATA', to: 'D4 + 10k pull-up to 5V' },
        { from: 'Siren / fan relay → IN', to: 'D7 / D8 (relay VCC 5V)' },
        { from: 'Valve servo → signal', to: 'D9 (servo on the 5V adapter, common GND)' },
        { from: 'Reset button →', to: 'D12 to GND (INPUT_PULLUP)' },
        { from: 'SIM800L → TXD (B)', to: 'D10 (SoftwareSerial RX)' },
        { from: 'SIM800L → RXD (B)', to: 'D11 via 1k/2k divider' },
        { from: 'ESP-01 → RX (B)', to: 'D5 via 1k/2k divider (Blynk link)' },
        { from: 'ESP-01 → VCC / GND (B)', to: 'ESP-01 adapter on 5V / GND (not the Uno 3V3)' },
      ],
    },
    {
      id: 'gsm',
      label: 'SIM800L power',
      board: 'SIM800L module',
      versions: ['b'],
      pins: [
        { from: 'SIM800L → VCC', to: '18650 cell (3.7–4.2V) or buck set to 4.0V, ≥2A — never 5V or 3V3' },
        { from: 'SIM800L VCC ↔ GND', to: '1000µF capacitor at the module pins' },
        { from: 'SIM800L → GND', to: 'Common ground with the controller' },
        { from: 'TP4056 → OUT+ / OUT−', to: '18650 holder, charged from the 5V adapter' },
        { from: 'SIM800L → ANT', to: 'Antenna fitted before power-up' },
      ],
    },
  ],
  steps: [
    {
      id: 'burn-in-baseline',
      title: 'Burn in + baseline',
      detail: 'Run the MQ2 for 24h, then log the clean-air reading on GPIO34 (through the divider, 12-bit). Set GAS_LIMIT at ~1.6× that baseline.',
      boardDetail: {
        uno: 'Run the MQ2 for 24h, then log the clean-air reading on A0 (10-bit). Set GAS_LIMIT at ~1.6× that baseline.',
      },
    },
    {
      id: 'confirm-before-alarm',
      title: 'Confirm before alarming',
      detail: 'Gas: 3 high reads in a row (LPG brings no heat, so don’t wait for temp). Fire: flame held ~1s, or flame plus a 5°C rise on the DHT22. Single-sample alarms false-trigger.',
    },
    {
      id: 'wire-responses',
      title: 'Wire the responses',
      detail: 'Siren relay on GPIO26, fan relay on GPIO33, valve servo on GPIO13 powered from the 5V adapter — sweep 0→90°. Test each output on its own first.',
      boardDetail: {
        uno: 'Siren relay on D7, fan relay on D8, valve servo on D9 powered from the 5V adapter — sweep 0→90°. Test each output on its own first.',
      },
    },
    {
      id: 'latching-alarm',
      title: 'Latching alarm',
      detail: 'Once triggered, the alarm latches until the reset button (GPIO23 to GND) is pressed with gas and flame clear — standard fire-panel behavior.',
      boardDetail: {
        uno: 'Once triggered, the alarm latches until the reset button (D12 to GND) is pressed with gas and flame clear — standard fire-panel behavior.',
      },
    },
    {
      id: 'power-sim800l',
      title: 'Power the SIM800L',
      versions: ['b'],
      detail: 'Feed it from an 18650 (3.7–4.2V) or a buck set to 4.0V — never 5V or 3V3 — with 1000µF at its pins for the 2A bursts. The NET LED blinks every 3s once registered.',
    },
    {
      id: 'sms-cloud-alerts',
      title: 'SMS + cloud alerts',
      versions: ['b'],
      detail: 'SIM800L on UART2 (GPIO16/17). On latch, text 2 numbers, then log a Blynk event if Wi-Fi is up. Test with the demo gas puff.',
      boardDetail: {
        uno: 'SIM800L on SoftwareSerial D10/D11 at 9600 baud. On latch, text 2 numbers and print an ALERT line on D5 for the ESP-01. Test with the demo gas puff.',
      },
    },
    {
      id: 'flash-esp01-bridge',
      title: 'Flash the ESP-01 bridge',
      versions: ['b'],
      boards: ['uno'],
      detail: 'Flash the ESP-01 (USB adapter, GPIO0 to GND) with a BlynkSimpleEsp8266 sketch that calls Blynk.logEvent() for each ALERT line it reads on RX.',
    },
    {
      id: 'safe-live-demo',
      title: 'Safe live demo',
      detail: 'Unlit lighter puff near MQ2 from 30cm, candle near flame sensor. Never use real LPG leaks.',
    },
  ],
  simulator: {
    viz: 'gauge',
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
      note: 'Libraries: ESP32Servo, DHT sensor library. Latched alarm: sustained gas or flame triggers; only RESET clears it.',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#include <ESP32Servo.h>
#include <DHT.h>
const int GAS_A = 34, FLAME1 = 25, FLAME2 = 32, DHT_PIN = 4;
const int SIREN = 26, FAN = 33, VALVE = 13, RESET_BTN = 23;
const int GAS_LIMIT = 1600;  // ~1.6× your clean-air baseline (12-bit ADC)
${alarmLogic}`,
    },
    {
      id: 'a-uno',
      label: 'A · Alarm logic (Uno)',
      note: 'Libraries: Servo, DHT sensor library. Same latch rule with Uno pins.',
      board: 'uno',
      versions: ['a', 'b'],
      code: `#include <Servo.h>
#include <DHT.h>
const int GAS_A = A0, FLAME1 = 2, FLAME2 = 3, DHT_PIN = 4;
const int SIREN = 7, FAN = 8, VALVE = 9, RESET_BTN = 12;
const int GAS_LIMIT = 400;  // ~1.6× your clean-air baseline (10-bit ADC)
${alarmLogic}`,
    },
    {
      id: 'b',
      label: 'B · SMS + Blynk alert',
      note: 'SIM800L on UART2, separate 3.4–4.4V supply. Blynk never blocks: SMS still goes out without Wi-Fi. Call onAlarm() once when the latch sets.',
      board: 'esp32',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "YOUR_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "Gas Fire Alert"
#define BLYNK_AUTH_TOKEN "YOUR_AUTH_TOKEN"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <HardwareSerial.h>
HardwareSerial gsm(2);
${smsHelpers}

void setup() {
  gsm.begin(9600, SERIAL_8N1, 16, 17);  // RX = GPIO16 ← SIM TXD
  WiFi.begin("YOUR_WIFI", "YOUR_PASS");
  Blynk.config(BLYNK_AUTH_TOKEN);
  delay(3000);  // module boot + network registration
}

void onAlarm(int gas, float temp) {
  String msg = "ALERT! Gas=" + String(gas) + " Temp=" + String(temp, 1) + "C";
  for (const char* n : NUMBERS) sendSMS(n, msg);
  if (Blynk.connected()) Blynk.logEvent("gas_alert", msg);
  // escalate: callNumber(NUMBERS[0]) if not reset within 60s
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) Blynk.run();
}`,
    },
    {
      id: 'b-uno',
      label: 'B · SMS alert (Uno)',
      note: 'SIM800L on SoftwareSerial D10/D11; the ESP-01 bridge on D5 turns ALERT lines into Blynk events.',
      board: 'uno',
      versions: ['b'],
      code: `#include <SoftwareSerial.h>
SoftwareSerial gsm(10, 11);  // RX D10 ← SIM TXD, TX D11 → divider → SIM RXD
SoftwareSerial esp(6, 5);    // TX D5 → divider → ESP-01 RX (D6 unused)
${smsHelpers}

void setup() {
  esp.begin(9600);
  gsm.begin(9600);
  gsm.listen();
  delay(3000);  // module boot + network registration
}

void onAlarm(int gas, float temp) {
  String msg = "ALERT! Gas=" + String(gas) + " Temp=" + String(temp, 1) + "C";
  for (const char* n : NUMBERS) sendSMS(n, msg);
  esp.println("ALERT," + msg);
  // escalate: callNumber(NUMBERS[0]) if not reset within 60s
}

void loop() {}`,
    },
  ],
  tips: [
    { title: 'Separate GSM power', detail: 'SIM800L bursts 2A at 3.4–4.4V — USB or the 5V pin browns it out mid-SMS, and 5V direct can kill it.' },
    { title: 'Latch, don’t follow', detail: 'Real panels latch until reset; following-sensor alarms clear while fire spreads.' },
    { title: 'Confirm, then alarm', detail: 'Sustained gas, or flame held ~1s / backed by temp rise, kills most false demo triggers.' },
    { title: 'No sparks near gas', detail: 'Relay contacts and brushed fans can ignite LPG — real kitchens use spark-proof fans. Keep this a model.' },
    { title: 'Demo safely', detail: 'Lighter puff + candle only. State your safety plan on slide one.' },
  ],
}
