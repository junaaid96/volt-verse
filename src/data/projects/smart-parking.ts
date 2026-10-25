import type { Project } from '../types'

export const smartParking: Project = {
  slug: 'smart-parking',
  categoryId: 'iot',
  title: 'Smart Parking System',
  tagline: 'Per-slot sensing with entry gate and live vacancy map.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,500–4,200',
  boards: ['ESP32', 'Arduino Mega'],
  skills: ['IR/ultrasonic arrays', 'Servo gates', 'Firebase', 'Web map'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['esp32', 'firebase-docs'],
  rig: { sensor: 'servo', extras: ['sonic'] },
  options: [
    {
      id: 'a',
      title: 'A. 4-slot model lot',
      level: 'Medium · core build',
      blurb: 'IR sensors per slot, entry/exit servo gates, OLED vacancy count. Tabletop model.',
      points: ['Per-slot red/green LEDs', 'Auto gate on free slot', 'OLED + 7-seg counter'],
      weeks: '2 weeks',
      cost: '৳2,500–3,400',
    },
    {
      id: 'b',
      title: 'B. Cloud vacancy map',
      level: 'Medium+ · best value',
      blurb: 'Firebase-backed live map: drivers see free slots on their phone before arriving.',
      points: ['Live phone map', 'Entry log + billing hook', 'Ultrasonic precision slots'],
      weeks: '3 weeks',
      cost: '৳3,000–4,200',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'IR obstacle sensors', qty: '4–6', role: 'Slot occupancy', price: '৳400–700' },
    { name: 'SG90 servos', qty: '2', role: 'Entry/exit gates', price: '৳360–600' },
    { name: 'Slot LEDs red/green', qty: '4–6 pairs', role: 'Slot status', price: '৳100–200' },
    { name: 'OLED display', qty: '1', role: 'Vacancy counter', price: '৳350–550' },
    { name: 'Base board + toy cars', qty: '1 set', role: 'Model lot', price: '৳400–700' },
    { name: '5V 3A supply', qty: '1', role: 'Servos + logic', price: '৳250–450' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'IR slot 1–4 → OUT', to: 'GPIO32,33,34,35' },
        { from: 'Entry IR / Exit IR →', to: 'GPIO27 / GPIO14' },
        { from: 'Gate servos →', to: 'GPIO13 / GPIO23 (PWM; GPIO12 avoided: boot strapping)' },
        { from: 'Slot LEDs →', to: 'GPIO16,17,18,19 + GND pairs' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22' },
      ],
    },
    {
      id: 'mega',
      label: 'Mega (8-slot)',
      board: 'Arduino Mega',
      pins: [
        { from: 'IR slot 1–8 →', to: 'D22–D29' },
        { from: 'Gate servos →', to: 'D9 / D10 (Servo lib)' },
        { from: 'Slot LEDs →', to: 'D30–D45 pairs' },
        { from: 'ESP link →', to: 'Serial1 TX1/RX1' },
      ],
    },
  ],
  steps: [
    { title: 'Tune each IR sensor', detail: 'Potentiometer per module: detect a toy car at slot distance, ignore the baseboard. Test in daylight and shade.' },
    { title: 'Wire slot array', detail: 'Common 5V/GND rails, one digital pin per slot. Confirm slot LEDs flip as cars park.' },
    { title: 'Gate logic', detail: 'Entry gate opens only if freeSlots > 0; exit gate always opens. 90° sweep, 3s hold.' },
    { title: 'Vacancy counter', detail: 'OLED shows FREE: n + per-slot map. Debounce slot reads 500ms so passing shadows don’t flicker.' },
    { title: 'Cloud map (B)', detail: 'Firebase /slots/{id} booleans; tiny web page polls and paints the lot green/red.' },
    { title: 'Demo rush hour', detail: 'Film full → entry denied (gate stays shut) → one car leaves → queued car enters.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: the entry gate opens only while free slots remain.',
    sliders: [
      { id: 'free', label: 'Free slots', unit: '', min: 0, max: 8, value: 3 },
      { id: 'queue', label: 'Waiting cars', unit: '', min: 0, max: 6, value: 1 },
    ],
    threshold: { id: 'thr', label: 'Allow entry if free ≥', unit: '', min: 1, max: 4, value: 1 },
    watch: 'free',
    rule: 'above',
    actuator: 'Gate',
    onText: 'OPEN',
    offText: 'shut',
    lcd: ['Free:{free} Q:{queue}', 'Gate:{act}'],
    demoSlider: 'free',
    demoFrom: 5,
    demoTo: 0,
    barLabel: 'Free slots',
  },
  code: [
    {
      id: 'a',
      label: 'A · Slots + gates',
      note: '4 slots, 2 servo gates, debounce on slot reads.',
      code: `#include <ESP32Servo.h>
const int SLOT[4] = {32, 33, 34, 35};
const int ENTRY_IR = 27, EXIT_IR = 14;
Servo gateIn, gateOut;

int freeSlots() {
  int n = 0;
  for (int i = 0; i < 4; i++)
    if (digitalRead(SLOT[i]) == HIGH) n++;  // HIGH = empty
  return n;
}

void setup() {
  for (int i = 0; i < 4; i++) pinMode(SLOT[i], INPUT);
  pinMode(ENTRY_IR, INPUT); pinMode(EXIT_IR, INPUT);
  gateIn.attach(13); gateOut.attach(23);
  gateIn.write(0); gateOut.write(0);
}

void loop() {
  if (digitalRead(ENTRY_IR) == LOW && freeSlots() > 0) {
    gateIn.write(90); delay(3000); gateIn.write(0);
  }
  if (digitalRead(EXIT_IR) == LOW) {
    gateOut.write(90); delay(3000); gateOut.write(0);
  }
  delay(300);  // debounce window
}`,
    },
    {
      id: 'b',
      label: 'B · Firebase sync',
      note: 'Library: FirebaseClient by mobizt with Email/Password auth. Web page listens on /slots and paints the lot green/red.',
      code: `#define ENABLE_USER_AUTH
#define ENABLE_DATABASE
#include <FirebaseClient.h>
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASS "YOUR_PASS"
#define API_KEY "YOUR_WEB_API_KEY"
#define USER_EMAIL "lot@class.edu"
#define USER_PASS "STRONG_PASS_8+"
#define DATABASE_URL "https://your-project-default-rtdb.firebaseio.com"

SSL_CLIENT ssl_client;
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
  ],
  tips: [
    { title: 'Tune in situ', detail: 'IR range shifts with sunlight — calibrate on the actual demo table.' },
    { title: 'Debounce slots', detail: '500ms stable-read rule stops flicker from people walking past.' },
    { title: 'Power servos right', detail: 'Two servos stall at 1A+ — never from the ESP 5V pin.' },
    { title: 'Deny visibly', detail: 'Full lot → red LED + buzzer blip at entry. Examiners test the edge case.' },
  ],
}
