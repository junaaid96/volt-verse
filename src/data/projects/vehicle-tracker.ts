import type { Project } from '../types'

export const vehicleTracker: Project = {
  slug: 'vehicle-tracker',
  categoryId: 'iot',
  title: 'Vehicle GPS Tracker + Accident Alert',
  tagline: 'Live location by SMS/cloud with crash detection and SOS.',
  difficulty: 'Advanced',
  weeks: '3–4 weeks',
  cost: '৳3,200–5,200',
  boards: ['ESP32', 'NodeMCU', 'Arduino + SIM808'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Use a SIM808 (GSM + GPS on one SoftwareSerial). Version B’s crash SMS works, but its live Blynk map would need an ESP-01 link — too much for 2 KB RAM, so build B’s map on an ESP.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: true,
      note: 'The hardware UART is shared with USB, so GPS and GSM both use SoftwareSerial at 9600 — expect the odd dropped GPS sentence while Wi-Fi is busy.',
    },
    esp32cam: {
      ok: false,
      reason: 'GPS + GSM + MPU6050 + SOS + buzzer need ~7 pins; the ESP32-CAM has ~4 free and its only spare UART is the flashing port.',
    },
  },
  skills: ['GPS parsing', 'GSM/SMS', 'MPU6050 shock', 'Maps links'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'neo6m', 'mpu6050', 'sim800l', 'lm2596', 'tp4056', 'blynk-docs'],
  rig: { sensor: 'gps', extras: ['gsm', 'mpu'] },
  options: [
    {
      id: 'a',
      title: 'A. SMS tracker',
      level: 'Advanced · core build',
      blurb: 'NEO-6M + SIM800L: reply to "LOC" SMS with a Google Maps link. Works with zero internet.',
      points: ['SMS command + reply', 'Maps link in text', 'Geo-fence exit alert'],
      weeks: '3 weeks',
      cost: '৳3,200–4,200',
    },
    {
      id: 'b',
      title: 'B. Cloud + crash SOS',
      level: 'Advanced · best value',
      blurb: 'Live Blynk map (over a phone hotspot) plus MPU6050 crash detection that auto-SMS emergency contacts.',
      points: ['Live map trail', 'Crash auto-SOS', 'Speed-over-limit alert'],
      weeks: '4 weeks',
      cost: '৳3,800–5,200',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳330–500', boards: ['nodemcu'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳550–900', boards: ['uno'] },
    { name: 'NEO-6M GPS + antenna', qty: '1', role: 'Position fix', price: '৳750–1,100', boards: ['esp32', 'nodemcu'] },
    { name: 'SIM800L + antenna + SIM', qty: '1', role: 'SMS + GPRS', price: '৳700–1,200', boards: ['esp32', 'nodemcu'] },
    { name: 'SIM808 board + GSM/GPS antennas + SIM', qty: '1', role: 'SMS + position fix', price: '৳1,700–2,500', boards: ['uno'] },
    { name: 'MPU6050 (GY-521)', qty: '1', role: 'Crash detect', price: '৳150–280', versions: ['b'] },
    { name: 'SOS button + active buzzer', qty: '1 set', role: 'Manual alert + countdown', price: '৳120–250' },
    { name: '2× LM2596 buck (5V + 4.0V)', qty: '1 set', role: 'Controller + GSM rails', price: '৳250–400' },
    { name: '18650 + TP4056 + 5V boost', qty: '1 set', role: 'Backup if 12V is cut', price: '৳300–500' },
    { name: 'Resistors + 1000µF cap', qty: '1 set', role: 'GSM RX divider + burst buffer', price: '৳30–60' },
    { name: 'Enclosure + mounts', qty: '1', role: 'In-vehicle rig', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'GPS → TX / RX', to: 'GPIO16 / GPIO17 (Serial2, 9600)' },
        { from: 'GPS → VCC', to: '5V rail' },
        { from: 'GSM → TX', to: 'GPIO32 (Serial1 RX, 9600)' },
        { from: 'GPIO33 (Serial1 TX) →', to: 'GSM RX via 1k/2.2k divider (2.8V logic)' },
        { from: 'GSM → VCC', to: '4.0V 2A buck (dedicated!) + 1000µF' },
        { from: 'MPU6050 → SDA / SCL', to: 'GPIO21 / GPIO22, VCC 3V3 (version B)' },
        { from: 'SOS button →', to: 'GPIO27 to GND (INPUT_PULLUP)' },
        { from: 'Buzzer + →', to: 'GPIO13 (− to GND)' },
        { from: '5V rail →', to: 'VIN' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'GPS → TX', to: 'D5 / GPIO14 (SoftwareSerial RX, 9600)' },
        { from: 'GPS → VCC', to: '5V rail (GPS RX not needed)' },
        { from: 'GSM → TX', to: 'D7 / GPIO13 (SoftwareSerial RX, 9600)' },
        { from: 'D6 / GPIO12 (TX) →', to: 'GSM RX via 1k/2.2k divider (2.8V logic)' },
        { from: 'GSM → VCC', to: '4.0V 2A buck (dedicated!) + 1000µF' },
        { from: 'MPU6050 → SDA / SCL', to: 'D2 / D1, VCC 3V3 (version B)' },
        { from: 'SOS button →', to: 'D3 / GPIO0 to GND (don’t hold at power-up)' },
        { from: 'Buzzer + →', to: 'D0 / GPIO16 (− to GND)' },
        { from: '5V rail →', to: 'VIN' },
      ],
    },
    {
      id: 'uno',
      label: 'Arduino + SIM808',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'SIM808 → TX', to: 'D8 (SoftwareSerial RX, 9600)' },
        { from: 'D9 (SoftwareSerial TX) →', to: 'SIM808 RX via 1k/1.2k divider (skip if board is level-shifted)' },
        { from: 'SIM808 → VCC', to: '4.0V 2A buck, or DC-in if the board has its own regulator' },
        { from: 'GPS antenna →', to: 'SIM808 GPS port (open sky)' },
        { from: 'MPU6050 → SDA / SCL', to: 'A4 / A5, VCC 5V (version B)' },
        { from: 'SOS button →', to: 'D7 to GND (INPUT_PULLUP)' },
        { from: 'Buzzer + →', to: 'D6 (− to GND)' },
        { from: '5V rail →', to: 'Uno 5V pin (not VIN — VIN needs 7V+)' },
      ],
    },
    {
      id: 'power',
      label: 'Power tree',
      board: 'Vehicle 12V',
      pins: [
        { from: '12V batt → fuse → buck 1 →', to: '5V rail (controller + GPS)' },
        { from: '12V batt → fuse → buck 2 →', to: '4.0V rail, 2A+ (GSM only)' },
        { from: 'All GNDs →', to: 'common ground point' },
        { from: '18650 → TP4056 + 5V boost →', to: '5V rail via Schottky diode (keeps logging if 12V is cut)' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-esp32-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → “esp32 by Espressif” (3.x), plus the TinyGPSPlus, MPU6050 (Electronic Cats) and Blynk libraries.',
      boards: ['esp32'],
    },
    {
      id: 'install-esp8266-core',
      title: 'Install the ESP8266 board package',
      detail: 'Add the ESP8266 board URL, install “esp8266”, pick “NodeMCU 1.0”, plus TinyGPSPlus, MPU6050 and Blynk libraries.',
      boards: ['nodemcu'],
    },
    {
      id: 'get-gps-fix',
      title: 'Get a GPS fix outdoors',
      detail: 'NEO-6M needs open sky — first fix takes 1–5 min (its LED starts blinking). Confirm lat/lon on Serial before anything else.',
      boardDetail: {
        uno: 'Send AT+CGNSPWR=1, then AT+CGNSINF under open sky — first fix takes 1–5 min (2nd field turns 1). Confirm lat/lon first.',
      },
    },
    {
      id: 'prove-sms',
      title: 'Prove SMS both ways',
      detail: 'Send "LOC", receive Maps link. GSM needs its own 4.0V/2A supply or texts silently fail.',
    },
    {
      id: 'build-maps-link',
      title: 'Build the Maps link',
      detail: 'https://maps.google.com/?q=lat,lon — test the link from the SMS on a real phone.',
    },
    {
      id: 'detect-crashes',
      title: 'Crash detection',
      detail: 'Set the MPU6050 to ±16g (the default ±2g can’t see 3g). Total accel above 3g = impact. Confirm with a gentle drop test onto foam.',
      versions: ['b'],
    },
    {
      id: 'sos-cancel-window',
      title: 'Cancel window',
      detail: 'After impact: 30s buzzer countdown, SOS button (GPIO27) cancels. Only then SMS emergency contacts. Hold SOS 3s for a manual alert.',
      versions: ['b'],
      boardDetail: {
        uno: 'After impact: 30s buzzer countdown, SOS button (D7) cancels. Only then SMS emergency contacts. Hold SOS 3s for a manual alert.',
        nodemcu: 'After impact: 30s buzzer countdown, SOS button (D3) cancels. Only then SMS emergency contacts. Hold SOS 3s for a manual alert.',
      },
    },
    {
      id: 'live-map-dashboard',
      title: 'Live map dashboard',
      detail: 'Blynk template: V0 location datastream on a Map widget, V1 speed, crash + overspeed events. Connect via a phone hotspot — SMS works without it.',
      versions: ['b'],
      boards: ['esp32', 'nodemcu'],
    },
    {
      id: 'road-test',
      title: 'Road-test + trail',
      detail: 'Log a rickshaw/car ride, plot the trail, and demo geo-fence + overspeed alerts live.',
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: shock above the crash limit starts the SOS countdown.',
    sliders: [
      { id: 'shock', label: 'Impact force', unit: 'g', min: 0, max: 8, value: 1 },
      { id: 'speed', label: 'Speed', unit: 'km/h', min: 0, max: 120, value: 42 },
    ],
    threshold: { id: 'thr', label: 'Crash above', unit: 'g', min: 2, max: 6, value: 3 },
    watch: 'shock',
    rule: 'above',
    actuator: 'SOS',
    onText: 'COUNTDOWN',
    offText: 'idle',
    lcd: ['{shock}g {speed}km/h', 'SOS:{act}'],
    demoSlider: 'shock',
    demoFrom: 1,
    demoTo: 5,
    barLabel: 'Impact force',
  },
  code: [
    {
      id: 'a',
      label: 'A · SMS locator',
      note: 'Libraries: TinyGPSPlus. GPS on Serial2, GSM on Serial1. Replies to "LOC" and texts when the geo-fence is left.',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#include <TinyGPS++.h>
HardwareSerial gpsSerial(2), gsm(1);
TinyGPSPlus gps;
const char* OWNER = "+8801XXXXXXXXX";
const double HOME_LAT = 23.8103, HOME_LNG = 90.4125, FENCE_M = 500;
bool outside = false;

void sendSMS(const String& msg) {
  gsm.print("AT+CMGS=\\""); gsm.print(OWNER); gsm.println("\\"");
  delay(300); gsm.print(msg); delay(300); gsm.write(26); delay(3000);
}

String mapsLink() {
  if (!gps.location.isValid()) return "No GPS fix yet";
  return "https://maps.google.com/?q=" +
    String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
}

void setup() {
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);  // RX, TX
  gsm.begin(9600, SERIAL_8N1, 32, 33);        // RX, TX
  gsm.setTimeout(300);
  delay(5000);                                // let the GSM register
  gsm.println("AT+CMGF=1"); delay(300);       // text mode
  gsm.println("AT+CNMI=2,2,0,0,0");           // push incoming SMS to serial
}

void loop() {
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  if (gsm.available()) {
    String s = gsm.readString();
    if (s.indexOf("LOC") >= 0) sendSMS(mapsLink());
  }
  if (gps.location.isUpdated()) {
    bool out = TinyGPSPlus::distanceBetween(gps.location.lat(), gps.location.lng(),
                                            HOME_LAT, HOME_LNG) > FENCE_M;
    if (out && !outside) sendSMS("Left geo-fence! " + mapsLink());
    outside = out;
  }
}`,
    },
    {
      id: 'a-uno',
      label: 'A · SMS locator (Uno + SIM808)',
      note: 'No extra libraries. Reads the SIM808’s built-in GPS with AT+CGNSINF and replies to "LOC". For B on the Uno, add the MPU6050 countdown from the ESP32 sketch.',
      board: 'uno',
      versions: ['a', 'b'],
      code: `#include <SoftwareSerial.h>
SoftwareSerial sim(8, 9);  // RX, TX
const char OWNER[] = "+8801XXXXXXXXX";

String at(const char* cmd, unsigned long wait) {
  sim.println(cmd);
  String r;
  unsigned long t = millis();
  while (millis() - t < wait) while (sim.available()) r += (char)sim.read();
  return r;
}

// +CGNSINF: run,fix,utc,lat,lon,...
String mapsLink() {
  String r = at("AT+CGNSINF", 800);
  int p = r.indexOf(':');
  int c1 = r.indexOf(',', p), c2 = r.indexOf(',', c1 + 1);
  int c3 = r.indexOf(',', c2 + 1), c4 = r.indexOf(',', c3 + 1);
  int c5 = r.indexOf(',', c4 + 1);
  if (p < 0 || c5 < 0 || r.charAt(c1 + 1) != '1') return "No GPS fix yet";
  return "https://maps.google.com/?q=" + r.substring(c3 + 1, c4) + "," + r.substring(c4 + 1, c5);
}

void sendSMS(const String& msg) {
  sim.print("AT+CMGS=\\""); sim.print(OWNER); sim.println("\\"");
  delay(300); sim.print(msg); delay(300); sim.write(26); delay(3000);
}

void setup() {
  sim.begin(9600);
  delay(5000);
  at("AT+CMGF=1", 300);           // text mode
  at("AT+CNMI=2,2,0,0,0", 300);   // push incoming SMS to serial
  at("AT+CGNSPWR=1", 300);        // GPS on
}

void loop() {
  if (sim.available()) {
    String s = sim.readString();
    if (s.indexOf("LOC") >= 0) sendSMS(mapsLink());
  }
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · SMS locator (NodeMCU)',
      note: 'Libraries: TinyGPSPlus. GPS on D5, GSM on D7/D6 (both SoftwareSerial). Only one can receive at a time, so GPS listens and the GSM is polled for unread SMS every 10s.',
      board: 'nodemcu',
      versions: ['a', 'b'],
      code: `#include <SoftwareSerial.h>
#include <TinyGPS++.h>
SoftwareSerial gpsSerial(D5, -1);  // RX only (GPS RX not wired)
SoftwareSerial gsm(D7, D6);        // RX, TX
TinyGPSPlus gps;
const char* OWNER = "+8801XXXXXXXXX";
const double HOME_LAT = 23.8103, HOME_LNG = 90.4125, FENCE_M = 500;
bool outside = false;
unsigned long lastPoll = 0;

// GPS owns the receive line; hand it to the GSM only while waiting for a reply
String at(const char* cmd, unsigned long wait) {
  gpsSerial.stopListening();
  gsm.listen();
  gsm.println(cmd);
  String r;
  unsigned long t = millis();
  while (millis() - t < wait) {
    while (gsm.available()) r += (char)gsm.read();
    yield();
  }
  gsm.stopListening();
  gpsSerial.listen();
  return r;
}

void sendSMS(const String& msg) {
  gsm.print("AT+CMGS=\\""); gsm.print(OWNER); gsm.println("\\"");
  delay(300); gsm.print(msg); delay(300); gsm.write(26); delay(3000);
}

String mapsLink() {
  if (!gps.location.isValid()) return "No GPS fix yet";
  return "https://maps.google.com/?q=" +
    String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
}

void setup() {
  gpsSerial.begin(9600);
  gsm.begin(9600);
  gsm.stopListening();
  delay(5000);                       // let the GSM register
  at("AT+CMGF=1", 300);              // text mode
  at("AT+CNMI=1,0,0,0,0", 300);      // store SMS on the SIM, no push (GSM isn't always listening)
}

void loop() {
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  if (millis() - lastPoll > 10000) {
    lastPoll = millis();
    if (at("AT+CMGL=\\"REC UNREAD\\"", 1500).indexOf("LOC") >= 0) sendSMS(mapsLink());
    at("AT+CMGD=1,1", 300);          // delete read SMS so the SIM never fills
  }
  if (gps.location.isUpdated()) {
    bool out = TinyGPSPlus::distanceBetween(gps.location.lat(), gps.location.lng(),
                                            HOME_LAT, HOME_LNG) > FENCE_M;
    if (out && !outside) sendSMS("Left geo-fence! " + mapsLink());
    outside = out;
  }
}`,
    },
    {
      id: 'b',
      label: 'B · Crash SOS + live map',
      note: 'Libraries: TinyGPSPlus, MPU6050 (Electronic Cats), Blynk. Map widget on V0, speed on V1; events "crash", "sos", "overspeed". Merge sketch A’s LOC reply + geo-fence into this loop.',
      board: 'esp32',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "YOUR_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "Vehicle Tracker"
#define BLYNK_AUTH_TOKEN "YOUR_AUTH_TOKEN"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>

#define SOS_BTN 27
#define BUZZER 13
HardwareSerial gpsSerial(2), gsm(1);
TinyGPSPlus gps;
MPU6050 mpu;
BlynkTimer timer;
const char* EMERGENCY = "+8801XXXXXXXXX";
const float SPEED_LIMIT = 60;  // km/h
unsigned long impactAt = 0, pressedAt = 0;
bool countdown = false, wasOver = false;

String mapsLink() {
  if (!gps.location.isValid()) return "(no GPS fix)";
  return "https://maps.google.com/?q=" +
    String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
}

void sendSMS(const String& msg) {
  gsm.print("AT+CMGS=\\""); gsm.print(EMERGENCY); gsm.println("\\"");
  delay(300); gsm.print(msg); delay(300); gsm.write(26); delay(3000);
}

void alert(const char* event, const String& text) {
  digitalWrite(BUZZER, LOW);
  sendSMS(text + " " + mapsLink());
  Blynk.logEvent(event, mapsLink());
}

float totalG() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  float x = ax / 2048.0, y = ay / 2048.0, z = az / 2048.0;  // ±16g scale
  return sqrt(x * x + y * y + z * z);
}

void pushLocation() {
  if (!gps.location.isValid()) return;
  Blynk.virtualWrite(V0, gps.location.lng(), gps.location.lat());  // Map: lon, lat
  Blynk.virtualWrite(V1, gps.speed.kmph());
  bool over = gps.speed.kmph() > SPEED_LIMIT;
  if (over && !wasOver) Blynk.logEvent("overspeed");  // once per episode
  wasOver = over;
}

void setup() {
  pinMode(SOS_BTN, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
  gsm.begin(9600, SERIAL_8N1, 32, 33);
  Wire.begin(21, 22);
  mpu.initialize();
  mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_16);
  delay(5000);
  gsm.println("AT+CMGF=1");
  WiFi.begin("YOUR_HOTSPOT", "YOUR_PASS");  // non-blocking: SMS works offline
  Blynk.config(BLYNK_AUTH_TOKEN);
  timer.setInterval(5000L, pushLocation);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) Blynk.run();
  timer.run();
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  bool pressed = digitalRead(SOS_BTN) == LOW;

  if (!countdown && totalG() > 3.0) { countdown = true; impactAt = millis(); }
  if (countdown) {
    digitalWrite(BUZZER, (millis() / 500) % 2);  // beep-beep
    if (pressed) { countdown = false; digitalWrite(BUZZER, LOW); }  // "I'm OK"
    else if (millis() - impactAt > 30000) { countdown = false; alert("crash", "CRASH!"); }
  } else if (pressed) {
    if (!pressedAt) pressedAt = millis();
    if (millis() - pressedAt > 3000) { alert("sos", "SOS!"); pressedAt = 0; }
  } else {
    pressedAt = 0;
  }
}`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · Crash SOS + live map (NodeMCU)',
      note: 'Libraries: TinyGPSPlus, MPU6050 (Electronic Cats), Blynk. GPS D5, GSM D7/D6, MPU6050 D2/D1, SOS D3, buzzer D0. The GSM only transmits here, so GPS keeps the receive line; merge sketch A’s at()/LOC poll + geo-fence into this loop.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "YOUR_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "Vehicle Tracker"
#define BLYNK_AUTH_TOKEN "YOUR_AUTH_TOKEN"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <Wire.h>
#include <MPU6050.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

#define SOS_BTN D3  // GPIO0: don't hold it at power-up
#define BUZZER D0
SoftwareSerial gpsSerial(D5, -1);  // RX only
SoftwareSerial gsm(D7, D6);        // RX, TX (TX only used here)
TinyGPSPlus gps;
MPU6050 mpu;
BlynkTimer timer;
const char* EMERGENCY = "+8801XXXXXXXXX";
const float SPEED_LIMIT = 60;  // km/h
unsigned long impactAt = 0, pressedAt = 0;
bool countdown = false, wasOver = false;

String mapsLink() {
  if (!gps.location.isValid()) return "(no GPS fix)";
  return "https://maps.google.com/?q=" +
    String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
}

void sendSMS(const String& msg) {
  gsm.print("AT+CMGS=\\""); gsm.print(EMERGENCY); gsm.println("\\"");
  delay(300); gsm.print(msg); delay(300); gsm.write(26); delay(3000);
}

void alert(const char* event, const String& text) {
  digitalWrite(BUZZER, LOW);
  sendSMS(text + " " + mapsLink());
  Blynk.logEvent(event, mapsLink());
}

float totalG() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  float x = ax / 2048.0, y = ay / 2048.0, z = az / 2048.0;  // ±16g scale
  return sqrt(x * x + y * y + z * z);
}

void pushLocation() {
  if (!gps.location.isValid()) return;
  Blynk.virtualWrite(V0, gps.location.lng(), gps.location.lat());  // Map: lon, lat
  Blynk.virtualWrite(V1, gps.speed.kmph());
  bool over = gps.speed.kmph() > SPEED_LIMIT;
  if (over && !wasOver) Blynk.logEvent("overspeed");  // once per episode
  wasOver = over;
}

void setup() {
  pinMode(SOS_BTN, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
  gpsSerial.begin(9600);
  gsm.begin(9600);
  gsm.stopListening();  // one SoftwareSerial receiving at a time: GPS
  Wire.begin(D2, D1);
  mpu.initialize();
  mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_16);
  delay(5000);
  gsm.println("AT+CMGF=1");
  WiFi.begin("YOUR_HOTSPOT", "YOUR_PASS");  // non-blocking: SMS works offline
  Blynk.config(BLYNK_AUTH_TOKEN);
  timer.setInterval(5000L, pushLocation);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) Blynk.run();
  timer.run();
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  bool pressed = digitalRead(SOS_BTN) == LOW;

  if (!countdown && totalG() > 3.0) { countdown = true; impactAt = millis(); }
  if (countdown) {
    digitalWrite(BUZZER, (millis() / 500) % 2);  // beep-beep
    if (pressed) { countdown = false; digitalWrite(BUZZER, LOW); }  // "I'm OK"
    else if (millis() - impactAt > 30000) { countdown = false; alert("crash", "CRASH!"); }
  } else if (pressed) {
    if (!pressedAt) pressedAt = millis();
    if (millis() - pressedAt > 3000) { alert("sos", "SOS!"); pressedAt = 0; }
  } else {
    pressedAt = 0;
  }
}`,
    },
  ],
  tips: [
    { title: 'Sky view', detail: 'GPS fails indoors — plan outdoor demo time and a window-seat backup.' },
    { title: 'GSM power', detail: 'Dedicated 4V/2A buck with a 1000µF cap at the module. Shared rails cause phantom SMS failures.' },
    { title: 'Car power', detail: 'Fuse the 12V tap (1–2A). A running car sits at ~14V with spikes, so use bucks rated well above that.' },
    { title: 'Cancel window', detail: '30s "I\'m OK" window before SOS is what makes crash alerts credible.' },
    { title: 'SIM credit', detail: 'Top up the demo SIM and test SMS the morning of the presentation.' },
  ],
}
