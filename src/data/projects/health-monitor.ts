import type { Project } from '../types'

export const healthMonitor: Project = {
  slug: 'health-monitor',
  categoryId: 'iot',
  title: 'IoT Patient Health Monitor',
  tagline: 'Heart, SpO2 and temp with cloud trends and SOS alerts.',
  difficulty: 'Medium',
  weeks: '2–4 weeks',
  cost: '৳2,800–4,500',
  boards: ['ESP32', 'Arduino + ESP8266'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Version A fits with an I²C level shifter for the 3V3 MAX30102 and the lightweight U8x8 OLED library. Version B needs an ESP-01 link (AT firmware) to reach ThingSpeak.',
    },
    esp32: { ok: true },
    nodemcu: { ok: true, note: 'Fits on D1, D2, D5, D6, D7 with native Wi-Fi for ThingSpeak.' },
    esp32cam: {
      ok: false,
      reason: 'Fits only by using strapping pins 2, 12 and 15 and giving up the SD slot, with no USB for watching the pulse signal. Use a DevKit.',
    },
  },
  skills: ['MAX30102 sensing', 'Signal filtering', 'ThingSpeak', 'Alert logic'],
  scene: 'health',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'max30102', 'ds18b20', 'ssd1306', 'level-shifter', 'esp-01', 'tp4056', 'thingspeak-docs'],
  rig: { sensor: 'max', extras: ['oled', 'buzzer'] },
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
      blurb: 'ThingSpeak trends, SOS button, and abnormal-vital alerts to the caretaker.',
      points: ['24h trend charts', 'SOS + fall button', 'Multi-patient IDs'],
      weeks: '3–4 weeks',
      cost: '৳3,200–4,500',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳650–1,000', boards: ['uno'] },
    { name: 'I²C level shifter (BSS138)', qty: '1', role: 'MAX30102 3V3 ↔ Uno 5V', price: '৳40–80', boards: ['uno'] },
    { name: 'ESP-01 + 3V3 adapter', qty: '1', role: 'Wi-Fi link for the Uno', price: '৳250–400', boards: ['uno'], versions: ['b'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳350–550', boards: ['nodemcu'] },
    { name: 'MAX30102 module', qty: '1', role: 'Heart rate + SpO2', price: '৳600–1,000' },
    { name: 'DS18B20 (waterproof) + 4.7k', qty: '1', role: 'Body temp', price: '৳150–300' },
    { name: '0.96" OLED (I²C)', qty: '1', role: 'Vitals display', price: '৳350–550' },
    { name: 'SOS button + active buzzer', qty: '1 set', role: 'Alerts', price: '৳120–250' },
    { name: '18650 + holder + TP4056 (protected) + 5V boost', qty: '1', role: 'Portable power', price: '৳400–700' },
    { name: 'Jumper + enclosure', qty: '1 set', role: 'Assembly', price: '৳250–500' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'MAX30102 → SDA / SCL', to: 'GPIO21 / GPIO22' },
        { from: 'MAX30102 → VIN / GND', to: '3V3 / GND (3V3 I²C, never 5V logic)' },
        { from: 'DS18B20 → DATA / VCC', to: 'GPIO4 (4.7k pull-up to 3V3) / 3V3' },
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (shared bus: OLED 0x3C, MAX30102 0x57)' },
        { from: 'SOS button →', to: 'GPIO27 to GND (INPUT_PULLUP)' },
        { from: 'Buzzer →', to: 'GPIO13 via NPN + 1k' },
      ],
    },
    {
      id: 'uno',
      label: 'Uno + ESP link',
      board: 'Arduino + ESP8266',
      boards: ['uno'],
      pins: [
        { from: 'MAX30102 → SDA / SCL', to: 'A4 / A5 through the I²C level shifter (module pulls up to ≤3.3V)' },
        { from: 'MAX30102 → VIN / GND', to: '3V3 / GND (low-side of the shifter also on 3V3)' },
        { from: 'OLED → SDA / SCL', to: 'A4 / A5 (5V side; OLED VCC 5V)' },
        { from: 'DS18B20 → DATA', to: 'D2 (4.7k pull-up to 5V)' },
        { from: 'SOS button →', to: 'D3 to GND (INPUT_PULLUP)' },
        { from: 'Buzzer →', to: 'D5 via NPN + 1k' },
        { from: 'ESP-01 TX → (B)', to: 'D8 (SoftwareSerial RX, 9600 baud)' },
        { from: 'ESP-01 RX → (B)', to: 'D6 via 1k/2k divider (SoftwareSerial TX)' },
        { from: 'ESP-01 VCC (B)', to: 'Adapter 3V3 regulator (Uno 3V3 pin can’t supply it)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'MAX30102 → SDA / SCL', to: 'D2 (GPIO4) / D1 (GPIO5)' },
        { from: 'MAX30102 → VIN / GND', to: '3V3 / GND' },
        { from: 'OLED → SDA / SCL', to: 'D2 / D1 (shared bus)' },
        { from: 'DS18B20 → DATA', to: 'D5 (GPIO14, 4.7k pull-up to 3V3)' },
        { from: 'SOS button →', to: 'D6 (GPIO12) to GND (INPUT_PULLUP)' },
        { from: 'Buzzer →', to: 'D7 (GPIO13) via NPN + 1k' },
      ],
    },
    {
      id: 'power',
      label: 'Portable power',
      board: '18650 pack',
      pins: [
        { from: '18650 + / − →', to: 'TP4056 B+ / B− (use the protected DW01 version)' },
        { from: 'TP4056 OUT+ / OUT− →', to: 'Boost IN+ / IN− (MT3608 set to 5.0V before connecting)' },
        { from: 'Boost 5V →', to: 'ESP32 VIN / NodeMCU VIN / Uno 5V pin' },
        { from: 'Charging →', to: 'TP4056 USB port (1A); don’t charge while strapped to a person' },
      ],
    },
  ],
  steps: [
    {
      id: 'get-clean-ppg',
      title: 'Get clean PPG first',
      detail: 'Run the SparkFun MAX3010x HeartRate example, keep the finger still and shaded. Noisy signal = everything downstream fails.',
    },
    {
      id: 'average-readings',
      title: 'Average, don’t trust raw',
      detail: '10-beat rolling average for BPM, 5s window for SpO2. Reject values outside 40–200 BPM.',
    },
    {
      id: 'add-temp-display',
      title: 'Add temp + display',
      detail: 'DS18B20 on GPIO4 as an armpit-temp proxy (reads ~0.5°C below core), all three vitals on the OLED with big BPM digits.',
      boardDetail: {
        uno: 'DS18B20 on D2 as an armpit-temp proxy (reads ~0.5°C below core), all three vitals on the OLED via U8x8 to save RAM.',
        nodemcu: 'DS18B20 on D5 as an armpit-temp proxy (reads ~0.5°C below core), all three vitals on the OLED with big BPM digits.',
      },
    },
    {
      id: 'program-alarm-limits',
      title: 'Program alarm limits',
      detail: 'BPM <50 or >120, SpO2 <94% for 10s → buzzer on GPIO13 + red screen. SOS button on GPIO27 overrides everything.',
      boardDetail: {
        uno: 'BPM <50 or >120, SpO2 <94% for 10s → buzzer on D5 + alert screen. SOS button on D3 overrides everything.',
        nodemcu: 'BPM <50 or >120, SpO2 <94% for 10s → buzzer on D7 + alert screen. SOS button on D6 overrides everything.',
      },
    },
    {
      id: 'setup-esp01-link',
      title: 'Set up the ESP-01 Wi-Fi link',
      detail: 'Keep AT firmware on the ESP-01, send AT+UART_DEF=9600,8,1,0,0 once, then wire ESP TX → D8 and D6 → ESP RX through a 1k/2k divider.',
      boards: ['uno'],
      versions: ['b'],
    },
    {
      id: 'cloud-trends',
      title: 'Cloud trends',
      detail: 'ThingSpeak fields for BPM, SpO2, temp and SOS every 20s (free tier: one update per 15s). Caretaker dashboard with 24h charts + a React alert email.',
      versions: ['b'],
    },
    {
      id: 'validate-disclaim',
      title: 'Validate + disclaim',
      detail: 'Compare against a commercial oximeter, record error %, and label it an educational prototype — not a medical device or medical advice.',
    },
  ],
  simulator: {
    viz: 'gauge',
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
      note: 'Libraries: SparkFun MAX3010x, OneWire, DallasTemperature, Adafruit SSD1306. SpO2: add SparkFun Example 8 (spo2_algorithm).',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE 4
#define BUZZER 13
const byte RATE_SIZE = 10;            // 10-beat rolling average
MAX30105 ppg;
OneWire oneWire(ONE_WIRE);
DallasTemperature temp(&oneWire);
byte rates[RATE_SIZE], rateIdx = 0, filled = 0;
long lastBeat = 0;
float bpmAvg = 0, tempC = 0;
unsigned long lastTemp = 0, normalSince = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();                       // SDA 21, SCL 22
  if (!ppg.begin(Wire, I2C_SPEED_FAST)) Serial.println("MAX30102 not found");
  ppg.setup(0x1F, 4, 2, 400, 411, 4096);
  temp.begin();
  temp.setWaitForConversion(false);   // a blocking read stalls beat detection ~750 ms
  temp.requestTemperatures();
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  long ir = ppg.getIR();
  if (ir < 50000) {                   // no finger: reset the average
    memset(rates, 0, sizeof rates); rateIdx = filled = 0; bpmAvg = 0;
  } else if (checkForBeat(ir)) {
    long now = millis();
    float bpm = 60000.0 / (now - lastBeat);
    lastBeat = now;
    if (bpm > 40 && bpm < 200) {
      rates[rateIdx] = (byte)bpm;
      rateIdx = (rateIdx + 1) % RATE_SIZE;
      if (filled < RATE_SIZE) filled++;
      int sum = 0;
      for (byte i = 0; i < RATE_SIZE; i++) sum += rates[i];
      bpmAvg = (float)sum / filled;
    }
  }
  if (millis() - lastTemp > 2000) {
    tempC = temp.getTempCByIndex(0);
    temp.requestTemperatures();
    lastTemp = millis();
  }
  bool abnormal = filled == RATE_SIZE && (bpmAvg > 120 || bpmAvg < 50);
  if (!abnormal) normalSince = millis();
  digitalWrite(BUZZER, millis() - normalSince > 10000 ? HIGH : LOW);  // 10 s persistence
  // ... print bpmAvg + tempC to OLED ...
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · Vitals + alarms (NodeMCU)',
      note: 'Same libraries and logic: MAX30102 + OLED share I²C on D2/D1, DS18B20 on D5, buzzer on D7.',
      board: 'nodemcu',
      versions: ['a', 'b'],
      code: `#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE D5
#define BUZZER D7
const byte RATE_SIZE = 10;            // 10-beat rolling average
MAX30105 ppg;
OneWire oneWire(ONE_WIRE);
DallasTemperature temp(&oneWire);
byte rates[RATE_SIZE], rateIdx = 0, filled = 0;
long lastBeat = 0;
float bpmAvg = 0, tempC = 0;
unsigned long lastTemp = 0, normalSince = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);                 // SDA, SCL
  if (!ppg.begin(Wire, I2C_SPEED_FAST)) Serial.println("MAX30102 not found");
  ppg.setup(0x1F, 4, 2, 400, 411, 4096);
  temp.begin();
  temp.setWaitForConversion(false);   // a blocking read stalls beat detection ~750 ms
  temp.requestTemperatures();
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  long ir = ppg.getIR();
  if (ir < 50000) {                   // no finger: reset the average
    memset(rates, 0, sizeof rates); rateIdx = filled = 0; bpmAvg = 0;
  } else if (checkForBeat(ir)) {
    long now = millis();
    float bpm = 60000.0 / (now - lastBeat);
    lastBeat = now;
    if (bpm > 40 && bpm < 200) {
      rates[rateIdx] = (byte)bpm;
      rateIdx = (rateIdx + 1) % RATE_SIZE;
      if (filled < RATE_SIZE) filled++;
      int sum = 0;
      for (byte i = 0; i < RATE_SIZE; i++) sum += rates[i];
      bpmAvg = (float)sum / filled;
    }
  }
  if (millis() - lastTemp > 2000) {
    tempC = temp.getTempCByIndex(0);
    temp.requestTemperatures();
    lastTemp = millis();
  }
  bool abnormal = filled == RATE_SIZE && (bpmAvg > 120 || bpmAvg < 50);
  if (!abnormal) normalSince = millis();
  digitalWrite(BUZZER, millis() - normalSince > 10000 ? HIGH : LOW);  // 10 s persistence
  // ... print bpmAvg + tempC to OLED ...
}`,
    },
    {
      id: 'a-uno',
      label: 'A · Vitals + alarms (Uno)',
      note: 'Libraries: SparkFun MAX3010x, OneWire, DallasTemperature, U8g2 (U8x8 text mode — Adafruit SSD1306 alone takes half of 2 KB RAM). DS18B20 on D2, buzzer on D5; the MAX30102 sits behind the level shifter. For B, send the vitals to the ESP-01 link (D8/D6) instead of the cloud sketch below.',
      board: 'uno',
      versions: ['a', 'b'],
      code: `#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <U8x8lib.h>
#define ONE_WIRE 2
#define BUZZER 5
const byte RATE_SIZE = 10;            // 10-beat rolling average
MAX30105 ppg;
OneWire oneWire(ONE_WIRE);
DallasTemperature temp(&oneWire);
U8X8_SSD1306_128X64_NONAME_HW_I2C oled(U8X8_PIN_NONE);
byte rates[RATE_SIZE], rateIdx = 0, filled = 0;
long lastBeat = 0;
float bpmAvg = 0, tempC = 0;
unsigned long lastTemp = 0, normalSince = 0, lastDraw = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();                       // SDA A4, SCL A5 (MAX30102 behind the level shifter)
  if (!ppg.begin(Wire, I2C_SPEED_FAST)) Serial.println("MAX30102 not found");
  ppg.setup(0x1F, 4, 2, 400, 411, 4096);
  temp.begin();
  temp.setWaitForConversion(false);   // a blocking read stalls beat detection ~750 ms
  temp.requestTemperatures();
  pinMode(BUZZER, OUTPUT);
  oled.begin();
  oled.setFont(u8x8_font_chroma48medium8_r);
}

void loop() {
  long ir = ppg.getIR();
  if (ir < 50000) {                   // no finger: reset the average
    memset(rates, 0, sizeof rates); rateIdx = filled = 0; bpmAvg = 0;
  } else if (checkForBeat(ir)) {
    long now = millis();
    float bpm = 60000.0 / (now - lastBeat);
    lastBeat = now;
    if (bpm > 40 && bpm < 200) {
      rates[rateIdx] = (byte)bpm;
      rateIdx = (rateIdx + 1) % RATE_SIZE;
      if (filled < RATE_SIZE) filled++;
      int sum = 0;
      for (byte i = 0; i < RATE_SIZE; i++) sum += rates[i];
      bpmAvg = (float)sum / filled;
    }
  }
  if (millis() - lastTemp > 2000) {
    tempC = temp.getTempCByIndex(0);
    temp.requestTemperatures();
    lastTemp = millis();
  }
  bool abnormal = filled == RATE_SIZE && (bpmAvg > 120 || bpmAvg < 50);
  if (!abnormal) normalSince = millis();
  bool alert = millis() - normalSince > 10000;  // 10 s persistence
  digitalWrite(BUZZER, alert ? HIGH : LOW);
  if (millis() - lastDraw > 500) {
    lastDraw = millis();
    oled.setCursor(0, 0);
    oled.print("BPM:"); oled.print(filled ? bpmAvg : 0, 0); oled.print("   ");
    oled.setCursor(0, 1);
    oled.print("T:"); oled.print(tempC, 1); oled.print("C   ");
    oled.setCursor(0, 2);
    oled.print(alert ? "! CHECK VITALS !" : "                ");
  }
}`,
    },
    {
      id: 'b',
      label: 'B · Cloud upload',
      note: 'Library: ThingSpeak. Uploads vitals every 20s; a latched SOS press goes out on the next allowed slot (free tier: one update per 15s).',
      board: 'esp32',
      versions: ['b'],
      code: `#include <WiFi.h>
#include <ThingSpeak.h>
#define SOS 27
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const unsigned long CHANNEL_ID = 0;   // your channel number
const char* WRITE_KEY = "YOUR_THINGSPEAK_KEY";
WiFiClient client;
unsigned long lastUpload = 0;
bool sosLatched = false;

void setup() {
  pinMode(SOS, INPUT_PULLUP);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  ThingSpeak.begin(client);
}

void upload(float bpm, float spo2, float t, bool sos) {
  ThingSpeak.setField(1, bpm);
  ThingSpeak.setField(2, spo2);
  ThingSpeak.setField(3, t);
  ThingSpeak.setField(4, sos ? 1 : 0);
  ThingSpeak.writeFields(CHANNEL_ID, WRITE_KEY);
}

void loop() {
  // ... keep running the version A loop: bpmAvg, spo2Avg, tempC ...
  if (digitalRead(SOS) == LOW) sosLatched = true;
  unsigned long gap = sosLatched ? 15000 : 20000;
  if (millis() - lastUpload >= gap) {
    upload(75.0, 97.0, 36.6, sosLatched);  // replace with live vars
    sosLatched = false;
    lastUpload = millis();
  }
}`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · Cloud upload (NodeMCU)',
      note: 'Library: ThingSpeak (works on ESP8266). Same 20s upload with latched SOS on D6; native Wi-Fi via ESP8266WiFi.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#include <ESP8266WiFi.h>
#include <ThingSpeak.h>
#define SOS D6
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const unsigned long CHANNEL_ID = 0;   // your channel number
const char* WRITE_KEY = "YOUR_THINGSPEAK_KEY";
WiFiClient client;
unsigned long lastUpload = 0;
bool sosLatched = false;

void setup() {
  pinMode(SOS, INPUT_PULLUP);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  ThingSpeak.begin(client);
}

void upload(float bpm, float spo2, float t, bool sos) {
  ThingSpeak.setField(1, bpm);
  ThingSpeak.setField(2, spo2);
  ThingSpeak.setField(3, t);
  ThingSpeak.setField(4, sos ? 1 : 0);
  ThingSpeak.writeFields(CHANNEL_ID, WRITE_KEY);
}

void loop() {
  // ... keep running the version A loop: bpmAvg, spo2Avg, tempC ...
  if (digitalRead(SOS) == LOW) sosLatched = true;
  unsigned long gap = sosLatched ? 15000 : 20000;
  if (millis() - lastUpload >= gap) {
    upload(75.0, 97.0, 36.6, sosLatched);  // replace with live vars
    sosLatched = false;
    lastUpload = millis();
  }
}`,
    },
  ],
  tips: [
    { title: 'Stillness matters', detail: 'Finger motion dwarfs the pulse signal — brace the hand on the table.' },
    { title: 'Block light', detail: 'A foam ring around the sensor kills ambient-light noise.' },
    { title: 'Average always', detail: 'Never alarm on one sample; use rolling averages + persistence timers.' },
    { title: 'Disclaim clearly', detail: 'Label every slide: educational prototype, not a medical device — validated against device X with Y% error.' },
  ],
}
