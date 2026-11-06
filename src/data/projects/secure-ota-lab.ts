import type { Project } from '../types'

export const secureOtaLab: Project = {
  slug: 'secure-ota-lab',
  categoryId: 'cybersecurity',
  title: 'Signed OTA Update Lab',
  tagline: 'Ship firmware that refuses tampered updates — sign, verify, roll back.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳900–1,500',
  boards: ['ESP32'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: false,
      reason: 'No SHA-256 engine and only 1 KB of EEPROM: the Uno cannot verify or stage realistic update images.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'The guide targets ESP32 NVS + mbedTLS verification; the ESP8266 port is untested and Espressif marks the chip NRND (not for new designs).',
    },
    esp32cam: {
      ok: false,
      reason: 'No USB for the update feed and too few free pins for the OLED + buzzer once the camera is attached.',
    },
  },
  skills: ['Firmware signing', 'Hash verification', 'Rollback protection', 'NVS'],
  scene: 'secure',
  updated: 'Nov 2026',
  sheets: ['esp32', 'ssd1306', 'esp-secure-boot', 'signed-ota-guide', 'esp-preferences', 'owasp-iot'],
  rig: { sensor: 'oled', extras: ['buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Hash-verified updates',
      level: 'Medium · core build',
      blurb: 'Update images arrive over Serial; the device hashes each one and installs only bytes matching the pinned release hash.',
      points: ['Pinned release hash', 'Tamper → REJECT demo', 'OLED verdict display'],
      weeks: '2 weeks',
      cost: '৳900–1,200',
    },
    {
      id: 'b',
      title: 'B. Anti-rollback channel',
      level: 'Medium+ · best value',
      blurb: 'Adds a versioned channel in NVS: downgrades are rejected even when correctly signed, and failures roll back safely.',
      points: ['NVS version counter', 'Downgrade rejection', 'Production Secure Boot path'],
      weeks: '2–3 weeks',
      cost: '৳900–1,500',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit V1', qty: '1', role: 'Update verifier + NVS store', price: '৳470–850' },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '1', role: 'ACCEPT / REJECT verdicts', price: '৳250–450' },
    { name: 'Active buzzer + red LED', qty: '1 set', role: 'Tamper alarm', price: '৳60–120' },
    { name: 'USB cable + small enclosure', qty: '1', role: 'Power + update feed', price: '৳150–350' },
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
        { from: 'Red LED →', to: 'GPIO2 via 220Ω (lights on REJECT)' },
        { from: 'Status button →', to: 'GPIO0 to GND (BOOT button shows the stored version — no extra wiring)' },
        { from: 'ESP32 VIN / GND', to: 'USB 5V / common GND' },
      ],
    },
    {
      id: 'lab',
      label: 'Release-signing setup',
      board: 'Your own laptop',
      pins: [
        { from: 'Signer →', to: 'Python hashlib on YOUR machine: hash the release bytes, paste the hex into the sketch as the pinned hash' },
        { from: 'Feed →', to: 'USB Serial only: IMG lines carry candidate images into YOUR verifier — no network needed' },
        { from: 'Attacker →', to: 'You, flipping one hex digit to prove a single tampered byte fails the whole image' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-core',
      title: 'Install arduino-esp32 3.x',
      detail: 'Boards Manager → esp32 by Espressif 3.3.x. Verification uses built-in mbedTLS SHA-256 and Preferences (NVS) — no extra installs beyond the OLED libraries.',
    },
    {
      id: 'wire-feedback',
      title: 'Wire the feedback',
      detail: 'OLED on GPIO21/22, buzzer on GPIO15 through an NPN transistor, verdict LED on GPIO2. The BOOT button (GPIO0) shows the stored firmware version.',
    },
    {
      id: 'flash-verifier',
      title: 'Flash the verifier',
      detail: 'Flash sketch A. It ships with one pinned release hash (SHA-256 of "voltverse-demo-v2") and accepts nothing else — the trust anchor is compiled into the device.',
    },
    {
      id: 'ship-good',
      title: 'Ship a good update',
      detail: 'Send the demo image over Serial: IMG 766f6c7476657273652d64656d6f2d7632. The device hashes it, matches the pinned hash, and shows ACCEPT. This is the happy path every release must take.',
    },
    {
      id: 'tamper-byte',
      title: 'Tamper one byte',
      detail: 'Resend with a single hex digit changed. SHA-256 avalanches: the digest is unrecognizable and the OLED shows REJECT with the buzzer. One flipped byte fails the whole image — record both digests for the report.',
    },
    {
      id: 'add-rollback',
      title: 'Add anti-rollback',
      detail: 'Flash sketch B: updates now carry a version (IMG <ver> <hex>) checked against an NVS counter. Replay the good v2 image as v1 and watch it rejected as a DOWNGRADE even though the bytes verify.',
      versions: ['b'],
    },
    {
      id: 'fail-closed',
      title: 'Prove fail-closed',
      detail: 'Power-cycle mid-session and confirm the NVS version survives; send garbage lines and confirm they are ignored, not applied. A verifier must do nothing when confused — "nothing" is the safe state.',
      versions: ['b'],
    },
    {
      id: 'production-path',
      title: 'Map the production path',
      detail: 'Write up how the bench demo scales: Ed25519/RSA signatures instead of a pinned hash, TLS delivery, and ESP32 Secure Boot V2 + flash encryption so even physical attackers cannot swap the verifier. Link each step to the OWASP insecure-update item.',
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same rule as the firmware: an image whose hash matches the pinned release hash below 100% is rejected — tampering is binary.',
    sliders: [
      { id: 'match', label: 'Hash match', unit: '%', min: 0, max: 100, value: 100 },
      { id: 'bytes', label: 'Image size', unit: 'B', min: 16, max: 512, value: 17 },
    ],
    threshold: { id: 'thr', label: 'Accept at', unit: '%', min: 90, max: 100, value: 100 },
    watch: 'match',
    rule: 'below',
    actuator: 'Update',
    onText: 'REJECTED',
    offText: 'accepted',
    lcd: ['Match:{match}%', 'Update:{act}'],
    demoSlider: 'match',
    demoFrom: 100,
    demoTo: 82,
    barLabel: 'Hash match %',
  },
  code: [
    {
      id: 'a',
      label: 'A · Hash-verified updates',
      note: 'Libraries: Adafruit SSD1306 + GFX. SHA-256 via built-in mbedTLS. Feed images as: IMG <hexbytes>.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "mbedtls/sha256.h"
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define MAX_IMG 512
// Pinned trust anchor: SHA-256 of the ASCII bytes "voltverse-demo-v2".
// Real releases pin a signature; the bench demo pins the release hash.
#define PINNED_HASH "39c59a7cef54307cae7552a3564be3f8f2f23f02faafd5c50a52179fcedd8a9d"

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
uint32_t accepted = 0, rejected = 0;
String verdict = "awaiting IMG";

int hexval(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  return -1;
}

size_t hexdec(const String &in, uint8_t *out, size_t cap) {
  size_t n = 0;
  for (unsigned i = 0; i + 1 < in.length() && n < cap; i += 2) {
    int hi = hexval(in[i]), lo = hexval(in[i + 1]);
    if (hi < 0 || lo < 0) break;
    out[n++] = (hi << 4) | lo;
  }
  return n;
}

void sha256hex(const uint8_t *data, size_t len, char *out) {
  uint8_t sum[32];
  mbedtls_sha256(data, len, sum, 0);
  for (int i = 0; i < 32; i++) sprintf(out + 2 * i, "%02x", sum[i]);
  out[64] = 0;
}

void verify(const String &hex) {
  uint8_t img[MAX_IMG];
  size_t n = hexdec(hex, img, sizeof(img));
  if (n == 0) {
    Serial.println("IGNORED: empty or malformed hex");
    return;
  }
  char digest[65];
  sha256hex(img, n, digest);
  bool ok = strcmp(digest, PINNED_HASH) == 0;
  Serial.printf("%s: %u bytes sha256=%s\\n", ok ? "ACCEPT" : "REJECT", (unsigned)n, digest);
  if (ok) {
    accepted++;
    verdict = "ACCEPT v2";
    digitalWrite(LED, LOW);
    digitalWrite(BUZZER, LOW);
  } else {
    rejected++;
    verdict = "REJECT tamper";
    digitalWrite(LED, HIGH);
    digitalWrite(BUZZER, HIGH);
    delay(400);
    digitalWrite(BUZZER, LOW);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  Serial.println("OTA verifier ready. Send: IMG <hexbytes>");
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\\n');
    line.trim();
    if (line.startsWith("IMG ")) verify(line.substring(4));
    else if (line.length()) Serial.println("IGNORED: unknown command");
  }
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(verdict.startsWith("REJECT") ? "REJECT" : (verdict.startsWith("ACCEPT") ? "ACCEPT" : "verifier"));
  oled.setTextSize(1);
  oled.setCursor(0, 24);
  oled.printf("ok %lu bad %lu", (unsigned long)accepted, (unsigned long)rejected);
  oled.setCursor(0, 36);
  oled.print(verdict);
  oled.setCursor(0, 52);
  oled.print("pinned: demo-v2");
  oled.display();
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · Anti-rollback channel',
      note: 'Adds an NVS version counter. Feed: IMG <ver> <hex>. WIPE resets the stored version for repeat demos.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>
#include "mbedtls/sha256.h"
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define MAX_IMG 512
#define PINNED_HASH "39c59a7cef54307cae7552a3564be3f8f2f23f02faafd5c50a52179fcedd8a9d"

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
Preferences prefs;
uint32_t accepted = 0, rejected = 0;
String verdict = "awaiting IMG";

int hexval(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  return -1;
}

size_t hexdec(const String &in, uint8_t *out, size_t cap) {
  size_t n = 0;
  for (unsigned i = 0; i + 1 < in.length() && n < cap; i += 2) {
    int hi = hexval(in[i]), lo = hexval(in[i + 1]);
    if (hi < 0 || lo < 0) break;
    out[n++] = (hi << 4) | lo;
  }
  return n;
}

void sha256hex(const uint8_t *data, size_t len, char *out) {
  uint8_t sum[32];
  mbedtls_sha256(data, len, sum, 0);
  for (int i = 0; i < 32; i++) sprintf(out + 2 * i, "%02x", sum[i]);
  out[64] = 0;
}

void reject(const char *why) {
  rejected++;
  verdict = String("REJECT ") + why;
  Serial.printf("REJECT %s\\n", why);
  digitalWrite(LED, HIGH);
  digitalWrite(BUZZER, HIGH);
  delay(400);
  digitalWrite(BUZZER, LOW);
}

void verify(long ver, const String &hex) {
  uint32_t cur = prefs.getUInt("fwver", 0);
  if (ver <= (long)cur) {  // signed but stale: classic downgrade attack
    reject("downgrade");
    return;
  }
  uint8_t img[MAX_IMG];
  size_t n = hexdec(hex, img, sizeof(img));
  if (n == 0) { reject("malformed"); return; }
  char digest[65];
  sha256hex(img, n, digest);
  if (strcmp(digest, PINNED_HASH) != 0) { reject("tamper"); return; }
  prefs.putUInt("fwver", (uint32_t)ver);  // commit only after both checks pass
  accepted++;
  verdict = "ACCEPT v" + String(ver);
  Serial.printf("ACCEPT v%ld: %u bytes sha256=%s\\n", ver, (unsigned)n, digest);
  digitalWrite(LED, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(0, INPUT_PULLUP);  // BOOT button = show stored version
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  prefs.begin("otalab", false);
  Serial.printf("OTA verifier ready, stored fw v%lu. Send: IMG <ver> <hex>\\n",
    (unsigned long)prefs.getUInt("fwver", 0));
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\\n');
    line.trim();
    if (line == "WIPE") {
      prefs.putUInt("fwver", 0);
      verdict = "version reset";
      Serial.println("Stored version reset to 0");
    } else if (line.startsWith("IMG ")) {
      int sp = line.indexOf(' ', 4);
      long ver = line.substring(4, sp).toInt();
      verify(ver, sp > 0 ? line.substring(sp + 1) : "");
    } else if (line.length()) Serial.println("IGNORED: unknown command");
  }
  if (digitalRead(0) == LOW) {
    Serial.printf("Stored firmware version: %lu\\n", (unsigned long)prefs.getUInt("fwver", 0));
    delay(500);
  }
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(verdict.startsWith("REJECT") ? "REJECT" : (verdict.startsWith("ACCEPT") ? "ACCEPT" : "verifier"));
  oled.setTextSize(1);
  oled.setCursor(0, 24);
  oled.printf("ok %lu bad %lu", (unsigned long)accepted, (unsigned long)rejected);
  oled.setCursor(0, 36);
  oled.print(verdict);
  oled.setCursor(0, 52);
  oled.printf("stored fw v%lu", (unsigned long)prefs.getUInt("fwver", 0));
  oled.display();
  delay(200);
}`,
    },
  ],
  tips: [
    { title: 'Pin the trust anchor', detail: 'The verifier must ship with the release hash or public key baked in. An update channel that fetches its own trust anchor over the same channel verifies nothing.' },
    { title: 'Signatures beat hashes', detail: 'A pinned hash works for one release; production uses Ed25519/RSA signatures so each new release verifies against a long-lived public key.' },
    { title: 'Never skip the version', detail: 'Without anti-rollback, attackers replay the oldest signed release with known holes. OWASP lists insecure updates among the top IoT risks for exactly this.' },
    { title: 'Fail closed', detail: 'Malformed input, power loss, unknown commands: the verifier must do nothing. "Nothing" is the only safe default for an update channel.' },
    { title: 'Hardware seals it', detail: 'Software verification stops remote tampering; ESP32 Secure Boot V2 + flash encryption stop attackers with physical access from swapping the verifier itself.' },
  ],
}
