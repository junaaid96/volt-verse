import type { Project } from '../types'

export const rfidCloningLab: Project = {
  slug: 'rfid-cloning-lab',
  categoryId: 'cybersecurity',
  title: 'RFID Cloning Lab',
  tagline: 'Clone your own card, then build the reader that stops clones.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳1,800–3,000',
  boards: ['ESP32', 'Arduino Uno', 'NodeMCU'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'RC522 is 3.3V-only: power it from the 3V3 pin and pass SS/SCK/MOSI/RST through a level shifter. UI is Serial + LEDs (no OLED: RAM).',
    },
    esp32: { ok: true },
    nodemcu: { ok: true, note: 'Pins run out fast: feedback is OLED + buzzer only, no status LEDs.' },
    esp32cam: {
      ok: false,
      reason: 'RC522 SPI + display + buzzer need ~8 GPIO; the camera and SD slot leave only 2–4 usable pins.',
    },
  },
  skills: ['MIFARE Classic', 'UID vs auth', 'Magic cards', 'Secure readers'],
  scene: 'secure',
  updated: 'Nov 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'mfrc522', 'level-shifter', 'ssd1306', 'mifare-edu', 'proxmark3'],
  rig: { sensor: 'rc522', extras: ['oled', 'buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. UID dump + weak lock',
      level: 'Medium · core build',
      blurb: 'Dump card UIDs, then build the classic rookie mistake on purpose: a mock lock that opens for any UID match.',
      points: ['UID reading + whitelist', 'UID-only mock lock', 'Why UID ≠ authentication'],
      weeks: '1–2 weeks',
      cost: '৳1,800–2,400',
    },
    {
      id: 'b',
      title: 'B. Clone vs hardened reader',
      level: 'Medium+ · best value',
      blurb: 'Copy a UID onto a Gen2 magic card, watch it fool the weak lock, then enable sector-auth + secrets that reject it.',
      points: ['Gen2 magic-card cloning', 'Sector keys + secret block', 'Clone-reject demo'],
      weeks: '2–3 weeks',
      cost: '৳2,000–3,000',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳650–1,000', boards: ['uno'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller', price: '৳380–550', boards: ['nodemcu'] },
    { name: '4-ch logic level shifter', qty: '1', role: '5V → 3.3V for RC522 signals', price: '৳60–120', boards: ['uno'] },
    { name: 'RC522 RFID module', qty: '1', role: 'Victim reader + attacker writer', price: '৳250–400' },
    { name: 'MIFARE Classic 1K cards', qty: '5', role: 'Lab-issued victim cards', price: '৳150–300' },
    { name: 'Gen2 magic (CUID) cards', qty: '3', role: 'Direct-write clone targets', price: '৳250–500', versions: ['b'] },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '1', role: 'UID / accept-reject display', price: '৳250–450', boards: ['esp32', 'nodemcu'] },
    { name: 'Buzzer + LEDs', qty: '1 set', role: 'Accept/reject feedback', price: '৳60–150' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'RC522 → 3.3V / GND', to: '3V3 / GND (never 5V)' },
        { from: 'RC522 → SDA/SCK/MOSI/MISO', to: 'GPIO5 / 18 / 23 / 19 (VSPI)' },
        { from: 'RC522 → RST', to: 'GPIO27' },
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (3V3)' },
        { from: 'Buzzer →', to: 'GPIO15 via NPN + 1k' },
      ],
    },
    {
      id: 'uno',
      label: 'Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'RC522 → 3.3V / GND', to: 'Uno 3V3 / GND' },
        { from: 'RC522 → SDA / RST', to: 'D10 / D9 via level shifter' },
        { from: 'RC522 → SCK/MOSI/MISO', to: 'D13 / D11 (via shifter) / D12 (direct)' },
        { from: 'Green LED / red LED →', to: 'D7 / D6 via 220Ω' },
        { from: 'Buzzer →', to: 'D8 via NPN + 1k' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'RC522 → 3.3V / GND', to: '3V3 / GND' },
        { from: 'RC522 → SDA / RST', to: 'D4 / D3 (matches the sketch constants)' },
        { from: 'RC522 → SCK/MOSI/MISO', to: 'D5 / D7 / D6 (hardware SPI)' },
        { from: 'OLED → SDA / SCL', to: 'D2 / D1 (3V3)' },
        { from: 'Buzzer →', to: 'D8 via NPN + 1k (D8 must be LOW at boot — the NPN keeps it there)' },
      ],
    },
    {
      id: 'bench',
      label: 'Card bench rules',
      board: 'Lab cards only',
      pins: [
        { from: 'Victim cards →', to: 'Lab-issued MIFARE Classic 1K — label each with its UID' },
        { from: 'Clone targets →', to: 'Gen2 magic cards (direct block-0 write; Gen1 needs a backdoor sequence)' },
        { from: 'Policy →', to: 'Own lab cards only. Dorm, office, transit or payment cards are never in scope' },
      ],
    },
  ],
  steps: [
    {
      id: 'own-cards-policy',
      title: 'Sign the own-cards policy',
      detail: 'Cloning your own lab cards for education is the whole lab; cloning anyone else’s card or touching a real access system is unauthorized access. Get the scope signed before unwrapping the magic cards.',
    },
    {
      id: 'wire-reader',
      title: 'Wire the reader',
      detail: 'RC522 on GPIO5/18/23/19 with RST on GPIO27, OLED on GPIO21/22, buzzer on GPIO15. Keep SPI wires under 20 cm.',
      boardDetail: {
        uno: 'RC522 on D10/D9 with SCK/MOSI/MISO on D13/D11/D12 through the level shifter, LEDs on D7/D6, buzzer on D8. Keep SPI wires under 20 cm.',
        nodemcu: 'RC522 on D4/D3 with SCK/MOSI/MISO on D5/D7/D6, OLED on D2/D1, buzzer on D8. Keep SPI wires under 20 cm.',
      },
    },
    {
      id: 'dump-uids',
      title: 'Dump card UIDs',
      detail: 'Flash sketch A, open Serial, tap each lab card and record its 4-byte UID. These UIDs are public — reading them needs no key.',
    },
    {
      id: 'weak-lock',
      title: 'Build the weak lock',
      detail: 'Sketch A doubles as a UID-only mock lock: any card whose UID is whitelisted opens it. Confirm a whitelisted card beeps accept and a stranger card beeps deny.',
    },
    {
      id: 'clone-uid',
      title: 'Clone the UID',
      detail: 'Flash sketch B, enroll the victim card (writes the secret sector), then send "w" over Serial and tap a Gen2 magic card to copy the UID onto it.',
      versions: ['b'],
    },
    {
      id: 'fool-weak-lock',
      title: 'Fool the weak lock',
      detail: 'Tap the clone against sketch A: it opens. Same UID, zero cryptography — this is the 60-second demo of why UID-only access control is broken.',
      versions: ['b'],
    },
    {
      id: 'harden-reader',
      title: 'Harden the reader',
      detail: 'Sketch B’s reader mode authenticates sector 1 with a custom key and checks the secret block. The original opens it; the UID-only clone is rejected as a suspected clone.',
      versions: ['b'],
    },
    {
      id: 'writeup-defenses',
      title: 'Write up the defenses',
      detail: 'Report: per-card diversified keys, challenge-response (DESFire EV2/EV3 AES), NTAG 424 SUN counters, server nonces + revocation. Note what the RC522 cannot do (DESFire AES) and why.',
      versions: ['b'],
    },
  ],
  simulator: {
    viz: 'lock',
    intro: 'Same rule as the hardened reader: the UID may match, but any failed sector check denies the card.',
    sliders: [
      { id: 'mismatch', label: 'Failed sector checks', unit: '', min: 0, max: 4, value: 0 },
      { id: 'uidok', label: 'UID matches', unit: '', min: 0, max: 1, value: 1 },
    ],
    threshold: { id: 'thr', label: 'Deny at', unit: '', min: 1, max: 2, value: 1 },
    watch: 'mismatch',
    rule: 'above',
    inclusive: true,
    actuator: 'Clone check',
    onText: 'DENY',
    offText: 'pass',
    lcd: ['UID ok, bad:{mismatch}', 'Clone:{act}'],
    demoSlider: 'mismatch',
    demoFrom: 0,
    demoTo: 2,
    barLabel: 'Failed sector checks',
  },
  code: [
    {
      id: 'a',
      label: 'A · UID dump + weak lock',
      note: 'Libraries: MFRC522, Adafruit SSD1306 + GFX. Deliberately UID-only — version B is the fix. Replace UIDs with your lab cards.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SS_PIN 5
#define RST_PIN 27
#define BUZZER 15
#define OLED_ADDR 0x3C
MFRC522 rfid(SS_PIN, RST_PIN);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
const char* whitelist[] = {"A1B2C3D4", "E5F60718"};

String readUid() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void show(const char* l1, const char* l2) {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(l1);
  oled.setTextSize(1);
  oled.setCursor(0, 30);
  oled.print(l2);
  oled.display();
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  SPI.begin();
  rfid.PCD_Init();
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  show("tap card", "UID-only lock");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  String uid = readUid();
  Serial.println("UID: " + uid);
  bool ok = false;
  for (const char* w : whitelist) if (uid == w) ok = true;
  show(ok ? "OPEN" : "DENY", uid.c_str());
  digitalWrite(BUZZER, ok ? LOW : HIGH);
  delay(ok ? 200 : 800);
  digitalWrite(BUZZER, LOW);
  rfid.PICC_HaltA();
}`,
    },
    {
      id: 'a-uno',
      label: 'A · Uno weak lock',
      note: 'Same logic on the Uno map: RC522 on D10/D9, Serial + LEDs + buzzer UI (no OLED: RAM).',
      board: 'uno',
      versions: ['a'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#define SS_PIN 10
#define RST_PIN 9
#define GREEN 7
#define RED 6
#define BUZZER 8
MFRC522 rfid(SS_PIN, RST_PIN);
const char* whitelist[] = {"A1B2C3D4", "E5F60718"};

String readUid() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void setup() {
  Serial.begin(9600);
  pinMode(GREEN, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("tap card (UID-only lock)");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  String uid = readUid();
  bool ok = false;
  for (const char* w : whitelist) if (uid == w) ok = true;
  Serial.println((ok ? String("OPEN ") : String("DENY ")) + uid);
  digitalWrite(ok ? GREEN : RED, HIGH);
  digitalWrite(BUZZER, ok ? LOW : HIGH);
  delay(ok ? 200 : 800);
  digitalWrite(GREEN, LOW);
  digitalWrite(RED, LOW);
  digitalWrite(BUZZER, LOW);
  rfid.PICC_HaltA();
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · NodeMCU weak lock',
      note: 'Same logic on the NodeMCU map: RC522 on D4/D3, OLED on D2/D1, buzzer on D8.',
      board: 'nodemcu',
      versions: ['a'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SS_PIN D4
#define RST_PIN D3
#define BUZZER D8
#define OLED_ADDR 0x3C
MFRC522 rfid(SS_PIN, RST_PIN);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
const char* whitelist[] = {"A1B2C3D4", "E5F60718"};

String readUid() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void show(const char* l1, const char* l2) {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(l1);
  oled.setTextSize(1);
  oled.setCursor(0, 30);
  oled.print(l2);
  oled.display();
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  SPI.begin();
  rfid.PCD_Init();
  Wire.begin(D2, D1);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  show("tap card", "UID-only lock");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  String uid = readUid();
  Serial.println("UID: " + uid);
  bool ok = false;
  for (const char* w : whitelist) if (uid == w) ok = true;
  show(ok ? "OPEN" : "DENY", uid.c_str());
  digitalWrite(BUZZER, ok ? LOW : HIGH);
  delay(ok ? 200 : 800);
  digitalWrite(BUZZER, LOW);
  rfid.PICC_HaltA();
}`,
    },
    {
      id: 'b',
      label: 'B · Clone + hardened reader',
      note: 'Serial commands: e = enroll victim (writes secret sector), w = clone its UID to a Gen2 magic card, r = hardened reader. Lab cards only.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SS_PIN 5
#define RST_PIN 27
#define BUZZER 15
#define OLED_ADDR 0x3C
#define SECRET_BLOCK 4   // sector 1 data
#define TRAILER 7        // sector 1 trailer
MFRC522 rfid(SS_PIN, RST_PIN);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
MFRC522::MIFARE_Key sysKey, defKey;
byte victimUid[4];
bool haveVictim = false;
char mode = 'r';

String hexUid() {
  String s = "";
  for (byte i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] < 0x10) s += "0";
    s += String(rfid.uid.uidByte[i], HEX);
  }
  s.toUpperCase();
  return s;
}

void show(const char* l1, String l2) {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(l1);
  oled.setTextSize(1);
  oled.setCursor(0, 30);
  oled.print(l2);
  oled.display();
}

bool auth(byte block, MFRC522::MIFARE_Key *key) {
  return rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A,
    block, key, &(rfid.uid)) == MFRC522::STATUS_OK;
}

void enroll() {  // tap victim card: store secret + set sector key
  memcpy(victimUid, rfid.uid.uidByte, 4);
  haveVictim = true;
  if (!auth(SECRET_BLOCK, &defKey)) { show("enroll?", "auth failed"); return; }
  byte data[16] = {'L','A','B','1',0,0,0,0,0,0,0,0,0,0,0,1};
  if (rfid.MIFARE_Write(SECRET_BLOCK, data, 16) != MFRC522::STATUS_OK) { show("enroll?", "write failed"); return; }
  byte tr[18]; byte len = sizeof(tr);
  if (!auth(TRAILER, &defKey) || rfid.MIFARE_Read(TRAILER, tr, &len) != MFRC522::STATUS_OK) {
    show("enroll?", "trailer failed"); return;
  }
  memcpy(tr, sysKey.keyByte, 6);  // swap key A, keep access bits + key B
  if (rfid.MIFARE_Write(TRAILER, tr, 16) != MFRC522::STATUS_OK) { show("enroll?", "key failed"); return; }
  show("enrolled", hexUid());
}

void cloneToGen2() {  // tap Gen2 magic card: copy victim UID into block 0
  if (!haveVictim) { show("clone?", "enroll first"); return; }
  if (!auth(0, &defKey)) { show("clone?", "auth failed"); return; }
  byte b0[18]; byte len = sizeof(b0);
  if (rfid.MIFARE_Read(0, b0, &len) != MFRC522::STATUS_OK) { show("clone?", "read failed"); return; }
  memcpy(b0, victimUid, 4);
  b0[4] = b0[0] ^ b0[1] ^ b0[2] ^ b0[3];  // BCC
  if (rfid.MIFARE_Write(0, b0, 16) != MFRC522::STATUS_OK) { show("clone?", "not a Gen2?"); return; }
  show("cloned!", hexUid());
}

void readHardened() {  // UID + sector key + secret must all pass
  String uid = hexUid();
  bool ok = false;
  if (auth(SECRET_BLOCK, &sysKey)) {
    byte buf[18]; byte len = sizeof(buf);
    if (rfid.MIFARE_Read(SECRET_BLOCK, buf, &len) == MFRC522::STATUS_OK)
      ok = buf[0] == 'L' && buf[1] == 'A' && buf[2] == 'B' && buf[3] == '1';
  }
  Serial.println((ok ? String("OPEN ") : String("DENY clone? ")) + uid);
  show(ok ? "OPEN" : "DENY?", uid);
  digitalWrite(BUZZER, ok ? LOW : HIGH);
  delay(ok ? 200 : 800);
  digitalWrite(BUZZER, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  for (byte i = 0; i < 6; i++) {
    defKey.keyByte[i] = 0xFF;
    sysKey.keyByte[i] = 0xA0 + i;  // lab key A: A0 A1 A2 A3 A4 A5
  }
  SPI.begin();
  rfid.PCD_Init();
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  Serial.println("e=enroll w=clone r=reader");
  show("reader", "tap card");
}

void loop() {
  if (Serial.available()) {
    mode = (char)Serial.read();
    show(mode == 'e' ? "enroll" : mode == 'w' ? "clone" : "reader", "tap card");
  }
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  if (rfid.uid.size != 4) { show("4-byte", "UID only"); rfid.PICC_HaltA(); return; }
  if (mode == 'e') enroll();
  else if (mode == 'w') cloneToGen2();
  else readHardened();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}`,
    },
    {
      id: 'b-uno',
      label: 'B · Uno clone + reader',
      note: 'Same enroll/clone/hardened-reader flow on the Uno map: RC522 on D10/D9, Serial + LEDs UI.',
      board: 'uno',
      versions: ['b'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#define SS_PIN 10
#define RST_PIN 9
#define GREEN 7
#define RED 6
#define BUZZER 8
#define SECRET_BLOCK 4
#define TRAILER 7
MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key sysKey, defKey;
byte victimUid[4];
bool haveVictim = false;
char mode = 'r';

String hexUid() {
  String s = "";
  for (byte i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] < 0x10) s += "0";
    s += String(rfid.uid.uidByte[i], HEX);
  }
  s.toUpperCase();
  return s;
}

bool auth(byte block, MFRC522::MIFARE_Key *key) {
  return rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A,
    block, key, &(rfid.uid)) == MFRC522::STATUS_OK;
}

void beep(bool ok) {
  digitalWrite(ok ? GREEN : RED, HIGH);
  digitalWrite(BUZZER, ok ? LOW : HIGH);
  delay(ok ? 200 : 800);
  digitalWrite(GREEN, LOW);
  digitalWrite(RED, LOW);
  digitalWrite(BUZZER, LOW);
}

void enroll() {
  memcpy(victimUid, rfid.uid.uidByte, 4);
  haveVictim = true;
  if (!auth(SECRET_BLOCK, &defKey)) { Serial.println("enroll: auth failed"); return; }
  byte data[16] = {'L','A','B','1',0,0,0,0,0,0,0,0,0,0,0,1};
  if (rfid.MIFARE_Write(SECRET_BLOCK, data, 16) != MFRC522::STATUS_OK) { Serial.println("enroll: write failed"); return; }
  byte tr[18]; byte len = sizeof(tr);
  if (!auth(TRAILER, &defKey) || rfid.MIFARE_Read(TRAILER, tr, &len) != MFRC522::STATUS_OK) {
    Serial.println("enroll: trailer failed"); return;
  }
  memcpy(tr, sysKey.keyByte, 6);
  if (rfid.MIFARE_Write(TRAILER, tr, 16) != MFRC522::STATUS_OK) { Serial.println("enroll: key failed"); return; }
  Serial.println("enrolled " + hexUid());
  beep(true);
}

void cloneToGen2() {
  if (!haveVictim) { Serial.println("clone: enroll first"); return; }
  if (!auth(0, &defKey)) { Serial.println("clone: auth failed"); return; }
  byte b0[18]; byte len = sizeof(b0);
  if (rfid.MIFARE_Read(0, b0, &len) != MFRC522::STATUS_OK) { Serial.println("clone: read failed"); return; }
  memcpy(b0, victimUid, 4);
  b0[4] = b0[0] ^ b0[1] ^ b0[2] ^ b0[3];
  if (rfid.MIFARE_Write(0, b0, 16) != MFRC522::STATUS_OK) { Serial.println("clone: not a Gen2?"); return; }
  Serial.println("cloned " + hexUid());
  beep(true);
}

void readHardened() {
  String uid = hexUid();
  bool ok = false;
  if (auth(SECRET_BLOCK, &sysKey)) {
    byte buf[18]; byte len = sizeof(buf);
    if (rfid.MIFARE_Read(SECRET_BLOCK, buf, &len) == MFRC522::STATUS_OK)
      ok = buf[0] == 'L' && buf[1] == 'A' && buf[2] == 'B' && buf[3] == '1';
  }
  Serial.println((ok ? String("OPEN ") : String("DENY clone? ")) + uid);
  beep(ok);
}

void setup() {
  Serial.begin(9600);
  pinMode(GREEN, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  for (byte i = 0; i < 6; i++) {
    defKey.keyByte[i] = 0xFF;
    sysKey.keyByte[i] = 0xA0 + i;
  }
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("e=enroll w=clone r=reader");
}

void loop() {
  if (Serial.available()) {
    mode = (char)Serial.read();
    Serial.println(mode == 'e' ? "mode: enroll" : mode == 'w' ? "mode: clone" : "mode: reader");
  }
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  if (rfid.uid.size != 4) { Serial.println("4-byte UID only"); rfid.PICC_HaltA(); return; }
  if (mode == 'e') enroll();
  else if (mode == 'w') cloneToGen2();
  else readHardened();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · NodeMCU clone + reader',
      note: 'Same flow on the NodeMCU map: RC522 on D4/D3, OLED on D2/D1, buzzer on D8.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SS_PIN D4
#define RST_PIN D3
#define BUZZER D8
#define OLED_ADDR 0x3C
#define SECRET_BLOCK 4
#define TRAILER 7
MFRC522 rfid(SS_PIN, RST_PIN);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
MFRC522::MIFARE_Key sysKey, defKey;
byte victimUid[4];
bool haveVictim = false;
char mode = 'r';

String hexUid() {
  String s = "";
  for (byte i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] < 0x10) s += "0";
    s += String(rfid.uid.uidByte[i], HEX);
  }
  s.toUpperCase();
  return s;
}

void show(const char* l1, String l2) {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(l1);
  oled.setTextSize(1);
  oled.setCursor(0, 30);
  oled.print(l2);
  oled.display();
}

bool auth(byte block, MFRC522::MIFARE_Key *key) {
  return rfid.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A,
    block, key, &(rfid.uid)) == MFRC522::STATUS_OK;
}

void enroll() {
  memcpy(victimUid, rfid.uid.uidByte, 4);
  haveVictim = true;
  if (!auth(SECRET_BLOCK, &defKey)) { show("enroll?", "auth failed"); return; }
  byte data[16] = {'L','A','B','1',0,0,0,0,0,0,0,0,0,0,0,1};
  if (rfid.MIFARE_Write(SECRET_BLOCK, data, 16) != MFRC522::STATUS_OK) { show("enroll?", "write failed"); return; }
  byte tr[18]; byte len = sizeof(tr);
  if (!auth(TRAILER, &defKey) || rfid.MIFARE_Read(TRAILER, tr, &len) != MFRC522::STATUS_OK) {
    show("enroll?", "trailer failed"); return;
  }
  memcpy(tr, sysKey.keyByte, 6);
  if (rfid.MIFARE_Write(TRAILER, tr, 16) != MFRC522::STATUS_OK) { show("enroll?", "key failed"); return; }
  show("enrolled", hexUid());
}

void cloneToGen2() {
  if (!haveVictim) { show("clone?", "enroll first"); return; }
  if (!auth(0, &defKey)) { show("clone?", "auth failed"); return; }
  byte b0[18]; byte len = sizeof(b0);
  if (rfid.MIFARE_Read(0, b0, &len) != MFRC522::STATUS_OK) { show("clone?", "read failed"); return; }
  memcpy(b0, victimUid, 4);
  b0[4] = b0[0] ^ b0[1] ^ b0[2] ^ b0[3];
  if (rfid.MIFARE_Write(0, b0, 16) != MFRC522::STATUS_OK) { show("clone?", "not a Gen2?"); return; }
  show("cloned!", hexUid());
}

void readHardened() {
  String uid = hexUid();
  bool ok = false;
  if (auth(SECRET_BLOCK, &sysKey)) {
    byte buf[18]; byte len = sizeof(buf);
    if (rfid.MIFARE_Read(SECRET_BLOCK, buf, &len) == MFRC522::STATUS_OK)
      ok = buf[0] == 'L' && buf[1] == 'A' && buf[2] == 'B' && buf[3] == '1';
  }
  Serial.println((ok ? String("OPEN ") : String("DENY clone? ")) + uid);
  show(ok ? "OPEN" : "DENY?", uid);
  digitalWrite(BUZZER, ok ? LOW : HIGH);
  delay(ok ? 200 : 800);
  digitalWrite(BUZZER, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  for (byte i = 0; i < 6; i++) {
    defKey.keyByte[i] = 0xFF;
    sysKey.keyByte[i] = 0xA0 + i;
  }
  SPI.begin();
  rfid.PCD_Init();
  Wire.begin(D2, D1);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  Serial.println("e=enroll w=clone r=reader");
  show("reader", "tap card");
}

void loop() {
  if (Serial.available()) {
    mode = (char)Serial.read();
    show(mode == 'e' ? "enroll" : mode == 'w' ? "clone" : "reader", "tap card");
  }
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  if (rfid.uid.size != 4) { show("4-byte", "UID only"); rfid.PICC_HaltA(); return; }
  if (mode == 'e') enroll();
  else if (mode == 'w') cloneToGen2();
  else readHardened();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}`,
    },
  ],
  tips: [
    { title: 'Gen1 vs Gen2', detail: 'Gen1 magic cards need a backdoor unlock sequence; Gen2 (CUID) cards accept a normal block-0 write. The lab uses Gen2 so every step is plain MFRC522 API.' },
    { title: 'Never brick a trailer blindly', detail: 'Enroll reads the sector trailer first and only swaps key A, preserving access bits. Writing a guessed trailer can lock the sector permanently.' },
    { title: 'UID is public', detail: 'Any phone with NFC reads a Classic UID in a second. Treat UIDs as usernames at best — never as passwords.' },
    { title: 'Classic is broken', detail: 'MIFARE Classic Crypto-1 fell in 2008. Production systems use DESFire EV2/EV3 AES mutual auth or NTAG 424 SUN — neither of which the RC522 can speak.' },
    { title: 'Scope in writing', detail: 'Own lab cards only, signed. A cloned dorm or office card is unauthorized access no matter the intent.' },
  ],
}
