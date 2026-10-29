import type { Project } from '../types'

export const energyMeter: Project = {
  slug: 'smart-energy-meter',
  categoryId: 'iot',
  title: 'IoT Smart Energy Meter',
  tagline: 'Live volts, amps, watts and billing estimates on your phone.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,400–4,000',
  boards: ['ESP32', 'ESP8266', 'Arduino Uno'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Version A and B’s local overload trip work. B’s Blynk dashboard needs Wi-Fi: an ESP-01 would need a second SoftwareSerial, which can’t listen while the PZEM port is busy — build B’s cloud on ESP32/NodeMCU. Use a 16×2 I²C LCD or 128×32 OLED to fit 2 KB RAM.',
    },
    esp32: { ok: true, note: 'PZEM on UART2 (GPIO16/17); divide the PZEM’s 5V TX down to 3.3V.' },
    nodemcu: { ok: true, note: 'PZEM on SoftwareSerial (D6/D7, 9600 baud); divide the PZEM’s 5V TX down to 3.3V.' },
    esp32cam: {
      ok: false,
      reason: 'No camera needed, and PZEM + display + relay + button need 6 GPIO; the ESP32-CAM has ~4 free, two of them boot-strapping pins.',
    },
  },
  skills: ['AC metering', 'PZEM-004T', 'Tariff math', 'Overload cut-off'],
  scene: 'energy',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'pzem-manual', 'ssd1306', 'lcd16x2', 'relay-5v', 'blynk-docs'],
  rig: { sensor: 'pzem', extras: ['relay', 'lcd'] },
  options: [
    {
      id: 'a',
      title: 'A. Bench power monitor',
      level: 'Medium · core build',
      blurb: 'PZEM-004T + CT clamp with a local readout of V/I/W/kWh. No cloud needed.',
      points: ['True RMS metering chip', 'CT clamp = no cutting the live wire', 'kWh + cost estimate'],
      weeks: '2 weeks',
      cost: '৳2,400–3,200',
    },
    {
      id: 'b',
      title: 'B. IoT billing dashboard',
      level: 'Medium+ · best value',
      blurb: 'Blynk dashboard with live watts, daily kWh, bill estimate and overload auto cut-off.',
      points: ['Live + history graphs', 'Tariff-based bill math', 'Overload relay trip'],
      weeks: '3 weeks',
      cost: '৳2,800–4,000',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳380–550', boards: ['nodemcu'] },
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'PZEM-004T V3 (100A) + CT', qty: '1', role: 'AC metering', price: '৳900–1,400' },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'PZEM TX 5V → 3.3V divider', price: '৳10–30', boards: ['esp32', 'nodemcu'] },
    { name: 'Relay module 10A 250VAC', qty: '1', role: 'Overload cut-off', price: '৳120–220', versions: ['b'] },
    { name: 'Push button', qty: '1', role: 'Trip re-arm', price: '৳10–30', versions: ['b'] },
    { name: 'OLED / 16×2 I²C LCD', qty: '1', role: 'Local readout', price: '৳250–550' },
    { name: 'Test load (bulb / ≤1kW heater)', qty: '1–2', role: 'Known-watt calibration', price: '৳150–400' },
    { name: 'Enclosure + 5V supply', qty: '1', role: 'Safe housing', price: '৳400–700' },
    { name: 'Fuse holder + 6.3A fuse + insulated leads', qty: '1 set', role: 'Mains safety', price: '৳150–300' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'PZEM → 5V / GND (TTL side)', to: 'VIN (5V) / GND' },
        { from: 'PZEM TX (5V) →', to: '1k/2k divider → GPIO16 (RX2, 9600)' },
        { from: 'PZEM RX ←', to: 'GPIO17 (TX2)' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'Cut-off relay → IN (B)', to: 'GPIO26 (VCC 5V; pick a 3.3V-trigger module)' },
        { from: 'Re-arm button (B)', to: 'GPIO27 → GND (INPUT_PULLUP)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'PZEM → 5V / GND (TTL side)', to: 'VIN (5V) / GND' },
        { from: 'PZEM TX (5V) →', to: '1k/2k divider → D6 (SoftwareSerial RX)' },
        { from: 'PZEM RX ←', to: 'D7 (SoftwareSerial TX)' },
        { from: 'OLED → SDA/SCL', to: 'D2 / D1' },
        { from: 'Cut-off relay → IN (B)', to: 'D0 (VCC 5V; pick a 3.3V-trigger module)' },
        { from: 'Re-arm button (B)', to: 'D5 → GND (INPUT_PULLUP)' },
      ],
    },
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'PZEM → 5V / GND (TTL side)', to: '5V / GND' },
        { from: 'PZEM TX →', to: 'D2 (SoftwareSerial RX, 9600)' },
        { from: 'PZEM RX ←', to: 'D3 (SoftwareSerial TX)' },
        { from: 'LCD / OLED → SDA/SCL', to: 'A4 / A5' },
        { from: 'Cut-off relay → IN (B)', to: 'D7 (VCC 5V)' },
        { from: 'Re-arm button (B)', to: 'D8 → GND (INPUT_PULLUP)' },
      ],
    },
    {
      id: 'safety',
      label: 'Mains safety map',
      board: 'Wiring order',
      pins: [
        { from: 'Wall live → 6.3A fuse →', to: 'relay COM → NO → load (B); straight to load in A' },
        { from: 'Wall neutral →', to: 'load neutral (never fused or switched)' },
        { from: 'CT clamp →', to: 'around the live wire only, after the fuse' },
        { from: 'PZEM L/N terminals →', to: 'parallel across live/neutral (voltage sense)' },
        { from: 'ESP / 5V side →', to: 'isolated: never connect to mains live or neutral' },
        { from: 'Socket →', to: 'RCD-protected; earth any metal enclosure' },
      ],
    },
  ],
  steps: [
    {
      id: 'wire-cold-first',
      title: 'Wire cold first',
      detail: 'Do all 230V wiring unplugged, inside the enclosure, on an RCD-protected socket. Have a supervisor inspect before first power-up.',
    },
    {
      id: 'wire-pzem-ttl',
      title: 'Wire the PZEM TTL side',
      detail: 'PZEM 5V/GND→VIN/GND, PZEM TX→1k/2k divider→GPIO16, PZEM RX←GPIO17. OLED on 21/22. This side is opto-isolated from mains.',
      boardDetail: {
        nodemcu: 'PZEM 5V/GND→VIN/GND, PZEM TX→1k/2k divider→D6, PZEM RX←D7 (SoftwareSerial). OLED on D2/D1. This side is opto-isolated from mains.',
        uno: 'PZEM 5V/GND→5V/GND, PZEM TX→D2, PZEM RX←D3 (SoftwareSerial, 9600). LCD/OLED on A4/A5. This side is opto-isolated from mains.',
      },
    },
    {
      id: 'read-the-meter',
      title: 'Read the meter',
      detail: 'Run the PZEM004Tv30 example: expect ~220–240V and sane watts on a known bulb (60W ≈ 55–65W). NaN readings usually mean TX/RX are swapped.',
    },
    {
      id: 'calibrate-known-loads',
      title: 'Calibrate with known loads',
      detail: 'Bulb + phone charger + ≤1kW heater: record meter vs nameplate watts, compute % error for the report.',
    },
    {
      id: 'add-tariff-math',
      title: 'Add tariff math',
      detail: 'kWh × slab rate = bill estimate. Implement 2–3 slabs (e.g. 0–75, 76–200, 200+ kWh) like the real utility tariff.',
    },
    {
      id: 'overload-trip',
      title: 'Overload trip',
      detail: 'Current above TRIP_A (5A, below the 6.3A fuse) for 5s → relay on GPIO26 opens + Blynk alert. Re-arm button on GPIO27 closes it again.',
      boardDetail: {
        nodemcu: 'Current above TRIP_A (5A, below the 6.3A fuse) for 5s → relay on D0 opens + Blynk alert. Re-arm button on D5 closes it again.',
        uno: 'Current above TRIP_A (5A, below the 6.3A fuse) for 5s → relay on D7 opens + TRIP on the display. Re-arm button on D8 closes it again.',
      },
      versions: ['b'],
    },
    {
      id: 'blynk-dashboard',
      title: 'Blynk dashboard',
      detail: 'V0 watts, V1 kWh, V2 bill (৳), V3 volts. Add an “overload” event in the template so trips push to the phone.',
      boardDetail: {
        uno: 'Blynk needs Wi-Fi: run the dashboard part on an ESP32 or NodeMCU build — the Uno version stays local with on-screen bill + trip.',
      },
      versions: ['b'],
    },
    {
      id: 'demo-compare',
      title: 'Demo + compare',
      detail: 'Run a 1kW heater 10 min (~0.17 kWh), show kWh climb, compare against a plug meter if available.',
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: current held above the trip setting for 5s opens the cut-off relay.',
    sliders: [
      { id: 'amps', label: 'Load current', unit: 'A', min: 0, max: 10, value: 3.2 },
      { id: 'volts', label: 'Mains voltage', unit: 'V', min: 180, max: 250, value: 228 },
    ],
    threshold: { id: 'thr', label: 'Trip above', unit: 'A', min: 1, max: 6, value: 5 },
    watch: 'amps',
    rule: 'above',
    actuator: 'Relay',
    onText: 'TRIP',
    offText: 'closed',
    lcd: ['{volts}V {amps}A', 'Relay:{act}'],
    demoSlider: 'amps',
    demoFrom: 1,
    demoTo: 7,
    barLabel: 'Current draw',
  },
  code: [
    {
      id: 'a',
      label: 'A · Meter reader',
      note: 'Library: PZEM004Tv30 by mandulaj. It starts Serial2 at 9600 baud on GPIO16/17 itself.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <PZEM004Tv30.h>
PZEM004Tv30 pzem(Serial2, 16, 17);  // RX2=16 (via divider), TX2=17

void setup() {
  Serial.begin(115200);
}

void loop() {
  float v = pzem.voltage();
  float i = pzem.current();
  float p = pzem.power();
  float e = pzem.energy();
  if (isnan(v)) { Serial.println("PZEM not found"); }
  else {
    Serial.printf("%.1fV %.2fA %.1fW %.3fkWh\\n", v, i, p, e);
    // ... show on OLED ...
  }
  delay(1000);
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · Meter reader (NodeMCU)',
      note: 'Same reader on SoftwareSerial D6/D7; the library sets 9600 baud.',
      board: 'nodemcu',
      versions: ['a'],
      code: `#include <PZEM004Tv30.h>
#include <SoftwareSerial.h>
SoftwareSerial pzemSerial(D6, D7);  // RX ← PZEM TX (divided), TX → PZEM RX
PZEM004Tv30 pzem(pzemSerial);

void setup() {
  Serial.begin(115200);
}

void loop() {
  float v = pzem.voltage(), i = pzem.current(), p = pzem.power(), e = pzem.energy();
  if (isnan(v)) Serial.println("PZEM not found");
  else Serial.printf("%.1fV %.2fA %.1fW %.3fkWh\\n", v, i, p, e);
  delay(1000);
}`,
    },
    {
      id: 'a-uno',
      label: 'A · Meter reader (Uno)',
      note: 'SoftwareSerial on D2/D3. AVR printf has no floats, so values print one by one.',
      board: 'uno',
      versions: ['a'],
      code: `#include <PZEM004Tv30.h>
#include <SoftwareSerial.h>
SoftwareSerial pzemSerial(2, 3);  // RX ← PZEM TX, TX → PZEM RX
PZEM004Tv30 pzem(pzemSerial);

void setup() {
  Serial.begin(115200);
}

void loop() {
  float v = pzem.voltage();
  if (isnan(v)) { Serial.println(F("PZEM not found")); delay(1000); return; }
  Serial.print(v, 1); Serial.print(F("V "));
  Serial.print(pzem.current(), 2); Serial.print(F("A "));
  Serial.print(pzem.power(), 1); Serial.print(F("W "));
  Serial.print(pzem.energy(), 3); Serial.println(F("kWh"));
  delay(1000);
}`,
    },
    {
      id: 'b',
      label: 'B · Bill + trip',
      note: 'Slab tariff math + 5s overload trip with manual re-arm button. Relay module is active-LOW.',
      board: 'esp32',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#define BLYNK_TEMPLATE_NAME "Energy Meter"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <PZEM004Tv30.h>
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
PZEM004Tv30 pzem(Serial2, 16, 17);
#define RELAY 26  // active-LOW: LOW = contacts closed, load on
#define REARM 27
const float TRIP_A = 5.0;  // below the 6.3A fuse and 10A relay
const unsigned long TRIP_MS = 5000;
bool tripped = false;
unsigned long overSince = 0;
BlynkTimer timer;

float bill(float kwh) {  // example slabs, adjust to your utility
  if (kwh <= 75) return kwh * 4.5;
  if (kwh <= 200) return 75 * 4.5 + (kwh - 75) * 6.0;
  return 75 * 4.5 + 125 * 6.0 + (kwh - 200) * 7.5;
}

void setRelay() { digitalWrite(RELAY, tripped ? HIGH : LOW); }

void sample() {
  float v = pzem.voltage(), i = pzem.current(), p = pzem.power(), e = pzem.energy();
  if (isnan(v)) return;  // PZEM not answering
  if (i > TRIP_A) {
    if (!overSince) overSince = millis();
    if (!tripped && millis() - overSince > TRIP_MS) {
      tripped = true; setRelay();
      Blynk.logEvent("overload", (String(i, 1) + " A").c_str());
    }
  } else overSince = 0;
  Blynk.virtualWrite(V0, p);
  Blynk.virtualWrite(V1, e);
  Blynk.virtualWrite(V2, bill(e));
  Blynk.virtualWrite(V3, v);
}

void setup() {
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);  // open until connected
  pinMode(REARM, INPUT_PULLUP);
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
  setRelay();
  timer.setInterval(1000L, sample);
}

void loop() {
  Blynk.run(); timer.run();
  if (tripped && digitalRead(REARM) == LOW) { tripped = false; setRelay(); }
}`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · Bill + trip (NodeMCU)',
      note: 'Same tariff math + 5s trip: PZEM on SoftwareSerial D6/D7, active-LOW relay on D0, re-arm button on D5.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#define BLYNK_TEMPLATE_NAME "Energy Meter"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <PZEM004Tv30.h>
#include <SoftwareSerial.h>
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
SoftwareSerial pzemSerial(D6, D7);  // RX ← PZEM TX (divided), TX → PZEM RX
PZEM004Tv30 pzem(pzemSerial);
#define RELAY D0  // active-LOW: LOW = contacts closed, load on
#define REARM D5
const float TRIP_A = 5.0;  // below the 6.3A fuse and 10A relay
const unsigned long TRIP_MS = 5000;
bool tripped = false;
unsigned long overSince = 0;
BlynkTimer timer;

float bill(float kwh) {  // example slabs, adjust to your utility
  if (kwh <= 75) return kwh * 4.5;
  if (kwh <= 200) return 75 * 4.5 + (kwh - 75) * 6.0;
  return 75 * 4.5 + 125 * 6.0 + (kwh - 200) * 7.5;
}

void setRelay() { digitalWrite(RELAY, tripped ? HIGH : LOW); }

void sample() {
  float v = pzem.voltage(), i = pzem.current(), p = pzem.power(), e = pzem.energy();
  if (isnan(v)) return;  // PZEM not answering
  if (i > TRIP_A) {
    if (!overSince) overSince = millis();
    if (!tripped && millis() - overSince > TRIP_MS) {
      tripped = true; setRelay();
      Blynk.logEvent("overload", (String(i, 1) + " A").c_str());
    }
  } else overSince = 0;
  Blynk.virtualWrite(V0, p);
  Blynk.virtualWrite(V1, e);
  Blynk.virtualWrite(V2, bill(e));
  Blynk.virtualWrite(V3, v);
}

void setup() {
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);  // open until connected
  pinMode(REARM, INPUT_PULLUP);
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
  setRelay();
  timer.setInterval(1000L, sample);
}

void loop() {
  Blynk.run(); timer.run();
  if (tripped && digitalRead(REARM) == LOW) { tripped = false; setRelay(); }
}`,
    },
  ],
  tips: [
    { title: 'CT on live only', detail: 'Clamping both live+neutral cancels the field and reads ~0A.' },
    { title: 'Fuse the live', detail: 'A 6.3A fuse before the relay — above the 5A trip, below the relay’s 10A rating — is non-negotiable on mains demos.' },
    { title: 'Divide the TX', detail: 'PZEM TX idles at 5V when its TTL side runs on 5V — ESP pins aren’t 5V tolerant, so use the 1k/2k divider.' },
    { title: 'Reset energy', detail: 'pzem.resetEnergy() at demo start so kWh math is clean.' },
    { title: 'Slab honesty', detail: 'Cite the utility tariff PDF in your report — rates change yearly.' },
  ],
}
