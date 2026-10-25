import type { Project } from '../types'

export const healthMonitor: Project = {
  slug: 'health-monitor',
  categoryId: 'iot',
  title: 'IoT Patient Health Monitor',
  tagline: 'Heart, SpO2 and temp with cloud trends and SOS alerts.',
  difficulty: 'Medium',
  weeks: '3 weeks',
  cost: '৳2,800–4,500',
  boards: ['ESP32', 'Arduino + ESP8266'],
  skills: ['MAX30102 sensing', 'Signal filtering', 'ThingSpeak', 'Alert logic'],
  scene: 'health',
  updated: 'Oct 2026',
  sheets: ['esp32', 'max30102', 'ds18b20', 'thingspeak-docs'],
  rig: { sensor: 'max', extras: ['oled'] },
  featured: true,
  options: [
    {
      id: 'a',
      title: 'A. Bedside monitor',
      level: 'Medium · core build',
      blurb: 'MAX30102 + DS18B20 on ESP32 with OLED vitals and buzzer limits. No cloud needed.',
      points: ['BPM + SpO2 + body temp', 'High/low alarms', 'Portable 18650 power'],
      weeks: '2–3 weeks',
      cost: '৳2,800–3,600',
    },
    {
      id: 'b',
      title: 'B. Cloud + SOS alerts',
      level: 'Medium+ · best value',
      blurb: 'ThingSpeak trends, SOS button, and abnormal-vital push alerts to the caretaker phone.',
      points: ['24h trend charts', 'SOS + fall button', 'Multi-patient IDs'],
      weeks: '3–4 weeks',
      cost: '৳3,200–4,500',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'MAX30102 module', qty: '1', role: 'Heart rate + SpO2', price: '৳600–1,000' },
    { name: 'DS18B20 (waterproof)', qty: '1', role: 'Body temp', price: '৳150–300' },
    { name: '0.96" OLED', qty: '1', role: 'Vitals display', price: '৳350–550' },
    { name: 'SOS button + buzzer', qty: '1 set', role: 'Alerts', price: '৳120–250' },
    { name: '18650 + holder + TP4056', qty: '1', role: 'Portable power', price: '৳350–600' },
    { name: 'Jumper + enclosure', qty: '1 set', role: 'Assembly', price: '৳250–500' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'MAX30102 → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'MAX30102 → VCC/GND', to: '3V3 / GND (never 5V!)' },
        { from: 'DS18B20 → DATA', to: 'GPIO4 (4.7k pull-up)' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'SOS button →', to: 'GPIO15 (INPUT_PULLUP)' },
        { from: 'Buzzer →', to: 'GPIO13 via transistor' },
      ],
    },
    {
      id: 'uno',
      label: 'Uno + ESP link',
      board: 'Arduino + ESP8266',
      pins: [
        { from: 'MAX30102 → SDA/SCL', to: 'A4 / A5 (3.3V logic!)' },
        { from: 'DS18B20 → DATA', to: 'D2 (4.7k pull-up)' },
        { from: 'OLED → SDA/SCL', to: 'A4 / A5' },
        { from: 'ESP link →', to: 'SoftwareSerial D8/D6' },
      ],
    },
  ],
  steps: [
    { title: 'Get clean PPG first', detail: 'Run the MAX30102 example, keep the finger still and shaded. Noisy signal = everything downstream fails.' },
    { title: 'Average, don’t trust raw', detail: '10-beat rolling average for BPM, 5s window for SpO2. Reject values outside 40–200 BPM.' },
    { title: 'Add temp + display', detail: 'DS18B20 armpit-temp proxy, all three vitals on OLED with big BPM digits.' },
    { title: 'Program alarm limits', detail: 'BPM <50 or >120, SpO2 <94% for 10s → buzzer + red screen. SOS button overrides everything.' },
    { title: 'Cloud trends (B)', detail: 'ThingSpeak 3 fields every 20s; caretaker dashboard with 24h charts + threshold emails.' },
    { title: 'Validate + disclaim', detail: 'Compare against a commercial oximeter, record error %, and label it an educational prototype — not medical advice.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: sustained abnormal vitals raise the alarm state.',
    sliders: [
      { id: 'bpm', label: 'Heart rate', unit: 'bpm', min: 40, max: 180, value: 78 },
      { id: 'spo2', label: 'SpO2', unit: '%', min: 85, max: 100, value: 97 },
      { id: 'temp', label: 'Body temp', unit: '°C', min: 35, max: 42, value: 36.8 },
    ],
    threshold: { id: 'thr', label: 'High BPM alarm', unit: 'bpm', min: 100, max: 150, value: 120 },
    watch: 'bpm',
    rule: 'above',
    actuator: 'Alarm',
    onText: 'ALERT',
    offText: 'normal',
    lcd: ['BPM:{bpm} O2:{spo2}%', 'T:{temp}C {act}'],
    demoSlider: 'bpm',
    demoFrom: 75,
    demoTo: 135,
    barLabel: 'Heart rate',
  },
  code: [
    {
      id: 'a',
      label: 'A · Vitals + alarms',
      note: 'Libraries: SparkFun MAX3010x, OneWire, DallasTemperature, Adafruit SSD1306.',
      code: `#include <Wire.h>
#include "MAX30105.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE 4
#define BUZZER 13
MAX30105 ppg;
OneWire oneWire(ONE_WIRE);
DallasTemperature temp(&oneWire);
long lastBeat = 0;
float bpmAvg = 75;

void setup() {
  ppg.begin(Wire, I2C_SPEED_FAST);
  ppg.setup(0x1F, 4, 2, 400, 411, 4096);
  temp.begin();
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  long ir = ppg.getIR();
  // simple beat detect: rising edge past threshold
  static long prev = 0;
  if (ir > 80000 && prev <= 80000) {
    long now = millis();
    float bpm = 60000.0 / (now - lastBeat);
    lastBeat = now;
    if (bpm > 40 && bpm < 200) bpmAvg = 0.7 * bpmAvg + 0.3 * bpm;
  }
  prev = ir;
  temp.requestTemperatures();
  float t = temp.getTempCByIndex(0);
  bool alarm = bpmAvg > 120 || bpmAvg < 50;
  digitalWrite(BUZZER, alarm ? HIGH : LOW);
  // ... print bpmAvg + t to OLED ...
  delay(20);
}`,
    },
    {
      id: 'b',
      label: 'B · Cloud upload',
      note: 'POST vitals to ThingSpeak every 20s + SOS immediate alert.',
      code: `#include <WiFi.h>
#include <HTTPClient.h>
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const String KEY = "YOUR_THINGSPEAK_KEY";
#define SOS 15

void upload(float bpm, float spo2, float t, bool sos) {
  HTTPClient http;
  http.begin("http://api.thingspeak.com/update?api_key=" + KEY +
    "&field1=" + bpm + "&field2=" + spo2 +
    "&field3=" + t + "&field4=" + (sos ? 1 : 0));
  http.GET(); http.end();
}

void loop() {
  // ... read bpmAvg, spo2Avg, temp ...
  bool sos = digitalRead(SOS) == LOW;
  upload(75.0, 97.0, 36.6, sos);  // replace with live vars
  delay(sos ? 5000 : 20000);
}`,
    },
  ],
  tips: [
    { title: 'Stillness matters', detail: 'Finger motion dwarfs the pulse signal — brace the hand on the table.' },
    { title: 'Block light', detail: 'A foam ring around the sensor kills ambient-light noise.' },
    { title: 'Average always', detail: 'Never alarm on one sample; use rolling averages + persistence timers.' },
    { title: 'Disclaim clearly', detail: 'Label every slide: educational prototype, validated against device X with Y% error.' },
  ],
}
