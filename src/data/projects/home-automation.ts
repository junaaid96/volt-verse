import type { Project } from '../types'

export const homeAutomation: Project = {
  slug: 'home-automation',
  categoryId: 'iot',
  title: 'Smart Home Automation',
  tagline: 'Phone + voice control of lights and fans with manual fallback.',
  difficulty: 'Basic',
  weeks: '1–3 weeks',
  cost: '৳2,000–3,800',
  boards: ['ESP32', 'ESP8266'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Version A works through an ESP-01 Wi-Fi link (Blynk ESP8266-shield mode). Version B’s PIR, LDR and DHT22 work, but Sinric Pro voice needs an ESP32 or NodeMCU.',
    },
    esp32: { ok: true },
    nodemcu: { ok: true, note: 'Only 2 relay channels + 2 buttons fit the safe GPIO; the app shows state instead of status LEDs.' },
    esp32cam: {
      ok: false,
      reason: 'Needs 4 relays, 4 buttons, PIR and DHT22 — the ESP32-CAM has only 2–4 free GPIO, and they are ADC2 so the LDR can’t be read with Wi-Fi on.',
    },
  },
  skills: ['Relay control', 'Blynk', 'Voice assist', 'Manual override'],
  scene: 'home',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'dht22', 'blynk-docs'],
  rig: { sensor: 'pir', extras: ['relay', 'dht'] },
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
      blurb: 'Add Alexa/Google voice via Sinric Pro plus PIR + LDR auto-light and a DHT22 comfort readout.',
      points: ['"Alexa, fan on" moments', 'Motion auto-light', 'Temp/humidity tile'],
      weeks: '2–3 weeks',
      cost: '৳2,600–3,800',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi/BT', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳650–1,000', boards: ['uno'] },
    { name: 'ESP-01 + 3V3 adapter', qty: '1', role: 'Wi-Fi link for the Uno', price: '৳250–400', boards: ['uno'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳350–550', boards: ['nodemcu'] },
    { name: '4ch relay module (opto, JD-VCC)', qty: '1', role: 'Mains switching', price: '৳280–450' },
    { name: 'Fuse holder + 2A fuse', qty: '1', role: 'Mains input protection', price: '৳60–120' },
    { name: 'PIR motion sensor (HC-SR501)', qty: '1', role: 'Auto-light trigger', price: '৳120–220', versions: ['b'] },
    { name: 'LDR + 10k resistor', qty: '1 set', role: 'Darkness sensing', price: '৳20–50', versions: ['b'] },
    { name: 'DHT22', qty: '1', role: 'Room climate', price: '৳250–450', versions: ['b'] },
    { name: 'Push buttons + LEDs', qty: '4 sets', role: 'Manual override', price: '৳100–200' },
    { name: 'Demo bulbs (AC) + holders', qty: '2–4', role: 'Safe appliance demo', price: '৳300–600' },
    { name: 'Enclosure + 5V 2A supply', qty: '1', role: 'Safe housing + relay power', price: '৳400–700' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'Relay → IN1..IN4', to: 'GPIO26, 25, 33, 32 (LOW = on)' },
        { from: 'Relay → VCC / JD-VCC', to: '3V3 / 5V supply (remove the JD-VCC jumper so 3V3 logic fully switches the optos)' },
        { from: 'Relay → GND', to: 'GND (common with the 5V supply)' },
        { from: 'Buttons →', to: 'GPIO18, 19, 21, 22 to GND (INPUT_PULLUP)' },
        { from: 'Status LEDs →', to: 'GPIO16, 17, 13, 23 via 220Ω (GPIO12/15 avoided: boot strapping)' },
        { from: 'PIR → OUT / VCC (B)', to: 'GPIO27 / 5V (output is 3.3V, safe)' },
        { from: 'LDR divider (B)', to: 'GPIO34 (LDR to 3V3, 10k to GND; ADC1 works with Wi-Fi)' },
        { from: 'DHT22 → DATA / VCC (B)', to: 'GPIO14 (10k pull-up) / 3V3' },
      ],
    },
    {
      id: 'uno',
      label: 'Uno + ESP-01 link',
      board: 'Arduino + ESP-01',
      boards: ['uno'],
      pins: [
        { from: 'ESP-01 TX →', to: 'D2 (SoftwareSerial RX, 9600 baud)' },
        { from: 'ESP-01 RX →', to: 'D3 via 1k/2k divider (Uno TX is 5V)' },
        { from: 'ESP-01 VCC / GND', to: 'Adapter 3V3 regulator from 5V (Uno 3V3 pin can’t supply it) / GND' },
        { from: 'Relay → IN1..IN4', to: 'D4, D5, D6, D7 (LOW = on)' },
        { from: 'Relay → VCC / GND', to: '5V supply / GND (common with the Uno)' },
        { from: 'Buttons →', to: 'D8, D9, D10, D11 to GND (INPUT_PULLUP)' },
        { from: 'Status LEDs →', to: 'D12, D13, A3, A4 via 220Ω' },
        { from: 'LDR divider (B)', to: 'A0 (LDR to 5V, 10k to GND)' },
        { from: 'PIR → OUT (B)', to: 'A1 (used as digital input)' },
        { from: 'DHT22 → DATA (B)', to: 'A2 (10k pull-up to 5V)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'Relay → IN1, IN2', to: 'D1 (GPIO5), D2 (GPIO4) (LOW = on)' },
        { from: 'Relay → VCC / JD-VCC', to: '3V3 / VIN 5V (remove the JD-VCC jumper)' },
        { from: 'Buttons →', to: 'D6 (GPIO12), D7 (GPIO13) to GND (INPUT_PULLUP)' },
        { from: 'PIR → OUT / VCC (B)', to: 'D5 (GPIO14) / VIN 5V' },
        { from: 'LDR divider (B)', to: 'A0 (LDR to 3V3, 10k to GND)' },
        { from: 'DHT22 → DATA (B)', to: 'D4 (GPIO2, 10k pull-up keeps it HIGH at boot)' },
      ],
    },
    {
      id: 'mains',
      label: 'Mains side (230V AC)',
      board: 'Relay board → loads',
      pins: [
        { from: 'Mains live (L) →', to: '2A fuse → relay COM (switch live, never neutral)' },
        { from: 'Relay NO →', to: 'Bulb/fan live terminal (off when unpowered)' },
        { from: 'Mains neutral (N) →', to: 'Bulb/fan neutral directly' },
        { from: 'Earth (PE) →', to: 'Metal enclosure + holder earth terminals' },
        { from: '5V supply →', to: 'Enclosed module (e.g. HLK-5M05) or phone charger on the fused input' },
      ],
    },
  ],
  steps: [
    {
      id: 'start-low-voltage',
      title: 'Start low-voltage',
      detail: 'Drive LEDs first, not mains. Prove every channel, button and sensor with 5V loads only.',
    },
    {
      id: 'install-esp8266-core',
      title: 'Install the ESP8266 board package',
      detail: 'Boards Manager → esp8266 by ESP8266 Community, then select NodeMCU 1.0 (ESP-12E). Install the Blynk library.',
      boards: ['nodemcu'],
    },
    {
      id: 'setup-esp01-link',
      title: 'Set up the ESP-01 Wi-Fi link',
      detail: 'Keep AT firmware on the ESP-01, send AT+UART_DEF=9600,8,1,0,0 once, then wire ESP TX → D2 and D3 → ESP RX through a 1k/2k divider.',
      boards: ['uno'],
    },
    {
      id: 'build-blynk-app',
      title: 'Build the Blynk app',
      detail: '4 switch widgets (V0–V3), temp/humidity tiles, one timer. Test on local Wi-Fi, then on mobile data.',
      boardDetail: {
        nodemcu: '2 switch widgets (V0–V1), temp/humidity tiles, one timer. Test on local Wi-Fi, then on mobile data.',
      },
    },
    {
      id: 'add-manual-override',
      title: 'Add manual override',
      detail: 'Buttons on GPIO18, 19, 21, 22 (INPUT_PULLUP) toggle their relay and push the new state back with Blynk.virtualWrite.',
      boardDetail: {
        uno: 'Buttons on D8–D11 (INPUT_PULLUP) toggle their relay and push the new state back with Blynk.virtualWrite.',
        nodemcu: 'Buttons on D6 and D7 (INPUT_PULLUP) toggle their relay and push the new state back with Blynk.virtualWrite.',
      },
    },
    {
      id: 'wire-mains-safely',
      title: 'Wire mains safely',
      detail: 'Power off at the MCB first. Live → fuse → relay COM, NO → bulb, neutral straight to the bulb. Insulate, enclose, earth metal parts. A supervisor checks before power-on.',
    },
    {
      id: 'add-motion-light',
      title: 'Add motion auto-light',
      detail: 'PIR OUT → GPIO27, LDR divider → GPIO34, DHT22 → GPIO14. Light relay turns on for 2 min when motion and darkness coincide.',
      boardDetail: {
        uno: 'PIR OUT → A1, LDR divider → A0, DHT22 → A2. Light relay turns on for 2 min when motion and darkness coincide.',
        nodemcu: 'PIR OUT → D5, LDR divider → A0, DHT22 → D4. Light relay turns on for 2 min when motion and darkness coincide.',
      },
      versions: ['b'],
    },
    {
      id: 'add-voice',
      title: 'Add voice control',
      detail: 'Sinric Pro devices mirror your relays; link to Alexa/Google Home and test each voice command.',
      boardDetail: {
        uno: 'Sinric Pro can’t run through the ESP-01 AT link. Demo voice on an ESP32/NodeMCU, or present B as sensors-only on the Uno.',
      },
      versions: ['b'],
    },
    {
      id: 'demo-scene',
      title: 'Demo a scene',
      detail: '"Movie mode": one button turns off the main light, keeps a lamp on, starts the fan and shows temp. Film it for the presentation.',
    },
  ],
  simulator: {
    viz: 'lamp',
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
      note: 'Blynk switches on V0–V3; physical buttons on GPIO18, 19, 21, 22 sync back to the app. Relay board is active-LOW.',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_TEMPLATE_NAME "Smart Home"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
const int RELAY[4] = {26, 25, 33, 32};
const int BTN[4] = {18, 19, 21, 22};
const int LED[4] = {16, 17, 13, 23};
bool state[4] = {false};
bool lastBtn[4] = {HIGH, HIGH, HIGH, HIGH};

void setRelay(int i, bool on) {
  state[i] = on;
  digitalWrite(RELAY[i], on ? LOW : HIGH);  // active-LOW board
  digitalWrite(LED[i], on);
}

BLYNK_CONNECTED() { Blynk.syncVirtual(V0, V1, V2, V3); }
BLYNK_WRITE(V0) { setRelay(0, param.asInt()); }
BLYNK_WRITE(V1) { setRelay(1, param.asInt()); }
BLYNK_WRITE(V2) { setRelay(2, param.asInt()); }
BLYNK_WRITE(V3) { setRelay(3, param.asInt()); }

void setup() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(RELAY[i], HIGH);  // off before enabling output
    pinMode(RELAY[i], OUTPUT);
    pinMode(LED[i], OUTPUT);
    pinMode(BTN[i], INPUT_PULLUP);
  }
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
}

void loop() {
  Blynk.run();
  for (int i = 0; i < 4; i++) {
    bool now = digitalRead(BTN[i]);
    if (lastBtn[i] == HIGH && now == LOW) {  // press edge = toggle
      setRelay(i, !state[i]);
      Blynk.virtualWrite(i, state[i]);
      delay(50);  // debounce
    }
    lastBtn[i] = now;
  }
}`,
    },
    {
      id: 'a-uno',
      label: 'A · Uno + ESP-01 Blynk',
      note: 'Libraries: Blynk, plus ESP8266_Lib — not in Library Manager: copy libraries/BlynkESP8266_Lib from Blynk_Release_v1.3.2.zip (GitHub blynkkk/blynk-library) into Arduino/libraries. ESP-01 runs AT firmware at 9600 baud; relays on D4–D7, buttons on D8–D11.',
      board: 'uno',
      versions: ['a', 'b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_TEMPLATE_NAME "Smart Home"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <ESP8266_Lib.h>
#include <BlynkSimpleShieldEsp8266.h>
#include <SoftwareSerial.h>
SoftwareSerial EspSerial(2, 3);  // RX, TX
ESP8266 wifi(&EspSerial);
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
const int RELAY[4] = {4, 5, 6, 7};
const int BTN[4] = {8, 9, 10, 11};
const int LED[4] = {12, 13, A3, A4};
bool state[4] = {false};
bool lastBtn[4] = {HIGH, HIGH, HIGH, HIGH};

void setRelay(int i, bool on) {
  state[i] = on;
  digitalWrite(RELAY[i], on ? LOW : HIGH);
  digitalWrite(LED[i], on);
}

BLYNK_WRITE(V0) { setRelay(0, param.asInt()); }
BLYNK_WRITE(V1) { setRelay(1, param.asInt()); }
BLYNK_WRITE(V2) { setRelay(2, param.asInt()); }
BLYNK_WRITE(V3) { setRelay(3, param.asInt()); }

void setup() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(RELAY[i], HIGH);
    pinMode(RELAY[i], OUTPUT);
    pinMode(LED[i], OUTPUT);
    pinMode(BTN[i], INPUT_PULLUP);
  }
  EspSerial.begin(9600);
  Blynk.begin(BLYNK_AUTH_TOKEN, wifi, SSID, PASS);
}

void loop() {
  Blynk.run();
  for (int i = 0; i < 4; i++) {
    bool now = digitalRead(BTN[i]);
    if (lastBtn[i] == HIGH && now == LOW) {
      setRelay(i, !state[i]);
      Blynk.virtualWrite(i, state[i]);
      delay(50);
    }
    lastBtn[i] = now;
  }
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · NodeMCU 2-channel',
      note: 'Same logic on 2 channels: relays on D1/D2, buttons on D6/D7, Blynk switches on V0–V1.',
      board: 'nodemcu',
      versions: ['a', 'b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_TEMPLATE_NAME "Smart Home"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
const int RELAY[2] = {D1, D2};
const int BTN[2] = {D6, D7};
bool state[2] = {false};
bool lastBtn[2] = {HIGH, HIGH};

void setRelay(int i, bool on) {
  state[i] = on;
  digitalWrite(RELAY[i], on ? LOW : HIGH);
}

BLYNK_CONNECTED() { Blynk.syncVirtual(V0, V1); }
BLYNK_WRITE(V0) { setRelay(0, param.asInt()); }
BLYNK_WRITE(V1) { setRelay(1, param.asInt()); }

void setup() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(RELAY[i], HIGH);
    pinMode(RELAY[i], OUTPUT);
    pinMode(BTN[i], INPUT_PULLUP);
  }
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
}

void loop() {
  Blynk.run();
  for (int i = 0; i < 2; i++) {
    bool now = digitalRead(BTN[i]);
    if (lastBtn[i] == HIGH && now == LOW) {
      setRelay(i, !state[i]);
      Blynk.virtualWrite(i, state[i]);
      delay(50);
    }
    lastBtn[i] = now;
  }
}`,
    },
    {
      id: 'b',
      label: 'B · PIR auto-light',
      note: 'Add-on: paste below the A sketch, call setupAutoLight() in setup() and updateAutoLight() in loop(). Motion + darkness → light relay (IN1) on for 2 min; it only switches on changes, so the app and wall button still work. Sinric Pro voice uses its own library examples.',
      board: 'esp32',
      versions: ['b'],
      code: `#define PIR 27
#define LDR 34                // ADC1: readable while Wi-Fi is on
#define DARK_BELOW 800        // 0–4095; LDR to 3V3 + 10k to GND → lower = darker
#define HOLD_MS 120000UL      // stay on 2 min after the last motion
unsigned long lastMotion = 0;
bool autoOn = false;

void setupAutoLight() { pinMode(PIR, INPUT); }

void updateAutoLight() {      // relay 0 (IN1) is the lamp
  if (digitalRead(PIR)) lastMotion = millis();
  bool occupied = lastMotion && millis() - lastMotion < HOLD_MS;
  bool want = occupied && analogRead(LDR) < DARK_BELOW;
  if (want == autoOn) return;
  autoOn = want;
  setRelay(0, want);
  Blynk.virtualWrite(V0, want);
}`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · PIR auto-light (NodeMCU)',
      note: 'Add-on: paste below the A NodeMCU sketch, call setupAutoLight() in setup() and updateAutoLight() in loop(). PIR on D5, LDR divider on A0 (0–1023), light relay is IN1 on D1. A0 is sampled every 100 ms because constant analogRead drops the ESP8266’s Wi-Fi. Sinric Pro voice uses its own library examples.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#define PIR D5
#define LDR A0                // the ESP8266's only ADC
#define DARK_BELOW 200        // 0–1023; LDR to 3V3 + 10k to GND → lower = darker
#define HOLD_MS 120000UL      // stay on 2 min after the last motion
unsigned long lastMotion = 0, lastLdrRead = 0;
int ldrLevel = 1023;
bool autoOn = false;

void setupAutoLight() { pinMode(PIR, INPUT); }

void updateAutoLight() {      // relay 0 (IN1, D1) is the lamp
  if (digitalRead(PIR)) lastMotion = millis();
  if (millis() - lastLdrRead >= 100) { ldrLevel = analogRead(LDR); lastLdrRead = millis(); }
  bool occupied = lastMotion && millis() - lastMotion < HOLD_MS;
  bool want = occupied && ldrLevel < DARK_BELOW;
  if (want == autoOn) return;
  autoOn = want;
  setRelay(0, want);
  Blynk.virtualWrite(V0, want);
}`,
    },
  ],
  tips: [
    { title: 'Mains last', detail: 'Prove all logic on LEDs before any 230V wire goes near the relays.' },
    { title: 'Sync both ways', detail: 'Manual buttons must update the app, or states drift and confuse users.' },
    { title: 'Retain states', detail: 'Save relay states to NVS (Preferences) or EEPROM so a reboot restores the room.' },
    { title: 'Fuse everything', detail: 'A fuse sized to the load (2A for demo bulbs, well under the relay’s 10A) on the live input is cheap examiner-proof safety.' },
    { title: 'Never touch live', detail: 'Work on mains only with the plug pulled. Bare relay screw terminals sit at 230V — keep them inside the enclosure.' },
  ],
}
