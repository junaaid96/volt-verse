import type { Project } from '../types'

export const smartDoorLock: Project = {
  slug: 'smart-door-lock',
  categoryId: 'iot',
  title: 'Smart Door Lock (RFID + OTP)',
  tagline: 'Tap-to-unlock with PIN fallback and phone OTP for guests.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳2,400–4,000',
  boards: ['ESP32', 'Arduino + ESP8266'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'Keypad is wired as 4×3 (column 4 unused) to free a pin for the buzzer. Version B needs an ESP-01 link flashed with its own Firebase bridge sketch.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'RC522 needs 5 SPI pins and a 4×4 keypad 8 more — NodeMCU has only about 7 safe GPIO. Use the ESP32.',
    },
    esp32cam: {
      ok: false,
      reason: 'Only 2–4 free GPIO: not enough for RC522 SPI plus a keypad, and there is no USB for flashing.',
    },
  },
  skills: ['RFID auth', 'Keypad/PIN', 'Firebase', 'Solenoid control'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32', 'arduino-uno', 'mfrc522', 'firebase-docs'],
  rig: { sensor: 'rc522', extras: ['keypad', 'solenoid'] },
  options: [
    {
      id: 'a',
      title: 'A. RFID + PIN lock',
      level: 'Medium · core build',
      blurb: 'RC522 cards plus a 4×4 keypad PIN. Solenoid unlocks for 5s; buzzer + OLED feedback.',
      points: ['Whitelist of card UIDs', 'PIN fallback for lost cards', 'Tamper alarm after 3 fails'],
      weeks: '2 weeks',
      cost: '৳2,400–3,200',
    },
    {
      id: 'b',
      title: 'B. OTP guest access',
      level: 'Medium+ · best value',
      blurb: 'Firebase-backed one-time PINs: host generates an OTP in the app, guest enters it on the keypad.',
      points: ['Time-limited guest codes', 'Entry log in cloud', 'Remote lock/unlock'],
      weeks: '3 weeks',
      cost: '৳2,800–4,000',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'Arduino Uno R3', qty: '1', role: 'Controller', price: '৳650–1,000', boards: ['uno'] },
    { name: 'ESP-01 + 3V3 adapter', qty: '1', role: 'Wi-Fi bridge for the Uno', price: '৳250–400', boards: ['uno'], versions: ['b'] },
    { name: '4-ch level shifter', qty: '1', role: 'RC522 5V → 3V3 lines', price: '৳40–80', boards: ['uno'] },
    { name: 'RC522 RFID kit', qty: '1', role: 'Cards + reader', price: '৳250–450' },
    { name: '4×4 keypad', qty: '1', role: 'PIN entry', price: '৳120–220' },
    { name: 'Solenoid lock 12V (fail-secure)', qty: '1', role: 'Door bolt', price: '৳500–900' },
    { name: 'Logic-level MOSFET (IRLZ44N) + 1N4007', qty: '1 set', role: 'Lock driver + flyback', price: '৳80–200' },
    { name: 'OLED + active buzzer', qty: '1 set', role: 'Feedback', price: '৳400–600' },
    { name: '12V 2A supply + 5V buck', qty: '1', role: 'Lock + logic power', price: '৳350–600' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'RC522 → SDA/SCK/MOSI/MISO', to: 'GPIO5 / 18 / 23 / 19 (VSPI)' },
        { from: 'RC522 → RST / 3V3', to: 'GPIO27 / 3V3 (never 5V)' },
        { from: 'Keypad rows R1–R4 →', to: 'GPIO13, 14, 26, 33 (Keypad lib enables pull-ups; GPIO12 avoided: strapping)' },
        { from: 'Keypad cols C1–C4 →', to: 'GPIO25, 32, 16, 17 (GPIO34/35 are input-only)' },
        { from: 'Lock MOSFET gate →', to: 'GPIO4 via 100Ω, 10k gate pull-down (IRF520 boards don’t switch fully at 3V3)' },
        { from: 'OLED → SDA / SCL', to: 'GPIO21 / GPIO22 (3V3)' },
        { from: 'Buzzer →', to: 'GPIO15 via NPN + 1k (strapping pin; a LOW at boot only mutes the boot log)' },
        { from: 'ESP32 VIN / GND', to: 'Buck 5V / common GND' },
      ],
    },
    {
      id: 'uno',
      label: 'Uno + ESP link',
      board: 'Arduino + ESP8266',
      boards: ['uno'],
      pins: [
        { from: 'RC522 → SDA / RST', to: 'D10 / D9 via level shifter' },
        { from: 'RC522 → SCK/MOSI/MISO', to: 'D13 / D11 (via shifter) / D12 (direct)' },
        { from: 'RC522 → 3V3', to: 'Uno 3V3 (~26 mA, within its limit)' },
        { from: 'Keypad rows R1–R4 →', to: 'D2, D3, D4, D5' },
        { from: 'Keypad cols C1–C3 →', to: 'A0, A1, A2 (C4 unused: A–D keys not needed)' },
        { from: 'Buzzer →', to: 'A3 via NPN + 1k' },
        { from: 'OLED → SDA / SCL', to: 'A4 / A5' },
        { from: 'Lock MOSFET gate →', to: 'D7 via 100Ω, 10k gate pull-down' },
        { from: 'ESP-01 TX → (B)', to: 'D8 (SoftwareSerial RX, 9600 baud)' },
        { from: 'ESP-01 RX → (B)', to: 'D6 via 1k/2k divider (SoftwareSerial TX)' },
        { from: 'ESP-01 VCC (B)', to: 'Adapter 3V3 regulator (Uno 3V3 pin can’t supply it)' },
      ],
    },
    {
      id: 'power',
      label: '12V lock power',
      board: '12V supply',
      pins: [
        { from: '12V + →', to: 'Solenoid + and buck input' },
        { from: 'Solenoid − →', to: 'MOSFET drain (source to GND)' },
        { from: '1N4007 →', to: 'Across the solenoid, stripe to 12V +' },
        { from: 'Buck 5V out →', to: 'ESP32 VIN or Uno 5V pin' },
        { from: 'All GND →', to: 'One common ground point' },
      ],
    },
  ],
  steps: [
    {
      id: 'read-card-uids',
      title: 'Read card UIDs',
      detail: 'Run sketch A with the Serial Monitor open, tap each card and copy its printed UID into the whitelist array.',
    },
    {
      id: 'add-keypad-pin',
      title: 'Add keypad PIN',
      detail: 'Rows on GPIO13, 14, 26, 33, columns on GPIO25, 32, 16, 17. 4-digit PIN with * clear and # enter; mask digits on the OLED.',
      boardDetail: {
        uno: 'Rows on D2–D5, columns on A0–A2 (column 4 unused). 4-digit PIN with * clear and # enter; mask digits on the OLED.',
      },
    },
    {
      id: 'drive-solenoid',
      title: 'Drive the solenoid',
      detail: 'Logic-level MOSFET gate on GPIO4 with a 10k pull-down. Unlock 5s, then re-lock. 1N4007 flyback diode across the lock.',
      boardDetail: {
        uno: 'Logic-level MOSFET gate on D7 with a 10k pull-down. Unlock 5s, then re-lock. 1N4007 flyback diode across the lock.',
      },
    },
    {
      id: 'fail-state-logic',
      title: 'Fail-state logic',
      detail: '3 wrong tries → 30s lockout + buzzer alarm on GPIO15. Log every attempt with timestamps.',
      boardDetail: {
        uno: '3 wrong tries → 30s lockout + buzzer alarm on A3. Log every attempt over Serial (the Uno has no clock).',
      },
    },
    {
      id: 'setup-esp01-bridge',
      title: 'Flash the ESP-01 bridge',
      detail: 'Flash the ESP-01 with a small sketch that joins Wi-Fi + Firebase. The Uno sends the typed code on D6, the ESP replies OK/NO on D8.',
      boards: ['uno'],
      versions: ['b'],
    },
    {
      id: 'cloud-otp',
      title: 'Cloud OTP',
      detail: 'Firebase node /otp holds code + exp (Unix seconds). Keypad checks the local PIN first, then the live OTP, and expires it after one use.',
      versions: ['b'],
    },
    {
      id: 'mount-demo',
      title: 'Mount + demo',
      detail: 'Wooden door mockup, inside/outside sides labeled. Demo: card, PIN, guest OTP, tamper alarm.',
    },
  ],
  simulator: {
    viz: 'padlock',
    intro: 'Same rule as the firmware: too many wrong PIN tries inside the window triggers lockout.',
    sliders: [
      { id: 'fails', label: 'Failed tries', unit: '', min: 0, max: 8, value: 1 },
      { id: 'window', label: 'Window', unit: 'min', min: 1, max: 10, value: 5 },
    ],
    threshold: { id: 'thr', label: 'Lockout after', unit: 'tries', min: 2, max: 6, value: 3 },
    watch: 'fails',
    rule: 'above',
    inclusive: true,
    actuator: 'Lockout',
    onText: 'ARMED',
    offText: 'off',
    lcd: ['Fails:{fails}/{thr}', 'Lockout:{act}'],
    demoSlider: 'fails',
    demoFrom: 0,
    demoTo: 5,
    barLabel: 'Failed tries',
  },
  code: [
    {
      id: 'a',
      label: 'A · RFID + PIN',
      note: 'Libraries: MFRC522, Keypad (+ Adafruit SSD1306 for the OLED). Replace UIDs with your cards.',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <Keypad.h>
#define SS_PIN 5
#define RST_PIN 27
#define LOCK 4
#define BUZZER 15
MFRC522 rfid(SS_PIN, RST_PIN);
const char* whitelist[] = {"A1B2C3D4", "E5F60718"};
String PIN = "1234", entry = "";
int fails = 0;

const byte R = 4, C = 4;
char keys[R][C] = {{'1','2','3','A'},{'4','5','6','B'},
  {'7','8','9','C'},{'*','0','#','D'}};
byte rp[R] = {13, 14, 26, 33}, cp[C] = {25, 32, 16, 17};
Keypad kp = Keypad(makeKeymap(keys), rp, cp, R, C);

void unlock() { fails = 0; digitalWrite(LOCK, HIGH); delay(5000); digitalWrite(LOCK, LOW); }

String readUid() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";  // keep 2 hex digits per byte
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void setup() {
  Serial.begin(115200);
  pinMode(LOCK, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  SPI.begin(); rfid.PCD_Init();
}

void loop() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = readUid();
    Serial.println(uid);
    bool ok = false;
    for (const char* w : whitelist) if (uid == w) ok = true;
    if (ok) unlock(); else fails++;
    rfid.PICC_HaltA();
  }
  char k = kp.getKey();
  if (k == '#') { if (entry == PIN) unlock(); else fails++; entry = ""; }
  else if (k == '*') entry = "";
  else if (k) entry += k;
  if (fails >= 3) {  // 30 s lockout, alarm for the first 3 s
    digitalWrite(BUZZER, HIGH); delay(3000);
    digitalWrite(BUZZER, LOW); delay(27000);
    fails = 0;
  }
}`,
    },
    {
      id: 'a-uno',
      label: 'A · Uno RFID + PIN',
      note: 'Same logic on the Uno map: RC522 on D10/D9, keypad 4×3 on D2–D5 / A0–A2, lock on D7, buzzer on A3.',
      board: 'uno',
      versions: ['a', 'b'],
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <Keypad.h>
#define SS_PIN 10
#define RST_PIN 9
#define LOCK 7
#define BUZZER A3
MFRC522 rfid(SS_PIN, RST_PIN);
const char* whitelist[] = {"A1B2C3D4", "E5F60718"};
String PIN = "1234", entry = "";
int fails = 0;

const byte R = 4, C = 3;
char keys[R][C] = {{'1','2','3'},{'4','5','6'},{'7','8','9'},{'*','0','#'}};
byte rp[R] = {2, 3, 4, 5}, cp[C] = {A0, A1, A2};
Keypad kp = Keypad(makeKeymap(keys), rp, cp, R, C);

void unlock() { fails = 0; digitalWrite(LOCK, HIGH); delay(5000); digitalWrite(LOCK, LOW); }

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
  pinMode(LOCK, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  SPI.begin(); rfid.PCD_Init();
}

void loop() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = readUid();
    Serial.println(uid);
    bool ok = false;
    for (const char* w : whitelist) if (uid == w) ok = true;
    if (ok) unlock(); else fails++;
    rfid.PICC_HaltA();
  }
  char k = kp.getKey();
  if (k == '#') { if (entry == PIN) unlock(); else fails++; entry = ""; }
  else if (k == '*') entry = "";
  else if (k) entry += k;
  if (fails >= 3) {
    digitalWrite(BUZZER, HIGH); delay(3000);
    digitalWrite(BUZZER, LOW); delay(27000);
    fails = 0;
  }
}`,
    },
    {
      id: 'b',
      label: 'B · Firebase OTP check',
      note: 'Paste at the top of the A sketch (A uses its globals), then call setupOTP() at the end of setup(), app.loop() in loop(), and on # unlock when entry == PIN || checkOTP(entry). Library: FirebaseClient by mobizt. Database-secret auth is deprecated — use Email/Password sign-in: create a lock@class.edu user, write /otp {code, exp}.',
      board: 'esp32',
      versions: ['b'],
      code: `#define ENABLE_USER_AUTH
#define ENABLE_DATABASE
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASS "YOUR_PASS"
#define API_KEY "YOUR_WEB_API_KEY"     // Project settings
#define USER_EMAIL "lock@class.edu"
#define USER_PASS "STRONG_PASS_8+"
#define DATABASE_URL "https://your-project-default-rtdb.firebaseio.com"

WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
RealtimeDatabase Database;
AsyncResult authResult;

void setupOTP() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  ssl_client.setInsecure();   // classroom only; use certs in production
  initializeApp(aClient, app, getAuth(user_auth), authResult);
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  configTime(6 * 3600, 0, "pool.ntp.org");  // expiry needs a clock
}

bool checkOTP(String entry) {
  app.loop();
  if (!app.ready()) return false;
  String code = Database.get<String>(aClient, "/otp/code");
  int exp = Database.get<int>(aClient, "/otp/exp");   // Unix seconds
  if (code.length() == 0 || entry != code || time(nullptr) >= exp) return false;
  Database.set<int>(aClient, "/otp/exp", 0);           // one use only
  return true;
}
// in A's loop(): app.loop(); and on '#': if (entry == PIN || checkOTP(entry)) unlock();`,
    },
  ],
  tips: [
    { title: 'Fail secure', detail: 'Power loss must keep the door locked — use a fail-secure solenoid.' },
    { title: 'Debounce keys', detail: 'Keypad ghosting ruins demos; the Keypad lib debounce defaults are fine.' },
    { title: 'Log entries', detail: 'UID + timestamp to LittleFS or Firebase makes a strong report appendix.' },
    { title: 'Shield the reader', detail: 'Mount RC522 away from the solenoid — its coil desensitizes RFID.' },
    { title: 'Mind Uno RAM', detail: 'On the Uno, drive the OLED with U8x8 text mode — Adafruit SSD1306 alone takes half of its 2 KB RAM.' },
  ],
}
