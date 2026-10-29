import type { Project } from '../types'

export const streetlight: Project = {
  slug: 'smart-streetlight',
  categoryId: 'iot',
  title: 'Smart Streetlight Automation',
  tagline: 'Dim-by-default lamps that brighten for traffic and faults.',
  difficulty: 'Basic',
  weeks: '1–2 weeks',
  cost: '৳1,600–2,900',
  boards: ['Arduino Uno', 'ESP32', 'NodeMCU'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Version A runs stand-alone. Version B’s dashboard needs an ESP-01 Wi-Fi link on one pole (wired below).' },
    esp32: { ok: true },
    nodemcu: {
      ok: true,
      note: 'Only one analog pin (A0): in version B the LDR becomes a digital LDR module so A0 is free for the ACS712.',
    },
    esp32cam: {
      ok: false,
      reason: 'Its free pins are all ADC2, so the LDR and ACS712 can’t be read with Wi-Fi on — and there’s no USB. Use an ESP32 DevKit.',
    },
  },
  skills: ['LDR sensing', 'PIR sensing', 'PWM dimming', 'Fault detection'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'esp8266', 'acs712', 'pir', 'lm2596', 'esp-01', 'blynk-docs'],
  rig: { sensor: 'pir', extras: ['lamp', 'solar'] },
  options: [
    {
      id: 'a',
      title: 'A. Dusk + motion lamp',
      level: 'Basic · easiest',
      blurb: 'LDR enables the lamp at dusk; PIR boosts it to full when motion passes, dims otherwise.',
      points: ['PWM dimming saves ~45–50% energy', 'Single-pole demo rig', 'LDR + PIR only'],
      weeks: '1 week',
      cost: '৳1,600–2,200',
    },
    {
      id: 'b',
      title: 'B. 3-pole IoT street',
      level: 'Medium · best demo',
      blurb: 'Three linked poles with lamp-current fault sensing, reporting to a Blynk dashboard.',
      points: ['Cascading light follows traffic', 'Dead-lamp auto alert', 'Energy dashboard'],
      weeks: '2 weeks',
      cost: '৳2,200–2,900',
    },
  ],
  parts: [
    { name: 'Arduino Uno R3', qty: '1–3', role: 'Pole controller', price: '৳550–900', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1–3', role: 'Pole controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'NodeMCU ESP8266', qty: '1–3', role: 'Pole controller + Wi-Fi', price: '৳330–500', boards: ['nodemcu'] },
    {
      name: 'ESP-01 + 3V3 adapter board',
      qty: '1',
      role: 'Dashboard Wi-Fi link (one pole)',
      price: '৳250–400',
      boards: ['uno'],
      versions: ['b'],
    },
    { name: 'LDR + 10k', qty: '1–3', role: 'Dusk detection', price: '৳30–90' },
    { name: 'LDR module (digital DO)', qty: '1–3', role: 'Dusk detection (frees A0)', price: '৳60–150', boards: ['nodemcu'], versions: ['b'] },
    { name: 'PIR sensor (HC-SR501)', qty: '1–3', role: 'Traffic detect', price: '৳120–450' },
    { name: '12V LED strip + logic-level MOSFET (IRLZ44N)', qty: '1–3', role: 'Dimmable lamp', price: '৳250–700' },
    { name: 'ACS712-5A current sensor', qty: '1–3', role: 'Lamp fault detect', price: '৳250–400', versions: ['b'] },
    {
      name: '10k / 20k resistors',
      qty: '1–3 sets',
      role: 'ACS712 5V → 3.3V divider',
      price: '৳10–30',
      boards: ['esp32', 'nodemcu'],
      versions: ['b'],
    },
    { name: 'LM2596 buck (12V → 5V)', qty: '1–3', role: 'Controller power from 12V', price: '৳120–200', boards: ['esp32', 'nodemcu'] },
    { name: 'Pole model (PVC/wood)', qty: '1–3', role: 'Demo street', price: '৳300–600' },
    { name: '12V supply', qty: '1', role: 'Lamp power', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino pole',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'LDR divider (10k to 5V, LDR to GND) →', to: 'A0 (dark = high)' },
        { from: 'PIR → OUT / VCC', to: 'D2 / 5V' },
        { from: 'MOSFET gate →', to: 'D9 (PWM) via 220Ω, 10k gate→GND' },
        { from: 'LED strip + / − →', to: '12V / MOSFET drain (source → GND)' },
        { from: '12V supply →', to: 'Uno barrel jack (shared GND)' },
        { from: 'Next-pole trigger →', to: 'D4 → neighbor D3, 10k pull-down (version B)' },
        { from: 'ACS712 → OUT / VCC', to: 'A1 / 5V (version B)' },
        { from: 'ACS712 IP+ / IP− →', to: 'in series with the strip’s 12V lead (version B)' },
        { from: 'ESP-01 adapter → TX', to: 'D10 (SoftwareSerial RX, version B)' },
        { from: 'Uno D11 (TX) →', to: 'adapter RX via 1k/2k divider (version B)' },
        { from: 'ESP-01 adapter → VCC / GND', to: '5V / GND (adapter has its own 3V3 regulator)' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 pole',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'LDR divider (10k to 3V3, LDR to GND) →', to: 'GPIO34 (ADC1, dark = high)' },
        { from: 'PIR → OUT / VCC', to: 'GPIO27 / VIN 5V (OUT is 3.3V — safe)' },
        { from: 'MOSFET gate →', to: 'GPIO25 (LEDC PWM) via 220Ω, 10k gate→GND' },
        { from: 'LED strip + / − →', to: '12V / MOSFET drain (source → GND)' },
        { from: '12V → LM2596 buck →', to: 'VIN 5V (shared GND)' },
        { from: 'Next-pole trigger →', to: 'GPIO26 → neighbor GPIO33, 10k pull-down (version B)' },
        { from: 'ACS712 → OUT', to: '10k/20k divider → GPIO35 (ADC1, version B)' },
        { from: 'ACS712 → VCC', to: 'VIN 5V (version B)' },
        { from: 'ACS712 IP+ / IP− →', to: 'in series with the strip’s 12V lead (version B)' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU pole',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'LDR divider (10k to 3V3, LDR to GND) →', to: 'A0 (version A, dark = high)' },
        { from: 'LDR module → DO / VCC', to: 'D5 (GPIO14) / 3V3 (version B, HIGH = dark)' },
        { from: 'PIR → OUT / VCC', to: 'D2 (GPIO4) / VIN 5V' },
        { from: 'MOSFET gate →', to: 'D1 (GPIO5, PWM) via 220Ω, 10k gate→GND' },
        { from: 'LED strip + / − →', to: '12V / MOSFET drain (source → GND)' },
        { from: '12V → LM2596 buck →', to: 'VIN 5V (shared GND)' },
        { from: 'Next-pole trigger →', to: 'D6 (GPIO12) → neighbor D7 (GPIO13), 10k pull-down (version B)' },
        { from: 'ACS712 → OUT', to: '10k/20k divider → A0 (version B)' },
        { from: 'ACS712 → VCC', to: 'VIN 5V (version B)' },
        { from: 'ACS712 IP+ / IP− →', to: 'in series with the strip’s 12V lead (version B)' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-esp32-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → “esp32 by Espressif” (3.x), then pick “ESP32 Dev Module” and the right COM port.',
      boards: ['esp32'],
    },
    {
      id: 'install-esp8266-core',
      title: 'Install the ESP8266 board package',
      detail: 'Add the ESP8266 board URL in Preferences, install “esp8266” in Boards Manager, then pick “NodeMCU 1.0 (ESP-12E)”.',
      boards: ['nodemcu'],
    },
    {
      id: 'prove-dusk-switching',
      title: 'Prove dusk switching',
      detail: 'Cover/uncover the LDR and watch the lamp cross the threshold. Add hysteresis so clouds don’t flicker it.',
      boardDetail: {
        nodemcu:
          'Cover/uncover the LDR and watch the lamp cross the threshold (version B: set the dusk point with the LDR module’s pot). Add hysteresis so clouds don’t flicker it.',
      },
    },
    {
      id: 'add-motion-boost',
      title: 'Add motion boost',
      detail: 'PIR hold-time ~30s: full brightness on motion, 30% dim otherwise. Tune with the simulator below.',
    },
    {
      id: 'build-pole-model',
      title: 'Build the pole model',
      detail: 'PVC pole + arm + LED strip diffuser. Run wires inside the pole for a clean look.',
    },
    {
      id: 'cascade-poles',
      title: 'Cascade poles',
      detail: 'Pole 1 D4 drives pole 2 D3 (10k pull-down, shared GND) so light “walks” ahead of traffic. Test with a toy car.',
      versions: ['b'],
      boardDetail: {
        esp32: 'Pole 1 GPIO26 drives pole 2 GPIO33 (10k pull-down, shared GND) so light “walks” ahead of traffic. Test with a toy car.',
        nodemcu: 'Pole 1 D6 drives pole 2 D7 (10k pull-down, shared GND) so light “walks” ahead of traffic. Test with a toy car.',
      },
    },
    {
      id: 'detect-lamp-faults',
      title: 'Fault detection',
      detail: 'ACS712 in series with the strip, OUT on A1: lamp commanded ON but under ~0.1A = dead lamp → dashboard alert.',
      versions: ['b'],
      boardDetail: {
        esp32: 'ACS712 in series with the strip, OUT through a 10k/20k divider to GPIO35: lamp ON but under ~0.1A = dead lamp → dashboard alert.',
        nodemcu: 'ACS712 in series with the strip, OUT through a 10k/20k divider to A0: lamp ON but under ~0.1A = dead lamp → dashboard alert.',
      },
    },
    {
      id: 'connect-dashboard',
      title: 'Connect the Blynk dashboard',
      detail: 'Set the ESP-01 to 9600 baud (AT+UART_DEF=9600,8,1,0,0), wire it to D10/D11, then add V0 (amps), V1 (lamp level) and a lamp_fault event in Blynk.',
      versions: ['b'],
      boardDetail: {
        esp32: 'Create a Blynk template with V0 (amps), V1 (lamp level) and a lamp_fault event, then paste the template ID and token into the sketch.',
        nodemcu: 'Create a Blynk template with V0 (amps), V1 (lamp level) and a lamp_fault event, then paste the template ID and token into the sketch.',
      },
    },
    {
      id: 'measure-savings',
      title: 'Measure savings',
      detail: 'Compare always-on vs dimmed energy over a night cycle. Present kWh + cost saved.',
    },
  ],
  simulator: {
    viz: 'lamp',
    intro: 'Same rule as the firmware: darkness arms the lamp, motion boosts it from dim to full.',
    sliders: [
      { id: 'ambient', label: 'Ambient light', unit: 'lx', min: 0, max: 1000, value: 90 },
      { id: 'motion', label: 'Motion', unit: '%', min: 0, max: 100, value: 80 },
    ],
    threshold: { id: 'thr', label: 'Dusk below', unit: 'lx', min: 10, max: 300, value: 50 },
    watch: 'ambient',
    rule: 'below',
    actuator: 'Lamp',
    onText: 'FULL',
    offText: 'dim/off',
    lcd: ['Amb:{ambient}lx M:{motion}', 'Lamp:{act}'],
    demoSlider: 'ambient',
    demoFrom: 600,
    demoTo: 10,
    barLabel: 'Darkness',
  },
  code: [
    {
      id: 'a',
      label: 'A · Dusk + motion',
      note: 'PWM dim default 30%, full on motion. LDR to GND, so a high reading = dark (tune!).',
      board: 'uno',
      versions: ['a'],
      code: `const int LDR = A0, PIR = 2, LAMP = 9;
const int DUSK_ON = 700, DUSK_OFF = 600, DIM = 80, FULL = 255;
unsigned long lastMotion = 0;
bool night = false;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LAMP, OUTPUT);
}

void loop() {
  int ambient = analogRead(LDR);
  if (ambient > DUSK_ON) night = true;    // hysteresis: on at 700,
  if (ambient < DUSK_OFF) night = false;  // off at 600
  if (digitalRead(PIR)) lastMotion = millis();
  bool active = millis() - lastMotion < 30000;
  analogWrite(LAMP, !night ? 0 : (active ? FULL : DIM));
  delay(200);
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · Dusk + motion (ESP32)',
      note: 'Same logic on the 12-bit ADC (0–4095) with LEDC PWM. Tune the dusk values for your LDR.',
      board: 'esp32',
      versions: ['a'],
      code: `const int LDR = 34, PIR = 27, LAMP = 25;
const int DUSK_ON = 2800, DUSK_OFF = 2400, DIM = 80, FULL = 255;
unsigned long lastMotion = 0;
bool night = false;

void setup() {
  pinMode(PIR, INPUT);
  ledcAttach(LAMP, 5000, 8);  // 5 kHz, 8-bit
}

void loop() {
  int ambient = analogRead(LDR);
  if (ambient > DUSK_ON) night = true;
  if (ambient < DUSK_OFF) night = false;
  if (digitalRead(PIR)) lastMotion = millis();
  bool active = millis() - lastMotion < 30000;
  ledcWrite(LAMP, !night ? 0 : (active ? FULL : DIM));
  delay(200);
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · Dusk + motion (NodeMCU)',
      note: 'LDR divider on A0 (0–1023, onboard divider ≈ 3.2V full scale), PIR D2, MOSFET D1. PWM range set to 0–255 so DIM/FULL match the Uno. Tune the dusk values for your LDR.',
      board: 'nodemcu',
      versions: ['a'],
      code: `const int LDR = A0, PIR = D2, LAMP = D1;
const int DUSK_ON = 720, DUSK_OFF = 620, DIM = 80, FULL = 255;  // tune for your LDR
unsigned long lastMotion = 0;
bool night = false;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LAMP, OUTPUT);
  analogWriteRange(255);  // ESP8266 default is 0–1023; keep 80 = ~30% dim
}

void loop() {
  int ambient = analogRead(LDR);
  if (ambient > DUSK_ON) night = true;    // hysteresis: on at 720,
  if (ambient < DUSK_OFF) night = false;  // off at 620
  if (digitalRead(PIR)) lastMotion = millis();
  bool active = millis() - lastMotion < 30000;
  analogWrite(LAMP, !night ? 0 : (active ? FULL : DIM));
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · Cascade + fault (Uno + ESP-01)',
      note: 'Libraries: Blynk, plus ESP8266_Lib — not in Library Manager: copy libraries/BlynkESP8266_Lib from Blynk_Release_v1.3.2.zip (GitHub blynkkk/blynk-library) into Arduino/libraries. Flash on the pole with the ESP-01; other poles run the same logic without the Blynk lines.',
      board: 'uno',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "YOUR_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "Smart Streetlight"
#define BLYNK_AUTH_TOKEN "YOUR_AUTH_TOKEN"
#include <ESP8266_Lib.h>
#include <BlynkSimpleShieldEsp8266.h>
#include <SoftwareSerial.h>

SoftwareSerial espSerial(10, 11);  // RX, TX (ESP-01 set to 9600 baud)
ESP8266 wifi(&espSerial);
BlynkTimer timer;

const int LDR = A0, ACS = A1, PIR = 2, PREV_IN = 3, NEXT_OUT = 4, LAMP = 9;
const int DUSK_ON = 700, DUSK_OFF = 600, DIM = 80, FULL = 255;
const float SENS = 0.185;  // ACS712-5A: V per A
float zeroV = 2.5;
int lampLevel = 0;
bool night = false, faultSent = false;
unsigned long lastMotion = 0;

float avgVolts() {  // average many samples to smooth PWM + noise
  long sum = 0;
  for (int i = 0; i < 200; i++) sum += analogRead(ACS);
  return sum / 200.0 * (5.0 / 1023.0);
}

void report() {
  float amps = fabs(avgVolts() - zeroV) / SENS;
  bool fault = lampLevel > 50 && amps < 0.1;
  Blynk.virtualWrite(V0, amps);
  Blynk.virtualWrite(V1, lampLevel);
  if (fault && !faultSent) Blynk.logEvent("lamp_fault", "Lamp ON but no current");
  faultSent = fault;
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(PREV_IN, INPUT);  // external 10k pull-down
  pinMode(NEXT_OUT, OUTPUT);
  pinMode(LAMP, OUTPUT);
  zeroV = avgVolts();  // lamp is off at boot = 0 A
  espSerial.begin(9600);
  Blynk.begin(BLYNK_AUTH_TOKEN, wifi, "YOUR_WIFI", "YOUR_PASS");
  timer.setInterval(2000L, report);
}

void loop() {
  Blynk.run();
  timer.run();
  int ambient = analogRead(LDR);
  if (ambient > DUSK_ON) night = true;
  if (ambient < DUSK_OFF) night = false;
  bool here = digitalRead(PIR);
  digitalWrite(NEXT_OUT, here);  // wake the next pole
  if (here || digitalRead(PREV_IN)) lastMotion = millis();
  lampLevel = !night ? 0 : (millis() - lastMotion < 30000 ? FULL : DIM);
  analogWrite(LAMP, lampLevel);
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · Cascade + fault (ESP32)',
      note: 'Libraries: Blynk. One Blynk device per pole; ACS712 read through the 10k/20k divider on GPIO35.',
      board: 'esp32',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "YOUR_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "Smart Streetlight"
#define BLYNK_AUTH_TOKEN "YOUR_AUTH_TOKEN"
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>

const int LDR = 34, ACS = 35, PIR = 27, PREV_IN = 33, NEXT_OUT = 26, LAMP = 25;
const int DUSK_ON = 2800, DUSK_OFF = 2400, DIM = 80, FULL = 255;
const float SENS = 0.185 * 2.0 / 3.0;  // ACS712-5A V/A after the divider
float zeroV = 1.67;
int lampLevel = 0;
bool night = false, faultSent = false;
unsigned long lastMotion = 0;
BlynkTimer timer;

float avgVolts() {
  uint32_t sum = 0;
  for (int i = 0; i < 200; i++) sum += analogReadMilliVolts(ACS);
  return sum / 200000.0;
}

void report() {
  float amps = fabs(avgVolts() - zeroV) / SENS;
  bool fault = lampLevel > 50 && amps < 0.1;
  Blynk.virtualWrite(V0, amps);
  Blynk.virtualWrite(V1, lampLevel);
  if (fault && !faultSent) Blynk.logEvent("lamp_fault", "Lamp ON but no current");
  faultSent = fault;
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(PREV_IN, INPUT_PULLDOWN);
  pinMode(NEXT_OUT, OUTPUT);
  ledcAttach(LAMP, 5000, 8);
  ledcWrite(LAMP, 0);
  zeroV = avgVolts();  // lamp off = 0 A
  Blynk.begin(BLYNK_AUTH_TOKEN, "YOUR_WIFI", "YOUR_PASS");
  timer.setInterval(2000L, report);
}

void loop() {
  Blynk.run();
  timer.run();
  int ambient = analogRead(LDR);
  if (ambient > DUSK_ON) night = true;
  if (ambient < DUSK_OFF) night = false;
  bool here = digitalRead(PIR);
  digitalWrite(NEXT_OUT, here);  // wake the next pole
  if (here || digitalRead(PREV_IN)) lastMotion = millis();
  lampLevel = !night ? 0 : (millis() - lastMotion < 30000 ? FULL : DIM);
  ledcWrite(LAMP, lampLevel);
}`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · Cascade + fault (NodeMCU)',
      note: 'Libraries: Blynk. Digital LDR module on D5 (set dusk with its pot) so A0 is free for the ACS712 via 10k/20k; PIR D2, MOSFET D1, trigger D6 → neighbour D7. Dusk hysteresis becomes a 5s hold.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#define BLYNK_TEMPLATE_ID "YOUR_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "Smart Streetlight"
#define BLYNK_AUTH_TOKEN "YOUR_AUTH_TOKEN"
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>

const int LDR_DO = D5, ACS = A0, PIR = D2, PREV_IN = D7, NEXT_OUT = D6, LAMP = D1;
const int DIM = 80, FULL = 255;
const unsigned long DUSK_HOLD = 5000;  // ms the LDR module must agree before switching
const float A0_FULL = 3.2;             // NodeMCU A0 full scale (onboard divider) — tune
const float SENS = 0.185 * 2.0 / 3.0;  // ACS712-5A V/A after the divider
float zeroV = 1.67;
int lampLevel = 0;
bool night = false, faultSent = false;
unsigned long lastMotion = 0, duskSince = 0;
BlynkTimer timer;

float avgVolts() {
  uint32_t sum = 0;
  for (int i = 0; i < 200; i++) sum += analogRead(ACS);
  return sum / 200.0 * (A0_FULL / 1023.0);
}

void report() {
  float amps = fabs(avgVolts() - zeroV) / SENS;
  bool fault = lampLevel > 50 && amps < 0.1;
  Blynk.virtualWrite(V0, amps);
  Blynk.virtualWrite(V1, lampLevel);
  if (fault && !faultSent) Blynk.logEvent("lamp_fault", "Lamp ON but no current");
  faultSent = fault;
}

void setup() {
  pinMode(LDR_DO, INPUT);
  pinMode(PIR, INPUT);
  pinMode(PREV_IN, INPUT);  // external 10k pull-down
  pinMode(NEXT_OUT, OUTPUT);
  pinMode(LAMP, OUTPUT);
  analogWriteRange(255);  // ESP8266 default is 0–1023; keep 80 = ~30% dim
  analogWrite(LAMP, 0);
  zeroV = avgVolts();  // lamp off = 0 A
  Blynk.begin(BLYNK_AUTH_TOKEN, "YOUR_WIFI", "YOUR_PASS");
  timer.setInterval(2000L, report);
}

void loop() {
  Blynk.run();
  timer.run();
  bool dark = digitalRead(LDR_DO) == HIGH;  // module DO: HIGH = dark
  if (dark == night) duskSince = millis();  // hysteresis: flip only after a 5s hold
  else if (millis() - duskSince > DUSK_HOLD) night = dark;
  bool here = digitalRead(PIR);
  digitalWrite(NEXT_OUT, here);  // wake the next pole
  if (here || digitalRead(PREV_IN)) lastMotion = millis();
  lampLevel = !night ? 0 : (millis() - lastMotion < 30000 ? FULL : DIM);
  analogWrite(LAMP, lampLevel);
}`,
    },
  ],
  tips: [
    { title: 'Hysteresis', detail: 'Dusk ON at 700, OFF at 600 on the Uno’s 0–1023 scale (≈2800/2400 on ESP32) — stops flicker on cloudy evenings.' },
    { title: 'Diffuser', detail: 'Frosted acrylic over the strip looks 10× more like a real lamp.' },
    { title: 'Hold time', detail: '30–60s motion hold keeps the lamp calm for slow pedestrians.' },
    { title: 'Logic-level MOSFET', detail: 'Use an IRLZ44N, not an IRF540/IRFZ44N — those barely switch on from a 3.3V or 5V pin and get hot.' },
    { title: 'Count savings', detail: '12h night, 8 idle hours at 30%: 4 + 8×0.3 = 6.4 vs 12 lamp-hours ≈ 47% saved — show the math.' },
  ],
}
