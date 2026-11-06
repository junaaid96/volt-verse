import type { Project } from '../types'

export const passwordVault: Project = {
  slug: 'password-vault',
  categoryId: 'cybersecurity',
  title: 'Attack-Tested Password Vault',
  tagline: 'A PIN vault that survives the brute-force rig you build to break it.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳1,400–2,200',
  boards: ['ESP32', 'Arduino Uno'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Serial UI + EEPROM storage; the hash is a labeled demo-grade FNV-1a (the Uno has no crypto engine). Rate-limit mechanics are identical.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'A 4×4 keypad needs 8 GPIO and the OLED 2 more — NodeMCU has only about 7 safe pins. Use the ESP32.',
    },
    esp32cam: {
      ok: false,
      reason: 'Only 2–4 free GPIO: not enough for a keypad plus display, and there is no USB for the attack-rig Serial link.',
    },
  },
  skills: ['Key derivation', 'Salts + peppers', 'Rate limiting', 'NVS/EEPROM'],
  scene: 'secure',
  updated: 'Nov 2026',
  sheets: ['esp32', 'arduino-uno', 'keypad-4x4', 'ssd1306', 'esp-preferences'],
  rig: { sensor: 'keypad', extras: ['oled', 'buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. PIN vault + lockout',
      level: 'Medium · core build',
      blurb: '6-digit PIN, salted hash storage, 3 secret slots over Serial, and a 60 s lockout after 5 wrong tries.',
      points: ['Salted hash storage', '3 secret slots', '5-fail lockout + alarm'],
      weeks: '2 weeks',
      cost: '৳1,400–1,800',
    },
    {
      id: 'b',
      title: 'B. Hardened + attack rig',
      level: 'Medium+ · best value',
      blurb: 'Iterated hashing with a device pepper, wipe-after-10, and a Serial brute-force script that visibly fails.',
      points: ['4k-round key derivation', 'Wipe-after-10 option', 'Measured attack failure'],
      weeks: '2–3 weeks',
      cost: '৳1,400–2,200',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + NVS + SHA-256', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller + EEPROM', price: '৳650–1,000', boards: ['uno'] },
    { name: '4×4 membrane keypad', qty: '1', role: 'PIN entry', price: '৳120–220' },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '1', role: 'Masked PIN + menus', price: '৳250–450', boards: ['esp32'] },
    { name: 'Active buzzer + red LED', qty: '1 set', role: 'Lockout alarm', price: '৳60–120' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'Keypad rows R1–R4 →', to: 'GPIO13, 14, 26, 33 (GPIO12 avoided: strapping)' },
        { from: 'Keypad cols C1–C4 →', to: 'GPIO25, 32, 16, 17 (GPIO34/35 are input-only)' },
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (3V3)' },
        { from: 'Buzzer →', to: 'GPIO15 via NPN + 1k' },
        { from: 'Red LED →', to: 'GPIO2 via 220Ω' },
      ],
    },
    {
      id: 'uno',
      label: 'Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'Keypad rows R1–R4 →', to: 'D2, D3, D4, D5' },
        { from: 'Keypad cols C1–C4 →', to: 'A0, A1, A2, A3' },
        { from: 'Buzzer →', to: 'D8 via NPN + 1k' },
        { from: 'Green LED / red LED →', to: 'D7 / D6 via 220Ω' },
        { from: 'UI →', to: 'Serial Monitor (no display: keeps RAM free)' },
      ],
    },
    {
      id: 'rig',
      label: 'Attack rig link',
      board: 'Your own vault',
      pins: [
        { from: 'Rig →', to: 'USB Serial only: the script types guesses as "auth <pin>" into YOUR vault' },
        { from: 'Scope →', to: 'Your vault, your PINs, your bench — brute-forcing anything else is unauthorized access' },
        { from: 'Evidence →', to: 'Vault logs every guess + lockout over Serial for the report appendix' },
      ],
    },
  ],
  steps: [
    {
      id: 'wire-keypad',
      title: 'Wire the keypad + feedback',
      detail: 'Keypad rows on GPIO13/14/26/33, columns on GPIO25/32/16/17, OLED on GPIO21/22, buzzer on GPIO15, LED on GPIO2.',
      boardDetail: {
        uno: 'Keypad rows on D2–D5, columns on A0–A3, buzzer on D8, LEDs on D7/D6. UI runs in the Serial Monitor.',
      },
    },
    {
      id: 'flash-vault',
      title: 'Flash the vault',
      detail: 'Flash sketch A. First boot asks for a 6-digit PIN twice, then stores only a salt + hash — the PIN itself never touches flash.',
    },
    {
      id: 'store-secrets',
      title: 'Store + recall secrets',
      detail: 'Unlock on the keypad, then use the Serial menu: "store 0 <text>" saves into a slot, "get 0" reads it back. Slots live in NVS (ESP32) or EEPROM (Uno).',
    },
    {
      id: 'test-lockout',
      title: 'Test the lockout',
      detail: 'Type 5 wrong PINs: the vault alarms and ignores input for 60 s. Confirm the OLED counts the lockout down and Serial logs each failure.',
    },
    {
      id: 'harden-kdf',
      title: 'Harden the key derivation',
      detail: 'Flash sketch B: 4,000-round hashing with a device pepper, persisted fail count, and wipe-after-10. Each guess now costs about a second by design.',
      versions: ['b'],
    },
    {
      id: 'build-rig',
      title: 'Build the attack rig',
      detail: 'Type a 10-line Python script that sends "auth 000000"…"auth 999999" over Serial at full speed against YOUR vault. Watch it eat lockouts: 10⁶ PINs × ~1 s ≈ 11+ days, and the vault wipes at 10 fails.',
      versions: ['b'],
    },
    {
      id: 'measure-failure',
      title: 'Measure the failure',
      detail: 'Run the rig for 10 minutes, count accepted vs rejected guesses from the Serial log, and extrapolate. The headline number of the report is “guesses per hour: N”.',
      versions: ['b'],
    },
    {
      id: 'report-math',
      title: 'Write the security math',
      detail: 'Report: PIN entropy (10⁶ ≈ 20 bits), why iterations alone cannot save a short PIN offline, and why the online lockout + wipe is the real defense.',
    },
  ],
  simulator: {
    viz: 'padlock',
    intro: 'Same rule as the firmware: too many wrong PIN tries arms the lockout.',
    sliders: [
      { id: 'fails', label: 'Failed tries', unit: '', min: 0, max: 8, value: 2 },
      { id: 'window', label: 'Window', unit: 'min', min: 1, max: 10, value: 5 },
    ],
    threshold: { id: 'thr', label: 'Lockout after', unit: 'tries', min: 3, max: 8, value: 5 },
    watch: 'fails',
    rule: 'above',
    inclusive: true,
    actuator: 'Lockout',
    onText: 'ARMED',
    offText: 'off',
    lcd: ['Fails:{fails}/{thr}', 'Lockout:{act}'],
    demoSlider: 'fails',
    demoFrom: 0,
    demoTo: 7,
    barLabel: 'Failed tries',
  },
  code: [
    {
      id: 'a',
      label: 'A · PIN vault + lockout',
      note: 'Libraries: Keypad, Adafruit SSD1306 + GFX. SHA-256 via built-in mbedTLS; storage via built-in Preferences (NVS).',
      board: 'esp32',
      versions: ['a'],
      code: `#include <Keypad.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>
#include "mbedtls/sha256.h"
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define MAX_FAILS 5
#define LOCKOUT_MS 60000

const byte R = 4, C = 4;
char keys[R][C] = {{'1','2','3','A'},{'4','5','6','B'},
  {'7','8','9','C'},{'*','0','#','D'}};
byte rp[R] = {13, 14, 26, 33}, cp[C] = {25, 32, 16, 17};
Keypad kp = Keypad(makeKeymap(keys), rp, cp, R, C);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
Preferences prefs;
String entry = "";
int fails = 0;
uint32_t lockUntil = 0;
bool unlocked = false;

void show(const char* l1, String l2) {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(l1);
  oled.setTextSize(1);
  oled.setCursor(0, 32);
  oled.print(l2.substring(0, 21));
  oled.display();
}

void sha256hex(const String &in, char out[65]) {
  unsigned char h[32];
  mbedtls_sha256((const unsigned char *)in.c_str(), in.length(), h, 0);
  for (int i = 0; i < 32; i++) sprintf(out + i * 2, "%02x", h[i]);
}

bool checkPin(const String &pin) {
  char got[65];
  sha256hex(prefs.getString("salt", "") + pin, got);
  return prefs.getString("hash", "") == String(got);
}

void enroll(const String &pin) {
  String salt = String((unsigned long)esp_random(), HEX);
  char h[65];
  sha256hex(salt + pin, h);
  prefs.putString("salt", salt);
  prefs.putString("hash", String(h));
}

void serialMenu() {
  if (!Serial.available()) return;
  String line = Serial.readStringUntil('\\n');
  line.trim();
  if (!unlocked) { Serial.println("locked: unlock on keypad first"); return; }
  if (line.startsWith("store ")) {
    int slot = line.charAt(6) - '0';
    String text = line.substring(8);
    if (slot >= 0 && slot <= 2 && text.length() > 0 && text.length() <= 64) {
      prefs.putString(("s" + String(slot)).c_str(), text);
      Serial.println("stored");
    } else Serial.println("use: store <0-2> <text>");
  } else if (line.startsWith("get ")) {
    int slot = line.charAt(4) - '0';
    Serial.println(slot >= 0 && slot <= 2 ? prefs.getString(("s" + String(slot)).c_str(), "(empty)") : "use: get <0-2>");
  } else Serial.println("cmds: store <0-2> <text> | get <0-2>");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  prefs.begin("vault", false);
  Serial.println(prefs.getString("hash", "") == "" ? "first boot: set 6-digit PIN (# = enter)" : "vault ready: enter PIN");
  show("vault", prefs.getString("hash", "") == "" ? "set PIN:" : "enter PIN:");
}

void loop() {
  serialMenu();
  if (millis() < lockUntil) {
    show("LOCKOUT", String((lockUntil - millis()) / 1000) + "s left");
    digitalWrite(BUZZER, HIGH);
    char k = kp.getKey();
    if (k) Serial.println("guess during lockout: ignored");
    return;
  }
  digitalWrite(BUZZER, LOW);
  digitalWrite(LED, unlocked ? HIGH : LOW);

  char k = kp.getKey();
  if (!k) return;
  if (k == '*') { entry = ""; unlocked = false; show("vault", "enter PIN:"); }
  else if (k == '#') {
    if (prefs.getString("hash", "") == "") {  // first boot enroll
      if (entry.length() == 6) { enroll(entry); show("vault", "PIN set!"); Serial.println("PIN set"); }
      else show("vault", "need 6 digits");
    } else if (checkPin(entry)) {
      fails = 0; unlocked = true;
      show("OPEN", "serial: store/get");
      Serial.println("unlock OK");
    } else {
      fails++;
      Serial.printf("deny (%d/%d)\\n", fails, MAX_FAILS);
      show("DENY", String(fails) + "/" + String(MAX_FAILS));
      if (fails >= MAX_FAILS) { lockUntil = millis() + LOCKOUT_MS; fails = 0; }
    }
    entry = "";
  } else if (k >= '0' && k <= '9' && entry.length() < 12) {
    entry += k;
    String mask = "";
    for (size_t i = 0; i < entry.length(); i++) mask += "*";
    show("vault", mask);
  }
}`,
    },
    {
      id: 'a-uno',
      label: 'A · Uno vault',
      note: 'Same vault on the Uno map: keypad on D2–D5 / A0–A3, Serial UI, EEPROM storage. Hash is demo-grade FNV-1a — labeled, not cryptographic.',
      board: 'uno',
      versions: ['a'],
      code: `#include <Keypad.h>
#include <EEPROM.h>
#define GREEN 7
#define RED 6
#define BUZZER 8
#define MAX_FAILS 5
#define LOCKOUT_MS 60000
#define E_SALT 0
#define E_HASH 4
#define E_FLAG 8
#define E_SLOT 16

const byte R = 4, C = 4;
char keys[R][C] = {{'1','2','3','A'},{'4','5','6','B'},
  {'7','8','9','C'},{'*','0','#','D'}};
byte rp[R] = {2, 3, 4, 5}, cp[C] = {A0, A1, A2, A3};
Keypad kp = Keypad(makeKeymap(keys), rp, cp, R, C);
String entry = "";
int fails = 0;
uint32_t lockUntil = 0;
bool unlocked = false;

// DEMO hash, not cryptographic: FNV-1a shows salt+hash mechanics.
// The ESP32 build uses real SHA-256; nothing here is brute-force resistant offline.
uint32_t fnv(const String &s, uint32_t salt) {
  uint32_t h = 2166136261UL ^ salt;
  for (size_t i = 0; i < s.length(); i++) { h ^= (uint8_t)s[i]; h *= 16777619UL; }
  return h;
}

bool enrolled() { byte f; EEPROM.get(E_FLAG, f); return f == 0xA5; }

bool checkPin(const String &pin) {
  uint32_t salt, want;
  EEPROM.get(E_SALT, salt);
  EEPROM.get(E_HASH, want);
  return fnv(pin, salt) == want;
}

void enroll(const String &pin) {
  uint32_t salt = ((uint32_t)analogRead(A5) << 16) | micros();
  uint32_t h = fnv(pin, salt);
  EEPROM.put(E_SALT, salt);
  EEPROM.put(E_HASH, h);
  EEPROM.put(E_FLAG, (byte)0xA5);
}

void serialMenu() {
  if (!Serial.available()) return;
  String line = Serial.readStringUntil('\\n');
  line.trim();
  if (!unlocked) { Serial.println("locked: unlock on keypad first"); return; }
  if (line.startsWith("store ")) {
    int slot = line.charAt(6) - '0';
    String text = line.substring(8);
    if (slot >= 0 && slot <= 2 && text.length() > 0 && text.length() <= 23) {
      char buf[24] = {0};
      text.toCharArray(buf, sizeof(buf));
      for (int i = 0; i < 24; i++) EEPROM.put(E_SLOT + slot * 24 + i, buf[i]);
      Serial.println("stored");
    } else Serial.println("use: store <0-2> <text, max 23>");
  } else if (line.startsWith("get ")) {
    int slot = line.charAt(4) - '0';
    if (slot < 0 || slot > 2) { Serial.println("use: get <0-2>"); return; }
    char buf[24];
    for (int i = 0; i < 24; i++) EEPROM.get(E_SLOT + slot * 24 + i, buf[i]);
    buf[23] = 0;
    Serial.println(String(buf));
  } else Serial.println("cmds: store <0-2> <text> | get <0-2>");
}

void setup() {
  Serial.begin(9600);
  pinMode(GREEN, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  randomSeed(analogRead(A5));
  Serial.println(enrolled() ? "vault ready: enter PIN" : "first boot: set 6-digit PIN (# = enter)");
}

void loop() {
  serialMenu();
  if (millis() < lockUntil) {
    digitalWrite(BUZZER, HIGH);
    digitalWrite(RED, HIGH);
    char k = kp.getKey();
    if (k) Serial.println("guess during lockout: ignored");
    return;
  }
  digitalWrite(BUZZER, LOW);
  digitalWrite(RED, LOW);
  digitalWrite(GREEN, unlocked ? HIGH : LOW);

  char k = kp.getKey();
  if (!k) return;
  if (k == '*') { entry = ""; unlocked = false; Serial.println("locked"); }
  else if (k == '#') {
    if (!enrolled()) {
      if (entry.length() == 6) { enroll(entry); Serial.println("PIN set"); }
      else Serial.println("need 6 digits");
    } else if (checkPin(entry)) {
      fails = 0; unlocked = true;
      Serial.println("unlock OK");
    } else {
      fails++;
      Serial.print("deny (");
      Serial.print(fails);
      Serial.println("/5)");
      if (fails >= MAX_FAILS) { lockUntil = millis() + LOCKOUT_MS; fails = 0; }
    }
    entry = "";
  } else if (k >= '0' && k <= '9' && entry.length() < 12) {
    entry += k;
    Serial.println(String("*") + entry.length() + "/6");
  }
}`,
    },
    {
      id: 'b',
      label: 'B · Hardened + attack log',
      note: '4,000-round salted KDF with device pepper, persisted fails, wipe-after-10. Attack your OWN vault over Serial with "auth <pin>" guesses.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <Keypad.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>
#include "mbedtls/sha256.h"
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define ROUNDS 4000
#define LOCK_FAILS 5
#define WIPE_AFTER 10
#define LOCKOUT_MS 60000

const byte R = 4, C = 4;
char keys[R][C] = {{'1','2','3','A'},{'4','5','6','B'},
  {'7','8','9','C'},{'*','0','#','D'}};
byte rp[R] = {13, 14, 26, 33}, cp[C] = {25, 32, 16, 17};
Keypad kp = Keypad(makeKeymap(keys), rp, cp, R, C);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
Preferences prefs;
String entry = "";
uint32_t lockUntil = 0;
bool unlocked = false;

void show(const char* l1, String l2) {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(l1);
  oled.setTextSize(1);
  oled.setCursor(0, 32);
  oled.print(l2.substring(0, 21));
  oled.display();
}

String pepper() { return String((uint64_t)ESP.getEfuseMac(), HEX); }

void kdf(const String &pin, const String &salt, char out[65]) {
  unsigned char h[32];
  String material = salt + pin + pepper();
  for (int r = 0; r < ROUNDS; r++) {
    mbedtls_sha256((const unsigned char *)material.c_str(), material.length(), h, 0);
    char hex[65];
    for (int i = 0; i < 32; i++) sprintf(hex + i * 2, "%02x", h[i]);
    material = String(hex) + String(r);
  }
  for (int i = 0; i < 32; i++) sprintf(out + i * 2, "%02x", h[i]);
}

bool enrolled() { return prefs.getString("hash", "") != ""; }

void enroll(const String &pin) {
  String salt = String((unsigned long)esp_random(), HEX);
  char h[65];
  kdf(pin, salt, h);
  prefs.putString("salt", salt);
  prefs.putString("hash", String(h));
  prefs.putInt("fails", 0);
}

// Returns: 1 = ok, 0 = deny, -1 = locked out. Every path is logged.
int tryPin(const String &pin, bool fromRig) {
  if (millis() < lockUntil) {
    Serial.printf("ATTACK guess=%s result=locked\\n", fromRig ? pin.c_str() : "keypad");
    return -1;
  }
  char got[65];
  kdf(pin, prefs.getString("salt", ""), got);
  if (prefs.getString("hash", "") == String(got)) {
    prefs.putInt("fails", 0);
    unlocked = true;
    Serial.println(fromRig ? "ATTACK result=OPEN (your own vault!)" : "unlock OK");
    show("OPEN", "serial: store/get");
    return 1;
  }
  int fails = prefs.getInt("fails", 0) + 1;
  prefs.putInt("fails", fails);
  Serial.printf("ATTACK guess=%s result=deny fails=%d\\n", fromRig ? pin.c_str() : "keypad", fails);
  show("DENY", String(fails) + "/" + String(WIPE_AFTER));
  if (fails >= WIPE_AFTER) {
    prefs.clear();  // wipe everything: hash, salt, slots
    show("WIPED", "re-enroll PIN");
    Serial.println("WIPE: 10 fails, vault erased");
  } else if (fails % LOCK_FAILS == 0) {
    lockUntil = millis() + LOCKOUT_MS;
  }
  return 0;
}

void serialMenu() {
  if (!Serial.available()) return;
  String line = Serial.readStringUntil('\\n');
  line.trim();
  if (line.startsWith("auth ")) { tryPin(line.substring(5), true); return; }
  if (!unlocked) { Serial.println("locked: unlock on keypad first (or auth <pin>)"); return; }
  if (line.startsWith("store ")) {
    int slot = line.charAt(6) - '0';
    String text = line.substring(8);
    if (slot >= 0 && slot <= 2 && text.length() > 0 && text.length() <= 64) {
      prefs.putString(("s" + String(slot)).c_str(), text);
      Serial.println("stored");
    } else Serial.println("use: store <0-2> <text>");
  } else if (line.startsWith("get ")) {
    int slot = line.charAt(4) - '0';
    Serial.println(slot >= 0 && slot <= 2 ? prefs.getString(("s" + String(slot)).c_str(), "(empty)") : "use: get <0-2>");
  } else Serial.println("cmds: auth <pin> | store <0-2> <text> | get <0-2>");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  prefs.begin("vault", false);
  Serial.println("hardened vault: auth <pin> = rig interface (your vault only)");
  show("vault", enrolled() ? "enter PIN:" : "set PIN:");
}

void loop() {
  serialMenu();
  if (millis() < lockUntil) {
    show("LOCKOUT", String((lockUntil - millis()) / 1000) + "s left");
    digitalWrite(BUZZER, HIGH);
    char k = kp.getKey();
    if (k) Serial.println("guess during lockout: ignored");
    return;
  }
  digitalWrite(BUZZER, LOW);
  digitalWrite(LED, unlocked ? HIGH : LOW);

  char k = kp.getKey();
  if (!k) return;
  if (k == '*') { entry = ""; unlocked = false; show("vault", "enter PIN:"); }
  else if (k == '#') {
    if (!enrolled()) {
      if (entry.length() == 6) { enroll(entry); show("vault", "PIN set!"); Serial.println("PIN set"); }
      else show("vault", "need 6 digits");
    } else tryPin(entry, false);
    entry = "";
  } else if (k >= '0' && k <= '9' && entry.length() < 12) {
    entry += k;
    String mask = "";
    for (size_t i = 0; i < entry.length(); i++) mask += "*";
    show("vault", mask);
  }
}`,
    },
    {
      id: 'b-uno',
      label: 'B · Uno hardened vault',
      note: 'Same rate-limit story on the Uno: persisted fails, escalating lockout, wipe-after-10, "auth <pin>" rig interface. Delay-throttled demo hash.',
      board: 'uno',
      versions: ['b'],
      code: `#include <Keypad.h>
#include <EEPROM.h>
#define GREEN 7
#define RED 6
#define BUZZER 8
#define LOCK_FAILS 5
#define WIPE_AFTER 10
#define LOCKOUT_MS 60000
#define GUESS_MS 1000   // throttle: every guess costs 1 s by design
#define E_SALT 0
#define E_HASH 4
#define E_FLAG 8
#define E_FAILS 9
#define E_SLOT 16

const byte R = 4, C = 4;
char keys[R][C] = {{'1','2','3','A'},{'4','5','6','B'},
  {'7','8','9','C'},{'*','0','#','D'}};
byte rp[R] = {2, 3, 4, 5}, cp[C] = {A0, A1, A2, A3};
Keypad kp = Keypad(makeKeymap(keys), rp, cp, R, C);
String entry = "";
uint32_t lockUntil = 0;
bool unlocked = false;

uint32_t fnv(const String &s, uint32_t salt) {
  uint32_t h = 2166136261UL ^ salt;
  for (size_t i = 0; i < s.length(); i++) { h ^= (uint8_t)s[i]; h *= 16777619UL; }
  return h;
}

bool enrolled() { byte f; EEPROM.get(E_FLAG, f); return f == 0xA5; }
int loadFails() { byte f; EEPROM.get(E_FAILS, f); return f > WIPE_AFTER ? 0 : f; }
void saveFails(int n) { EEPROM.put(E_FAILS, (byte)n); }

void enroll(const String &pin) {
  uint32_t salt = ((uint32_t)analogRead(A5) << 16) | micros();
  EEPROM.put(E_SALT, salt);
  EEPROM.put(E_HASH, fnv(pin, salt));
  EEPROM.put(E_FLAG, (byte)0xA5);
  saveFails(0);
}

void wipe() {
  for (int i = 0; i < 88; i++) EEPROM.put(i, (byte)0);
  Serial.println("WIPE: 10 fails, vault erased");
}

int tryPin(const String &pin, bool fromRig) {
  if (millis() < lockUntil) {
    Serial.print("ATTACK guess=");
    Serial.print(fromRig ? pin : "keypad");
    Serial.println(" result=locked");
    return -1;
  }
  delay(GUESS_MS);  // throttle BEFORE the check: rig pays full price per guess
  uint32_t salt, want;
  EEPROM.get(E_SALT, salt);
  EEPROM.get(E_HASH, want);
  if (fnv(pin, salt) == want) {
    saveFails(0);
    unlocked = true;
    Serial.println(fromRig ? "ATTACK result=OPEN (your own vault!)" : "unlock OK");
    return 1;
  }
  int fails = loadFails() + 1;
  saveFails(fails);
  Serial.print("ATTACK guess=");
  Serial.print(fromRig ? pin : "keypad");
  Serial.print(" result=deny fails=");
  Serial.println(fails);
  if (fails >= WIPE_AFTER) wipe();
  else if (fails % LOCK_FAILS == 0) lockUntil = millis() + LOCKOUT_MS;
  return 0;
}

void serialMenu() {
  if (!Serial.available()) return;
  String line = Serial.readStringUntil('\\n');
  line.trim();
  if (line.startsWith("auth ")) { tryPin(line.substring(5), true); return; }
  if (!unlocked) { Serial.println("locked: unlock first (or auth <pin>)"); return; }
  if (line.startsWith("store ")) {
    int slot = line.charAt(6) - '0';
    String text = line.substring(8);
    if (slot >= 0 && slot <= 2 && text.length() > 0 && text.length() <= 23) {
      char buf[24] = {0};
      text.toCharArray(buf, sizeof(buf));
      for (int i = 0; i < 24; i++) EEPROM.put(E_SLOT + slot * 24 + i, buf[i]);
      Serial.println("stored");
    } else Serial.println("use: store <0-2> <text, max 23>");
  } else if (line.startsWith("get ")) {
    int slot = line.charAt(4) - '0';
    if (slot < 0 || slot > 2) { Serial.println("use: get <0-2>"); return; }
    char buf[24];
    for (int i = 0; i < 24; i++) EEPROM.get(E_SLOT + slot * 24 + i, buf[i]);
    buf[23] = 0;
    Serial.println(String(buf));
  } else Serial.println("cmds: auth <pin> | store <0-2> <text> | get <0-2>");
}

void setup() {
  Serial.begin(9600);
  pinMode(GREEN, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.println("hardened vault: auth <pin> = rig interface (your vault only)");
}

void loop() {
  serialMenu();
  if (millis() < lockUntil) {
    digitalWrite(BUZZER, HIGH);
    digitalWrite(RED, HIGH);
    char k = kp.getKey();
    if (k) Serial.println("guess during lockout: ignored");
    return;
  }
  digitalWrite(BUZZER, LOW);
  digitalWrite(RED, LOW);
  digitalWrite(GREEN, unlocked ? HIGH : LOW);

  char k = kp.getKey();
  if (!k) return;
  if (k == '*') { entry = ""; unlocked = false; Serial.println("locked"); }
  else if (k == '#') {
    if (!enrolled()) {
      if (entry.length() == 6) { enroll(entry); Serial.println("PIN set"); }
      else Serial.println("need 6 digits");
    } else tryPin(entry, false);
    entry = "";
  } else if (k >= '0' && k <= '9' && entry.length() < 12) {
    entry += k;
  }
}`,
    },
  ],
  tips: [
    { title: 'Never store the PIN', detail: 'Salt + hash only. If your storage dump contains anything a thief can type, the design is wrong.' },
    { title: 'Short PINs need online defense', detail: '10⁶ PINs fall to any offline GPU in under a second of hashing — iterations only buy time online. The lockout + wipe is the real vault door.' },
    { title: 'Persist the fail count', detail: 'A counter that resets on reboot is a lockout that loses to the reset button. Version B keeps fails in NVS/EEPROM.' },
    { title: 'Pepper binds the device', detail: 'Mixing the eFuse MAC into the hash means a stolen flash dump will not crack on another board.' },
    { title: 'Rig ethics', detail: 'The brute-force script touches your vault and nothing else. Keep the scope note in the report appendix.' },
  ],
}
