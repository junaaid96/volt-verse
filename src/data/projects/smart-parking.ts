import type { Project } from '../types'

const slotsAndGates = `const unsigned long STABLE_MS = 500;
Servo gateIn, gateOut;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
bool occupied[SLOTS];
unsigned long changedAt[SLOTS];

void readSlots() {  // a slot flips only after 500ms of stable reads
  for (int i = 0; i < SLOTS; i++) {
    bool now = digitalRead(SLOT_IR[i]) == LOW;  // LOW = car present
    if (now == occupied[i]) changedAt[i] = millis();
    else if (millis() - changedAt[i] > STABLE_MS) occupied[i] = now;
    digitalWrite(SLOT_LED[i], occupied[i] ? LOW : HIGH);  // HIGH = green
  }
}

int freeSlots() {
  int n = 0;
  for (int i = 0; i < SLOTS; i++) if (!occupied[i]) n++;
  return n;
}

void showFree() {
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(2); oled.setCursor(0, 0);
  if (freeSlots() == 0) oled.print("FULL");
  else { oled.print("FREE: "); oled.print(freeSlots()); }
  oled.setTextSize(1); oled.setCursor(0, 32);
  for (int i = 0; i < SLOTS; i++) oled.print(occupied[i] ? "[X] " : "[ ] ");
  oled.display();
}

void openGate(Servo& gate) {
  gate.write(90); delay(3000); gate.write(0);
}

void setup() {
  for (int i = 0; i < SLOTS; i++) {
    pinMode(SLOT_IR[i], INPUT); pinMode(SLOT_LED[i], OUTPUT);
  }
  pinMode(ENTRY_IR, INPUT); pinMode(EXIT_IR, INPUT);
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  gateIn.attach(GATE_IN); gateOut.attach(GATE_OUT);
  gateIn.write(0); gateOut.write(0);
}

void loop() {
  readSlots();
  showFree();
  if (digitalRead(ENTRY_IR) == LOW && freeSlots() > 0) openGate(gateIn);
  if (digitalRead(EXIT_IR) == LOW) openGate(gateOut);
  delay(50);
}`

const oledIncludes = `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>`

export const smartParking: Project = {
  slug: 'smart-parking',
  categoryId: 'iot',
  title: 'Smart Parking System',
  tagline: 'Per-slot sensing with entry gate and live vacancy map.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,500–4,200',
  boards: ['ESP32', 'Arduino Uno', 'NodeMCU'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Version A fits with no expander: 4 slots + entry/exit use A0–A3 and D2–D10. B’s Firebase map needs an ESP-01 serial link. Want 8+ slots? An Arduino Mega has the pins (not a bench board).',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: true,
      note: 'Too few GPIO for six IR sensors directly — they go through a PCF8574 I²C expander that shares D1/D2 with the OLED.',
    },
    esp32cam: {
      ok: false,
      reason: 'Needs ~14 I/O (6 IR sensors, 2 servos, 4 LED pins, OLED); the ESP32-CAM has ~4 free pins.',
    },
  },
  skills: ['IR sensor arrays', 'Servo gates', 'Firebase', 'Web map'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'firebase-docs'],
  rig: { sensor: 'servo', extras: ['ir', 'oled'] },
  options: [
    {
      id: 'a',
      title: 'A. 4-slot model lot',
      level: 'Medium · core build',
      blurb: 'IR sensors per slot, entry/exit servo gates, OLED vacancy count. Tabletop model.',
      points: ['Per-slot red/green LEDs', 'Auto gate on free slot', 'OLED vacancy counter'],
      weeks: '2 weeks',
      cost: '৳2,500–3,400',
    },
    {
      id: 'b',
      title: 'B. Cloud vacancy map',
      level: 'Medium+ · best value',
      blurb: 'Firebase-backed live map: drivers see free slots on their phone before arriving.',
      points: ['Live phone map', 'Entry log + billing hook', 'Works in any phone browser'],
      weeks: '3 weeks',
      cost: '৳3,000–4,200',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳650–1,100', boards: ['uno'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳350–550', boards: ['nodemcu'] },
    { name: 'IR obstacle sensors', qty: '6', role: '4 slots + entry/exit', price: '৳420–700' },
    { name: 'SG90 servos', qty: '2', role: 'Entry/exit gates', price: '৳360–600' },
    { name: 'Slot LEDs red/green', qty: '4 pairs + 220Ω', role: 'Slot status', price: '৳80–150' },
    { name: 'OLED display', qty: '1', role: 'Vacancy counter', price: '৳350–550' },
    { name: 'PCF8574 I/O expander', qty: '1', role: 'IR sensor inputs over I²C', price: '৳150–250', boards: ['nodemcu'] },
    { name: 'ESP-01 + 3V3 adapter', qty: '1', role: 'Wi-Fi link for Firebase (+ 1k/2k divider)', price: '৳250–400', boards: ['uno'], versions: ['b'] },
    { name: 'Base board + toy cars', qty: '1 set', role: 'Model lot', price: '৳400–700' },
    { name: '5V 3A supply', qty: '1', role: 'Servos + logic', price: '৳250–450' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'IR slot 1–4 → OUT', to: 'GPIO32, 33, 34, 35 (input-only pins are fine)' },
        { from: 'Entry / Exit IR → OUT', to: 'GPIO27 / GPIO14' },
        { from: 'IR sensors → VCC', to: '3V3 (keeps outputs ESP-safe)' },
        { from: 'Gate servos → signal', to: 'GPIO13 / GPIO23 (GPIO12 avoided: boot strapping)' },
        { from: 'Servos → V+ / GND', to: '5V 3A supply, common GND with the ESP32' },
        { from: 'Slot LED pairs →', to: 'GPIO16, 17, 18, 19 (green to GND, red to 3V3, 220Ω each)' },
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (VCC 3V3)' },
      ],
    },
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'IR slot 1–4 → OUT', to: 'A0, A1, A2, A3 (used as digital pins)' },
        { from: 'Entry / Exit IR → OUT', to: 'D2 / D3' },
        { from: 'IR sensors + OLED → VCC', to: '5V' },
        { from: 'Gate servos → signal', to: 'D9 / D10 (Servo lib)' },
        { from: 'Servos → V+ / GND', to: '5V 3A supply, common GND with the Uno' },
        { from: 'Slot LED pairs →', to: 'D4, D5, D6, D7 (green to GND, red to 5V, 220Ω each)' },
        { from: 'OLED → SDA / SCL', to: 'A4 / A5' },
        { from: 'ESP-01 → RX (B)', to: 'D11 via 1k/2k divider (Firebase link)' },
        { from: 'ESP-01 → VCC / GND (B)', to: 'ESP-01 adapter on 5V / GND (not the Uno 3V3)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'PCF8574 → SDA / SCL', to: 'D2 / D1 (shared with the OLED)' },
        { from: 'PCF8574 → VCC / A0–A2', to: '3V3 / GND (address 0x20)' },
        { from: 'IR slot 1–4 → OUT', to: 'PCF8574 P0–P3' },
        { from: 'Entry / Exit IR → OUT', to: 'PCF8574 P4 / P5' },
        { from: 'IR sensors + OLED → VCC', to: '3V3' },
        { from: 'Gate servos → signal', to: 'D3 / D8 (GPIO0 / GPIO15)' },
        { from: 'Servos → V+ / GND', to: '5V 3A supply, common GND with the NodeMCU' },
        { from: 'Slot LED pairs →', to: 'D5, D6, D7, D0 (green to GND, red to 3V3, 220Ω each)' },
      ],
    },
  ],
  steps: [
    {
      id: 'tune-ir-sensors',
      title: 'Tune each IR sensor',
      detail: 'Potentiometer per module: detect a toy car at slot distance, ignore the baseboard. Power them from 3V3 so outputs stay board-safe. Test in daylight and shade.',
      boardDetail: {
        uno: 'Potentiometer per module: detect a toy car at slot distance, ignore the baseboard. Power them from 5V. Test in daylight and shade.',
      },
    },
    {
      id: 'wire-slot-array',
      title: 'Wire slot array',
      detail: 'Slot IR outputs on GPIO32–35, entry/exit IR on GPIO27/14. Each LED pin drives a pair: green to GND, red to 3V3, 220Ω each — HIGH = free, LOW = taken.',
      boardDetail: {
        uno: 'Slot IR outputs on A0–A3 (as digital pins), entry/exit IR on D2/D3. LED pins D4–D7 each drive a pair: green to GND, red to 5V, 220Ω each — HIGH = free.',
        nodemcu: 'All six IR outputs go to the PCF8574 (P0–P3 slots, P4/P5 entry/exit) on D2/D1. LED pins D5, D6, D7, D0 each drive a pair: green to GND, red to 3V3 — HIGH = free.',
      },
    },
    {
      id: 'setup-pcf8574',
      title: 'Install the ESP8266 core + PCF8574',
      boards: ['nodemcu'],
      detail: 'Install the ESP8266 board package and a PCF8574 library. A0–A2 to GND gives 0x20 (PCF8574A boards start at 0x38); read P0–P5 each loop — LOW = car present.',
    },
    {
      id: 'gate-logic',
      title: 'Gate logic',
      detail: 'Entry gate (GPIO13) opens only if freeSlots > 0; exit gate (GPIO23) always opens. 90° sweep, 3s hold, servos on the 5V 3A supply.',
      boardDetail: {
        uno: 'Entry gate (D9) opens only if freeSlots > 0; exit gate (D10) always opens. 90° sweep, 3s hold, servos on the 5V 3A supply.',
        nodemcu: 'Entry gate (D3) opens only if freeSlots > 0; exit gate (D8) always opens. 90° sweep, 3s hold, servos on the 5V 3A supply.',
      },
    },
    {
      id: 'vacancy-counter',
      title: 'Vacancy counter',
      detail: 'OLED shows FREE: n (or FULL) + per-slot map. A slot only flips after 500ms of stable reads, so passing shadows don’t flicker.',
    },
    {
      id: 'cloud-map',
      title: 'Cloud map',
      versions: ['b'],
      detail: 'Firebase /slots/{id} booleans + /free count; a tiny web page listens and paints the lot green/red. Push a timestamp to /log on each entry — the billing hook.',
      boardDetail: {
        uno: 'The Uno prints a slot string like "1010" on D11 every 2s; the ESP-01 writes it to Firebase /slots/{id} + /free. A tiny web page listens and paints the lot green/red.',
      },
    },
    {
      id: 'flash-esp01-bridge',
      title: 'Flash the ESP-01 bridge',
      versions: ['b'],
      boards: ['uno'],
      detail: 'Flash the ESP-01 (USB adapter, GPIO0 to GND) with the ESP8266 build of sketch B, reading the slot string on RX instead of GPIO pins.',
    },
    {
      id: 'demo-rush-hour',
      title: 'Demo rush hour',
      detail: 'Film full → entry denied (gate stays shut) → one car leaves → queued car enters.',
    },
  ],
  simulator: {
    viz: 'slots',
    intro: 'Same rule as the firmware: the entry gate opens only while free slots remain.',
    sliders: [
      { id: 'free', label: 'Free slots', unit: '', min: 0, max: 4, value: 3 },
      { id: 'queue', label: 'Waiting cars', unit: '', min: 0, max: 6, value: 1 },
    ],
    threshold: { id: 'thr', label: 'Open while free above', unit: '', min: 0, max: 3, value: 0 },
    watch: 'free',
    rule: 'above',
    actuator: 'Gate',
    onText: 'OPEN',
    offText: 'shut',
    lcd: ['Free:{free} Q:{queue}', 'Gate:{act}'],
    demoSlider: 'free',
    demoFrom: 4,
    demoTo: 0,
    barLabel: 'Free slots',
  },
  code: [
    {
      id: 'a',
      label: 'A · Slots + gates',
      note: 'Libraries: ESP32Servo, Adafruit SSD1306. 4 debounced slots, LED pairs, OLED count, 2 servo gates.',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#include <ESP32Servo.h>
${oledIncludes}
const int SLOTS = 4;
const int SLOT_IR[SLOTS] = {32, 33, 34, 35};
const int SLOT_LED[SLOTS] = {16, 17, 18, 19};
const int ENTRY_IR = 27, EXIT_IR = 14, GATE_IN = 13, GATE_OUT = 23;
${slotsAndGates}`,
    },
    {
      id: 'a-uno',
      label: 'A · Slots + gates (Uno)',
      note: 'Libraries: Servo, Adafruit SSD1306. Same logic with Uno pins — A0–A3 read as digital inputs.',
      board: 'uno',
      versions: ['a', 'b'],
      code: `#include <Servo.h>
${oledIncludes}
const int SLOTS = 4;
const int SLOT_IR[SLOTS] = {A0, A1, A2, A3};
const int SLOT_LED[SLOTS] = {4, 5, 6, 7};
const int ENTRY_IR = 2, EXIT_IR = 3, GATE_IN = 9, GATE_OUT = 10;
${slotsAndGates}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · Slots + gates (NodeMCU)',
      note: 'Libraries: Servo (ESP8266 core), Adafruit SSD1306. All six IR sensors are read in one Wire read from the PCF8574 (0x20) on D2/D1; gates D3/D8, LEDs D5/D6/D7/D0.',
      board: 'nodemcu',
      versions: ['a', 'b'],
      code: `#include <Servo.h>
${oledIncludes}
const int SLOTS = 4;
const uint8_t PCF = 0x20;                 // PCF8574, A0–A2 to GND (PCF8574A: 0x38)
const int SLOT_IR[SLOTS] = {0, 1, 2, 3};  // PCF8574 P0–P3
const int SLOT_LED[SLOTS] = {D5, D6, D7, D0};
const int ENTRY_IR = 4, EXIT_IR = 5;      // PCF8574 P4 / P5
const int GATE_IN = D3, GATE_OUT = D8;
const unsigned long STABLE_MS = 500;
Servo gateIn, gateOut;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
bool occupied[SLOTS];
unsigned long changedAt[SLOTS];
uint8_t pcfBits = 0xFF;

void readExpander() {  // one I²C read covers all six IR sensors
  Wire.requestFrom(PCF, (uint8_t)1);
  pcfBits = Wire.available() ? Wire.read() : 0xFF;  // no reply = no car seen
}

bool irLow(int p) { return !(pcfBits & (1 << p)); }  // LOW = car present

void readSlots() {  // a slot flips only after 500ms of stable reads
  for (int i = 0; i < SLOTS; i++) {
    bool now = irLow(SLOT_IR[i]);
    if (now == occupied[i]) changedAt[i] = millis();
    else if (millis() - changedAt[i] > STABLE_MS) occupied[i] = now;
    digitalWrite(SLOT_LED[i], occupied[i] ? LOW : HIGH);  // HIGH = green
  }
}

int freeSlots() {
  int n = 0;
  for (int i = 0; i < SLOTS; i++) if (!occupied[i]) n++;
  return n;
}

void showFree() {
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(2); oled.setCursor(0, 0);
  if (freeSlots() == 0) oled.print("FULL");
  else { oled.print("FREE: "); oled.print(freeSlots()); }
  oled.setTextSize(1); oled.setCursor(0, 32);
  for (int i = 0; i < SLOTS; i++) oled.print(occupied[i] ? "[X] " : "[ ] ");
  oled.display();
}

void openGate(Servo& gate) {
  gate.write(90); delay(3000); gate.write(0);
}

void setup() {
  for (int i = 0; i < SLOTS; i++) pinMode(SLOT_LED[i], OUTPUT);
  Wire.begin();  // D2 = SDA, D1 = SCL
  Wire.beginTransmission(PCF);
  Wire.write(0xFF);  // all pins HIGH = inputs the IR modules can pull LOW
  Wire.endTransmission();
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  gateIn.attach(GATE_IN, 544, 2400); gateOut.attach(GATE_OUT, 544, 2400);  // ESP8266 default is 1000–2000µs
  gateIn.write(0); gateOut.write(0);
}

void loop() {
  readExpander();
  readSlots();
  showFree();
  if (irLow(ENTRY_IR) && freeSlots() > 0) openGate(gateIn);
  if (irLow(EXIT_IR)) openGate(gateOut);
  delay(50);
}`,
    },
    {
      id: 'b',
      label: 'B · Firebase sync',
      note: 'Library: FirebaseClient by mobizt with Email/Password auth. Merge into sketch A and push its debounced occupied[] instead of raw reads.',
      board: 'esp32',
      versions: ['b'],
      code: `#define ENABLE_USER_AUTH
#define ENABLE_DATABASE
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASS "YOUR_PASS"
#define API_KEY "YOUR_WEB_API_KEY"
#define USER_EMAIL "lot@class.edu"
#define USER_PASS "STRONG_PASS_8+"
#define DATABASE_URL "https://your-project-default-rtdb.firebaseio.com"

WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
RealtimeDatabase Database;
const int SLOT[4] = {32, 33, 34, 35};

void setup() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  ssl_client.setInsecure();   // classroom only
  initializeApp(aClient, app, getAuth(user_auth));
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  for (int i = 0; i < 4; i++) pinMode(SLOT[i], INPUT);
}

void loop() {
  app.loop();
  if (!app.ready()) { delay(500); return; }
  int freeCount = 0;
  for (int i = 0; i < 4; i++) {
    bool occupied = digitalRead(SLOT[i]) == LOW;
    if (!occupied) freeCount++;
    Database.set<bool>(aClient, "/slots/" + String(i), occupied);
  }
  Database.set<int>(aClient, "/free", freeCount);
  delay(2000);
}`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · Firebase sync (NodeMCU)',
      note: 'Library: FirebaseClient by mobizt with Email/Password auth. Slots come from PCF8574 P0–P3 over Wire (D2/D1); TLS buffers shrunk for ESP8266 RAM. Merge into sketch A and push its debounced occupied[] instead of raw reads.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#define ENABLE_USER_AUTH
#define ENABLE_DATABASE
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <FirebaseClient.h>
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASS "YOUR_PASS"
#define API_KEY "YOUR_WEB_API_KEY"
#define USER_EMAIL "lot@class.edu"
#define USER_PASS "STRONG_PASS_8+"
#define DATABASE_URL "https://your-project-default-rtdb.firebaseio.com"

WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
RealtimeDatabase Database;
const uint8_t PCF = 0x20;  // slots on PCF8574 P0–P3

void setup() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  ssl_client.setInsecure();   // classroom only
  ssl_client.setBufferSizes(4096, 1024);  // BearSSL fits the ESP8266 heap
  initializeApp(aClient, app, getAuth(user_auth));
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  Wire.begin();  // D2 = SDA, D1 = SCL
  Wire.beginTransmission(PCF);
  Wire.write(0xFF);  // all pins HIGH = inputs
  Wire.endTransmission();
}

void loop() {
  app.loop();
  if (!app.ready()) { delay(500); return; }
  Wire.requestFrom(PCF, (uint8_t)1);
  uint8_t bits = Wire.available() ? Wire.read() : 0xFF;
  int freeCount = 0;
  for (int i = 0; i < 4; i++) {
    bool occupied = !(bits & (1 << i));  // LOW = car present
    if (!occupied) freeCount++;
    Database.set<bool>(aClient, "/slots/" + String(i), occupied);
  }
  Database.set<int>(aClient, "/free", freeCount);
  delay(2000);
}`,
    },
  ],
  tips: [
    { title: 'Tune in situ', detail: 'IR range shifts with sunlight — calibrate on the actual demo table.' },
    { title: 'Debounce slots', detail: '500ms stable-read rule stops flicker from people walking past.' },
    { title: 'Power servos right', detail: 'Two servos stall at 1A+ — never from the board’s 5V pin.' },
    { title: 'Deny visibly', detail: 'Full lot → OLED shows FULL, every slot LED is red and the entry gate stays shut. Examiners test the edge case.' },
  ],
}
