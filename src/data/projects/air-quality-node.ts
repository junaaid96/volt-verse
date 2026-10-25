import type { Project } from '../types'

export const airQuality: Project = {
  slug: 'air-quality-node',
  categoryId: 'iot',
  title: 'Air Quality Monitoring Node',
  tagline: 'PM2.5, CO2 and gas sensing with AQI dashboard.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳3,000–6,500',
  boards: ['ESP32', 'ESP8266'],
  skills: ['PM sensing', 'AQI math', 'LoRa option', 'Dashboards'],
  scene: 'climate',
  updated: 'Oct 2026',
  sheets: ['esp32', 'pms5003', 'sx1278', 'dht22'],
  rig: { sensor: 'pms', extras: ['bme'] },
  options: [
    {
      id: 'a',
      title: 'A. Indoor monitor',
      level: 'Medium · core build',
      blurb: 'PMS5003 + MQ135 on ESP32 with OLED AQI readout and Blynk room gauge.',
      points: ['True PM2.5/PM10 laser data', 'AQI color scale', 'Room ventilation alerts'],
      weeks: '2 weeks',
      cost: '৳3,000–4,200',
    },
    {
      id: 'b',
      title: 'B. Outdoor LoRa node',
      level: 'Advanced · extra marks',
      blurb: 'Solar-powered node sending AQI over LoRa to a gateway — real sensor-network topology.',
      points: ['LoRa long-range link', 'Solar + deep sleep', 'Multi-node map'],
      weeks: '3–4 weeks',
      cost: '৳4,500–6,500',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'PMS5003 sensor', qty: '1', role: 'PM2.5/PM10 laser', price: '৳1,800–2,800' },
    { name: 'MQ135 gas sensor', qty: '1', role: 'Air-quality gases', price: '৳180–350' },
    { name: 'DHT22', qty: '1', role: 'Temp/humidity compensation', price: '৳250–450' },
    { name: 'OLED + RGB LED', qty: '1 set', role: 'AQI readout', price: '৳400–600' },
    { name: 'LoRa RA-02 (B)', qty: '1–2', role: 'Long-range radio', price: '৳600–1,200' },
    { name: 'Enclosure + fan vent', qty: '1', role: 'Airflow housing', price: '৳300–600' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'PMS5003 → TX/RX', to: 'GPIO16 / GPIO17 (UART2)' },
        { from: 'PMS5003 → VCC/GND', to: '5V / GND' },
        { from: 'MQ135 → AO', to: 'GPIO34' },
        { from: 'DHT22 → DATA', to: 'GPIO4' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'RGB LED →', to: 'GPIO25,26,27 via 220Ω' },
      ],
    },
    {
      id: 'lora',
      label: 'LoRa add-on (B)',
      board: 'ESP32 + RA-02',
      pins: [
        { from: 'RA-02 → MOSI/MISO/SCK', to: 'GPIO23/19/18 (SPI)' },
        { from: 'RA-02 → NSS/RST/DIO0', to: 'GPIO5/14/26' },
        { from: 'RGB LED →', to: 'omit in LoRa build (DIO0 shares GPIO26)' },
        { from: 'Solar → TP4056 →', to: '18650 → 5V boost' },
      ],
    },
  ],
  steps: [
    { title: 'Burn in the MQ135', detail: 'Power it 24h before calibration — fresh gas sensors drift badly in the first day.' },
    { title: 'Read PM over UART', detail: 'PMS5003 passive mode on UART2. Verify the 0x42 0x4D frame header before parsing.' },
    { title: 'Compute AQI', detail: 'Convert PM2.5 µg/m³ to AQI breakpoints (US EPA table). Map bands to RGB colors.' },
    { title: 'Add compensation', detail: 'Log temp/humidity alongside — examiners ask about sensor cross-sensitivity.' },
    { title: 'LoRa link (B)', detail: 'Node packs AQI+GPS-free ID into 12 bytes; gateway forwards to ThingSpeak. Test range outdoors.' },
    { title: 'Deploy + compare', detail: 'Run 48h next to a reference (government station or phone app) and report correlation.' },
  ],
  simulator: {
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
      note: 'PMS5003 on UART2 + AQI breakpoints + RGB band output.',
      code: `#include <HardwareSerial.h>
HardwareSerial pms(2);
const int R = 25, G = 26, B = 27;

int toAQI(int pm) {  // US EPA PM2.5 breakpoints (simplified)
  if (pm <= 12) return map(pm, 0, 12, 0, 50);
  if (pm <= 35) return map(pm, 13, 35, 51, 100);
  if (pm <= 55) return map(pm, 36, 55, 101, 150);
  if (pm <= 150) return map(pm, 56, 150, 151, 200);
  return 250;
}

void setup() {
  Serial.begin(115200);
  pms.begin(9600, SERIAL_8N1, 16, 17);
  pinMode(R, OUTPUT); pinMode(G, OUTPUT); pinMode(B, OUTPUT);
}

void loop() {
  if (pms.available() >= 32 && pms.read() == 0x42 && pms.read() == 0x4D) {
    uint8_t f[30];
    pms.readBytes(f, 30);
    int pm25 = (f[10] << 8) | f[11];
    int aqi = toAQI(pm25);
    digitalWrite(G, aqi <= 50);
    digitalWrite(B, aqi > 50 && aqi <= 100);
    digitalWrite(R, aqi > 100);
    Serial.printf("PM2.5=%d AQI=%d\\n", pm25, aqi);
  }
}`,
    },
    {
      id: 'b',
      label: 'B · LoRa sender',
      note: 'Library: LoRa by Sandeep Mistry. 12-byte payload: id + pm + aqi + temp.',
      code: `#include <SPI.h>
#include <LoRa.h>
#define NSS 5
#define RST 14
#define DIO0 26

void setup() {
  LoRa.setPins(NSS, RST, DIO0);
  LoRa.begin(433E6);  // match your region!
}

void sendNode(uint8_t id, int pm, int aqi, float t) {
  LoRa.beginPacket();
  LoRa.write(id);
  LoRa.write(pm >> 8); LoRa.write(pm & 0xFF);
  LoRa.write(aqi >> 8); LoRa.write(aqi & 0xFF);
  LoRa.write((int)(t * 10) >> 8); LoRa.write((int)(t * 10) & 0xFF);
  LoRa.endPacket();
}

void loop() {
  sendNode(1, 42, 96, 29.5);  // replace with live vars
  delay(30000);
}`,
    },
  ],
  tips: [
    { title: 'Burn-in first', detail: 'MQ sensors need 24h warm-up before any calibration means anything.' },
    { title: 'Airflow', detail: 'PMS5003 needs a vented box with the inlet/outlet clear — sealed boxes read stale air.' },
    { title: 'Cite breakpoints', detail: 'Name the EPA table in your report; AQI without a standard is just a number.' },
    { title: 'Check LoRa band', detail: '433/868/915 MHz depends on country — wrong band fails demo day range tests.' },
  ],
}
