import type { Project } from '../types'

export const encryptedLoraMessenger: Project = {
  slug: 'encrypted-lora-messenger',
  categoryId: 'cybersecurity',
  title: 'Encrypted LoRa Messenger',
  tagline: 'Two-node AES-encrypted chat over license-free LoRa.',
  difficulty: 'Medium',
  weeks: '3–4 weeks',
  cost: '৳2,600–4,200',
  boards: ['ESP32 × 2'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: false,
      reason: 'No mbedTLS and only 2 KB RAM: AES-CBC plus LoRa buffers do not fit the Uno comfortably.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'The ESP8266 ships BearSSL, not the mbedTLS AES API this guide teaches — the crypto code would need a rewrite.',
    },
    esp32cam: {
      ok: false,
      reason: 'SPI and free GPIO are taken by the camera and SD slot; no room for the Ra-02 plus OLED.',
    },
  },
  skills: ['LoRa PHY', 'AES-CBC + nonces', 'Replay defense', 'Two-node protocol'],
  scene: 'city',
  updated: 'Nov 2026',
  sheets: ['esp32', 'sx1278', 'arduino-lora', 'radiolib', 'ssd1306'],
  rig: { sensor: 'gsm', extras: ['oled'] },
  options: [
    {
      id: 'a',
      title: 'A. Plaintext link',
      level: 'Medium · core build',
      blurb: 'Two ESP32 + Ra-02 nodes chat over Serial with RSSI/SNR on the OLED — and anyone with a third radio reads along.',
      points: ['Two-node LoRa chat', 'RSSI/SNR link budget', 'Eavesdrop demo with node 3'],
      weeks: '2 weeks',
      cost: '৳2,600–3,400',
    },
    {
      id: 'b',
      title: 'B. Encrypted + replay-safe',
      level: 'Medium+ · best value',
      blurb: 'AES-128-CBC with a fresh random IV per message, sequence counters that reject replays, and an ECB-vs-CBC demo.',
      points: ['mbedTLS AES-128-CBC', 'Random IV + seq counters', 'Replay-reject demo'],
      weeks: '3–4 weeks',
      cost: '৳2,800–4,200',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit V1', qty: '2', role: 'One per chat node', price: '৳940–1,700' },
    { name: 'Ra-02 SX1278 module + antenna', qty: '2', role: 'LoRa radio (frequency must match your region)', price: '৳900–1,400' },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '2', role: 'Last message + link stats', price: '৳500–900' },
    { name: 'USB cables + 2 power banks', qty: '1 set', role: 'Range-test power', price: '৳900–1,500', versions: ['b'] },
    { name: 'Jumper wires + 2 breadboards', qty: '1 set', role: 'Two-node bench', price: '৳200–400' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'Each node (build twice)',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'Ra-02 → NSS / RST / DIO0', to: 'GPIO5 / GPIO14 / GPIO26' },
        { from: 'Ra-02 → SCK/MOSI/MISO', to: 'GPIO18 / GPIO23 / GPIO19 (VSPI)' },
        { from: 'Ra-02 → 3V3 / GND', to: '3V3 / GND (never 5V; antenna attached before power)' },
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (3V3)' },
        { from: 'ESP32 VIN / GND', to: 'USB 5V / common GND' },
      ],
    },
    {
      id: 'freq',
      label: 'Frequency by region',
      board: 'Regulatory',
      pins: [
        { from: 'Module →', to: '433 MHz (Asia) / 868 MHz (EU) / 915 MHz (Americas) — module and LORA_FREQ must match' },
        { from: 'Sync word →', to: 'Unique per bench pair (0xF3, 0xF4…) so pairs ignore each other' },
        { from: 'Power →', to: 'Keep the stock 17 dBm; check local duty-cycle rules before beaconing' },
      ],
    },
  ],
  steps: [
    {
      id: 'pick-frequency',
      title: 'Pick the legal frequency',
      detail: 'Confirm your region’s ISM band (433/868/915 MHz) and buy both Ra-02 modules in that band. Set LORA_FREQ and a per-pair sync word before flashing.',
    },
    {
      id: 'wire-node',
      title: 'Wire node 1',
      detail: 'Ra-02 NSS/RST/DIO0 on GPIO5/14/26, SPI on GPIO18/23/19, OLED on GPIO21/22. Screw the antenna on before powering the radio.',
    },
    {
      id: 'plaintext-chat',
      title: 'Chat in plaintext',
      detail: 'Flash sketch A on both nodes. Type in either Serial Monitor and watch the message arrive with RSSI/SNR. Note: every byte is readable to any third radio.',
    },
    {
      id: 'eavesdrop-demo',
      title: 'Demo the eavesdropper',
      detail: 'Borrow a third pair’s node (or a cheap SDR): same frequency + sync word reads the whole chat. Screenshot it — this is the “why encrypt” slide of the report.',
    },
    {
      id: 'add-aes',
      title: 'Add AES-128-CBC',
      detail: 'Flash sketch B on both nodes with the same 16-byte pre-shared key typed in by hand. Every message gets a fresh random IV; identical plaintexts encrypt differently.',
      versions: ['b'],
    },
    {
      id: 'replay-test',
      title: 'Test replay rejection',
      detail: 'Capture one encrypted packet from Serial, re-inject it with the sender sketch’s test hook (or replay via node 3): the sequence counter rejects it as REPLAY. Log the reject count.',
      versions: ['b'],
    },
    {
      id: 'ecb-demo',
      title: 'ECB vs CBC demo',
      detail: 'Send the same message twice and compare ciphertext hex on Serial: CBC differs every time (random IV), while the report’s ECB diagram shows why fixed mode leaks patterns.',
      versions: ['b'],
    },
    {
      id: 'range-test',
      title: 'Range-test on batteries',
      detail: 'Power both nodes from banks, walk apart across campus, and log where RSSI/SNR (and delivery) die. Urban range is hundreds of meters, not kilometers.',
    },
  ],
  simulator: {
    viz: 'tank',
    intro: 'Same rule as the receiver: too many failed integrity checks in the last 10 messages marks the link untrusted.',
    sliders: [
      { id: 'badmac', label: 'Failed checks', unit: '/10', min: 0, max: 10, value: 1 },
      { id: 'rssi', label: 'Signal', unit: 'dBm', min: -120, max: -40, value: -85 },
    ],
    threshold: { id: 'thr', label: 'Distrust above', unit: '/10', min: 2, max: 8, value: 3 },
    watch: 'badmac',
    rule: 'above',
    actuator: 'Link',
    onText: 'UNTRUSTED',
    offText: 'trusted',
    lcd: ['Bad MAC:{badmac}/10', 'Link:{act}'],
    demoSlider: 'badmac',
    demoFrom: 0,
    demoTo: 6,
    barLabel: 'Failed checks / 10 msgs',
  },
  code: [
    {
      id: 'a',
      label: 'A · Plaintext chat',
      note: 'Flash on BOTH nodes. Library: LoRa by Sandeep Mistry (+ Adafruit SSD1306/GFX). Set LORA_FREQ to your module’s band.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define LORA_NSS 5
#define LORA_RST 14
#define LORA_DIO0 26
#define OLED_ADDR 0x3C
#define LORA_FREQ 433E6     // match your module: 433 / 868 / 915 MHz
#define SYNC_WORD 0xF3      // unique per bench pair

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
String lastRx = "(nothing yet)";
int lastRssi = 0;
float lastSnr = 0;
uint32_t txCount = 0, rxCount = 0;

void show(const char* title) {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.print(title);
  oled.setCursor(0, 14);
  oled.print(lastRx.substring(0, 21));
  oled.setCursor(0, 30);
  oled.printf("rssi %d  snr %.1f", lastRssi, lastSnr);
  oled.setCursor(0, 44);
  oled.printf("tx %lu  rx %lu", (unsigned long)txCount, (unsigned long)rxCount);
  oled.display();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  LoRa.setPins(LORA_NSS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) { show("LoRa FAIL"); while (true) delay(1000); }
  LoRa.setSyncWord(SYNC_WORD);
  Serial.println("type a line + enter to send");
  show("plaintext chat");
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\\n');
    line.trim();
    if (line.length() > 0 && line.length() <= 200) {
      LoRa.beginPacket();
      LoRa.print(line);
      LoRa.endPacket();
      txCount++;
      Serial.println("sent: " + line);
      show("plaintext chat");
    }
  }
  int size = LoRa.parsePacket();
  if (size) {
    lastRx = "";
    while (LoRa.available()) lastRx += (char)LoRa.read();
    lastRssi = LoRa.packetRssi();
    lastSnr = LoRa.packetSnr();
    rxCount++;
    Serial.printf("got (%d dBm, snr %.1f): %s\\n", lastRssi, lastSnr, lastRx.c_str());
    show("plaintext chat");
  }
}`,
    },
    {
      id: 'b',
      label: 'B · AES-128-CBC chat',
      note: 'Flash on BOTH nodes with the same hand-typed PSK. No crypto library to install: uses the ESP32 built-in mbedTLS. Packet = IV + seq + ciphertext.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <esp_system.h>
#include "mbedtls/aes.h"
#define LORA_NSS 5
#define LORA_RST 14
#define LORA_DIO0 26
#define OLED_ADDR 0x3C
#define LORA_FREQ 433E6
#define SYNC_WORD 0xF3
#define MAX_MSG 48

// Classroom pre-shared key: type the SAME 16 bytes into both nodes.
// A hardcoded key is fine for coursework, never for production.
static const unsigned char PSK[16] = {
  'l','a','b','-','p','s','k','-','0','0','7','-','!','#','$','%'
};

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
String lastRx = "(nothing yet)";
uint32_t txSeq = 1, lastSeq = 0, rejects = 0, rxCount = 0;

void show(const char* title) {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.print(title);
  oled.setCursor(0, 14);
  oled.print(lastRx.substring(0, 21));
  oled.setCursor(0, 30);
  oled.printf("rx %lu  replay! %lu", (unsigned long)rxCount, (unsigned long)rejects);
  oled.setCursor(0, 44);
  oled.printf("seq out %lu in %lu", (unsigned long)txSeq, (unsigned long)lastSeq);
  oled.display();
}

void hexDump(const unsigned char *p, size_t n) {
  for (size_t i = 0; i < n; i++) Serial.printf("%02X", p[i]);
  Serial.println();
}

void sendEncrypted(const String &msg) {
  unsigned char plain[64], cipher[64], iv[16], ivc[16];
  size_t mlen = msg.length() > MAX_MSG ? MAX_MSG : msg.length();
  size_t pad = 16 - (mlen % 16);
  size_t total = mlen + pad;
  memcpy(plain, msg.c_str(), mlen);
  memset(plain + mlen, (int)pad, pad);  // PKCS#7
  for (int i = 0; i < 4; i++) {  // fresh random IV every message
    uint32_t r = esp_random();
    memcpy(iv + i * 4, &r, 4);
  }
  memcpy(ivc, iv, 16);
  mbedtls_aes_context ctx;
  mbedtls_aes_init(&ctx);
  mbedtls_aes_setkey_enc(&ctx, PSK, 128);
  mbedtls_aes_crypt_cbc(&ctx, MBEDTLS_AES_ENCRYPT, total, ivc, plain, cipher);
  mbedtls_aes_free(&ctx);

  LoRa.beginPacket();
  LoRa.write(iv, 16);
  LoRa.write((uint8_t)(txSeq >> 24)); LoRa.write((uint8_t)(txSeq >> 16));
  LoRa.write((uint8_t)(txSeq >> 8)); LoRa.write((uint8_t)txSeq);
  LoRa.write(cipher, total);
  LoRa.endPacket();
  Serial.printf("sent seq %lu ct: ", (unsigned long)txSeq);
  hexDump(cipher, total);  // same text twice -> different bytes: the CBC demo
  txSeq++;
}

void receive() {
  int size = LoRa.parsePacket();
  if (!size) return;
  if (size < 21 || size > 84 || ((size - 20) % 16 != 0)) { rejects++; show("AES chat"); return; }
  unsigned char iv[16], cipher[64], plain[65];
  LoRa.readBytes((char *)iv, 16);
  uint32_t seq = 0;
  for (int i = 0; i < 4; i++) seq = (seq << 8) | (uint8_t)LoRa.read();
  size_t clen = size - 20;
  LoRa.readBytes((char *)cipher, clen);
  if (seq <= lastSeq) { rejects++; Serial.println("REPLAY rejected"); show("AES chat"); return; }

  mbedtls_aes_context ctx;
  mbedtls_aes_init(&ctx);
  mbedtls_aes_setkey_dec(&ctx, PSK, 128);
  mbedtls_aes_crypt_cbc(&ctx, MBEDTLS_AES_DECRYPT, clen, iv, cipher, plain);
  mbedtls_aes_free(&ctx);
  uint8_t pad = plain[clen - 1];  // verify + strip PKCS#7
  if (pad < 1 || pad > 16) { rejects++; show("AES chat"); return; }
  for (size_t i = clen - pad; i < clen; i++)
    if (plain[i] != pad) { rejects++; show("AES chat"); return; }
  plain[clen - pad] = 0;

  lastSeq = seq;
  rxCount++;
  lastRx = String((char *)plain);
  Serial.printf("got seq %lu: %s\\n", (unsigned long)seq, lastRx.c_str());
  show("AES chat");
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  LoRa.setPins(LORA_NSS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) { show("LoRa FAIL"); while (true) delay(1000); }
  LoRa.setSyncWord(SYNC_WORD);
  Serial.println("AES chat: type a line + enter");
  show("AES chat");
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\\n');
    line.trim();
    if (line.length() > 0) sendEncrypted(line);
  }
  receive();
}`,
    },
  ],
  tips: [
    { title: 'Antenna first', detail: 'Never power a LoRa module without its antenna: reflected power can kill the PA stage.' },
    { title: 'Frequency = law', detail: 'The wrong band is not a bug, it is a spectrum violation. Module marking, LORA_FREQ and local rules must all agree.' },
    { title: 'IVs are single-use', detail: 'Reusing a CBC IV leaks whether two messages share a prefix. Fresh esp_random() IV per message is the whole point of the demo.' },
    { title: 'PSK is the ceiling', detail: 'A shared key typed into both nodes is classroom key management. Real systems need key exchange (X25519) plus authentication — say so in the report.' },
    { title: 'V3 boards differ', detail: 'LILYGO/Heltec V3 boards use the SX1262, which arduino-LoRa does not support — those need RadioLib instead.' },
  ],
}
