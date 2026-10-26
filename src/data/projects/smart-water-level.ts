import type { Project } from '../types'

export const waterLevel: Project = {
  slug: 'smart-water-level',
  categoryId: 'iot',
  title: 'Smart Water Level Controller',
  tagline: 'Tank sensing with auto pump cut-off and dry-run safety.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,500–2,800',
  boards: ['Arduino Uno', 'ESP8266', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: {
      ok: true,
      note: 'Version A runs natively. B needs the ESP-01 Wi-Fi link (wiring below) using Blynk’s ESP8266 shield mode.',
    },
    esp32: { ok: true, note: 'Needs a 1k/2k divider on ECHO and a level shifter for the 5V LCD.' },
    nodemcu: { ok: true, note: 'Needs a 1k/2k divider on ECHO, a level shifter for the 5V LCD and an external pull-up on D0 for the float.' },
    esp32cam: {
      ok: false,
      reason: 'The build needs 6 GPIO (TRIG, ECHO, relay, float, SDA, SCL) but the ESP32-CAM leaves only ~4 safe ones, and it has no USB. Use NodeMCU or ESP32.',
    },
  },
  skills: ['Ultrasonic sensing', 'Relay control', 'Safety interlocks', 'Blynk'],
  scene: 'water',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp8266', 'esp32', 'hcsr04', 'blynk-docs'],
  rig: { sensor: 'sonic', extras: ['tank', 'lcd'] },
  options: [
    {
      id: 'a',
      title: 'A. Automatic controller',
      level: 'Basic · easiest',
      blurb: 'Ultrasonic level + relay pump control with low/high cut-offs and dry-run timeout.',
      points: ['HC-SR04 level sensing', 'Auto ON/OFF with hysteresis', 'LCD percentage readout'],
      weeks: '1–2 weeks',
      cost: '৳1,500–2,200',
    },
    {
      id: 'b',
      title: 'B. IoT + phone alerts',
      level: 'Medium · best value',
      blurb: 'Adds a Blynk tank gauge, manual fill button and low-water / dry-run push alerts.',
      points: ['Phone gauge + button', 'Low-water + dry-run alerts', 'Pump-runtime log'],
      weeks: '2 weeks',
      cost: '৳1,800–2,800',
    },
  ],
  parts: [
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳600–1,000', boards: ['uno'] },
    { name: 'ESP8266 NodeMCU', qty: '1', role: 'Controller + Wi-Fi', price: '৳300–500', boards: ['nodemcu'] },
    { name: 'ESP32 DevKit (WROOM-32)', qty: '1', role: 'Controller + Wi-Fi', price: '৳450–700', boards: ['esp32'] },
    { name: 'ESP-01 + 5V adapter', qty: '1', role: 'Wi-Fi link for Blynk', price: '৳250–400', boards: ['uno'], versions: ['b'] },
    { name: 'HC-SR04 ultrasonic', qty: '1', role: 'Tank level', price: '৳150–300' },
    { name: 'Resistors (1k, 2k, 10k)', qty: '1 set', role: 'ECHO divider + float pull-up', price: '৳10–30', boards: ['esp32', 'nodemcu'] },
    { name: 'Relay module (5V)', qty: '1', role: 'Pump switching', price: '৳80–180' },
    { name: 'Mini pump / demo motor', qty: '1', role: 'Demo pumping', price: '৳200–450' },
    { name: '16×2 I²C LCD', qty: '1', role: 'Level display', price: '৳180–350' },
    { name: 'I²C level shifter (4-ch)', qty: '1', role: '5V LCD ↔ 3V3 pins', price: '৳60–120', boards: ['esp32', 'nodemcu'] },
    { name: 'Float switch (optional)', qty: '1', role: 'Backup high-level cut', price: '৳120–250' },
    { name: 'Bucket + tube + supply', qty: '1 set', role: 'Demo tank rig', price: '৳400–800' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'HC-SR04 → VCC/GND', to: '5V / GND' },
        { from: 'HC-SR04 → TRIG', to: 'D9' },
        { from: 'HC-SR04 → ECHO', to: 'D10' },
        { from: 'Relay → VCC/GND', to: '5V / GND' },
        { from: 'Relay → IN', to: 'D7' },
        { from: 'LCD → VCC/GND', to: '5V / GND' },
        { from: 'LCD → SDA/SCL', to: 'A4 / A5' },
        { from: 'Float → signal (other leg GND)', to: 'D3 (INPUT_PULLUP)' },
        { from: 'ESP-01 adapter → VCC/GND (B)', to: '5V / GND' },
        { from: 'ESP-01 → TX (B)', to: 'D4 (SoftwareSerial RX)' },
        { from: 'ESP-01 → RX (B)', to: 'D5 via 1k/2k divider' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'HC-SR04 → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'HC-SR04 → TRIG', to: 'D7' },
        { from: 'HC-SR04 → ECHO', to: 'D6 via 1k/2k divider' },
        { from: 'Relay → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'Relay → IN', to: 'D5' },
        { from: 'LCD → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'LCD → SDA/SCL', to: 'D2 / D1 via level shifter' },
        { from: 'Level shifter → LV / HV', to: '3V3 / VIN (5V)' },
        { from: 'Float → signal (other leg GND)', to: 'D0 (+ 10k pull-up to 3V3)' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'HC-SR04 → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'HC-SR04 → TRIG', to: 'GPIO27' },
        { from: 'HC-SR04 → ECHO', to: 'GPIO32 via 1k/2k divider' },
        { from: 'Relay → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'Relay → IN', to: 'GPIO26' },
        { from: 'LCD → VCC/GND', to: 'VIN (5V) / GND' },
        { from: 'LCD → SDA/SCL', to: 'GPIO21 / GPIO22 via level shifter' },
        { from: 'Level shifter → LV / HV', to: '3V3 / VIN (5V)' },
        { from: 'Float → signal (other leg GND)', to: 'GPIO33 (INPUT_PULLUP)' },
      ],
    },
    {
      id: 'pump',
      label: 'Pump circuit',
      board: 'Relay + pump supply',
      pins: [
        { from: 'Pump supply + (via fuse)', to: 'Relay COM' },
        { from: 'Relay NO', to: 'Pump +' },
        { from: 'Pump −', to: 'Pump supply −' },
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
      id: 'range-test-sensor',
      title: 'Range-test the sensor',
      detail: 'HC-SR04 VCC → 5V, TRIG → D9, ECHO → D10. Point it at the water from your tank height — ripples and tank walls cause spikes, so confirm stable cm readings first.',
      boardDetail: {
        nodemcu: 'HC-SR04 VCC → VIN (5V), TRIG → D7, ECHO → D6 through the 1k/2k divider (5V echo → 3.3V). Point it at the water and confirm stable cm readings first.',
        esp32: 'HC-SR04 VCC → VIN (5V), TRIG → GPIO27, ECHO → GPIO32 through the 1k/2k divider (5V echo → 3.3V). Point it at the water and confirm stable cm readings first.',
      },
    },
    {
      id: 'map-cm-percent',
      title: 'Map cm to percent',
      detail: 'Measure empty-tank and full-tank distances, set EMPTY_CM / FULL_CM, and map to 0–100%. The sketch takes a 5-sample median to ignore ripples.',
    },
    {
      id: 'wire-relay-pump',
      title: 'Wire relay + pump',
      detail: 'Relay IN → D7, relay VCC → 5V. Run the pump from a separate supply through the relay COM/NO contacts, with a fuse if you demo with a real pump.',
      boardDetail: {
        nodemcu: 'Relay IN → D5, relay VCC → VIN (5V). Run the pump from a separate supply through COM/NO, with a fuse for a real pump. If 3V3 logic can’t release the relay, use a 3V3-trigger module.',
        esp32: 'Relay IN → GPIO26, relay VCC → VIN (5V). Run the pump from a separate supply through COM/NO, with a fuse for a real pump. If 3V3 logic can’t release the relay, use a 3V3-trigger module.',
      },
    },
    {
      id: 'add-lcd-float',
      title: 'Add the LCD and float switch',
      detail: 'LCD SDA/SCL → A4/A5 on 5V (address 0x27 or 0x3F — run an I²C scanner). Float switch between D3 and GND; INPUT_PULLUP reads LOW when the tank is full.',
      boardDetail: {
        nodemcu: 'LCD on VIN (5V) with SDA/SCL through the level shifter to D2/D1. Float switch between D0 and GND with a 10k pull-up to 3V3 (D0 has no internal pull-up); LOW = full.',
        esp32: 'LCD on VIN (5V) with SDA/SCL through the level shifter to GPIO21/GPIO22. Float switch between GPIO33 and GND (INPUT_PULLUP); LOW = full.',
      },
    },
    {
      id: 'program-interlocks',
      title: 'Program the interlocks',
      detail: 'Pump ON below 20%, OFF above 95% or when the float trips. If the level doesn’t rise within 60s of pumping, the dry-run cut latches until you press reset.',
    },
    {
      id: 'add-esp01-link',
      title: 'Add the ESP-01 Wi-Fi link',
      detail: 'ESP-01 adapter on 5V, its TX → D4, its RX ← D5 through a 1k/2k divider. Once, send AT+UART_DEF=9600,8,1,0,0, then use Blynk’s ESP8266_Lib with BlynkSimpleShieldEsp8266 and SoftwareSerial at 9600.',
      versions: ['b'],
      boards: ['uno'],
    },
    {
      id: 'setup-blynk',
      title: 'Set up the Blynk app',
      detail: 'Create a template with datastreams V0 level (0–100), V1 manual fill switch, V2 pump minutes, and events low_water + dry_run. Paste the template ID, name and token into the sketch.',
      versions: ['b'],
    },
    {
      id: 'demo-fill-drain',
      title: 'Demo fill + drain',
      detail: 'Film a full cycle: low trigger, auto fill, high cut-off, plus the dry-run test with the inlet blocked.',
    },
  ],
  simulator: {
    viz: 'tank',
    intro: 'Same rule as the firmware: pump starts when the tank falls below the low mark and stops at the high mark.',
    sliders: [
      { id: 'level', label: 'Tank level', unit: '%', min: 0, max: 100, value: 42 },
      { id: 'flow', label: 'Inlet flow', unit: 'L/m', min: 0, max: 20, value: 8 },
    ],
    threshold: { id: 'thr', label: 'Low mark', unit: '%', min: 5, max: 25, value: 20 },
    watch: 'level',
    rule: 'below',
    band: 75,
    actuator: 'Pump',
    onText: 'FILL',
    offText: 'idle',
    lcd: ['Tank:{level}%', 'Pump:{act} F:{flow}'],
    demoSlider: 'level',
    demoFrom: 60,
    demoTo: 8,
    barLabel: 'Tank level',
  },
  code: [
    {
      id: 'a',
      label: 'A · Auto controller',
      note: 'Library: LiquidCrystal_I2C. 5-sample median + hysteresis + float backup + latched dry-run guard (press reset to clear).',
      board: 'uno',
      versions: ['a'],
      code: `#include <LiquidCrystal_I2C.h>
const int TRIG = 9, ECHO = 10, RELAY = 7, FLOAT_SW = 3;
const int LOWMK = 20, HIGHMK = 95;
const int EMPTY_CM = 40, FULL_CM = 6;   // measure your tank
LiquidCrystal_I2C lcd(0x27, 16, 2);
bool pumping = false, dryFault = false;
unsigned long pumpStart = 0;
int startLevel = 0;

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

int readLevel() {
  long s[5];
  for (int i = 0; i < 5; i++) { s[i] = readCm(); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && s[j] < s[j - 1]; j--) { long x = s[j]; s[j] = s[j - 1]; s[j - 1] = x; }
  // no echo (0 cm) clamps to FULL, so a dead sensor keeps the pump off
  long d = constrain(s[2], FULL_CM, EMPTY_CM);
  return map(d, EMPTY_CM, FULL_CM, 0, 100);
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(FLOAT_SW, INPUT_PULLUP);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);   // relay OFF (active low)
  lcd.init(); lcd.backlight();
}

void loop() {
  int lvl = readLevel();
  bool floatFull = digitalRead(FLOAT_SW) == LOW;
  if (!pumping && !dryFault && lvl < LOWMK) { pumping = true; pumpStart = millis(); startLevel = lvl; }
  if (pumping && millis() - pumpStart > 60000) {
    if (lvl <= startLevel + 1) { pumping = false; dryFault = true; }
    else { pumpStart = millis(); startLevel = lvl; }
  }
  if (lvl > HIGHMK || floatFull) pumping = false;
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  lcd.setCursor(0, 0);
  lcd.print("Tank:" + String(lvl) + "%   ");
  lcd.setCursor(0, 1);
  lcd.print(dryFault ? "DRY RUN - reset " : pumping ? "Pump: FILL      " : "Pump: idle      ");
  delay(500);
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · NodeMCU controller',
      note: 'Same logic as the Uno sketch: TRIG D7, ECHO D6 (1k/2k divider), relay D5, LCD D2/D1 via the level shifter, float on D0 with an external 10k pull-up (D0 has no INPUT_PULLUP).',
      board: 'nodemcu',
      versions: ['a'],
      code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#define TRIG D7
#define ECHO D6       // through the 1k/2k divider
#define RELAY D5
#define FLOAT_SW D0   // external 10k pull-up to 3V3
const int LOWMK = 20, HIGHMK = 95;
const int EMPTY_CM = 40, FULL_CM = 6;   // measure your tank
LiquidCrystal_I2C lcd(0x27, 16, 2);
bool pumping = false, dryFault = false;
unsigned long pumpStart = 0;
int startLevel = 0;

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

int readLevel() {
  long s[5];
  for (int i = 0; i < 5; i++) { s[i] = readCm(); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && s[j] < s[j - 1]; j--) { long x = s[j]; s[j] = s[j - 1]; s[j - 1] = x; }
  // no echo (0 cm) clamps to FULL, so a dead sensor keeps the pump off
  long d = constrain(s[2], FULL_CM, EMPTY_CM);
  return map(d, EMPTY_CM, FULL_CM, 0, 100);
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(FLOAT_SW, INPUT);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);   // relay OFF (active low)
  Wire.begin(D2, D1);                                  // SDA, SCL through the level shifter
  lcd.init(); lcd.backlight();
}

void loop() {
  int lvl = readLevel();
  bool floatFull = digitalRead(FLOAT_SW) == LOW;
  if (!pumping && !dryFault && lvl < LOWMK) { pumping = true; pumpStart = millis(); startLevel = lvl; }
  if (pumping && millis() - pumpStart > 60000) {
    if (lvl <= startLevel + 1) { pumping = false; dryFault = true; }
    else { pumpStart = millis(); startLevel = lvl; }
  }
  if (lvl > HIGHMK || floatFull) pumping = false;
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  lcd.setCursor(0, 0);
  lcd.print("Tank:" + String(lvl) + "%   ");
  lcd.setCursor(0, 1);
  lcd.print(dryFault ? "DRY RUN - reset " : pumping ? "Pump: FILL      " : "Pump: idle      ");
  delay(500);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 controller',
      note: 'Same logic as the Uno sketch: TRIG GPIO27, ECHO GPIO32 (1k/2k divider), relay GPIO26, LCD GPIO21/22 via the level shifter, float on GPIO33 (INPUT_PULLUP).',
      board: 'esp32',
      versions: ['a'],
      code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#define TRIG 27
#define ECHO 32       // through the 1k/2k divider
#define RELAY 26
#define FLOAT_SW 33
const int LOWMK = 20, HIGHMK = 95;
const int EMPTY_CM = 40, FULL_CM = 6;   // measure your tank
LiquidCrystal_I2C lcd(0x27, 16, 2);
bool pumping = false, dryFault = false;
unsigned long pumpStart = 0;
int startLevel = 0;

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

int readLevel() {
  long s[5];
  for (int i = 0; i < 5; i++) { s[i] = readCm(); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && s[j] < s[j - 1]; j--) { long x = s[j]; s[j] = s[j - 1]; s[j - 1] = x; }
  // no echo (0 cm) clamps to FULL, so a dead sensor keeps the pump off
  long d = constrain(s[2], FULL_CM, EMPTY_CM);
  return map(d, EMPTY_CM, FULL_CM, 0, 100);
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(FLOAT_SW, INPUT_PULLUP);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);   // relay OFF (active low)
  Wire.begin(21, 22);                                  // SDA, SCL through the level shifter
  lcd.init(); lcd.backlight();
}

void loop() {
  int lvl = readLevel();
  bool floatFull = digitalRead(FLOAT_SW) == LOW;
  if (!pumping && !dryFault && lvl < LOWMK) { pumping = true; pumpStart = millis(); startLevel = lvl; }
  if (pumping && millis() - pumpStart > 60000) {
    if (lvl <= startLevel + 1) { pumping = false; dryFault = true; }
    else { pumpStart = millis(); startLevel = lvl; }
  }
  if (lvl > HIGHMK || floatFull) pumping = false;
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  lcd.setCursor(0, 0);
  lcd.print("Tank:" + String(lvl) + "%   ");
  lcd.setCursor(0, 1);
  lcd.print(dryFault ? "DRY RUN - reset " : pumping ? "Pump: FILL      " : "Pump: idle      ");
  delay(500);
}`,
    },
    {
      id: 'b',
      label: 'B · Blynk IoT',
      note: 'Blynk IoT: gauge V0, manual fill V1, pump minutes V2, events "low_water" + "dry_run". Blynk.begin waits for Wi-Fi, so the tank isn’t controlled until it connects.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_TEMPLATE_NAME "Water Level"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <LiquidCrystal_I2C.h>
#define TRIG D7
#define ECHO D6       // through the 1k/2k divider
#define RELAY D5
#define FLOAT_SW D0   // external 10k pull-up to 3V3
const int LOWMK = 20, HIGHMK = 95, ALERTMK = 15;
const int EMPTY_CM = 40, FULL_CM = 6;
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
LiquidCrystal_I2C lcd(0x27, 16, 2);
BlynkTimer timer;
bool manual = false, pumping = false, dryFault = false, lowSent = false;
unsigned long pumpStart = 0, pumpSeconds = 0;
int startLevel = 0;

BLYNK_WRITE(V1) { manual = param.asInt(); }

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

int readLevel() {
  long s[5];
  for (int i = 0; i < 5; i++) { s[i] = readCm(); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && s[j] < s[j - 1]; j--) { long x = s[j]; s[j] = s[j - 1]; s[j - 1] = x; }
  long d = constrain(s[2], FULL_CM, EMPTY_CM);
  return map(d, EMPTY_CM, FULL_CM, 0, 100);
}

void control() {
  int lvl = readLevel();
  bool floatFull = digitalRead(FLOAT_SW) == LOW;
  if (!pumping && !dryFault && (manual || lvl < LOWMK)) { pumping = true; pumpStart = millis(); startLevel = lvl; }
  if (pumping && millis() - pumpStart > 60000) {
    if (lvl <= startLevel + 1) { pumping = false; dryFault = true; Blynk.logEvent("dry_run"); }
    else { pumpStart = millis(); startLevel = lvl; }
  }
  if (pumping && (lvl > HIGHMK || floatFull)) { pumping = false; manual = false; Blynk.virtualWrite(V1, 0); }
  if (pumping) pumpSeconds++;
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  if (lvl < ALERTMK && !lowSent) { Blynk.logEvent("low_water"); lowSent = true; }
  if (lvl > LOWMK) lowSent = false;
  Blynk.virtualWrite(V0, lvl);
  Blynk.virtualWrite(V2, pumpSeconds / 60.0);

  lcd.setCursor(0, 0);
  lcd.print("Tank:" + String(lvl) + "%   ");
  lcd.setCursor(0, 1);
  lcd.print(dryFault ? "DRY RUN - reset " : pumping ? "Pump: FILL      " : "Pump: idle      ");
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(FLOAT_SW, INPUT);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);   // relay OFF (active low)
  lcd.init(); lcd.backlight();
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
  timer.setInterval(1000L, control);
}

void loop() {
  Blynk.run();
  timer.run();
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 Blynk IoT',
      note: 'Same Blynk setup as the NodeMCU sketch (V0 gauge, V1 manual fill, V2 pump minutes, "low_water" + "dry_run"). TRIG GPIO27, ECHO GPIO32 (divider), relay GPIO26, LCD GPIO21/22, float GPIO33 (INPUT_PULLUP).',
      board: 'esp32',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_TEMPLATE_NAME "Water Level"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#define TRIG 27
#define ECHO 32       // through the 1k/2k divider
#define RELAY 26
#define FLOAT_SW 33
const int LOWMK = 20, HIGHMK = 95, ALERTMK = 15;
const int EMPTY_CM = 40, FULL_CM = 6;
char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
LiquidCrystal_I2C lcd(0x27, 16, 2);
BlynkTimer timer;
bool manual = false, pumping = false, dryFault = false, lowSent = false;
unsigned long pumpStart = 0, pumpSeconds = 0;
int startLevel = 0;

BLYNK_WRITE(V1) { manual = param.asInt(); }

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

int readLevel() {
  long s[5];
  for (int i = 0; i < 5; i++) { s[i] = readCm(); delay(30); }
  for (int i = 1; i < 5; i++)
    for (int j = i; j > 0 && s[j] < s[j - 1]; j--) { long x = s[j]; s[j] = s[j - 1]; s[j - 1] = x; }
  long d = constrain(s[2], FULL_CM, EMPTY_CM);
  return map(d, EMPTY_CM, FULL_CM, 0, 100);
}

void control() {
  int lvl = readLevel();
  bool floatFull = digitalRead(FLOAT_SW) == LOW;
  if (!pumping && !dryFault && (manual || lvl < LOWMK)) { pumping = true; pumpStart = millis(); startLevel = lvl; }
  if (pumping && millis() - pumpStart > 60000) {
    if (lvl <= startLevel + 1) { pumping = false; dryFault = true; Blynk.logEvent("dry_run"); }
    else { pumpStart = millis(); startLevel = lvl; }
  }
  if (pumping && (lvl > HIGHMK || floatFull)) { pumping = false; manual = false; Blynk.virtualWrite(V1, 0); }
  if (pumping) pumpSeconds++;
  digitalWrite(RELAY, pumping ? LOW : HIGH);

  if (lvl < ALERTMK && !lowSent) { Blynk.logEvent("low_water"); lowSent = true; }
  if (lvl > LOWMK) lowSent = false;
  Blynk.virtualWrite(V0, lvl);
  Blynk.virtualWrite(V2, pumpSeconds / 60.0);

  lcd.setCursor(0, 0);
  lcd.print("Tank:" + String(lvl) + "%   ");
  lcd.setCursor(0, 1);
  lcd.print(dryFault ? "DRY RUN - reset " : pumping ? "Pump: FILL      " : "Pump: idle      ");
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(FLOAT_SW, INPUT_PULLUP);
  pinMode(RELAY, OUTPUT); digitalWrite(RELAY, HIGH);   // relay OFF (active low)
  Wire.begin(21, 22);                                  // SDA, SCL through the level shifter
  lcd.init(); lcd.backlight();
  Blynk.begin(BLYNK_AUTH_TOKEN, SSID, PASS);
  timer.setInterval(1000L, control);
}

void loop() {
  Blynk.run();
  timer.run();
}`,
    },
  ],
  tips: [
    { title: 'Divider on ECHO', detail: 'HC-SR04 ECHO is 5V — divide it to 3.3V (1k in series, 2k to GND) on ESP boards or you risk the pin.' },
    { title: 'Median filter', detail: 'Water ripples spike readings; a 5-sample median keeps the relay calm.' },
    { title: 'Float backup', detail: 'A cheap float switch cuts the pump even when the ultrasonic reading is wrong — flood insurance.' },
    { title: 'Log usage', detail: 'Pump runtime × flow rate = a water-usage stat examiners love.' },
  ],
}
