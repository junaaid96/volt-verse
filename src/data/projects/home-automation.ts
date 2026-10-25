import type { Project } from '../types'

export const homeAutomation: Project = {
  slug: 'home-automation',
  categoryId: 'iot',
  title: 'Smart Home Automation',
  tagline: 'Phone + voice control of lights and fans with manual fallback.',
  difficulty: 'Basic',
  weeks: '2 weeks',
  cost: '৳2,000–3,800',
  boards: ['ESP32', 'ESP8266'],
  skills: ['Relay control', 'Blynk', 'Voice assist', 'Manual override'],
  scene: 'home',
  updated: 'Oct 2026',
  sheets: ['esp32', 'dht22', 'blynk-docs'],
  rig: { sensor: 'pir', extras: ['relay'] },
  featured: true,
  options: [
    {
      id: 'a',
      title: 'A. Phone control (Blynk)',
      level: 'Basic · easiest',
      blurb: '4-channel relay board on ESP32 with a Blynk app: buttons, timers and status LEDs.',
      points: ['4 appliances on one board', 'Timers + scenes', 'Works from anywhere'],
      weeks: '1–2 weeks',
      cost: '৳2,000–2,800',
    },
    {
      id: 'b',
      title: 'B. Voice + sensors',
      level: 'Medium · best demo',
      blurb: 'Add Alexa/Google voice via Sinric Pro plus PIR auto-light and a DHT comfort readout.',
      points: ['"Alexa, fan on" moments', 'Motion auto-light', 'Temp/humidity tile'],
      weeks: '2–3 weeks',
      cost: '৳2,600–3,800',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi/BT', price: '৳470–850' },
    { name: '4ch relay module (opto)', qty: '1', role: 'Mains switching', price: '৳280–450' },
    { name: 'PIR motion sensor', qty: '1', role: 'Auto-light trigger', price: '৳120–220' },
    { name: 'DHT22', qty: '1', role: 'Room climate', price: '৳250–450' },
    { name: 'Push buttons + LEDs', qty: '4 sets', role: 'Manual override', price: '৳100–200' },
    { name: 'Demo bulbs (AC) + holders', qty: '2–4', role: 'Safe appliance demo', price: '৳300–600' },
    { name: 'Enclosure + 5V supply', qty: '1', role: 'Safe housing', price: '৳400–700' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'Relay → IN1..IN4', to: 'GPIO26,25,33,32' },
        { from: 'Relay → VCC/GND', to: '5V / GND (separate supply ideal)' },
        { from: 'PIR → OUT', to: 'GPIO27' },
        { from: 'DHT22 → DATA', to: 'GPIO14' },
        { from: 'Buttons →', to: 'GPIO18,19,21,22 (INPUT_PULLUP)' },
        { from: 'Status LEDs →', to: 'GPIO16,17,13,23 via 220Ω (GPIO12/15 avoided: boot strapping)' },
      ],
    },
    {
      id: 'esp8266',
      label: 'Budget ESP8266',
      board: 'ESP8266 NodeMCU',
      pins: [
        { from: 'Relay → IN1..IN2', to: 'D1, D2' },
        { from: 'PIR → OUT', to: 'D5' },
        { from: 'DHT22 → DATA', to: 'D4' },
        { from: 'Buttons →', to: 'D6, D7 (INPUT_PULLUP)' },
      ],
    },
  ],
  steps: [
    { title: 'Start low-voltage', detail: 'Drive LEDs first, not mains. Prove every channel, button and sensor with 5V loads only.' },
    { title: 'Build the Blynk app', detail: '4 buttons (V0–V3), temp/humidity tiles, one timer. Test on local Wi-Fi, then on mobile data.' },
    { title: 'Add manual override', detail: 'Every relay gets a physical button. Rule: button press toggles and syncs the app state back.' },
    { title: 'Wire mains safely', detail: 'Relay COM→live, NO→bulb. Insulate, fuse, enclose. Have a supervisor check before power-on.' },
    { title: 'Add voice (B)', detail: 'Sinric Pro devices mirror your relays; link to Alexa/Google Home and test each voice command.' },
    { title: 'Demo a scene', detail: '"Movie mode": one button dims room light, starts fan, shows temp. Film it for the presentation.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: motion plus darkness switches the room light on automatically.',
    sliders: [
      { id: 'motion', label: 'Motion level', unit: '%', min: 0, max: 100, value: 70 },
      { id: 'light', label: 'Ambient light', unit: 'lx', min: 0, max: 1000, value: 120 },
      { id: 'temp', label: 'Room temp', unit: '°C', min: 16, max: 40, value: 28 },
    ],
    threshold: { id: 'thr', label: 'Dark below', unit: 'lx', min: 50, max: 600, value: 200 },
    watch: 'light',
    rule: 'below',
    actuator: 'Light',
    onText: 'AUTO-ON',
    offText: 'off',
    lcd: ['L:{light}lx M:{motion}%', 'Light:{act} T:{temp}C'],
    demoSlider: 'light',
    demoFrom: 500,
    demoTo: 40,
    barLabel: 'Darkness',
  },
  code: [
    {
      id: 'a',
      label: 'A · Blynk 4-channel',
      note: 'Blynk buttons on V0–V3; physical buttons on GPIO18–22 sync back to the app.',
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxx"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
char AUTH[] = "YOUR_BLYNK_TOKEN";
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
const int RELAY[4] = {26, 25, 33, 32};
const int BTN[4] = {18, 19, 21, 22};
bool state[4] = {0};

BLYNK_WRITE(V0) { state[0] = param.asInt(); }
BLYNK_WRITE(V1) { state[1] = param.asInt(); }
BLYNK_WRITE(V2) { state[2] = param.asInt(); }
BLYNK_WRITE(V3) { state[3] = param.asInt(); }

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(RELAY[i], OUTPUT);
    pinMode(BTN[i], INPUT_PULLUP);
  }
  Blynk.begin(AUTH, SSID, PASS);
}

void loop() {
  Blynk.run();
  for (int i = 0; i < 4; i++) {
    if (digitalRead(BTN[i]) == LOW) {  // manual toggle
      state[i] = !state[i];
      Blynk.virtualWrite(i, state[i]);
      delay(300);
    }
    digitalWrite(RELAY[i], state[i] ? LOW : HIGH);
  }
}`,
    },
    {
      id: 'b',
      label: 'B · PIR auto-light',
      note: 'Add-on sketch logic: motion + darkness → light on for 2 min. Merge into version A.',
      code: `#define PIR 27
#define LDR 34
#define LAMP_RELAY 26
#define DARK_BELOW 800        // tune: higher = darker room
unsigned long lastMotion = 0;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LAMP_RELAY, OUTPUT);
  digitalWrite(LAMP_RELAY, HIGH);
}

void loop() {
  int light = analogRead(LDR);   // LDR divider
  if (digitalRead(PIR)) lastMotion = millis();
  bool dark = light < DARK_BELOW;
  bool occupied = millis() - lastMotion < 120000;
  digitalWrite(LAMP_RELAY, (dark && occupied) ? LOW : HIGH);
  delay(500);
}`,
    },
  ],
  tips: [
    { title: 'Mains last', detail: 'Prove all logic on LEDs before any 220V wire goes near the relays.' },
    { title: 'Sync both ways', detail: 'Manual buttons must update the app, or states drift and confuse users.' },
    { title: 'Retain states', detail: 'Save relay states to EEPROM/NVS so a reboot restores the room.' },
    { title: 'Fuse everything', detail: 'A 5A fuse on the mains input is cheap examiner-proof safety.' },
  ],
}
