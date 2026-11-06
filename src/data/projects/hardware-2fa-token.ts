import type { Project } from '../types'

export const hardware2faToken: Project = {
  slug: 'hardware-2fa-token',
  categoryId: 'cybersecurity',
  title: 'Hardware 2FA Token',
  tagline: 'A pocket TOTP token: real RFC 6238 codes, no phone needed.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳900–1,700',
  boards: ['ESP32'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: false,
      reason: 'No Wi-Fi for NTP time sync and no crypto-friendly RAM budget: TOTP needs accurate wall-clock time.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'The guide targets ESP32 NVS secret storage + mbedTLS HMAC; the ESP8266 port is untested and Espressif marks the chip NRND (not for new designs).',
    },
    esp32cam: {
      ok: false,
      reason: 'Too few free pins for the OLED + buttons once the camera is attached, and no USB for secret enrollment.',
    },
  },
  skills: ['TOTP / RFC 6238', 'NTP time sync', 'Secret storage', 'NVS'],
  scene: 'secure',
  updated: 'Nov 2026',
  sheets: ['esp32', 'ssd1306', 'totp-rfc', 'totp-arduino', 'esp-preferences'],
  rig: { sensor: 'oled', extras: ['buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Single-secret token',
      level: 'Medium · core build',
      blurb: 'NTP-synced clock drives an RFC 6238 TOTP generator; the OLED shows the live 6-digit code with a countdown ring.',
      points: ['RFC 6238 from scratch', 'NTP clock sync', 'Live code + countdown'],
      weeks: '2 weeks',
      cost: '৳900–1,300',
    },
    {
      id: 'b',
      title: 'B. Multi-slot vault token',
      level: 'Medium+ · best value',
      blurb: 'Enroll up to 3 secrets over Serial, switch slots with a button, and prove the drift window with a skew test.',
      points: ['3 NVS secret slots', 'Slot switching', 'Clock-skew test'],
      weeks: '2–3 weeks',
      cost: '৳900–1,700',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit V1', qty: '1', role: 'TOTP generator + NVS secret store', price: '৳470–850' },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '1', role: 'Live 6-digit code + countdown', price: '৳250–450' },
    { name: 'Tactile button (slot key)', qty: '1', role: 'Switch secret slot', price: '৳15–30', versions: ['b'] },
    { name: 'Active buzzer', qty: '1', role: 'Beeps on code rollover', price: '৳40–80' },
    { name: 'USB cable + small enclosure', qty: '1', role: 'Power + pocket token', price: '৳150–350' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (3V3)' },
        { from: 'Buzzer →', to: 'GPIO15 via NPN + 1k (short blip each 30 s rollover)' },
        { from: 'Resync button →', to: 'GPIO0 to GND (BOOT button forces an NTP resync — no extra wiring)' },
        { from: 'Slot button →', to: 'GPIO4 to GND with INPUT_PULLUP (version B: next secret slot)' },
        { from: 'ESP32 VIN / GND', to: 'USB 5V / common GND' },
      ],
    },
    {
      id: 'lab',
      label: 'Time + secret setup',
      board: 'Your own bench',
      pins: [
        { from: 'Wi-Fi →', to: 'A phone hotspot or lab AP YOU own — NTP needs internet, then codes work offline until reboot' },
        { from: 'Secrets →', to: 'Enroll only YOUR OWN test accounts; never type a real production seed into a bench device' },
        { from: 'Verifier →', to: 'Any TOTP app on your phone with the same demo seed, for side-by-side comparison' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-core',
      title: 'Install arduino-esp32 3.x',
      detail: 'Boards Manager → esp32 by Espressif 3.3.x. TOTP runs on built-in mbedTLS HMAC-SHA1 and the core SNTP client — no extra installs beyond the OLED libraries.',
    },
    {
      id: 'wire-token',
      title: 'Wire the token',
      detail: 'OLED on GPIO21/22, buzzer on GPIO15 through an NPN transistor. Version B adds one tactile button on GPIO4 for slot switching; BOOT (GPIO0) forces an NTP resync.',
    },
    {
      id: 'flash-token',
      title: 'Flash the token',
      detail: 'Fill in WIFI_SSID / WIFI_PASS for a hotspot you own, then flash sketch A. It syncs time over NTP and displays the demo-seed TOTP with a seconds-left bar. Compare against a phone authenticator loaded with the same seed.',
    },
    {
      id: 'prove-rfc',
      title: 'Prove RFC 6238',
      detail: 'Set the demo seed JBSWY3DPEHPK3PXP in a phone app and confirm both devices show identical codes at each rollover. Matching codes across two independent implementations is the interoperability proof for the report.',
    },
    {
      id: 'enroll-slots',
      title: 'Enroll your own slots',
      detail: 'Flash sketch B and enroll up to 3 test-account seeds over Serial: SET 0 <base32>. Secrets persist in NVS across reboots; LIST shows slot labels without revealing seeds.',
      versions: ['b'],
    },
    {
      id: 'skew-test',
      title: 'Run the skew test',
      detail: 'Sketch B accepts SKEW <seconds> to offset the clock artificially. Push past ±90 s and watch codes fail against the phone app: this is why the RFC allows a ±1-step window and why NTP matters.',
      versions: ['b'],
    },
    {
      id: 'drift-report',
      title: 'Measure drift',
      detail: 'Unplug Wi-Fi for an hour, then compare token vs phone codes. Record how far the ESP32 crystal drifts — the number justifies either periodic resync or a ±1-step server window in the report.',
    },
  ],
  simulator: {
    viz: 'padlock',
    intro: 'Same rule as the standard: a token whose clock drifts outside the ±3-step acceptance window produces codes the server rejects.',
    sliders: [
      { id: 'drift', label: 'Clock drift', unit: 's', min: 0, max: 180, value: 12 },
      { id: 'step', label: 'Time step', unit: 's', min: 30, max: 60, value: 30 },
    ],
    threshold: { id: 'thr', label: 'Window', unit: 's', min: 30, max: 150, value: 90 },
    watch: 'drift',
    rule: 'above',
    actuator: 'Code',
    onText: 'REJECTED',
    offText: 'accepted',
    lcd: ['Drift:{drift}s', 'Code:{act}'],
    demoSlider: 'drift',
    demoFrom: 0,
    demoTo: 150,
    barLabel: 'Clock drift (s)',
  },
  code: [
    {
      id: 'a',
      label: 'A · Single-secret token',
      note: 'Libraries: Adafruit SSD1306 + GFX. HMAC-SHA1 via built-in mbedTLS. Set WIFI_SSID/PASS to a hotspot you own.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <WiFi.h>
#include <time.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "mbedtls/md.h"
#define OLED_ADDR 0x3C
#define BUZZER 15
#define WIFI_SSID "YOUR_HOTSPOT"  // a hotspot YOU own: NTP needs internet
#define WIFI_PASS "YOUR_PASSWORD"
#define DEMO_SEED "JBSWY3DPEHPK3PXP"  // demo only: enroll real seeds in B
#define TIME_STEP 30

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
uint8_t key[64];
size_t keyLen = 0;

int b32val(char c) {
  if (c >= 'A' && c <= 'Z') return c - 'A';
  if (c >= '2' && c <= '7') return c - '2' + 26;
  return -1;
}

size_t b32dec(const char *in, uint8_t *out, size_t cap) {
  uint32_t buf = 0;
  int bits = 0;
  size_t n = 0;
  for (const char *p = in; *p && n < cap; p++) {
    char c = *p;
    if (c >= 'a' && c <= 'z') c -= 32;
    if (c == '=' || c == ' ') continue;
    int v = b32val(c);
    if (v < 0) continue;
    buf = (buf << 5) | v;
    bits += 5;
    if (bits >= 8) { bits -= 8; out[n++] = (buf >> bits) & 0xFF; }
  }
  return n;
}

// RFC 6238: TOTP = HOTP(K, floor((T - T0) / X)) truncated to 6 digits.
uint32_t totp(const uint8_t *k, size_t klen, uint64_t ctr) {
  uint8_t msg[8];
  for (int i = 7; i >= 0; i--) { msg[i] = ctr & 0xFF; ctr >>= 8; }
  uint8_t hash[20];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA1), 1);
  mbedtls_md_hmac_starts(&ctx, k, klen);
  mbedtls_md_hmac_update(&ctx, msg, 8);
  mbedtls_md_hmac_finish(&ctx, hash);
  mbedtls_md_free(&ctx);
  int o = hash[19] & 0x0F;  // dynamic truncation
  uint32_t code = ((uint32_t)(hash[o] & 0x7F) << 24) | ((uint32_t)hash[o + 1] << 16)
    | ((uint32_t)hash[o + 2] << 8) | hash[o + 3];
  return code % 1000000;
}

void syncTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Syncing NTP");
  for (int i = 0; i < 30; i++) {
    time_t t = time(nullptr);
    if (t > 1700000000) { Serial.println(" ok"); return; }
    Serial.print(".");
    delay(500);
  }
  Serial.println(" FAILED: check hotspot");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(0, INPUT_PULLUP);  // BOOT button = resync time
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  keyLen = b32dec(DEMO_SEED, key, sizeof(key));
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Joining Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { Serial.print("."); delay(500); }
  Serial.println(" ok");
  syncTime();
}

void loop() {
  static long lastCtr = -1;
  if (digitalRead(0) == LOW) { syncTime(); delay(500); }
  time_t now = time(nullptr);
  long ctr = now / TIME_STEP;
  if (ctr != lastCtr) {  // fresh code: blip the buzzer
    lastCtr = ctr;
    digitalWrite(BUZZER, HIGH);
    delay(60);
    digitalWrite(BUZZER, LOW);
    Serial.printf("t=%ld code=%06lu\\n", (long)now, (unsigned long)totp(key, keyLen, ctr));
  }
  uint32_t code = totp(key, keyLen, (uint64_t)ctr);
  int left = TIME_STEP - (now % TIME_STEP);
  oled.clearDisplay();
  oled.setTextSize(3);
  oled.setCursor(8, 8);
  oled.printf("%06lu", (unsigned long)code);
  oled.setTextSize(1);
  oled.setCursor(0, 44);
  oled.printf("demo seed  %ds left", left);
  oled.drawRect(0, 56, 128, 7, SSD1306_WHITE);
  oled.fillRect(1, 57, (126 * left) / TIME_STEP, 5, SSD1306_WHITE);
  oled.display();
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · Multi-slot vault token',
      note: 'Serial commands: SET <slot 0-2> <base32>, LIST, SKEW <sec>, WIPE. Slot button on GPIO4; BOOT resyncs NTP.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <WiFi.h>
#include <time.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>
#include "mbedtls/md.h"
#define OLED_ADDR 0x3C
#define BUZZER 15
#define SLOT_BTN 4
#define WIFI_SSID "YOUR_HOTSPOT"  // a hotspot YOU own: NTP needs internet
#define WIFI_PASS "YOUR_PASSWORD"
#define TIME_STEP 30
#define SLOTS 3

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
Preferences prefs;
uint8_t slot = 0;
long skew = 0;  // artificial clock offset for the skew test

int b32val(char c) {
  if (c >= 'A' && c <= 'Z') return c - 'A';
  if (c >= '2' && c <= '7') return c - '2' + 26;
  return -1;
}

size_t b32dec(const String &in, uint8_t *out, size_t cap) {
  uint32_t buf = 0;
  int bits = 0;
  size_t n = 0;
  for (unsigned i = 0; i < in.length() && n < cap; i++) {
    char c = in[i];
    if (c >= 'a' && c <= 'z') c -= 32;
    if (c == '=' || c == ' ') continue;
    int v = b32val(c);
    if (v < 0) continue;
    buf = (buf << 5) | v;
    bits += 5;
    if (bits >= 8) { bits -= 8; out[n++] = (buf >> bits) & 0xFF; }
  }
  return n;
}

uint32_t totp(const uint8_t *k, size_t klen, uint64_t ctr) {
  uint8_t msg[8];
  for (int i = 7; i >= 0; i--) { msg[i] = ctr & 0xFF; ctr >>= 8; }
  uint8_t hash[20];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA1), 1);
  mbedtls_md_hmac_starts(&ctx, k, klen);
  mbedtls_md_hmac_update(&ctx, msg, 8);
  mbedtls_md_hmac_finish(&ctx, hash);
  mbedtls_md_free(&ctx);
  int o = hash[19] & 0x0F;
  uint32_t code = ((uint32_t)(hash[o] & 0x7F) << 24) | ((uint32_t)hash[o + 1] << 16)
    | ((uint32_t)hash[o + 2] << 8) | hash[o + 3];
  return code % 1000000;
}

void syncTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Syncing NTP");
  for (int i = 0; i < 30; i++) {
    if (time(nullptr) > 1700000000) { Serial.println(" ok"); return; }
    Serial.print(".");
    delay(500);
  }
  Serial.println(" FAILED: check hotspot");
}

String slotKey(uint8_t s) { return "seed" + String(s); }

void pollSerial() {
  if (!Serial.available()) return;
  String line = Serial.readStringUntil('\\n');
  line.trim();
  if (line.startsWith("SET ")) {
    int a = line.indexOf(' ', 4);
    uint8_t s = line.substring(4, a).toInt();
    String seed = line.substring(a + 1);
    if (s < SLOTS && seed.length() >= 16) {
      prefs.putString(slotKey(s).c_str(), seed);  // test seeds only: NVS is not encrypted here
      Serial.printf("Slot %u enrolled (%u chars)\\n", s, seed.length());
    } else Serial.println("Usage: SET <0-2> <base32 seed, 16+ chars>");
  } else if (line == "LIST") {
    for (uint8_t s = 0; s < SLOTS; s++)
      Serial.printf("slot %u: %s\\n", s, prefs.getString(slotKey(s).c_str(), "").length() ? "set" : "empty");
  } else if (line.startsWith("SKEW ")) {
    skew = line.substring(5).toInt();
    Serial.printf("Clock offset now %+ld s\\n", skew);
  } else if (line == "WIPE") {
    for (uint8_t s = 0; s < SLOTS; s++) prefs.remove(slotKey(s).c_str());
    Serial.println("All slots wiped");
  } else if (line.length()) Serial.println("Commands: SET / LIST / SKEW / WIPE");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(0, INPUT_PULLUP);       // BOOT = resync time
  pinMode(SLOT_BTN, INPUT_PULLUP);  // slot button
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  prefs.begin("totp", false);
  if (!prefs.getString(slotKey(0).c_str(), "").length())
    prefs.putString(slotKey(0).c_str(), "JBSWY3DPEHPK3PXP");  // demo seed in slot 0
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Joining Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { Serial.print("."); delay(500); }
  Serial.println(" ok");
  syncTime();
  Serial.println("Commands: SET <slot> <seed> | LIST | SKEW <sec> | WIPE");
}

void loop() {
  static long lastCtr = -1;
  static uint32_t lastBtn = 0;
  pollSerial();
  if (digitalRead(0) == LOW) { syncTime(); delay(500); }
  if (digitalRead(SLOT_BTN) == LOW && millis() - lastBtn > 400) {
    lastBtn = millis();
    slot = (slot + 1) % SLOTS;
    Serial.printf("Slot %u\\n", slot);
  }
  time_t now = time(nullptr) + skew;
  long ctr = now / TIME_STEP;
  if (ctr != lastCtr) {
    lastCtr = ctr;
    digitalWrite(BUZZER, HIGH);
    delay(60);
    digitalWrite(BUZZER, LOW);
  }
  uint8_t key[64];
  size_t klen = b32dec(prefs.getString(slotKey(slot).c_str(), ""), key, sizeof(key));
  uint32_t code = klen ? totp(key, klen, (uint64_t)ctr) : 0;
  int left = TIME_STEP - (now % TIME_STEP);
  oled.clearDisplay();
  oled.setTextSize(3);
  oled.setCursor(8, 8);
  if (klen) oled.printf("%06lu", (unsigned long)code);
  else oled.print("------");
  oled.setTextSize(1);
  oled.setCursor(0, 44);
  oled.printf("slot %u  %ds left", slot, left);
  if (skew) {
    oled.setCursor(80, 44);
    oled.printf("%+lds", skew);
  }
  oled.drawRect(0, 56, 128, 7, SSD1306_WHITE);
  oled.fillRect(1, 57, (126 * left) / TIME_STEP, 5, SSD1306_WHITE);
  oled.display();
  delay(200);
}`,
    },
  ],
  tips: [
    { title: 'Time is the secret ingredient', detail: 'TOTP codes are HMAC-SHA1 of a time counter. A token with the wrong time generates perfectly valid codes for the wrong moment — which every server rejects.' },
    { title: 'Test seeds only', detail: 'Bench NVS is not encrypted. Enroll throwaway test accounts; real seeds belong in a hardware key with a secure element, not a dev board.' },
    { title: 'Windows exist for a reason', detail: 'Servers accept ±1 step to absorb drift and latency. Your skew test shows the tradeoff: wider windows accept more drift — and more replay room.' },
    { title: 'Compare implementations', detail: 'Token vs phone app with the same seed is the gold standard check. If they disagree, suspect the clock first and the code second.' },
    { title: 'Mind the backup codes', detail: 'Lose the seed and you lose the account. The report should cover seed backup and recovery — the unglamorous half of 2FA.' },
  ],
}
