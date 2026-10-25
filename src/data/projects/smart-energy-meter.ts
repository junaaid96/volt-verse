import type { Project } from '../types'

export const energyMeter: Project = {
  slug: 'smart-energy-meter',
  categoryId: 'iot',
  title: 'IoT Smart Energy Meter',
  tagline: 'Live volts, amps, watts and billing estimates on your phone.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,400–4,000',
  boards: ['ESP32', 'ESP8266'],
  skills: ['AC metering', 'PZEM-004T', 'Tariff math', 'Overload cut-off'],
  scene: 'energy',
  updated: 'Oct 2026',
  sheets: ['esp32', 'pzem-manual', 'acs712', 'blynk-docs'],
  rig: { sensor: 'pzem', extras: ['relay'] },
  options: [
    {
      id: 'a',
      title: 'A. Bench power monitor',
      level: 'Medium · core build',
      blurb: 'PZEM-004T + CT clamp on ESP32 with OLED readout of V/I/W/kWh. No cloud needed.',
      points: ['True RMS metering chip', 'CT clamp = no mains contact', 'kWh + cost estimate'],
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
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'PZEM-004T V3 + CT', qty: '1', role: 'AC metering', price: '৳900–1,400' },
    { name: 'Relay module 10A', qty: '1', role: 'Overload cut-off', price: '৳120–220' },
    { name: 'OLED display', qty: '1', role: 'Local readout', price: '৳350–550' },
    { name: 'Test load (bulb/heater)', qty: '1–2', role: 'Known-watt calibration', price: '৳150–400' },
    { name: 'Enclosure + 5V supply', qty: '1', role: 'Safe housing', price: '৳400–700' },
    { name: 'Fuse + insulated leads', qty: '1 set', role: 'Mains safety', price: '৳150–300' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'PZEM → TX/RX (5V TTL)', to: 'GPIO16 / GPIO17 (Serial2 9600)' },
        { from: 'PZEM → 5V/GND', to: '5V / GND' },
        { from: 'CT clamp →', to: 'around ONE live wire only' },
        { from: 'Cut-off relay →', to: 'GPIO26' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22' },
      ],
    },
    {
      id: 'safety',
      label: 'Mains safety map',
      board: 'Wiring order',
      pins: [
        { from: 'Wall live → fuse →', to: 'relay COM → NO → load' },
        { from: 'CT clamp →', to: 'clipped over live AFTER relay' },
        { from: 'PZEM L/N →', to: 'parallel across live/neutral' },
        { from: 'ESP ground →', to: 'NEVER bond to mains earth' },
      ],
    },
  ],
  steps: [
    { title: 'Wire cold first', detail: 'Complete all mains wiring with everything unplugged. Have a supervisor inspect before power.' },
    { title: 'Read the meter', detail: 'PZEM example sketch: confirm ~220V and sane watts on a known bulb (60W ≈ 55–65W reading).' },
    { title: 'Calibrate with known loads', detail: 'Bulb + phone charger + heater: record meter vs nameplate watts, compute % error for the report.' },
    { title: 'Add tariff math', detail: 'kWh × slab rate = bill estimate. Implement 2–3 slabs (lifeline/regular/peak) like the real utility.' },
    { title: 'Overload trip (B)', detail: 'Current > breaker rating for 5s → relay opens + Blynk alert. Manual reset button re-arms.' },
    { title: 'Demo + compare', detail: 'Run a heater 10 min, show kWh climb, compare against a plug meter if available.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: sustained current above the breaker rating trips the cut-off relay.',
    sliders: [
      { id: 'amps', label: 'Load current', unit: 'A', min: 0, max: 20, value: 6.4 },
      { id: 'volts', label: 'Mains voltage', unit: 'V', min: 180, max: 250, value: 223 },
    ],
    threshold: { id: 'thr', label: 'Trip above', unit: 'A', min: 5, max: 16, value: 10 },
    watch: 'amps',
    rule: 'above',
    actuator: 'Relay',
    onText: 'TRIP',
    offText: 'closed',
    lcd: ['{volts}V {amps}A', 'Relay:{act}'],
    demoSlider: 'amps',
    demoFrom: 4,
    demoTo: 14,
    barLabel: 'Current draw',
  },
  code: [
    {
      id: 'a',
      label: 'A · Meter reader',
      note: 'Library: PZEM004Tv30 by mandulaj. PZEM on Serial2 at 9600 baud.',
      code: `#include <PZEM004Tv30.h>
PZEM004Tv30 pzem(Serial2, 16, 17);  // RX=16 TX=17

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
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
      id: 'b',
      label: 'B · Bill + trip',
      note: 'Slab tariff math + overload trip with manual re-arm button.',
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <PZEM004Tv30.h>
char AUTH[] = "YOUR_BLYNK_TOKEN";
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
PZEM004Tv30 pzem(Serial2, 16, 17);
#define RELAY 26
#define REARM 15
#define TRIP_A 10.0
bool tripped = false;

float bill(float kwh) {  // example slabs, adjust to your utility
  if (kwh <= 75) return kwh * 4.5;
  if (kwh <= 200) return 75 * 4.5 + (kwh - 75) * 6.0;
  return 75 * 4.5 + 125 * 6.0 + (kwh - 200) * 7.5;
}

void setup() {
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);
  pinMode(REARM, INPUT_PULLUP);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  Blynk.begin(AUTH, SSID, PASS);
}

void loop() {
  Blynk.run();
  float i = pzem.current(), e = pzem.energy();
  if (i > TRIP_A) tripped = true;
  if (digitalRead(REARM) == LOW) tripped = false;
  digitalWrite(RELAY, tripped ? HIGH : LOW);  // relay opens on trip
  Blynk.virtualWrite(V0, pzem.power());
  Blynk.virtualWrite(V1, e);
  Blynk.virtualWrite(V2, bill(e));
  if (tripped) Blynk.logEvent("overload");
  delay(2000);
}`,
    },
  ],
  tips: [
    { title: 'CT on live only', detail: 'Clamping both live+neutral cancels the field and reads ~0A.' },
    { title: 'Fuse the live', detail: 'A 5A fuse before the relay is non-negotiable on mains demos.' },
    { title: 'Reset energy', detail: 'pzem.resetEnergy() at demo start so kWh math is clean.' },
    { title: 'Slab honesty', detail: 'Cite the utility tariff PDF in your report — rates change yearly.' },
  ],
}
