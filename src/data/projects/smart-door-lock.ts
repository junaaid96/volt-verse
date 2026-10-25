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
  skills: ['RFID auth', 'Keypad/PIN', 'Firebase', 'Solenoid control'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32', 'mfrc522', 'firebase-docs'],
  rig: { sensor: 'rc522', extras: ['keypad'] },
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
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'RC522 RFID kit', qty: '1', role: 'Cards + reader', price: '৳250–450' },
    { name: '4×4 keypad', qty: '1', role: 'PIN entry', price: '৳120–220' },
    { name: 'Solenoid lock 12V', qty: '1', role: 'Door bolt', price: '৳500–900' },
    { name: 'Relay / MOSFET module', qty: '1', role: 'Lock driver', price: '৳100–250' },
    { name: 'OLED + buzzer', qty: '1 set', role: 'Feedback', price: '৳400–600' },
    { name: '12V supply + buck', qty: '1', role: 'Lock + logic power', price: '৳350–600' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'RC522 → SDA/SCK/MOSI/MISO', to: 'GPIO5/18/23/19 (SPI)' },
        { from: 'RC522 → RST/3V3', to: 'GPIO27 / 3V3 (never 5V)' },
        { from: 'Keypad rows →', to: 'GPIO13,14,26,33 (inputs; GPIO12 avoided: boot strapping)' },
        { from: 'Keypad cols →', to: 'GPIO25,32,16,17 (outputs; GPIO34/35 are input-only)' },
        { from: 'Lock driver →', to: 'GPIO4 (via relay/MOSFET + flyback diode)' },
        { from: 'OLED → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'Buzzer →', to: 'GPIO15 via transistor' },
      ],
    },
    {
      id: 'uno',
      label: 'Uno + ESP link',
      board: 'Arduino + ESP8266',
      pins: [
        { from: 'RC522 → SDA/RST', to: 'D10 / D9 (SPI bus)' },
        { from: 'Keypad rows/cols →', to: 'D2–D5 / A0–A3' },
        { from: 'Lock relay →', to: 'D7' },
        { from: 'ESP link →', to: 'SoftwareSerial D8/D6' },
      ],
    },
  ],
  steps: [
    { title: 'Read card UIDs', detail: 'Run the RC522 dump example, collect your cards UIDs, and hard-code a whitelist array.' },
    { title: 'Add keypad PIN', detail: '4-digit PIN with * clear and # enter. Mask digits on the OLED as you type.' },
    { title: 'Drive the solenoid', detail: 'Relay/MOSFET from GPIO4. Unlock 5s, then re-lock. Add a flyback diode across the lock.' },
    { title: 'Fail-state logic', detail: '3 wrong tries → 30s lockout + buzzer alarm. Log every attempt with timestamps.' },
    { title: 'Cloud OTP (B)', detail: 'Firebase node /otp holds code + expiry. Keypad checks local PIN first, then live OTP.' },
    { title: 'Mount + demo', detail: 'Wooden door mockup, inside/outside sides labeled. Demo: card, PIN, guest OTP, tamper alarm.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: too many wrong PIN tries inside the window triggers lockout.',
    sliders: [
      { id: 'fails', label: 'Failed tries', unit: '', min: 0, max: 8, value: 1 },
      { id: 'window', label: 'Window', unit: 'min', min: 1, max: 10, value: 5 },
    ],
    threshold: { id: 'thr', label: 'Lockout after', unit: 'tries', min: 2, max: 6, value: 3 },
    watch: 'fails',
    rule: 'above',
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
      note: 'Libraries: MFRC522, Keypad, Adafruit SSD1306. Replace UIDs with your cards.',
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <Keypad.h>
#define SS_PIN 5
#define RST_PIN 27
#define LOCK 4
MFRC522 rfid(SS_PIN, RST_PIN);
String whitelist[] = {"A1B2C3D4", "E5F60718"};
String PIN = "1234", entry = "";
int fails = 0;

const byte R = 4, C = 4;
char keys[R][C] = {{'1','2','3','A'},{'4','5','6','B'},
  {'7','8','9','C'},{'*','0','#','D'}};
byte rp[R] = {13,14,26,33}, cp[C] = {25,32,16,17};
Keypad kp = Keypad(makeKeymap(keys), rp, cp, R, C);

void unlock() { digitalWrite(LOCK, HIGH); delay(5000); digitalWrite(LOCK, LOW); }

void setup() {
  SPI.begin(); rfid.PCD_Init();
  pinMode(LOCK, OUTPUT);
}

void loop() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++) uid += String(rfid.uid.uidByte[i], HEX);
    uid.toUpperCase();
    bool ok = false;
    for (auto w : whitelist) if (w == uid) ok = true;
    if (ok) unlock(); else fails++;
    rfid.PICC_HaltA();
  }
  char k = kp.getKey();
  if (k == '#') { if (entry == PIN) unlock(); else fails++; entry = ""; }
  else if (k == '*') entry = "";
  else if (k) entry += k;
  if (fails >= 3) { delay(30000); fails = 0; }  // lockout
}`,
    },
    {
      id: 'b',
      label: 'B · Firebase OTP check',
      note: 'Library: FirebaseClient by mobizt. Database-secret auth is deprecated — use Email/Password sign-in: create a lock@class.edu user, write /otp {code, exp}.',
      code: `#define ENABLE_USER_AUTH
#define ENABLE_DATABASE
#include <FirebaseClient.h>
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASS "YOUR_PASS"
#define API_KEY "YOUR_WEB_API_KEY"     // Project settings
#define USER_EMAIL "lock@class.edu"
#define USER_PASS "STRONG_PASS_8+"
#define DATABASE_URL "https://your-project-default-rtdb.firebaseio.com"

SSL_CLIENT ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
RealtimeDatabase Database;

void setup() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  ssl_client.setInsecure();   // classroom only; use certs in production
  initializeApp(aClient, app, getAuth(user_auth));
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  configTime(6 * 3600, 0, "pool.ntp.org");  // expiry needs a clock
}

bool checkOTP(String entry) {
  app.loop();
  if (!app.ready()) return false;
  String code = Database.get<String>(aClient, "/otp/code");
  int64_t exp = Database.get<int64_t>(aClient, "/otp/exp");
  return entry == code && time(nullptr) < exp;
}
// call: if (entry == PIN || checkOTP(entry)) unlock();`,
    },
  ],
  tips: [
    { title: 'Fail secure', detail: 'Power loss must keep the door locked — use a fail-secure solenoid.' },
    { title: 'Debounce keys', detail: 'Keypad ghosting ruins demos; the Keypad lib debounce defaults are fine.' },
    { title: 'Log entries', detail: 'UID + timestamp to SPIFFS or Firebase makes a strong report appendix.' },
    { title: 'Shield the reader', detail: 'Mount RC522 away from the solenoid — its coil desensitizes RFID.' },
  ],
}
