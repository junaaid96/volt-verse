import type { Project } from '../types'

export const wifiAttackDetector: Project = {
  slug: 'wifi-attack-detector',
  categoryId: 'cybersecurity',
  title: 'Wi-Fi Attack Detector',
  tagline: 'Catch deauth floods and evil-twin APs with a passive ESP32 sniffer.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳900–1,600',
  boards: ['ESP32'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: false,
      reason: 'No Wi-Fi radio: the Uno cannot hear 802.11 frames at all.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'The guide targets the ESP32 promiscuous API; the ESP8266 port is untested and Espressif marks the chip NRND (not for new designs).',
    },
    esp32cam: {
      ok: false,
      reason: 'No USB for flashing and too few free pins for the OLED + buzzer once the camera is attached.',
    },
  },
  skills: ['802.11 frames', 'Promiscuous mode', 'IDS thresholds', 'OLED UI'],
  scene: 'secure',
  updated: 'Nov 2026',
  sheets: ['esp32', 'ssd1306', 'esp-wifi-modes', 'deauth-canary', 'wireshark-docs'],
  rig: { sensor: 'oled', extras: ['buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Deauth canary',
      level: 'Medium · core build',
      blurb: 'Passive sniffer counts deauth/disassoc frames per 5 s window; a burst over threshold trips the OLED + buzzer alarm.',
      points: ['Receive-only: joins no network', 'Channel hop across 1/6/11', 'Self-test button for demos'],
      weeks: '2 weeks',
      cost: '৳900–1,200',
    },
    {
      id: 'b',
      title: 'B. Rogue-AP hunter',
      level: 'Medium+ · best value',
      blurb: 'Adds periodic AP scans that flag evil twins: your SSID from a new BSSID, wrong channel or impossible RSSI jump.',
      points: ['Known-AP fingerprinting', 'Evil-twin + anomaly alerts', 'Serial incident log'],
      weeks: '2–3 weeks',
      cost: '৳900–1,600',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit V1', qty: '1', role: 'Sniffer + display driver', price: '৳470–850' },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '1', role: 'Live frame counts + alerts', price: '৳250–450' },
    { name: 'Active buzzer + red LED', qty: '1 set', role: 'Audible alarm', price: '৳60–120' },
    { name: 'Push button (self-test)', qty: '1', role: 'Inject a fake burst for demos', price: '৳15–30', versions: ['a', 'b'] },
    { name: 'USB cable + small enclosure', qty: '1', role: 'Power + desk unit', price: '৳150–350' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (3V3)' },
        { from: 'Buzzer →', to: 'GPIO15 via NPN + 1k (strapping pin; LOW at boot only mutes the boot log)' },
        { from: 'Red LED →', to: 'GPIO2 via 220Ω (onboard LED pin — doubles as alarm light)' },
        { from: 'Self-test button →', to: 'GPIO0 to GND (BOOT button doubles as the input — no extra wiring)' },
        { from: 'ESP32 VIN / GND', to: 'USB 5V / common GND' },
      ],
    },
    {
      id: 'lab',
      label: 'Lab network setup',
      board: 'Your own AP',
      pins: [
        { from: 'Test AP →', to: 'A phone hotspot or lab router YOU own — never sniff networks without written consent' },
        { from: 'Lock the AP →', to: 'Fixed channel 1, 6 or 11 so baseline counts are stable' },
        { from: 'Baseline →', to: 'Note idle deauth counts for 5 min before setting the alarm threshold' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-core',
      title: 'Install arduino-esp32 3.x',
      detail: 'Boards Manager → esp32 by Espressif 3.3.x. The sniffer uses esp_wifi promiscuous APIs that are stable across IDF 5.x/6.x, but pin one core version for the whole class.',
    },
    {
      id: 'wire-feedback',
      title: 'Wire the feedback',
      detail: 'OLED on GPIO21/22, buzzer on GPIO15 through an NPN transistor, alarm LED on GPIO2. The BOOT button (GPIO0) is the self-test input.',
    },
    {
      id: 'flash-canary',
      title: 'Flash the canary',
      detail: 'Flash sketch A. It runs in WIFI_MODE_NULL: the ESP32 joins no network and only counts management frames — deauth (0xC0) and disassoc (0xA0).',
    },
    {
      id: 'baseline-tune',
      title: 'Baseline + tune',
      detail: 'Watch idle counts for 5 minutes on your own AP, then set ALARM_FRAMES above the noise floor (start at 25 per 5 s). Reboot the AP once: the reconnect burst shows what real management traffic looks like.',
    },
    {
      id: 'selftest-demo',
      title: 'Self-test the alarm path',
      detail: 'Hold BOOT to inject a synthetic burst and verify the OLED flips to ATTACK with the buzzer. This is also the classroom demo — no attack hardware needed, ever.',
    },
    {
      id: 'rogue-scan',
      title: 'Add rogue-AP hunting',
      detail: 'Flash sketch B and record your AP fingerprint (SSID + BSSID + channel). It scans every 30 s and flags same-SSID/different-BSSID twins, channel moves and impossible RSSI jumps.',
      versions: ['b'],
    },
    {
      id: 'incident-log',
      title: 'Keep an incident log',
      detail: 'Timestamp every alert over Serial, note what caused it (microwave? AP reboot? demo button?), and write the false-positive analysis into the report.',
      versions: ['b'],
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: deauth/disassoc frames past the threshold inside one 5 s window trip the alarm.',
    sliders: [
      { id: 'deauth', label: 'Deauth frames', unit: '/5s', min: 0, max: 60, value: 8 },
      { id: 'rogue', label: 'Suspicious APs', unit: '', min: 0, max: 4, value: 0 },
    ],
    threshold: { id: 'thr', label: 'Alarm above', unit: '/5s', min: 5, max: 50, value: 25 },
    watch: 'deauth',
    rule: 'above',
    actuator: 'Alarm',
    onText: 'ATTACK',
    offText: 'clear',
    lcd: ['Deauth:{deauth}/5s', 'Alarm:{act}'],
    demoSlider: 'deauth',
    demoFrom: 0,
    demoTo: 45,
    barLabel: 'Deauth frames / 5 s',
  },
  code: [
    {
      id: 'a',
      label: 'A · Deauth canary',
      note: 'Libraries: Adafruit SSD1306 + GFX. Detection only — this sketch never transmits. Tune ALARM_FRAMES after baselining your own AP.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <WiFi.h>
#include <esp_wifi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define ALARM_FRAMES 25   // deauth/disassoc per 5 s window
#define WINDOW_MS 5000

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
volatile uint32_t mgmtCount = 0;
volatile int lastRssi = 0;
uint8_t channel = 1;
uint32_t windowStart = 0, windowCount = 0;
bool attack = false;

// Runs in the Wi-Fi driver task: count and leave, no prints or delays.
void IRAM_ATTR sniffer(void *buf, wifi_promiscuous_pkt_type_t type) {
  if (type != WIFI_PKT_MGMT) return;
  const wifi_promiscuous_pkt_t *pkt = (const wifi_promiscuous_pkt_t *)buf;
  uint8_t fc = pkt->payload[0];
  if (fc == 0xC0 || fc == 0xA0) {  // deauth / disassoc
    mgmtCount++;
    lastRssi = pkt->rx_ctrl.rssi;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(0, INPUT_PULLUP);  // BOOT button = self-test
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);

  WiFi.mode(WIFI_MODE_NULL);  // receive-only: joins no network
  esp_wifi_set_promiscuous(true);
  wifi_promiscuous_filter_t f = { .filter_mask = WIFI_PROMIS_FILTER_MASK_MGMT };
  esp_wifi_set_promiscuous_filter(&f);
  esp_wifi_set_promiscuous_rx_cb(sniffer);
  windowStart = millis();
}

void loop() {
  static uint32_t lastHop = 0;
  if (millis() - lastHop > 1200) {  // hop 1 -> 6 -> 11
    lastHop = millis();
    channel = channel == 1 ? 6 : (channel == 6 ? 11 : 1);
    esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
  }
  if (digitalRead(0) == LOW) mgmtCount += 5;  // self-test burst

  if (millis() - windowStart >= WINDOW_MS) {
    noInterrupts();
    windowCount = mgmtCount;
    mgmtCount = 0;
    interrupts();
    attack = windowCount >= ALARM_FRAMES;
    windowStart = millis();
    digitalWrite(BUZZER, attack ? HIGH : LOW);
    digitalWrite(LED, attack ? HIGH : LOW);
    Serial.printf("ch %d  mgmt %lu  rssi %d  %s\\n",
      channel, (unsigned long)windowCount, lastRssi, attack ? "ATTACK" : "clear");
  }

  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(attack ? "ATTACK!" : "listening");
  oled.setTextSize(1);
  oled.setCursor(0, 24);
  oled.printf("ch %d  mgmt %lu/5s", channel, (unsigned long)windowCount);
  oled.setCursor(0, 36);
  oled.printf("last rssi %d dBm", lastRssi);
  oled.setCursor(0, 52);
  oled.print("BOOT btn = self-test");
  oled.display();
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · Rogue-AP hunter',
      note: 'Run once with Serial open to learn your AP fingerprint, fill in KNOWN_*, then reflash. Scans every 30 s.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define KNOWN_SSID "YOUR_LAB_AP"       // your own AP only
#define KNOWN_BSSID "AA:BB:CC:DD:EE:FF"  // from the first scan
#define KNOWN_CH 6
#define RSSI_JUMP 25   // dBm swing vs last sighting = suspect move/clone

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
int lastRssi = -100;
uint32_t scans = 0, twins = 0;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
}

void loop() {
  scans++;
  int n = WiFi.scanNetworks(false, true);
  bool evil = false;
  String why = "";
  for (int i = 0; i < n; i++) {
    String ssid = WiFi.SSID(i);
    int rssi = WiFi.RSSI(i);
    Serial.printf("%-24s %s ch %2d %d dBm\\n",
      ssid.c_str(), WiFi.BSSIDstr(i).c_str(), WiFi.channel(i), rssi);
    if (ssid != KNOWN_SSID) continue;
    if (WiFi.BSSIDstr(i) != KNOWN_BSSID) { evil = true; why = "new BSSID!"; }
    else if (WiFi.channel(i) != KNOWN_CH) { evil = true; why = "ch moved!"; }
    else if (abs(rssi - lastRssi) > RSSI_JUMP && lastRssi > -95) { evil = true; why = "rssi jump!"; }
    lastRssi = rssi;
  }
  if (evil) twins++;
  WiFi.scanDelete();
  digitalWrite(BUZZER, evil ? HIGH : LOW);
  digitalWrite(LED, evil ? HIGH : LOW);

  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(evil ? "TWIN!" : "clear");
  oled.setTextSize(1);
  oled.setCursor(0, 24);
  oled.printf("APs %d  scan %lu", n, (unsigned long)scans);
  oled.setCursor(0, 36);
  oled.print(evil ? why : "fingerprint ok");
  oled.setCursor(0, 52);
  oled.printf("twins %lu total", (unsigned long)twins);
  oled.display();
  delay(30000);
}`,
    },
  ],
  tips: [
    { title: 'Stay receive-only', detail: 'Never add packet-injection (esp_wifi_80211_tx) code: transmitting deauth frames is illegal in most countries, including against your own AP without authorization.' },
    { title: 'Baseline first', detail: 'An idle AP sends a few deauths per hour; a reboot or channel switch sends a burst. Thresholds set without a baseline are fiction.' },
    { title: 'Mind the callback', detail: 'The promiscuous callback runs in the Wi-Fi driver task — counting only. Serial prints or OLED writes there will crash the sniffer.' },
    { title: 'BSSID over SSID', detail: 'Any phone hotspot can copy an SSID; the BSSID + channel + RSSI fingerprint is what makes an evil twin detectable.' },
    { title: 'Consent in writing', detail: 'Get supervisor sign-off that passive monitoring of the lab network is in scope before you power the sniffer on.' },
  ],
}
