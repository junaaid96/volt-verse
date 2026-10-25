import type { Project } from '../types'

export const smartAgriculture: Project = {
  slug: 'smart-agriculture',
  categoryId: 'iot',
  title: 'Smart Agriculture Field Monitoring',
  tagline: 'Soil, climate and auto-irrigation with LCD, web or cloud versions.',
  difficulty: 'Basic',
  weeks: '2–4 weeks',
  cost: '৳2,300–4,300',
  boards: ['Arduino Uno', 'ESP8266', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: {
      ok: true,
      note: 'Version A runs natively. B and C need the ESP-01 Wi-Fi link (wiring below) driven by AT commands — NodeMCU or ESP32 is far simpler for those.',
    },
    esp32: { ok: true, note: 'Best for C: two ADC1 pins give you two soil zones with Wi-Fi on.' },
    nodemcu: { ok: true, note: 'Only one analog pin (A0), so C logs a single soil zone.' },
    esp32cam: {
      ok: false,
      reason: 'Its free pins are all ADC2, so the soil sensor can’t be read while Wi-Fi is on, and too few are left for DHT22, relay and LCD. Use an ESP32 DevKit.',
    },
  },
  skills: ['Analog sensing', 'Relay control', 'LCD display', 'ThingSpeak'],
  scene: 'field',
  updated: 'Oct 2026',
  sheets: ['esp8266', 'esp32', 'dht22', 'arduino-uno', 'thingspeak-docs'],
  rig: { sensor: 'soil', extras: ['relay'] },
  featured: true,
  options: [
    {
      id: 'a',
      title: 'A. Auto-irrigation with LCD',
      level: 'Basic · easiest',
      blurb: 'No internet. The board reads soil + DHT22, shows values on an LCD and runs the pump through a relay automatically.',
      points: ['Soil sensor, DHT22, relay, pump, LCD', '~2 weeks', 'Great if you need a safe pass'],
      weeks: '2 weeks',
      cost: '৳2,300–3,000',
    },
    {
      id: 'b',
      title: 'B. Wi-Fi web dashboard',
      level: 'Medium · best value',
      blurb: 'The board reads sensors and hosts a web page on your Wi-Fi with live data and a manual pump button.',
      points: ['NodeMCU or ESP32 does everything', 'Live page on phone/laptop', 'Most impressive for the effort'],
      weeks: '3 weeks',
      cost: '৳2,500–3,500',
    },
    {
      id: 'c',
      title: 'C. Cloud logging + charts',
      level: 'Medium+ · extra marks',
      blurb: 'Same sensing as B, but readings go to ThingSpeak and render as history charts with alerts.',
      points: ['2nd soil sensor = 2 zones (ESP32/Uno — NodeMCU has one ADC)', 'Charts + alerts', 'Needs stable Wi-Fi'],
      weeks: '3–4 weeks',
      cost: '৳3,000–4,300',
    },
  ],
  parts: [
    { name: 'Arduino Uno R3', qty: '1', role: 'Main controller', price: '৳600–1,000', boards: ['uno'] },
    { name: 'ESP32 DevKit (WROOM-32)', qty: '1', role: 'Controller + Wi-Fi', price: '৳450–700', boards: ['esp32'] },
    { name: 'ESP8266 NodeMCU', qty: '1', role: 'Controller + Wi-Fi', price: '৳300–500', boards: ['nodemcu'] },
    { name: 'ESP-01 + 5V adapter', qty: '1', role: 'Wi-Fi link for the Uno', price: '৳250–400', boards: ['uno'], versions: ['b', 'c'] },
    { name: 'Capacitive soil moisture sensor', qty: '1', role: 'Measures soil wetness', price: '৳150–350' },
    { name: 'Second soil sensor', qty: '1', role: 'Zone 2 moisture', price: '৳150–350', versions: ['c'], boards: ['uno', 'esp32'] },
    { name: 'DHT22', qty: '1', role: 'Air temp & humidity', price: '৳250–450' },
    { name: 'Relay module (5V)', qty: '1', role: 'Switches the pump', price: '৳80–180' },
    { name: 'Mini DC pump + tube', qty: '1', role: 'Waters the plant', price: '৳200–450' },
    { name: '16×2 I²C LCD', qty: '1', role: 'Local display', price: '৳180–350', versions: ['a'] },
    { name: 'I²C level shifter (4-ch)', qty: '1', role: '5V LCD ↔ 3V3 pins', price: '৳60–120', versions: ['a'], boards: ['esp32', 'nodemcu'] },
    { name: 'Breadboard + jumpers', qty: '1 set', role: 'Connections', price: '৳200–400' },
    { name: 'Extras (5V supply, tub, box, pot)', qty: '–', role: 'Power & housing', price: '৳700–1,500' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'Soil → VCC/GND', to: '5V / GND' },
        { from: 'Soil → AOUT', to: 'A0' },
        { from: 'Soil 2 → AOUT (C)', to: 'A1' },
        { from: 'DHT22 → VCC/GND', to: '5V / GND' },
        { from: 'DHT22 → DATA', to: 'D2 (+ 10k pull-up)' },
        { from: 'Relay → VCC/GND', to: '5V / GND' },
        { from: 'Relay → IN', to: 'D7' },
        { from: 'LCD → VCC/GND (A)', to: '5V / GND' },
        { from: 'LCD → SDA / SCL (A)', to: 'A4 / A5' },
        { from: 'ESP-01 adapter → VCC/GND (B/C)', to: '5V / GND' },
        { from: 'ESP-01 → TX (B/C)', to: 'D4 (SoftwareSerial RX)' },
        { from: 'ESP-01 → RX (B/C)', to: 'D5 via 1k/2k divider' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'Soil → VCC/GND', to: '3V3 / GND' },
        { from: 'Soil → AOUT', to: 'GPIO34 (ADC1)' },
        { from: 'Soil 2 → AOUT (C)', to: 'GPIO35 (ADC1)' },
        { from: 'DHT22 → VCC/GND', to: '3V3 / GND' },
        { from: 'DHT22 → DATA', to: 'GPIO4 (+ 10k pull-up to 3V3)' },
        { from: 'Relay → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'Relay → IN', to: 'GPIO26' },
        { from: 'LCD → VCC/GND (A)', to: 'VIN (5V) / GND' },
        { from: 'LCD → SDA / SCL (A)', to: 'GPIO21 / GPIO22 via level shifter' },
        { from: 'Level shifter → LV / HV (A)', to: '3V3 / VIN (5V)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'Soil → VCC/GND', to: '3V3 / GND' },
        { from: 'Soil → AOUT', to: 'A0' },
        { from: 'DHT22 → VCC/GND', to: '3V3 / GND' },
        { from: 'DHT22 → DATA', to: 'D6 (+ 10k pull-up to 3V3)' },
        { from: 'Relay → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'Relay → IN', to: 'D5' },
        { from: 'LCD → VCC/GND (A)', to: 'VIN (5V) / GND' },
        { from: 'LCD → SDA / SCL (A)', to: 'D2 / D1 via level shifter' },
        { from: 'Level shifter → LV / HV (A)', to: '3V3 / VIN (5V)' },
      ],
    },
    {
      id: 'pump',
      label: 'Pump circuit',
      board: 'Relay + 5V pump supply',
      pins: [
        { from: '5V supply +', to: 'Relay COM' },
        { from: 'Relay NO', to: 'Pump +' },
        { from: 'Pump −', to: '5V supply −' },
      ],
    },
  ],
  steps: [
    {
      id: 'learn-parts',
      title: 'Learn the parts alone',
      detail: 'New to microcontrollers? Run a few interactive 3D lessons first, then test each part with its example sketch: soil raw values, DHT readings, LCD hello-world, relay click.',
    },
    {
      id: 'install-esp32-core',
      title: 'Install the ESP32 board package',
      detail: 'In Arduino IDE Boards Manager install "esp32 by Espressif" (3.x) and pick ESP32 Dev Module. If upload stalls at "Connecting…", hold BOOT.',
      boards: ['esp32'],
    },
    {
      id: 'install-esp8266-core',
      title: 'Install the ESP8266 board package',
      detail: 'In Arduino IDE Boards Manager install "esp8266 by ESP8266 Community" and pick NodeMCU 1.0 (ESP-12E). Install the CH340/CP2102 driver if no port appears.',
      boards: ['nodemcu'],
    },
    {
      id: 'wire-sensing',
      title: 'Wire the sensing side',
      detail: 'Soil AOUT → A0 and DHT22 DATA → D2 (10k pull-up), both on 5V. Open Serial Monitor and confirm stable readings before adding the pump.',
      boardDetail: {
        esp32: 'Soil AOUT → GPIO34 (ADC1, works with Wi-Fi) and DHT22 DATA → GPIO4 (10k pull-up), both on 3V3. Confirm stable readings in Serial Monitor before adding the pump.',
        nodemcu: 'Soil AOUT → A0 and DHT22 DATA → D6 (10k pull-up), both on 3V3. Confirm stable readings in Serial Monitor before adding the pump.',
      },
    },
    {
      id: 'add-relay-pump',
      title: 'Add relay + pump safely',
      detail: 'Relay IN → D7, relay VCC → 5V. Power the pump from its own 5V supply through the relay COM/NO contacts — never from an Arduino pin.',
      boardDetail: {
        esp32: 'Relay IN → GPIO26, relay VCC → VIN (5V). Power the pump from its own 5V supply through COM/NO. If the relay never releases at 3V3 logic, use a 3V3-trigger module or an NPN driver.',
        nodemcu: 'Relay IN → D5, relay VCC → VIN (5V). Power the pump from its own 5V supply through COM/NO. If the relay never releases at 3V3 logic, use a 3V3-trigger module or an NPN driver.',
      },
    },
    {
      id: 'add-lcd',
      title: 'Add the LCD',
      detail: 'LCD SDA → A4, SCL → A5, VCC → 5V. Run an I²C scanner: the backpack is usually 0x27 (or 0x3F) — set that address in the sketch.',
      versions: ['a'],
      boardDetail: {
        esp32: 'The LCD needs 5V: power it from VIN and run SDA/SCL through the level shifter to GPIO21/GPIO22 (LV 3V3, HV 5V). Scan for 0x27 or 0x3F.',
        nodemcu: 'The LCD needs 5V: power it from VIN and run SDA/SCL through the level shifter to D2/D1 (LV 3V3, HV 5V). Scan for 0x27 or 0x3F.',
      },
    },
    {
      id: 'add-esp01-link',
      title: 'Add the ESP-01 Wi-Fi link',
      detail: 'ESP-01 adapter on 5V, its TX → D4, its RX ← D5 through a 1k/2k divider. Once, send AT+UART_DEF=9600,8,1,0,0 so SoftwareSerial stays reliable. B: serve the page with AT+CIPMUX=1 + AT+CIPSERVER=1,80. C: post to ThingSpeak with AT+CIPSTART + AT+CIPSEND.',
      versions: ['b', 'c'],
      boards: ['uno'],
    },
    {
      id: 'add-zone-two',
      title: 'Add a second soil zone',
      detail: 'Wire the second soil sensor to A1 (5V) and push it into the second pot. Log it as field5.',
      versions: ['c'],
      boards: ['uno', 'esp32'],
      boardDetail: {
        esp32: 'Wire the second soil sensor to GPIO35 (ADC1, 3V3) and push it into the second pot. The sketch logs it as field5.',
      },
    },
    {
      id: 'flash-control-logic',
      title: 'Flash the control logic',
      detail: 'Upload the sketch for your version below. Default rule: pump ON below 35% moisture, OFF above 55% (hysteresis stops relay chatter), max 10s per run then a 60s soak.',
    },
    {
      id: 'open-dashboard',
      title: 'Open the web dashboard',
      detail: 'Open Serial Monitor at 115200 to read the board’s IP, open it on a phone on the same Wi-Fi and test the manual pump button.',
      versions: ['b'],
      boardDetail: {
        uno: 'Read the ESP-01’s IP with AT+CIFSR, open it on a phone on the same Wi-Fi and test the manual pump button.',
      },
    },
    {
      id: 'setup-thingspeak',
      title: 'Create the ThingSpeak channel',
      detail: 'Make a free channel with fields 1 soil, 2 temp, 3 humidity, 4 pump (5 = zone 2 if you have it), paste the Write API Key and confirm charts update every 20s. Add a React rule for a dry-soil alert.',
      versions: ['c'],
    },
    {
      id: 'calibrate-soil',
      title: 'Calibrate your soil',
      detail: 'Note raw values for dry air and a glass of water, put them in DRY_RAW / WET_RAW, then adjust the 35% dry threshold for your soil type.',
    },
    {
      id: 'build-demo-rig',
      title: 'Build the demo rig',
      detail: 'Pot + plant, water tub, tube fixed in soil, electronics in a box away from water. Pull the sensor out once to check the 10s timeout stops the pump.',
    },
    {
      id: 'measure-present',
      title: 'Measure and present',
      detail: 'Record before/after moisture, film the pump starting automatically, and screenshot the dashboard or ThingSpeak chart.',
    },
  ],
  simulator: {
    intro: 'Test the same rule your code will use: if soil moisture drops below the threshold, the pump turns on.',
    sliders: [
      { id: 'soil', label: 'Soil moisture', unit: '%', min: 0, max: 100, value: 55 },
      { id: 'temp', label: 'Temperature', unit: '°C', min: 10, max: 45, value: 29 },
      { id: 'hum', label: 'Humidity', unit: '%', min: 20, max: 100, value: 68 },
    ],
    threshold: { id: 'thr', label: 'Dry threshold', unit: '%', min: 10, max: 60, value: 35 },
    watch: 'soil',
    rule: 'below',
    band: 20,
    actuator: 'Pump',
    onText: 'ON',
    offText: 'OFF',
    lcd: ['Soil:{soil}% T:{temp}C', 'Hum:{hum}% Pump:{act}'],
    demoSlider: 'soil',
    demoFrom: 70,
    demoTo: 15,
    barLabel: 'Soil level',
  },
  code: [
    {
      id: 'a',
      label: 'A · Arduino + LCD',
      note: 'Needs libraries: DHT sensor, LiquidCrystal_I2C. Hysteresis + 10s safety timeout + 60s soak included.',
      board: 'uno',
      versions: ['a'],
      code: `#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#define DHTPIN 2
#define DHTTYPE DHT22
#define SOIL A0
#define RELAY 7
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
const int DRY_RAW = 600, WET_RAW = 280;  // calibrate: dry air / glass of water
const int DRY = 35, WET = 55;            // hysteresis band (%)
unsigned long pumpStart = 0, pumpStop = 0;
bool pumping = false, resting = false;

void setup() {
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, HIGH);    // relay OFF (active low)
  dht.begin(); lcd.init(); lcd.backlight();
}

void loop() {
  int soil = map(analogRead(SOIL), DRY_RAW, WET_RAW, 0, 100);
  soil = constrain(soil, 0, 100);
  float t = dht.readTemperature(), h = dht.readHumidity();

  if (resting && millis() - pumpStop > 60000) resting = false;
  if (!pumping && !resting && soil < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (soil > WET || millis() - pumpStart > 10000)) {
    pumping = false; resting = true; pumpStop = millis();
  }
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  lcd.setCursor(0, 0);
  lcd.print("S:" + String(soil) + "% T:" + String(t, 1) + "C ");
  lcd.setCursor(0, 1);
  lcd.print("H:" + String(h, 0) + "% P:" + String(pumping ? "ON " : "OFF"));
  delay(1000);
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · NodeMCU + LCD',
      note: 'Same logic as the Uno sketch: soil A0, DHT22 D6, relay D5, LCD SDA/SCL D2/D1 via the level shifter. Recalibrate DRY_RAW / WET_RAW for the 3V3 sensor supply.',
      board: 'nodemcu',
      versions: ['a'],
      code: `#include <Wire.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#define DHTPIN D6
#define DHTTYPE DHT22
#define SOIL A0
#define RELAY D5
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
const int DRY_RAW = 900, WET_RAW = 430;  // calibrate: dry air / glass of water
const int DRY = 35, WET = 55;            // hysteresis band (%)
unsigned long pumpStart = 0, pumpStop = 0;
bool pumping = false, resting = false;

void setup() {
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, HIGH);    // relay OFF (active low)
  dht.begin();
  Wire.begin(D2, D1);           // SDA, SCL through the level shifter
  lcd.init(); lcd.backlight();
}

void loop() {
  int soil = map(analogRead(SOIL), DRY_RAW, WET_RAW, 0, 100);
  soil = constrain(soil, 0, 100);
  float t = dht.readTemperature(), h = dht.readHumidity();

  if (resting && millis() - pumpStop > 60000) resting = false;
  if (!pumping && !resting && soil < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (soil > WET || millis() - pumpStart > 10000)) {
    pumping = false; resting = true; pumpStop = millis();
  }
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  lcd.setCursor(0, 0);
  lcd.print("S:" + String(soil) + "% T:" + String(t, 1) + "C ");
  lcd.setCursor(0, 1);
  lcd.print("H:" + String(h, 0) + "% P:" + String(pumping ? "ON " : "OFF"));
  delay(1000);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 + LCD',
      note: 'Same logic as the Uno sketch: soil GPIO34 (ADC1), DHT22 GPIO4, relay GPIO26, LCD GPIO21/22 via the level shifter. 12-bit ADC — recalibrate DRY_RAW / WET_RAW.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <Wire.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL 34
#define RELAY 26
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
const int DRY_RAW = 3500, WET_RAW = 1600;  // 12-bit ADC: calibrate!
const int DRY = 35, WET = 55;              // hysteresis band (%)
unsigned long pumpStart = 0, pumpStop = 0;
bool pumping = false, resting = false;

void setup() {
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, HIGH);    // relay OFF (active low)
  dht.begin();
  Wire.begin(21, 22);           // SDA, SCL through the level shifter
  lcd.init(); lcd.backlight();
}

void loop() {
  int soil = map(analogRead(SOIL), DRY_RAW, WET_RAW, 0, 100);
  soil = constrain(soil, 0, 100);
  float t = dht.readTemperature(), h = dht.readHumidity();

  if (resting && millis() - pumpStop > 60000) resting = false;
  if (!pumping && !resting && soil < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (soil > WET || millis() - pumpStart > 10000)) {
    pumping = false; resting = true; pumpStop = millis();
  }
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  lcd.setCursor(0, 0);
  lcd.print("S:" + String(soil) + "% T:" + String(t, 1) + "C ");
  lcd.setCursor(0, 1);
  lcd.print("H:" + String(h, 0) + "% P:" + String(pumping ? "ON " : "OFF"));
  delay(1000);
}`,
    },
    {
      id: 'b',
      label: 'B · NodeMCU dashboard',
      note: 'ESP8266 + ESP8266WebServer. The IP prints in Serial Monitor (115200); open it on your phone (same Wi-Fi).',
      board: 'nodemcu',
      versions: ['b'],
      code: `#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#define DHTPIN D6
#define DHTTYPE DHT22
#define SOIL A0
#define RELAY D5
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const int DRY_RAW = 900, WET_RAW = 430;  // calibrate: dry air / glass of water
const int DRY = 35, WET = 55;
DHT dht(DHTPIN, DHTTYPE);
ESP8266WebServer server(80);
int soil = 0;
float t = NAN, h = NAN;
bool manual = false, pumping = false, resting = false;
unsigned long lastRead = 0, pumpStart = 0, pumpStop = 0;

void handleRoot() {
  String html = "<meta name='viewport' content='width=device-width'>"
    "<meta http-equiv='refresh' content='5'><h1>Field Monitor</h1><p>Soil: ";
  html += String(soil) + "% Temp: " + String(t, 1) + "C Hum: " + String(h, 0) + "%</p><p>Pump: ";
  html += (pumping || manual) ? "ON" : "OFF";
  html += manual ? " (manual)" : " (auto)";
  html += "</p><a href='/pump'>Toggle manual pump</a>";
  server.send(200, "text/html", html);
}

void handleToggle() {
  manual = !manual;
  server.sendHeader("Location", "/");
  server.send(303);
}

void readAndControl() {
  soil = map(analogRead(SOIL), DRY_RAW, WET_RAW, 0, 100);
  soil = constrain(soil, 0, 100);
  t = dht.readTemperature(); h = dht.readHumidity();
  if (resting && millis() - pumpStop > 60000) resting = false;
  if (!pumping && !resting && soil < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (soil > WET || millis() - pumpStart > 10000)) {
    pumping = false; resting = true; pumpStop = millis();
  }
  if (manual && soil > WET) manual = false;
  digitalWrite(RELAY, (pumping || manual) ? LOW : HIGH);
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);  // relay OFF (active low)
  dht.begin();
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.on("/pump", handleToggle);
  server.begin();
}

void loop() {
  server.handleClient();
  if (millis() - lastRead > 2000) { lastRead = millis(); readAndControl(); }
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 dashboard',
      note: 'ESP32 + WebServer. Soil GPIO34 (ADC1 works with Wi-Fi on), DHT22 GPIO4, relay GPIO26. The IP prints in Serial Monitor (115200); open it on your phone (same Wi-Fi).',
      board: 'esp32',
      versions: ['b'],
      code: `#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL 34
#define RELAY 26
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const int DRY_RAW = 3500, WET_RAW = 1600;  // 12-bit ADC: calibrate!
const int DRY = 35, WET = 55;
DHT dht(DHTPIN, DHTTYPE);
WebServer server(80);
int soil = 0;
float t = NAN, h = NAN;
bool manual = false, pumping = false, resting = false;
unsigned long lastRead = 0, pumpStart = 0, pumpStop = 0;

void handleRoot() {
  String html = "<meta name='viewport' content='width=device-width'>"
    "<meta http-equiv='refresh' content='5'><h1>Field Monitor</h1><p>Soil: ";
  html += String(soil) + "% Temp: " + String(t, 1) + "C Hum: " + String(h, 0) + "%</p><p>Pump: ";
  html += (pumping || manual) ? "ON" : "OFF";
  html += manual ? " (manual)" : " (auto)";
  html += "</p><a href='/pump'>Toggle manual pump</a>";
  server.send(200, "text/html", html);
}

void handleToggle() {
  manual = !manual;
  server.sendHeader("Location", "/");
  server.send(303);
}

void readAndControl() {
  soil = map(analogRead(SOIL), DRY_RAW, WET_RAW, 0, 100);
  soil = constrain(soil, 0, 100);
  t = dht.readTemperature(); h = dht.readHumidity();
  if (resting && millis() - pumpStop > 60000) resting = false;
  if (!pumping && !resting && soil < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (soil > WET || millis() - pumpStart > 10000)) {
    pumping = false; resting = true; pumpStop = millis();
  }
  if (manual && soil > WET) manual = false;
  digitalWrite(RELAY, (pumping || manual) ? LOW : HIGH);
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);  // relay OFF (active low)
  dht.begin();
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.on("/pump", handleToggle);
  server.begin();
}

void loop() {
  server.handleClient();
  if (millis() - lastRead > 2000) { lastRead = millis(); readAndControl(); }
}`,
    },
    {
      id: 'c',
      label: 'C · Cloud (ThingSpeak)',
      note: 'Sends field1=soil, field2=temp, field3=humidity, field4=pump every 20s. Free ThingSpeak channel works.',
      board: 'nodemcu',
      versions: ['c'],
      code: `#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#define DHTPIN D6
#define DHTTYPE DHT22
#define SOIL A0
#define RELAY D5
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const String APIKEY = "YOUR_THINGSPEAK_KEY";
const int DRY_RAW = 900, WET_RAW = 430;  // calibrate: dry air / glass of water
const int DRY = 35, WET = 55;
DHT dht(DHTPIN, DHTTYPE);
WiFiClient client;
int soil = 0;
float t = NAN, h = NAN;
bool pumping = false, resting = false;
unsigned long lastRead = 0, lastPost = 0, pumpStart = 0, pumpStop = 0;

void readAndControl() {
  soil = map(analogRead(SOIL), DRY_RAW, WET_RAW, 0, 100);
  soil = constrain(soil, 0, 100);
  t = dht.readTemperature(); h = dht.readHumidity();
  if (resting && millis() - pumpStop > 60000) resting = false;
  if (!pumping && !resting && soil < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (soil > WET || millis() - pumpStart > 10000)) {
    pumping = false; resting = true; pumpStop = millis();
  }
  digitalWrite(RELAY, pumping ? LOW : HIGH);
}

void post() {
  HTTPClient http;
  String url = "http://api.thingspeak.com/update?api_key=" + APIKEY +
    "&field1=" + soil + "&field2=" + String(t, 1) + "&field3=" + String(h, 0) +
    "&field4=" + (pumping ? 1 : 0);
  http.begin(client, url);
  http.GET();
  http.end();
}

void setup() {
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);  // relay OFF (active low)
  dht.begin();
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
}

void loop() {
  if (millis() - lastRead > 2000) { lastRead = millis(); readAndControl(); }
  // ThingSpeak free limit: one update per 15s
  if (WiFi.status() == WL_CONNECTED && millis() - lastPost > 20000) { lastPost = millis(); post(); }
}`,
    },
    {
      id: 'c-esp32',
      label: 'C · ESP32 two zones',
      note: 'Zone 2 goes to field5. One pump follows the drier zone — add a second relay + pump for truly separate zones.',
      board: 'esp32',
      versions: ['c'],
      code: `#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL1 34
#define SOIL2 35
#define RELAY 26
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const String APIKEY = "YOUR_THINGSPEAK_KEY";
const int DRY_RAW = 3500, WET_RAW = 1600;  // 12-bit ADC: calibrate!
const int DRY = 35, WET = 55;
DHT dht(DHTPIN, DHTTYPE);
int soil1 = 0, soil2 = 0;
float t = NAN, h = NAN;
bool pumping = false, resting = false;
unsigned long lastRead = 0, lastPost = 0, pumpStart = 0, pumpStop = 0;

int readSoil(int pin) {
  int pct = map(analogRead(pin), DRY_RAW, WET_RAW, 0, 100);
  return constrain(pct, 0, 100);
}

void readAndControl() {
  soil1 = readSoil(SOIL1); soil2 = readSoil(SOIL2);
  t = dht.readTemperature(); h = dht.readHumidity();
  int driest = soil1 < soil2 ? soil1 : soil2;
  if (resting && millis() - pumpStop > 60000) resting = false;
  if (!pumping && !resting && driest < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (driest > WET || millis() - pumpStart > 10000)) {
    pumping = false; resting = true; pumpStop = millis();
  }
  digitalWrite(RELAY, pumping ? LOW : HIGH);
}

void post() {
  HTTPClient http;
  String url = "http://api.thingspeak.com/update?api_key=" + APIKEY +
    "&field1=" + soil1 + "&field2=" + String(t, 1) + "&field3=" + String(h, 0) +
    "&field4=" + (pumping ? 1 : 0) + "&field5=" + soil2;
  http.begin(url);
  http.GET();
  http.end();
}

void setup() {
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);  // relay OFF (active low)
  dht.begin();
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
}

void loop() {
  if (millis() - lastRead > 2000) { lastRead = millis(); readAndControl(); }
  if (WiFi.status() == WL_CONNECTED && millis() - lastPost > 20000) { lastPost = millis(); post(); }
}`,
    },
  ],
  tips: [
    { title: 'Calibrate', detail: 'Print raw values for dry air and a glass of water, then map them to 0–100%. ESP32 reads 0–4095, Uno/NodeMCU 0–1023.' },
    { title: 'Add hysteresis', detail: 'Pump ON below 35%, OFF above 55%, so the relay does not chatter.' },
    { title: 'Safety timeout', detail: 'Stop the pump after 10s per cycle in case the sensor fails, then rest 60s so water can soak in.' },
    { title: 'Relays on 3V3 boards', detail: 'Power the relay module from 5V (VIN). If a 3V3 pin can’t switch it off, use a 3V3-trigger module or an NPN transistor driver.' },
    { title: 'Show results', detail: 'Take a before/after soil reading and a short video of the pump starting automatically.' },
  ],
}
