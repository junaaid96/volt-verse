import type { Project } from '../types'

export const bleTrackerDetector: Project = {
  slug: 'ble-tracker-detector',
  categoryId: 'cybersecurity',
  title: 'BLE Tracker Detector',
  tagline: 'Sweep for unknown AirTags and BLE trackers that keep showing up near you.',
  difficulty: 'Medium',
  weeks: '2 weeks',
  cost: '৳900–1,500',
  boards: ['ESP32'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: false,
      reason: 'No Bluetooth radio: the Uno cannot hear BLE advertisements.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'The ESP8266 has Wi-Fi only — no Bluetooth Classic or BLE.',
    },
    esp32cam: {
      ok: false,
      reason: 'BLE works but there is no USB for field debugging and too few free pins for the OLED + buzzer.',
    },
  },
  skills: ['BLE advertising', 'RSSI ranging', 'Tracker signatures', 'Alert UX'],
  scene: 'secure',
  updated: 'Nov 2026',
  sheets: ['esp32', 'ssd1306', 'nimble', 'airguard'],
  rig: { sensor: 'hc05', extras: ['oled', 'buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Tracker scanner',
      level: 'Medium · core build',
      blurb: 'Continuous BLE scan classifies Apple, Tile, Samsung and Google beacons and ranks them by signal strength.',
      points: ['Vendor-signature matching', 'RSSI proximity bars', 'Top-suspects OLED list'],
      weeks: '1–2 weeks',
      cost: '৳900–1,200',
    },
    {
      id: 'b',
      title: 'B. Follower alarm',
      level: 'Medium+ · best value',
      blurb: 'Tracks beacons across scan windows: an unknown tag seen 3+ times with strong RSSI trips the buzzer.',
      points: ['Persistence tracking table', 'Anti-false-positive rules', 'Walk-around demo mode'],
      weeks: '2 weeks',
      cost: '৳900–1,500',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit V1', qty: '1', role: 'BLE scanner (never the S2 — no Bluetooth)', price: '৳470–850' },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '1', role: 'Suspect list + proximity bars', price: '৳250–450' },
    { name: 'Active buzzer + green LED', qty: '1 set', role: 'Follower alarm', price: '৳60–120' },
    { name: 'USB power bank (small)', qty: '1', role: 'Walk-around demo power', price: '৳400–700', versions: ['b'] },
    { name: 'USB cable + enclosure', qty: '1', role: 'Power + handheld unit', price: '৳150–350' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (3V3)' },
        { from: 'Buzzer →', to: 'GPIO15 via NPN + 1k' },
        { from: 'Green LED →', to: 'GPIO2 via 220Ω (blinks each scan round)' },
        { from: 'Clear button →', to: 'GPIO0 to GND (BOOT button clears the tracking table)' },
        { from: 'ESP32 VIN / GND', to: 'USB 5V / common GND (power bank for walk tests)' },
      ],
    },
    {
      id: 'walk',
      label: 'Walk-test protocol',
      board: 'Your own tag',
      pins: [
        { from: 'Test tag →', to: 'Borrow a consenting friend’s tag or your own — never plant tags on people' },
        { from: 'Route →', to: 'Two rooms + corridor: tag in a bag, detector in hand' },
        { from: 'Control →', to: 'Repeat without the tag to measure the false-positive rate' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-core',
      title: 'Install arduino-esp32 3.x',
      detail: 'Boards Manager → esp32 by Espressif 3.3.x. The sketches use the built-in BLEDevice API (BlueDroid on classic ESP32); NimBLE-Arduino is the drop-in low-memory upgrade.',
    },
    {
      id: 'wire-feedback',
      title: 'Wire the feedback',
      detail: 'OLED on GPIO21/22, buzzer on GPIO15 through an NPN transistor, scan LED on GPIO2. BOOT (GPIO0) clears the suspect table.',
    },
    {
      id: 'flash-scanner',
      title: 'Flash the scanner',
      detail: 'Flash sketch A and watch the OLED fill with nearby beacons. Phones, earbuds and TVs all advertise — the vendor labels are the first filter.',
    },
    {
      id: 'learn-signatures',
      title: 'Learn the signatures',
      detail: 'Apple 0x004C (FindMy types 0x12/0x19), Tile FEED/FEEC/FEDB, Samsung FD5A, Chipolo FEAB, Pebblebee FE61, Google 0xFEAA. Verify each against a known device before trusting it.',
    },
    {
      id: 'rssi-calibrate',
      title: 'Calibrate RSSI',
      detail: 'Hold a known tag at 1 m, 3 m, 10 m and note the RSSI at each step. Walls and bodies swing readings ±10 dBm — proximity bars are rough by physics, not by bug.',
    },
    {
      id: 'follower-alarm',
      title: 'Add the follower alarm',
      detail: 'Flash sketch B: unknown beacons seen across 3+ scan windows with strong average RSSI trip the buzzer. Single sightings stay silent.',
      versions: ['b'],
    },
    {
      id: 'walk-test',
      title: 'Walk-test + report',
      detail: 'Run the walk protocol with and without a consenting test tag. Report detection rate, false positives and the MAC-rotation caveat (tags rotate addresses, so MAC-only tracking under-detects).',
      versions: ['b'],
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: an unknown beacon seen across enough scan windows trips the follower alert.',
    sliders: [
      { id: 'sightings', label: 'Repeat sightings', unit: 'x', min: 0, max: 10, value: 1 },
      { id: 'rssi', label: 'Signal', unit: 'dBm', min: -95, max: -35, value: -72 },
    ],
    threshold: { id: 'thr', label: 'Alert after', unit: 'x', min: 2, max: 6, value: 3 },
    watch: 'sightings',
    rule: 'above',
    inclusive: true,
    actuator: 'Alert',
    onText: 'TRACKER',
    offText: 'clear',
    lcd: ['Seen:{sightings}x {rssi}dBm', 'Alert:{act}'],
    demoSlider: 'sightings',
    demoFrom: 0,
    demoTo: 6,
    barLabel: 'Repeat sightings',
  },
  code: [
    {
      id: 'a',
      label: 'A · Tracker scanner',
      note: 'No extra BLE library needed: uses the built-in BLEDevice API. Libraries: Adafruit SSD1306 + GFX. Passive scan only — never connects.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <BLEDevice.h>
#include <BLEScan.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define OLED_ADDR 0x3C
#define LED 2
#define MAXH 12

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
BLEScan *scan;
struct Hit { String addr; String label; int rssi; };
Hit hits[MAXH];
int nHits = 0;
uint32_t rounds = 0;

bool svc(BLEAdvertisedDevice d, uint16_t uuid) {
  return d.isAdvertisingService(BLEUUID(uuid));
}

String labelFor(BLEAdvertisedDevice d) {
  if (d.haveManufacturerData()) {
    String m = d.getManufacturerData();
    if (m.length() >= 2 && (uint8_t)m[0] == 0x4C && (uint8_t)m[1] == 0x00) {
      if (m.length() >= 4 && ((uint8_t)m[2] == 0x12 || (uint8_t)m[2] == 0x19))
        return "Apple FindMy?";
      return "Apple";
    }
  }
  if (svc(d, 0xFEAA)) return "Google/FMDN?";
  if (svc(d, 0xFEED) || svc(d, 0xFEEC) || svc(d, 0xFEDB)) return "Tile?";
  if (svc(d, 0xFD5A)) return "Samsung?";
  if (svc(d, 0xFEAB)) return "Chipolo?";
  if (svc(d, 0xFE61)) return "Pebblebee?";
  if (d.haveName()) return String(d.getName().c_str());
  return "unknown";
}

class Cb : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice dev) override {
    if (nHits >= MAXH) return;
    hits[nHits++] = { String(dev.getAddress().toString().c_str()), labelFor(dev), dev.getRSSI() };
  }
};

String bars(int rssi) {
  int n = constrain(map(rssi, -95, -45, 1, 4), 1, 4);
  String s = "";
  for (int i = 0; i < n; i++) s += "|";
  return s;
}

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  BLEDevice::init("");
  scan = BLEDevice::getScan();
  scan->setAdvertisedDeviceCallbacks(new Cb());
  scan->setInterval(100);
  scan->setWindow(99);
  scan->setActiveScan(true);
}

void loop() {
  rounds++;
  nHits = 0;
  digitalWrite(LED, HIGH);
  scan->start(5, false);  // 5 s passive window
  scan->clearResults();
  digitalWrite(LED, LOW);
  // strongest first (tiny bubble sort is fine for 12)
  for (int i = 0; i < nHits; i++)
    for (int j = i + 1; j < nHits; j++)
      if (hits[j].rssi > hits[i].rssi) { Hit t = hits[i]; hits[i] = hits[j]; hits[j] = t; }

  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.printf("scan %lu  beacons %d", (unsigned long)rounds, nHits);
  for (int i = 0; i < 4 && i < nHits; i++) {
    oled.setCursor(0, 14 + i * 12);
    oled.printf("%-12s %s", hits[i].label.substring(0, 12).c_str(), bars(hits[i].rssi).c_str());
  }
  oled.display();
  for (int i = 0; i < nHits; i++)
    Serial.printf("%s  %-12s %d dBm\\n", hits[i].addr.c_str(), hits[i].label.c_str(), hits[i].rssi);
}`,
    },
    {
      id: 'b',
      label: 'B · Follower alarm',
      note: 'Same libraries as A. Unknown beacons seen in 3+ windows with strong RSSI trip the buzzer; BOOT clears the table.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <BLEDevice.h>
#include <BLEScan.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define MAXT 16
#define PERSIST_WINDOWS 3  // seen in this many windows...
#define RSSI_NEAR -70      // ...this strong on average = follower

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
BLEScan *scan;
struct Track { String addr; String label; int windows; int rssiSum; uint32_t first; uint32_t last; bool counted; };
Track table[MAXT];
int nTrack = 0;
uint32_t rounds = 0;

bool svc(BLEAdvertisedDevice d, uint16_t uuid) {
  return d.isAdvertisingService(BLEUUID(uuid));
}

String labelFor(BLEAdvertisedDevice d) {
  if (d.haveManufacturerData()) {
    String m = d.getManufacturerData();
    if (m.length() >= 2 && (uint8_t)m[0] == 0x4C && (uint8_t)m[1] == 0x00) {
      if (m.length() >= 4 && ((uint8_t)m[2] == 0x12 || (uint8_t)m[2] == 0x19))
        return "Apple FindMy?";
      return "Apple";
    }
  }
  if (svc(d, 0xFEAA)) return "Google/FMDN?";
  if (svc(d, 0xFEED) || svc(d, 0xFEEC) || svc(d, 0xFEDB)) return "Tile?";
  if (svc(d, 0xFD5A)) return "Samsung?";
  if (svc(d, 0xFEAB)) return "Chipolo?";
  if (svc(d, 0xFE61)) return "Pebblebee?";
  return "unknown";
}

class Cb : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice dev) override {
    String addr = String(dev.getAddress().toString().c_str());
    for (int i = 0; i < nTrack; i++) {
      if (table[i].addr == addr) {
        if (!table[i].counted) { table[i].windows++; table[i].counted = true; }
        table[i].rssiSum += dev.getRSSI();
        table[i].last = millis();
        return;
      }
    }
    if (nTrack >= MAXT) return;
    table[nTrack++] = { addr, labelFor(dev), 1, dev.getRSSI(), millis(), millis(), true };
  }
};

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(0, INPUT_PULLUP);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  BLEDevice::init("");
  scan = BLEDevice::getScan();
  scan->setAdvertisedDeviceCallbacks(new Cb());
  scan->setInterval(100);
  scan->setWindow(99);
  scan->setActiveScan(true);
}

void loop() {
  if (digitalRead(0) == LOW) { nTrack = 0; Serial.println("table cleared"); }
  rounds++;
  for (int i = 0; i < nTrack; i++) table[i].counted = false;
  digitalWrite(LED, HIGH);
  scan->start(5, false);
  scan->clearResults();
  digitalWrite(LED, LOW);

  int suspect = -1;
  for (int i = 0; i < nTrack; i++) {
    int avg = table[i].rssiSum / max(1, table[i].windows);
    bool known = table[i].label != "unknown" && !table[i].label.endsWith("?");
    // tracker-like signatures alert sooner; plain unknowns need persistence AND closeness
    if ((table[i].windows >= PERSIST_WINDOWS && avg > RSSI_NEAR) ||
        (table[i].label.endsWith("?") && table[i].windows >= PERSIST_WINDOWS)) {
      if (!known) suspect = i;
    }
    Serial.printf("%s %-12s x%d avg %d\\n",
      table[i].addr.c_str(), table[i].label.c_str(), table[i].windows, avg);
  }
  bool alarm = suspect >= 0;
  digitalWrite(BUZZER, alarm ? HIGH : LOW);

  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(alarm ? "TRACKER?" : "clear");
  oled.setTextSize(1);
  oled.setCursor(0, 24);
  oled.printf("scan %lu  tracked %d", (unsigned long)rounds, nTrack);
  oled.setCursor(0, 38);
  if (alarm) oled.printf("%s x%d", table[suspect].label.c_str(), table[suspect].windows);
  else oled.print("no persistent beacon");
  oled.setCursor(0, 52);
  oled.print("BOOT = clear table");
  oled.display();
}`,
    },
  ],
  tips: [
    { title: 'Persistence beats RSSI', detail: 'A single strong sighting is usually a neighbor’s earbuds. Only repeated sightings across windows — ideally across locations — mean “following”.' },
    { title: 'MACs rotate', detail: 'AirTags rotate addresses roughly daily, Samsung tags faster. MAC-only tracking under-detects by design — say so in the report.' },
    { title: 'Never connect', detail: 'Scanning is passive; connecting to a stranger’s tag crosses into unauthorized access. The sketches have no connect call — keep it that way.' },
    { title: 'Consent your test tag', detail: 'Walk-tests need a tag whose owner knows it is being tracked. Get that in writing before the demo.' },
    { title: 'Upgrade path', detail: 'If RAM runs out, swap the built-in stack for NimBLE-Arduino (h2zero): same scan API shape, far less memory.' },
  ],
}
