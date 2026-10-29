import type { Project } from '../types'

const aqiHelpers = `int toAQI(int pm) {  // US EPA 2024 PM2.5 breakpoints (integer-simplified)
  if (pm <= 9) return map(pm, 0, 9, 0, 50);
  if (pm <= 35) return map(pm, 10, 35, 51, 100);
  if (pm <= 55) return map(pm, 36, 55, 101, 150);
  if (pm <= 125) return map(pm, 56, 125, 151, 200);
  if (pm <= 225) return map(pm, 126, 225, 201, 300);
  return 301;
}

bool readPM25(Stream& s, int& pm25) {
  if (s.available() < 32 || s.read() != 0x42 || s.read() != 0x4D) return false;
  uint8_t f[30];
  s.readBytes(f, 30);
  uint16_t sum = 0x42 + 0x4D;
  for (int i = 0; i < 28; i++) sum += f[i];
  if (sum != ((f[28] << 8) | f[29])) return false;  // corrupt frame
  pm25 = (f[10] << 8) | f[11];                       // atmospheric PM2.5
  return true;
}

void showBand(int aqi) {  // common-cathode RGB: green / yellow / red / purple
  digitalWrite(G, aqi <= 100);
  digitalWrite(R, aqi > 50);
  digitalWrite(B, aqi > 200);
}`

export const airQuality: Project = {
  slug: 'air-quality-node',
  categoryId: 'iot',
  title: 'Air Quality Monitoring Node',
  tagline: 'PM2.5, CO2 and gas sensing with AQI dashboard.',
  difficulty: 'Medium',
  weeks: '2–4 weeks',
  cost: '৳3,400–8,000',
  boards: ['ESP32', 'ESP8266', 'Arduino Uno'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Version A only. The Blynk gauge needs an ESP-01 serial link (the Uno prints a CSV line, the ESP-01 pushes it). Build B on the ESP32: the RA-02 is 3.3V-only and the Uno can’t deep-sleep on solar.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: true,
      note: 'Version A only — the RA-02 needs the SPI pins (D5–D8) the sensors and LED already use, so build B on the ESP32.',
    },
    esp32cam: {
      ok: false,
      reason: 'Needs ~8 pins (PMS UART, MQ135 analog, DHT22, OLED, RGB LED); the ESP32-CAM has ~4 free and they are all ADC2, so the MQ135 can’t be read with Wi-Fi on.',
    },
  },
  skills: ['PM sensing', 'AQI math', 'LoRa option', 'Dashboards'],
  scene: 'climate',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'pms5003', 'sx1278', 'dht22', 'mq135', 'ssd1306', 'esp-01', 'tp4056', 'blynk-docs', 'thingspeak-docs'],
  rig: { sensor: 'pms', extras: ['bme', 'mq'] },
  options: [
    {
      id: 'a',
      title: 'A. Indoor monitor',
      level: 'Medium · core build',
      blurb: 'PMS5003 + MQ135 with OLED AQI readout and a Blynk room gauge.',
      points: ['True PM2.5/PM10 laser data', 'AQI color scale', 'Room ventilation alerts'],
      weeks: '2 weeks',
      cost: '৳3,400–5,000',
    },
    {
      id: 'b',
      title: 'B. Outdoor LoRa node',
      level: 'Advanced · extra marks',
      blurb: 'Solar-powered ESP32 node sending AQI over LoRa to a gateway — real sensor-network topology.',
      points: ['LoRa long-range link', 'Solar + deep sleep', 'Multi-node map'],
      weeks: '3–4 weeks',
      cost: '৳5,900–8,000',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳650–1,100', boards: ['uno'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳350–550', boards: ['nodemcu'] },
    { name: 'PMS5003 sensor', qty: '1', role: 'PM2.5/PM10 laser', price: '৳1,800–2,800' },
    { name: 'MQ135 gas sensor', qty: '1', role: 'Air-quality gases', price: '৳180–350' },
    { name: 'DHT22', qty: '1', role: 'Temp/humidity compensation', price: '৳250–450' },
    { name: 'OLED + RGB LED', qty: '1 set', role: 'AQI readout', price: '৳400–600' },
    { name: 'Resistors 10k + 20k', qty: '1 set', role: 'MQ135 AO divider (5V → 3.3V)', price: '৳10–30', boards: ['esp32', 'nodemcu'] },
    { name: 'ESP-01 + 3V3 adapter', qty: '1', role: 'Wi-Fi link for Blynk (+ 1k/2k divider)', price: '৳250–400', boards: ['uno'], versions: ['a'] },
    { name: 'LoRa RA-02 (433 MHz)', qty: '2', role: 'Node + gateway radios', price: '৳1,100–1,600', versions: ['b'] },
    { name: 'Gateway ESP32 DevKit', qty: '1', role: 'LoRa → ThingSpeak bridge', price: '৳470–850', versions: ['b'] },
    { name: 'Solar kit', qty: '1 set', role: '6 W panel + TP4056 + 2×18650 + 5V boost', price: '৳900–1,500', versions: ['b'] },
    { name: 'Enclosure + fan vent', qty: '1', role: 'Airflow housing', price: '৳300–600' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'PMS5003 → VCC / GND', to: '5V (VIN) / GND' },
        { from: 'PMS5003 → TX / RX', to: 'GPIO16 (RX2) / GPIO17 (TX2)' },
        { from: 'MQ135 → VCC / GND', to: '5V (VIN) / GND' },
        { from: 'MQ135 → AO', to: '10k/20k divider → GPIO34 (ADC1)' },
        { from: 'DHT22 → DATA', to: 'GPIO4 + 10k pull-up to 3V3' },
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (VCC 3V3)' },
        { from: 'RGB LED → R / G / B', to: 'GPIO25 / 26 / 27 via 220Ω' },
      ],
    },
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'PMS5003 → VCC / GND', to: '5V / GND' },
        { from: 'PMS5003 → TX', to: 'D8 (SoftwareSerial RX)' },
        { from: 'PMS5003 → RX', to: 'not connected (active mode)' },
        { from: 'MQ135 → VCC / AO', to: '5V / A0 (direct, 5V ADC)' },
        { from: 'DHT22 → DATA', to: 'D4 + 10k pull-up to 5V' },
        { from: 'OLED → SDA / SCL', to: 'A4 / A5' },
        { from: 'RGB LED → R / G / B', to: 'D5 / D6 / D9 via 220Ω' },
        { from: 'ESP-01 → RX', to: 'D3 via 1k/2k divider (Blynk link)' },
        { from: 'ESP-01 → VCC / GND', to: 'ESP-01 adapter on 5V / GND (not the Uno 3V3)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'PMS5003 → VCC / GND', to: 'VIN (5V) / GND' },
        { from: 'PMS5003 → TX', to: 'D5 (GPIO14, SoftwareSerial RX)' },
        { from: 'MQ135 → VCC / GND', to: 'VIN (5V) / GND' },
        { from: 'MQ135 → AO', to: '10k/20k divider → A0' },
        { from: 'DHT22 → DATA', to: 'D6 (GPIO12) + 10k pull-up to 3V3' },
        { from: 'OLED → SDA / SCL', to: 'D2 / D1 (GPIO4 / GPIO5)' },
        { from: 'RGB LED → R / G / B', to: 'D8 / D7 / D0 via 220Ω (LED to GND keeps D8 LOW at boot)' },
      ],
    },
    {
      id: 'lora',
      label: 'LoRa node',
      board: 'ESP32 + RA-02',
      versions: ['b'],
      pins: [
        { from: 'RA-02 → VCC / GND', to: '3V3 / GND (never 5V)' },
        { from: 'RA-02 → SCK / MISO / MOSI', to: 'GPIO18 / 19 / 23 (VSPI)' },
        { from: 'RA-02 → NSS / RST / DIO0', to: 'GPIO5 / 14 / 32' },
        { from: 'RA-02 → ANT', to: 'Antenna fitted before power-up' },
        { from: 'Solar panel → TP4056 →', to: '2×18650 → 5V boost → VIN' },
      ],
    },
  ],
  steps: [
    {
      id: 'burn-in-mq135',
      title: 'Burn in the MQ135',
      detail: 'Power it from 5V for 24h before calibration — fresh gas sensors drift badly on day one. AO swings up to 5V, so it goes through the 10k/20k divider into GPIO34 (ADC1 keeps working with Wi-Fi on).',
      boardDetail: {
        uno: 'Power it from 5V for 24h before calibration — fresh gas sensors drift badly on day one. AO goes straight into A0; the Uno ADC reads 0–5V.',
        nodemcu: 'Power it from VIN (5V) for 24h before calibration — fresh gas sensors drift badly on day one. AO swings up to 5V, so it goes through the 10k/20k divider into A0 (the only ADC, 0–3.3V).',
      },
    },
    {
      id: 'read-pm-uart',
      title: 'Read PM over UART',
      detail: 'PMS5003 streams frames in its default active mode: its TX → GPIO16 (UART2 RX) at 9600 baud. Check the 0x42 0x4D header and the checksum before parsing.',
      boardDetail: {
        uno: 'PMS5003 streams frames in its default active mode: its 3.3V TX → D8 via SoftwareSerial at 9600 baud. Check the 0x42 0x4D header and the checksum before parsing.',
        nodemcu: 'PMS5003 streams frames in its default active mode: its TX → D5 (GPIO14) via SoftwareSerial at 9600 baud. Check the 0x42 0x4D header and the checksum before parsing.',
      },
    },
    {
      id: 'compute-aqi',
      title: 'Compute AQI',
      detail: 'Convert PM2.5 µg/m³ with the US EPA breakpoints (2024 revision: Good ends at 9.0). Map bands to green / yellow / red / purple on the RGB LED.',
    },
    {
      id: 'add-compensation',
      title: 'Add compensation',
      detail: 'Log DHT22 temp/humidity alongside — above ~80% RH laser PM sensors over-read as droplets count as particles, and examiners ask about cross-sensitivity.',
    },
    {
      id: 'push-blynk-gauge',
      title: 'Push to a Blynk gauge',
      versions: ['a'],
      detail: 'Blynk IoT template with V0 = PM2.5, V1 = AQI. Define BLYNK_TEMPLATE_ID / NAME / AUTH_TOKEN before including BlynkSimpleEsp32, and push every 10s with BlynkTimer — never from loop() directly.',
      boardDetail: {
        uno: 'The Uno has no Wi-Fi: flash the ESP-01 with a Blynk sketch (BlynkSimpleEsp8266) that reads "pm,aqi" lines on its RX, and have the Uno print that line on D3 every 10s.',
        nodemcu: 'Blynk IoT template with V0 = PM2.5, V1 = AQI. Define BLYNK_TEMPLATE_ID / NAME / AUTH_TOKEN before including BlynkSimpleEsp8266, and push every 10s with BlynkTimer — never from loop() directly.',
      },
    },
    {
      id: 'lora-link',
      title: 'LoRa link',
      versions: ['b'],
      detail: 'Node packs ID + PM2.5 + AQI + temp into 7 bytes every 5 min; a second ESP32 + RA-02 gateway forwards to ThingSpeak. Fit the antenna before powering the RA-02 and test range outdoors.',
    },
    {
      id: 'solar-deep-sleep',
      title: 'Solar + deep sleep',
      versions: ['b'],
      detail: 'TP4056 charges the 18650s; a 5V boost feeds the ESP32, PMS5003 and MQ135. The ESP32 deep-sleeps between sends, but the MQ135 heater and PMS fan still draw ~1W — measure the current and size the panel for it.',
    },
    {
      id: 'deploy-compare',
      title: 'Deploy + compare',
      detail: 'Run 48h next to a reference (government station or phone app) and report correlation.',
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: PM2.5 above the limit pushes AQI to unhealthy and lights red.',
    sliders: [
      { id: 'pm', label: 'PM2.5', unit: 'µg/m³', min: 0, max: 300, value: 42 },
      { id: 'gas', label: 'Gas index', unit: '', min: 0, max: 500, value: 120 },
      { id: 'hum', label: 'Humidity', unit: '%', min: 20, max: 100, value: 65 },
    ],
    threshold: { id: 'thr', label: 'Unhealthy above', unit: 'µg/m³', min: 35, max: 150, value: 55 },
    watch: 'pm',
    rule: 'above',
    actuator: 'AQI',
    onText: 'POOR',
    offText: 'ok',
    lcd: ['PM:{pm} G:{gas}', 'AQI:{act} H:{hum}%'],
    demoSlider: 'pm',
    demoFrom: 25,
    demoTo: 160,
    barLabel: 'PM2.5 level',
  },
  code: [
    {
      id: 'a',
      label: 'A · AQI reader',
      note: 'PMS5003 on UART2 + checksum + EPA breakpoints + RGB band output.',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#include <HardwareSerial.h>
HardwareSerial pms(2);
const int R = 25, G = 26, B = 27;

${aqiHelpers}

void setup() {
  Serial.begin(115200);
  pms.begin(9600, SERIAL_8N1, 16, 17);  // RX = GPIO16 ← PMS TX
  pinMode(R, OUTPUT); pinMode(G, OUTPUT); pinMode(B, OUTPUT);
}

void loop() {
  int pm25;
  if (readPM25(pms, pm25)) {
    int aqi = toAQI(pm25);
    showBand(aqi);
    Serial.printf("PM2.5=%d AQI=%d\\n", pm25, aqi);
  }
}`,
    },
    {
      id: 'a-uno',
      label: 'A · AQI reader (Uno)',
      note: 'Same logic on SoftwareSerial D8. D7 is the unused TX pin — leave it unconnected.',
      board: 'uno',
      versions: ['a'],
      code: `#include <SoftwareSerial.h>
SoftwareSerial pms(8, 7);  // RX = D8 ← PMS TX
const int R = 5, G = 6, B = 9;

${aqiHelpers}

void setup() {
  Serial.begin(115200);
  pms.begin(9600);
  pinMode(R, OUTPUT); pinMode(G, OUTPUT); pinMode(B, OUTPUT);
}

void loop() {
  int pm25;
  if (readPM25(pms, pm25)) {
    int aqi = toAQI(pm25);
    showBand(aqi);
    Serial.print("PM2.5="); Serial.print(pm25);
    Serial.print(" AQI="); Serial.println(aqi);
  }
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · AQI reader (NodeMCU)',
      note: 'Same logic on SoftwareSerial D5 (bundled with the ESP8266 core).',
      board: 'nodemcu',
      versions: ['a'],
      code: `#include <SoftwareSerial.h>
SoftwareSerial pms(D5, -1);  // RX = D5 ← PMS TX, no TX pin
const int R = D8, G = D7, B = D0;

${aqiHelpers}

void setup() {
  Serial.begin(115200);
  pms.begin(9600);
  pinMode(R, OUTPUT); pinMode(G, OUTPUT); pinMode(B, OUTPUT);
}

void loop() {
  int pm25;
  if (readPM25(pms, pm25)) {
    int aqi = toAQI(pm25);
    showBand(aqi);
    Serial.printf("PM2.5=%d AQI=%d\\n", pm25, aqi);
  }
}`,
    },
    {
      id: 'b',
      label: 'B · LoRa sender',
      note: 'Library: LoRa by Sandeep Mistry. 7-byte payload (id + PM2.5 + AQI + temp×10), then 5 min deep sleep.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <SPI.h>
#include <LoRa.h>
#define NSS 5
#define RST 14
#define DIO0 32
const uint64_t SLEEP_US = 5ULL * 60 * 1000000;  // send every 5 min

void sendNode(uint8_t id, int pm, int aqi, float t) {
  int t10 = (int)(t * 10);
  LoRa.beginPacket();
  LoRa.write(id);
  LoRa.write(pm >> 8); LoRa.write(pm & 0xFF);
  LoRa.write(aqi >> 8); LoRa.write(aqi & 0xFF);
  LoRa.write(t10 >> 8); LoRa.write(t10 & 0xFF);
  LoRa.endPacket();
}

void setup() {
  LoRa.setPins(NSS, RST, DIO0);
  if (LoRa.begin(433E6)) {        // RA-02 is 433 MHz — match your gateway
    sendNode(1, 42, 116, 29.5);   // replace with live PMS/DHT values
    LoRa.sleep();
  }
  esp_sleep_enable_timer_wakeup(SLEEP_US);
  esp_deep_sleep_start();         // setup() runs again on wake
}

void loop() {}`,
    },
  ],
  tips: [
    { title: 'Burn-in first', detail: 'MQ sensors need 24h warm-up before any calibration means anything.' },
    { title: 'Airflow', detail: 'PMS5003 needs a vented box with the inlet/outlet clear — sealed boxes read stale air.' },
    { title: 'Cite breakpoints', detail: 'Name the EPA table (2024 revision) in your report; AQI without a standard is just a number.' },
    { title: 'Check LoRa band', detail: 'RA-02 is a 433 MHz module — confirm your country allows it and the gateway uses the same frequency before demo day.' },
  ],
}
