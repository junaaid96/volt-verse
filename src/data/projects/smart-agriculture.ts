import type { Project } from '../types'

export const smartAgriculture: Project = {
  slug: 'smart-agriculture',
  categoryId: 'iot',
  title: 'Smart Agriculture Field Monitoring',
  tagline: 'Soil, climate and auto-irrigation with LCD, web or cloud versions.',
  difficulty: 'Basic',
  weeks: '2–3 weeks',
  cost: '৳2,300–4,300',
  boards: ['Arduino Uno', 'ESP8266'],
  skills: ['Analog sensing', 'Relay control', 'LCD display', 'ThingSpeak'],
  scene: 'field',
  updated: 'Oct 2026',
  sheets: ['esp8266', 'dht22', 'arduino-uno', 'thingspeak-docs'],
  rig: { sensor: 'soil', extras: ['relay'] },
  featured: true,
  options: [
    {
      id: 'a',
      title: 'A. Auto-irrigation with LCD',
      level: 'Basic · easiest',
      blurb: 'No internet. Arduino reads soil + DHT22, shows values on LCD, relay runs the pump automatically.',
      points: ['Arduino Uno, soil sensor, DHT22, relay, pump, LCD', '~2–3 weeks', 'Great if you need a safe pass'],
      weeks: '2 weeks',
      cost: '৳2,300–3,000',
    },
    {
      id: 'b',
      title: 'B. Wi-Fi web dashboard',
      level: 'Medium · best value',
      blurb: 'NodeMCU reads sensors, hosts a web page on your Wi-Fi with live data and a manual pump button.',
      points: ['NodeMCU ESP8266 does everything', 'Live page on phone/laptop', 'Most impressive for the effort'],
      weeks: '3 weeks',
      cost: '৳2,500–3,500',
    },
    {
      id: 'c',
      title: 'C. Cloud logging + charts',
      level: 'Medium+ · extra marks',
      blurb: 'Same as B, but readings go to ThingSpeak/Firebase and render as history charts with alerts.',
      points: ['2 soil sensors = 2 zones', 'Charts + alerts', 'Needs stable Wi-Fi'],
      weeks: '3–4 weeks',
      cost: '৳3,000–4,300',
    },
  ],
  parts: [
    { name: 'Arduino Uno R3', qty: '1', role: 'Main controller (A)', price: '৳600–1,000' },
    { name: 'Capacitive soil moisture sensor', qty: '1–2', role: 'Measures soil wetness', price: '৳150–350 each' },
    { name: 'DHT22', qty: '1', role: 'Air temp & humidity', price: '৳250–450' },
    { name: 'ESP8266 NodeMCU', qty: '1', role: 'Wi-Fi / web page (B, C)', price: '৳300–500' },
    { name: 'Relay module (5V)', qty: '1', role: 'Switches the pump', price: '৳80–180' },
    { name: 'Mini DC pump + tube', qty: '1', role: 'Waters the plant', price: '৳200–450' },
    { name: '16×2 I²C LCD', qty: '1', role: 'Local display', price: '৳180–350' },
    { name: 'Breadboard + jumpers', qty: '1 set', role: 'Connections', price: '৳200–400' },
    { name: 'Extras (5V supply, tub, box, pot)', qty: '–', role: 'Power & housing', price: '৳700–1,500' },
  ],
  wiring: [
    {
      id: 'arduino',
      label: 'Arduino (A)',
      board: 'Arduino Uno',
      pins: [
        { from: 'Soil → VCC', to: '5V' },
        { from: 'Soil → GND', to: 'GND' },
        { from: 'Soil → AOUT', to: 'A0' },
        { from: 'DHT22 → DATA', to: 'D2 (+ 10k pull-up)' },
        { from: 'Relay → IN', to: 'D7' },
        { from: 'Relay → VCC/GND', to: '5V / GND' },
        { from: 'LCD → SDA', to: 'A4' },
        { from: 'LCD → SCL', to: 'A5' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU (B/C)',
      board: 'ESP8266 NodeMCU',
      pins: [
        { from: 'Soil → AOUT', to: 'A0' },
        { from: 'Soil → VCC/GND', to: '3V3 / GND' },
        { from: 'DHT22 → DATA', to: 'D4' },
        { from: 'Relay → IN', to: 'D5' },
        { from: 'LCD → SDA', to: 'D2' },
        { from: 'LCD → SCL', to: 'D1' },
      ],
    },
  ],
  steps: [
    { title: 'Learn the parts alone', detail: 'New to Arduino? Run a few interactive 3D lessons first, then test each part with its example sketch: soil raw values, DHT readings, LCD hello-world, relay click.' },
    { title: 'Wire the sensing side', detail: 'Connect soil sensor and DHT22 on the breadboard. Open Serial Monitor and confirm stable readings before adding the pump.' },
    { title: 'Add relay + pump safely', detail: 'Wire relay IN to the control pin. Power the pump from its own 5V supply through the relay contacts — never from an Arduino pin.' },
    { title: 'Flash the control logic', detail: 'Upload version A, B or C below. Default rule: pump ON below 35% moisture, OFF above 55% (hysteresis stops relay chatter).' },
    { title: 'Calibrate your soil', detail: 'Note raw values for dry air and a glass of water, then map to 0–100%. Adjust the dry threshold for your soil type.' },
    { title: 'Build the demo rig', detail: 'Pot + plant, water tub, tube fixed in soil, electronics in a box away from water. Add a 10s safety timeout per cycle.' },
    { title: 'Measure and present', detail: 'Record before/after moisture, film the pump starting automatically, and screenshot the dashboard or ThingSpeak chart.' },
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
      note: 'Needs libraries: DHT sensor, LiquidCrystal_I2C. Hysteresis + 10s safety timeout included.',
      code: `#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#define DHTPIN 2
#define DHTTYPE DHT22
#define SOIL A0
#define RELAY 7
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
const int DRY = 35, WET = 55;   // hysteresis band
unsigned long pumpStart = 0;
bool pumping = false;

void setup() {
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, HIGH);    // relay OFF (active low)
  dht.begin(); lcd.init(); lcd.backlight();
}

void loop() {
  int raw = analogRead(SOIL);
  int soil = map(raw, 850, 350, 0, 100);  // calibrate!
  soil = constrain(soil, 0, 100);
  float t = dht.readTemperature(), h = dht.readHumidity();

  if (!pumping && soil < DRY) { pumping = true; pumpStart = millis(); }
  if (pumping && (soil > WET || millis() - pumpStart > 10000)) pumping = false;
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
      note: 'ESP8266 + ESP8266WebServer. Open the shown IP on your phone (same Wi-Fi).',
      code: `#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#define DHTPIN D4
#define DHTTYPE DHT22
#define SOIL A0
#define RELAY D5
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
DHT dht(DHTPIN, DHTTYPE);
ESP8266WebServer server(80);
bool manual = false;

String page(int soil, float t, float h, bool pump) {
  return "<h1>Field Monitor</h1><p>Soil: " + String(soil) +
    "% Temp: " + String(t) + "C Hum: " + String(h) +
    "% Pump: " + (pump ? "ON" : "OFF") +
    "</p><a href='/pump'>Toggle pump</a><meta http-equiv='refresh' content='5'>";
}

void setup() {
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);
  dht.begin();
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  server.on("/", [&]() {
    int soil = constrain(map(analogRead(SOIL), 850, 350, 0, 100), 0, 100);
    bool pump = manual || soil < 35;
    digitalWrite(RELAY, pump ? LOW : HIGH);
    server.send(200, "text/html", page(soil, dht.readTemperature(), dht.readHumidity(), pump));
  });
  server.on("/pump", [&]() { manual = !manual; server.sendHeader("Location", "/"); server.send(303); });
  server.begin();
}
void loop() { server.handleClient(); }`,
    },
    {
      id: 'c',
      label: 'C · Cloud (ThingSpeak)',
      note: 'Send field1=soil, field2=temp, field3=humidity every 20s. Free ThingSpeak channel works.',
      code: `#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#define DHTPIN D4
#define DHTTYPE DHT22
#define SOIL A0
#define RELAY D5
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const String APIKEY = "YOUR_THINGSPEAK_KEY";
DHT dht(DHTPIN, DHTTYPE);
bool pumping = false;

void setup() {
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);
  dht.begin(); WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  int soil = constrain(map(analogRead(SOIL), 850, 350, 0, 100), 0, 100);
  float t = dht.readTemperature(), h = dht.readHumidity();
  if (!pumping && soil < 35) pumping = true;
  if (pumping && soil > 55) pumping = false;
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://api.thingspeak.com/update?api_key=" + APIKEY
      + "&field1=" + soil + "&field2=" + t + "&field3=" + h;
    http.begin(url); http.GET(); http.end();
  }
  delay(20000);  // ThingSpeak free limit: 15s+
}`,
    },
  ],
  tips: [
    { title: 'Calibrate', detail: 'Print raw values for dry air and a glass of water, then map them to 0–100%.' },
    { title: 'Add hysteresis', detail: 'Pump ON below 35%, OFF above 55%, so the relay does not chatter.' },
    { title: 'Safety timeout', detail: 'Stop the pump after 10s per cycle in case the sensor fails, then rest 60s.' },
    { title: 'Show results', detail: 'Take a before/after soil reading and a short video of the pump starting automatically.' },
  ],
}
