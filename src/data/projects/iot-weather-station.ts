import type { Project } from '../types'

export const weatherStation: Project = {
  slug: 'iot-weather-station',
  categoryId: 'iot',
  title: 'IoT Weather Station',
  tagline: 'Temp, humidity, pressure and rain with live cloud charts.',
  difficulty: 'Basic',
  weeks: '2 weeks',
  cost: '৳1,800–3,200',
  boards: ['ESP8266', 'ESP32'],
  skills: ['BME280 sensing', 'Rain gauge', 'ThingSpeak', 'OLED display'],
  scene: 'climate',
  updated: 'Oct 2026',
  sheets: ['esp8266', 'bme280', 'thingspeak-docs'],
  rig: { sensor: 'bme', extras: ['oled'] },
  featured: true,
  options: [
    {
      id: 'a',
      title: 'A. LCD desktop station',
      level: 'Basic · easiest',
      blurb: 'BME280 + rain sensor on ESP8266 with an OLED readout. No cloud needed.',
      points: ['BME280 does temp/humidity/pressure', 'OLED live values', 'Battery-friendly'],
      weeks: '1–2 weeks',
      cost: '৳1,800–2,400',
    },
    {
      id: 'b',
      title: 'B. Cloud station + charts',
      level: 'Medium · best value',
      blurb: 'Same hardware plus ThingSpeak logging, alerts and a public chart link for your report.',
      points: ['History charts + CSV export', 'Rain alerts via webhook', 'Solar-power option'],
      weeks: '2–3 weeks',
      cost: '৳2,200–3,200',
    },
  ],
  parts: [
    { name: 'ESP8266 NodeMCU', qty: '1', role: 'Controller + Wi-Fi', price: '৳300–500' },
    { name: 'BME280 module', qty: '1', role: 'Temp / humidity / pressure', price: '৳350–600' },
    { name: 'Rain sensor (MH-RD)', qty: '1', role: 'Rain detect + intensity', price: '৳120–250' },
    { name: '0.96" OLED (I²C)', qty: '1', role: 'Local display', price: '৳350–550' },
    { name: 'LDR + 10k resistor', qty: '1', role: 'Light level', price: '৳30–60' },
    { name: 'Breadboard + jumpers', qty: '1 set', role: 'Connections', price: '৳200–400' },
    { name: 'Weather housing (box + vents)', qty: '1', role: 'Outdoor protection', price: '৳300–600' },
  ],
  wiring: [
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      pins: [
        { from: 'BME280 → SDA', to: 'D2' },
        { from: 'BME280 → SCL', to: 'D1' },
        { from: 'BME280 → VCC/GND', to: '3V3 / GND' },
        { from: 'OLED → SDA/SCL', to: 'D2 / D1 (shared bus)' },
        { from: 'Rain → AO', to: 'A0 (via divider)' },
        { from: 'Rain → DO', to: 'D5' },
        { from: 'LDR divider →', to: 'A0 alternate / D6 digital' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'BME280 → SDA', to: 'GPIO21' },
        { from: 'BME280 → SCL', to: 'GPIO22' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'Rain → AO', to: 'GPIO34' },
        { from: 'Rain → DO', to: 'GPIO25' },
        { from: 'LDR divider →', to: 'GPIO35' },
      ],
    },
  ],
  steps: [
    { title: 'Verify each sensor', detail: 'Run BME280, OLED and rain-sensor examples separately. Confirm plausible temp/humidity before combining.' },
    { title: 'Share one I²C bus', detail: 'BME280 (0x76) and OLED (0x3C) share SDA/SCL — different addresses, no conflict. Scan with an I²C scanner sketch.' },
    { title: 'Add rain + light', detail: 'Mount the rain plate tilted so water runs off. Calibrate wet/dry analog values with a spray bottle.' },
    { title: 'Log to the cloud', detail: 'Create a ThingSpeak channel with 4 fields, paste the key, and confirm charts update every 20s.' },
    { title: 'Weatherproof the rig', detail: 'Ventilated box, sensors shaded from direct sun, rain plate outside. BME280 inside reads high if sunlit.' },
    { title: 'Present 48h of data', detail: 'Export CSV, plot a day/night cycle, and correlate one rain event with your humidity spike.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: when rain intensity crosses the threshold, the station raises a RAIN alert.',
    sliders: [
      { id: 'rain', label: 'Rain intensity', unit: '%', min: 0, max: 100, value: 12 },
      { id: 'temp', label: 'Temperature', unit: '°C', min: 10, max: 45, value: 31 },
      { id: 'hum', label: 'Humidity', unit: '%', min: 20, max: 100, value: 74 },
    ],
    threshold: { id: 'thr', label: 'Rain alert at', unit: '%', min: 20, max: 90, value: 50 },
    watch: 'rain',
    rule: 'above',
    actuator: 'Alert',
    onText: 'RAIN',
    offText: 'clear',
    lcd: ['T:{temp}C H:{hum}%', 'Rain:{rain}% {act}'],
    demoSlider: 'rain',
    demoFrom: 10,
    demoTo: 85,
    barLabel: 'Rain level',
  },
  code: [
    {
      id: 'a',
      label: 'A · OLED station',
      note: 'Libraries: Adafruit BME280, Adafruit SSD1306.',
      code: `#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SSD1306.h>
#define RAIN_A A0
#define RAIN_D D5
Adafruit_BME280 bme;
Adafruit_SSD1306 oled(128, 64, &Wire);

void setup() {
  pinMode(RAIN_D, INPUT);
  bme.begin(0x76);
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0;
  int rain = map(analogRead(RAIN_A), 1024, 300, 0, 100);
  bool raining = digitalRead(RAIN_D) == LOW;

  oled.clearDisplay();
  oled.setTextSize(1); oled.setTextColor(1);
  oled.setCursor(0, 0);
  oled.printf("T:%.1fC H:%.0f%%\\nP:%.0fhPa\\nRain:%d%% %s",
    t, h, p, rain, raining ? "RAIN" : "clear");
  oled.display();
  delay(2000);
}`,
    },
    {
      id: 'b',
      label: 'B · ThingSpeak logger',
      note: 'Fields: 1=temp 2=humidity 3=pressure 4=rain. Post every 20s.',
      code: `#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Adafruit_BME280.h>
#define RAIN_A A0
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const String KEY = "YOUR_THINGSPEAK_KEY";
Adafruit_BME280 bme;

void setup() {
  bme.begin(0x76);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0;
  int rain = map(analogRead(RAIN_A), 1024, 300, 0, 100);

  HTTPClient http;
  http.begin("http://api.thingspeak.com/update?api_key=" + KEY +
    "&field1=" + t + "&field2=" + h + "&field3=" + p + "&field4=" + rain);
  http.GET(); http.end();
  delay(20000);
}`,
    },
  ],
  tips: [
    { title: 'Shade the BME280', detail: 'Direct sun adds 3–5°C. A louvered white cover fixes it.' },
    { title: 'Debounce rain', detail: 'Require 3 wet reads in a row before flagging RAIN.' },
    { title: 'Deep-sleep it', detail: 'On battery, sleep 60s between reads to last for weeks.' },
    { title: 'Export CSV', detail: 'ThingSpeak CSV export makes great report graphs.' },
  ],
}
