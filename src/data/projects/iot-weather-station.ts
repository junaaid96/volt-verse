import type { Project } from '../types'

export const weatherStation: Project = {
  slug: 'iot-weather-station',
  categoryId: 'iot',
  title: 'IoT Weather Station',
  tagline: 'Temp, humidity, pressure and rain with live cloud charts.',
  difficulty: 'Basic',
  weeks: '1–3 weeks',
  cost: '৳1,800–3,200',
  boards: ['ESP8266', 'ESP32', 'Arduino Uno'],
  defaultBoard: 'nodemcu',
  support: {
    uno: {
      ok: true,
      note: 'Version A runs natively (the OLED buffer uses half of the 2 KB RAM). B needs the ESP-01 Wi-Fi link (wiring below) driven by AT commands.',
    },
    esp32: { ok: true, note: 'Extra ADC1 pins add the LDR light reading alongside rain.' },
    nodemcu: { ok: true, note: 'Its single analog pin (A0) goes to the rain sensor, so the LDR is skipped.' },
    esp32cam: {
      ok: false,
      reason: 'Its free pins are all ADC2, so rain intensity can’t be read while Wi-Fi is on, and there is no USB for easy flashing. Use an ESP32 DevKit.',
    },
  },
  skills: ['BME280 sensing', 'Rain gauge', 'ThingSpeak', 'OLED display'],
  scene: 'climate',
  updated: 'Oct 2026',
  sheets: ['esp8266', 'esp32', 'arduino-uno', 'bme280', 'thingspeak-docs'],
  rig: { sensor: 'bme', extras: ['oled'] },
  featured: true,
  options: [
    {
      id: 'a',
      title: 'A. OLED desktop station',
      level: 'Basic · easiest',
      blurb: 'BME280 + rain sensor on a NodeMCU or ESP32 with an OLED readout. No cloud needed.',
      points: ['BME280 does temp/humidity/pressure', 'OLED live values', 'Battery-friendly'],
      weeks: '1–2 weeks',
      cost: '৳1,800–2,400',
    },
    {
      id: 'b',
      title: 'B. Cloud station + charts',
      level: 'Medium · best value',
      blurb: 'Same hardware plus ThingSpeak logging, alerts and a public chart link for your report.',
      points: ['History charts + CSV export', 'Rain alerts via ThingSpeak React', 'Public chart link for your report'],
      weeks: '2–3 weeks',
      cost: '৳2,200–3,200',
    },
  ],
  parts: [
    { name: 'ESP8266 NodeMCU', qty: '1', role: 'Controller + Wi-Fi', price: '৳300–500', boards: ['nodemcu'] },
    { name: 'ESP32 DevKit (WROOM-32)', qty: '1', role: 'Controller + Wi-Fi', price: '৳450–700', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳600–1,000', boards: ['uno'] },
    { name: 'ESP-01 + 5V adapter', qty: '1', role: 'Wi-Fi link for the Uno', price: '৳250–400', boards: ['uno'], versions: ['b'] },
    { name: 'I²C level shifter (4-ch)', qty: '1', role: '3V3 BME280 ↔ 5V Uno bus', price: '৳60–120', boards: ['uno'] },
    { name: 'BME280 module', qty: '1', role: 'Temp / humidity / pressure', price: '৳350–600' },
    { name: 'Rain sensor (MH-RD)', qty: '1', role: 'Rain detect + intensity', price: '৳120–250' },
    { name: '0.96" OLED (I²C)', qty: '1', role: 'Local display', price: '৳350–550' },
    { name: 'LDR + 10k resistor', qty: '1', role: 'Light level', price: '৳30–60', boards: ['esp32', 'uno'] },
    { name: 'Breadboard + jumpers', qty: '1 set', role: 'Connections', price: '৳200–400' },
    { name: 'Weather housing (box + vents)', qty: '1', role: 'Outdoor protection', price: '৳300–600' },
  ],
  wiring: [
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'BME280 → VCC/GND', to: '3V3 / GND' },
        { from: 'BME280 → SDA', to: 'D2' },
        { from: 'BME280 → SCL', to: 'D1' },
        { from: 'OLED → VCC/GND', to: '3V3 / GND' },
        { from: 'OLED → SDA/SCL', to: 'D2 / D1 (shared bus)' },
        { from: 'Rain → VCC/GND', to: '3V3 / GND' },
        { from: 'Rain → AO', to: 'A0' },
        { from: 'Rain → DO', to: 'D5' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'BME280 → VCC/GND', to: '3V3 / GND' },
        { from: 'BME280 → SDA', to: 'GPIO21' },
        { from: 'BME280 → SCL', to: 'GPIO22' },
        { from: 'OLED → VCC/GND', to: '3V3 / GND' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22 (shared bus)' },
        { from: 'Rain → VCC/GND', to: '3V3 / GND' },
        { from: 'Rain → AO', to: 'GPIO34 (ADC1)' },
        { from: 'Rain → DO', to: 'GPIO25' },
        { from: 'LDR (to 3V3) + 10k (to GND) midpoint', to: 'GPIO35 (ADC1)' },
      ],
    },
    {
      id: 'uno',
      label: 'Arduino build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'BME280 → VCC/GND', to: '3V3 / GND' },
        { from: 'BME280 → SDA / SCL', to: 'A4 / A5 via level shifter' },
        { from: 'Level shifter → LV / HV', to: '3V3 / 5V' },
        { from: 'OLED → VCC/GND', to: '5V / GND' },
        { from: 'OLED → SDA / SCL', to: 'A4 / A5' },
        { from: 'Rain → VCC/GND', to: '5V / GND' },
        { from: 'Rain → AO', to: 'A0' },
        { from: 'Rain → DO', to: 'D2' },
        { from: 'LDR (to 5V) + 10k (to GND) midpoint', to: 'A1' },
        { from: 'ESP-01 adapter → VCC/GND (B)', to: '5V / GND' },
        { from: 'ESP-01 → TX (B)', to: 'D4 (SoftwareSerial RX)' },
        { from: 'ESP-01 → RX (B)', to: 'D5 via 1k/2k divider' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-esp8266-core',
      title: 'Install the ESP8266 board package',
      detail: 'In Arduino IDE Boards Manager install "esp8266 by ESP8266 Community" and pick NodeMCU 1.0 (ESP-12E). Install the CH340/CP2102 driver if no port appears.',
      boards: ['nodemcu'],
    },
    {
      id: 'install-esp32-core',
      title: 'Install the ESP32 board package',
      detail: 'In Arduino IDE Boards Manager install "esp32 by Espressif" (3.x) and pick ESP32 Dev Module. If upload stalls at "Connecting…", hold BOOT.',
      boards: ['esp32'],
    },
    {
      id: 'verify-sensors',
      title: 'Verify each sensor',
      detail: 'Run BME280, OLED and rain-sensor examples separately. Confirm plausible temp/humidity before combining.',
    },
    {
      id: 'share-i2c-bus',
      title: 'Share one I²C bus',
      detail: 'BME280 (0x76) and OLED (0x3C) share SDA D2 / SCL D1 — different addresses, no conflict. Run an I²C scanner; some BME280 boards answer at 0x77.',
      boardDetail: {
        esp32: 'BME280 (0x76) and OLED (0x3C) share SDA GPIO21 / SCL GPIO22 — different addresses, no conflict. Run an I²C scanner; some BME280 boards answer at 0x77.',
        uno: 'BME280 (0x76) and OLED (0x3C) share A4 (SDA) / A5 (SCL); the BME280 sits on the 3V3 side of the level shifter. Run an I²C scanner to confirm both.',
      },
    },
    {
      id: 'add-rain-light',
      title: 'Add rain sensing',
      detail: 'Rain AO → A0, DO → D5, module on 3V3. A0 is the only analog pin, so skip the LDR. Mount the plate tilted so water runs off and calibrate wet/dry values with a spray bottle.',
      boardDetail: {
        esp32: 'Rain AO → GPIO34, DO → GPIO25, LDR divider → GPIO35 (ADC1 pins work with Wi-Fi). Mount the plate tilted so water runs off and calibrate wet/dry values with a spray bottle.',
        uno: 'Rain AO → A0, DO → D2, LDR divider → A1. Mount the plate tilted so water runs off and calibrate wet/dry values with a spray bottle.',
      },
    },
    {
      id: 'add-esp01-link',
      title: 'Add the ESP-01 Wi-Fi link',
      detail: 'ESP-01 adapter on 5V, its TX → D4, its RX ← D5 through a 1k/2k divider. Once, send AT+UART_DEF=9600,8,1,0,0 so SoftwareSerial stays reliable, then post to ThingSpeak with AT+CIPSTART + AT+CIPSEND.',
      versions: ['b'],
      boards: ['uno'],
    },
    {
      id: 'log-to-cloud',
      title: 'Log to the cloud',
      detail: 'Create a ThingSpeak channel with 4 fields (1 temp, 2 humidity, 3 pressure, 4 rain), paste the Write API Key, and confirm charts update every 20s.',
      versions: ['b'],
      boardDetail: {
        esp32: 'Create a ThingSpeak channel with 5 fields (1 temp, 2 humidity, 3 pressure, 4 rain, 5 light), paste the Write API Key, and confirm charts update every 20s.',
        uno: 'Create a ThingSpeak channel with 5 fields (1 temp, 2 humidity, 3 pressure, 4 rain, 5 light), and send the update URL through the ESP-01 every 20s.',
      },
    },
    {
      id: 'rain-alert',
      title: 'Set up a rain alert',
      detail: 'In ThingSpeak add a React rule: field4 above 50 → ThingHTTP call to your webhook (Telegram, IFTTT). Trigger it with the spray bottle.',
      versions: ['b'],
    },
    {
      id: 'weatherproof',
      title: 'Weatherproof the rig',
      detail: 'Ventilated box, sensors shaded from direct sun, rain plate outside. BME280 inside reads high if sunlit.',
    },
    {
      id: 'demo-live-station',
      title: 'Demo the live station',
      detail: 'Breathe on the BME280 to show the humidity spike, spray the rain plate to flip the OLED to RAIN, and compare readings with a phone weather app.',
      versions: ['a'],
    },
    {
      id: 'present-48h-data',
      title: 'Present 48h of data',
      detail: 'Export CSV, plot a day/night cycle, and correlate one rain event with your humidity spike.',
      versions: ['b'],
    },
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
      note: 'Libraries: Adafruit BME280, Adafruit SSD1306. Change 0x76 to 0x77 if your scanner shows that.',
      board: 'nodemcu',
      versions: ['a'],
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
  int rain = map(analogRead(RAIN_A), 1023, 300, 0, 100);
  rain = constrain(rain, 0, 100);
  bool raining = digitalRead(RAIN_D) == LOW;

  oled.clearDisplay();
  oled.setTextSize(1); oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  oled.printf("T:%.1fC H:%.0f%%\\nP:%.0fhPa\\nRain:%d%% %s",
    t, h, p, rain, raining ? "RAIN" : "clear");
  oled.display();
  delay(2000);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 OLED station',
      note: 'Same libraries. Adds the LDR light level on GPIO35; ESP32 ADC reads 0–4095.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SSD1306.h>
#define RAIN_A 34
#define RAIN_D 25
#define LDR 35
Adafruit_BME280 bme;
Adafruit_SSD1306 oled(128, 64, &Wire);

void setup() {
  pinMode(RAIN_D, INPUT);
  Wire.begin(21, 22);
  bme.begin(0x76);
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0;
  int rain = map(analogRead(RAIN_A), 4095, 1200, 0, 100);
  rain = constrain(rain, 0, 100);
  int light = map(analogRead(LDR), 0, 4095, 0, 100);
  bool raining = digitalRead(RAIN_D) == LOW;

  oled.clearDisplay();
  oled.setTextSize(1); oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  oled.printf("T:%.1fC H:%.0f%%\\nP:%.0fhPa\\nRain:%d%% %s\\nLight:%d%%",
    t, h, p, rain, raining ? "RAIN" : "clear", light);
  oled.display();
  delay(2000);
}`,
    },
    {
      id: 'b',
      label: 'B · ThingSpeak logger',
      note: 'Fields: 1=temp 2=humidity 3=pressure 4=rain. Posts every 20s. Logging only — merge the OLED block from A to keep the display.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Adafruit_BME280.h>
#define RAIN_A A0
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const String KEY = "YOUR_THINGSPEAK_KEY";
Adafruit_BME280 bme;
WiFiClient client;

void setup() {
  bme.begin(0x76);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0;
  int rain = map(analogRead(RAIN_A), 1023, 300, 0, 100);
  rain = constrain(rain, 0, 100);

  HTTPClient http;
  http.begin(client, "http://api.thingspeak.com/update?api_key=" + KEY +
    "&field1=" + t + "&field2=" + h + "&field3=" + p + "&field4=" + rain);
  http.GET(); http.end();
  delay(20000);  // ThingSpeak free limit: 15s+
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 ThingSpeak logger',
      note: 'Fields: 1=temp 2=humidity 3=pressure 4=rain 5=light. Posts every 20s.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_BME280.h>
#define RAIN_A 34
#define LDR 35
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const String KEY = "YOUR_THINGSPEAK_KEY";
Adafruit_BME280 bme;

void setup() {
  bme.begin(0x76);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0;
  int rain = map(analogRead(RAIN_A), 4095, 1200, 0, 100);
  rain = constrain(rain, 0, 100);
  int light = map(analogRead(LDR), 0, 4095, 0, 100);

  HTTPClient http;
  http.begin("http://api.thingspeak.com/update?api_key=" + KEY +
    "&field1=" + t + "&field2=" + h + "&field3=" + p + "&field4=" + rain + "&field5=" + light);
  http.GET(); http.end();
  delay(20000);  // ThingSpeak free limit: 15s+
}`,
    },
  ],
  tips: [
    { title: 'Shade the BME280', detail: 'Direct sun adds 3–5°C. A louvered white cover fixes it.' },
    { title: 'BME or BMP?', detail: 'Many cheap “BME280” boards are BMP280s with no humidity. If humidity reads 0 or NaN, check the chip ID (BME 0x60, BMP 0x58).' },
    { title: 'Debounce rain', detail: 'Require 3 wet reads in a row before flagging RAIN.' },
    { title: 'Deep-sleep it', detail: 'On battery, deep-sleep 60s between reads (NodeMCU: wire D0 to RST). Dev boards still drain power through the USB chip and regulator, so a bare module lasts far longer.' },
    { title: 'Export CSV', detail: 'ThingSpeak CSV export makes great report graphs.' },
  ],
}
