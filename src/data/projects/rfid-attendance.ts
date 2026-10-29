import type { Project } from '../types'

export const rfidAttendance: Project = {
  slug: 'rfid-attendance',
  categoryId: 'iot',
  title: 'RFID Attendance System',
  tagline: 'Tap-in attendance with cloud log and proxy-proof rules.',
  difficulty: 'Medium',
  weeks: '1–3 weeks',
  cost: '৳2,000–3,400',
  boards: ['ESP32', 'ESP8266', 'Arduino Uno'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: true,
      note: 'RC522 is 3.3V-only: power it from the 3V3 pin and pass SS/SCK/MOSI/RST through a level shifter. Use a 16×2 I²C LCD (an OLED buffer won’t fit in 2 KB RAM). Version B needs an ESP-01 Wi-Fi link.',
    },
    esp32: { ok: true },
    nodemcu: { ok: true, note: 'Pins run out: feedback is OLED + buzzer only, no status LEDs.' },
    esp32cam: {
      ok: false,
      reason: 'RC522 SPI + RST, the RTC, display and buzzer need ~8 GPIO; the camera and SD slot leave only 2–4 usable pins.',
    },
  },
  skills: ['RFID auth', 'NTP time', 'Google Sheets', 'LCD UI'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp8266', 'arduino-uno', 'mfrc522', 'ds3231', 'ssd1306', 'lcd16x2', 'level-shifter', 'microsd', 'esp-01', 'apps-script'],
  rig: { sensor: 'rc522', extras: ['oled', 'buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Standalone logger',
      level: 'Medium · core build',
      blurb: 'RC522 + RTC + SD card: tap to log UID + timestamp, the display confirms the name.',
      points: ['Works offline (RTC+SD)', '50-student roster onboard', 'CSV export via SD'],
      weeks: '1–2 weeks',
      cost: '৳2,000–2,700',
    },
    {
      id: 'b',
      title: 'B. Cloud register',
      level: 'Medium+ · best value',
      blurb: 'Taps also go to Google Sheets via Apps Script; teacher dashboard with late flags.',
      points: ['Live Sheets register', 'Late/duplicate detection', 'Monthly % auto-calc'],
      weeks: '2–3 weeks',
      cost: '৳2,200–3,400',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850', boards: ['esp32'] },
    { name: 'NodeMCU ESP8266', qty: '1', role: 'Controller + Wi-Fi', price: '৳380–550', boards: ['nodemcu'] },
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: '4-ch logic level shifter', qty: '1', role: '5V → 3.3V for RC522 signals', price: '৳60–120', boards: ['uno'] },
    {
      name: 'ESP-01 + 5V adapter + USB programmer',
      qty: '1',
      role: 'Wi-Fi bridge to Sheets',
      price: '৳350–600',
      boards: ['uno'],
      versions: ['b'],
    },
    { name: 'RC522 RFID kit + cards', qty: '1 + 10', role: 'Reader + student cards', price: '৳350–600' },
    { name: 'DS3231 RTC', qty: '1', role: 'Accurate offline time', price: '৳180–300' },
    { name: 'MicroSD module', qty: '1', role: 'Offline log + backup', price: '৳150–280' },
    { name: '16×2 I²C LCD / OLED', qty: '1', role: 'Tap feedback', price: '৳250–550' },
    { name: 'Buzzer + LEDs + NPN transistor', qty: '1 set', role: 'OK/deny feedback', price: '৳80–150' },
    { name: 'Enclosure + stand', qty: '1', role: 'Desk terminal', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'RC522 → 3.3V / GND', to: '3V3 / GND (never 5V)' },
        { from: 'RC522 → SDA/SCK/MOSI/MISO', to: 'GPIO5 / 18 / 23 / 19' },
        { from: 'RC522 → RST', to: 'GPIO27' },
        { from: 'SD → CS', to: 'GPIO4 (MOSI/MISO/SCK shared with RC522)' },
        { from: 'DS3231 + display → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'Green / red LED →', to: 'GPIO32 / GPIO33 via 220Ω' },
        { from: 'Buzzer →', to: 'GPIO25 via NPN transistor' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'NodeMCU build',
      board: 'ESP8266 NodeMCU',
      boards: ['nodemcu'],
      pins: [
        { from: 'RC522 → 3.3V / GND', to: '3V3 / GND (never 5V)' },
        { from: 'RC522 → SDA/RST', to: 'D4 / D3 (idle HIGH: safe for boot)' },
        { from: 'RC522 → SCK/MISO/MOSI', to: 'D5 / D6 / D7' },
        { from: 'SD → CS', to: 'D8 (shared SPI; LOW at boot is fine for CS)' },
        { from: 'DS3231 + OLED → SDA/SCL', to: 'D2 / D1' },
        { from: 'Buzzer →', to: 'D0 via NPN transistor' },
      ],
    },
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'RC522 → 3.3V / GND', to: '3V3 pin / GND (never 5V)' },
        { from: 'RC522 → SDA/SCK/MOSI/RST', to: 'D10 / D13 / D11 / D9 via level shifter' },
        { from: 'RC522 → MISO', to: 'D12 direct (3.3V reads HIGH)' },
        { from: 'SD module (5V VCC) → CS', to: 'D4 (shared SPI)' },
        { from: 'DS3231 + I²C LCD → SDA/SCL', to: 'A4 / A5' },
        { from: 'Buzzer / green / red LED →', to: 'D5 / D6 / D7 (LEDs via 220Ω)' },
        { from: 'ESP-01 adapter TX → (B)', to: 'D2 (SoftwareSerial RX)' },
        { from: 'D3 → 1k/2k divider → (B)', to: 'ESP-01 adapter RX' },
        { from: 'ESP-01 adapter VCC/GND (B)', to: '5V / GND (adapter has its own 3.3V regulator)' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-board-core',
      title: 'Install the board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x). Libraries: MFRC522, RTClib, LiquidCrystal_I2C or Adafruit SSD1306.',
      boardDetail: {
        nodemcu: 'Boards Manager → esp8266 by ESP8266 Community, board “NodeMCU 1.0”. Libraries: MFRC522, RTClib, Adafruit SSD1306.',
        uno: 'Uno is built in. Libraries: MFRC522, RTClib, LiquidCrystal_I2C (SD and SoftwareSerial ship with the IDE).',
      },
    },
    {
      id: 'wire-reader-3v3',
      title: 'Wire the reader on 3.3V',
      detail: 'RC522 on 3V3 only. SDA→GPIO5, SCK→18, MOSI→23, MISO→19, RST→27. SD CS→GPIO4 on the same SPI bus; RTC + display on 21/22.',
      boardDetail: {
        nodemcu: 'RC522 on 3V3 only. SDA→D4, RST→D3, SCK/MISO/MOSI→D5/D6/D7. SD CS→D8 on the same SPI bus; RTC + OLED on D2/D1.',
        uno: 'RC522 on the 3V3 pin only. SDA→D10, SCK→D13, MOSI→D11, RST→D9 through the level shifter; MISO→D12 direct. SD CS→D4; RTC + LCD on A4/A5.',
      },
    },
    { id: 'enroll-roster', title: 'Enroll the roster', detail: 'Scan each card, record UID → name/roll in a table. Print the mapping for the report.' },
    {
      id: 'set-time-source',
      title: 'Set the time source',
      detail: 'Set the DS3231 once from your PC clock (A). In B, NTP from pool.ntp.org re-syncs it at boot. Wrong time = useless register.',
    },
    {
      id: 'tap-feedback',
      title: 'Tap → feedback',
      detail: 'Known UID: green LED + name on the display + short beep. Unknown: red LED + long deny tone. <1s response.',
      boardDetail: {
        nodemcu: 'Known UID: name on the OLED + short beep. Unknown: DENY on the OLED + long tone. <1s response.',
      },
    },
    { id: 'anti-proxy-rules', title: 'Anti-proxy rules', detail: 'Same card twice within 5 min = ignored + flagged. Entry/exit reader pair optional.' },
    {
      id: 'link-esp01-wifi',
      title: 'Add the ESP-01 Wi-Fi bridge',
      detail: 'Flash the ESP-01 with a small ESP8266 sketch that reads each CSV line at 9600 baud and sends the Sheets request. Uno prints every tap to it on D3.',
      boards: ['uno'],
      versions: ['b'],
    },
    {
      id: 'push-to-sheets',
      title: 'Cloud register',
      detail: 'Apps Script web app appends rows: date, time, UID. Sheet formulas look up the name and mark late after 09:00. SD keeps logging as backup.',
      versions: ['b'],
    },
    { id: 'demo-a-class', title: 'Demo a class', detail: '10 taps incl. 1 unknown card + 1 double-tap. Show the log (A) or live sheet rows + monthly % pivot (B).' },
  ],
  simulator: {
    viz: 'lock',
    intro: 'Same rule as the firmware: taps after the late mark are flagged LATE in the register.',
    sliders: [
      { id: 'mins', label: 'Minutes after 9:00', unit: 'min', min: 0, max: 90, value: 8 },
      { id: 'taps', label: 'Taps today', unit: '', min: 0, max: 60, value: 22 },
    ],
    threshold: { id: 'thr', label: 'Late after', unit: 'min', min: 5, max: 45, value: 15 },
    watch: 'mins',
    rule: 'above',
    actuator: 'Status',
    onText: 'LATE',
    offText: 'present',
    lcd: ['+{mins}min taps:{taps}', 'Mark:{act}'],
    demoSlider: 'mins',
    demoFrom: 0,
    demoTo: 40,
    barLabel: 'Lateness',
  },
  code: [
    {
      id: 'a',
      label: 'A · Tap logger',
      note: 'MFRC522 + RTClib + SD. Roster array maps UID to names; repeat taps within 5 min are rejected.',
      board: 'esp32',
      versions: ['a', 'b'],
      code: `#include <SPI.h>
#include <Wire.h>
#include <MFRC522.h>
#include <RTClib.h>
#include <SD.h>
#define SS_PIN 5
#define RST_PIN 27
#define SD_CS 4
#define BUZZER 25
#define LED_OK 32
#define LED_DENY 33
MFRC522 rfid(SS_PIN, RST_PIN);
RTC_DS3231 rtc;

struct Student { const char* uid; const char* name; };
const Student roster[] = {{"A1B2C3D4", "Rahim"}, {"E5F60718", "Sara"}};
const int N = sizeof(roster) / sizeof(roster[0]);
unsigned long lastTap[N];

String readUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";  // keep 2 hex digits per byte
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase(); return uid;
}

void feedback(bool ok) {
  digitalWrite(ok ? LED_OK : LED_DENY, HIGH);
  digitalWrite(BUZZER, HIGH); delay(ok ? 100 : 600);
  digitalWrite(BUZZER, LOW);
  digitalWrite(LED_OK, LOW); digitalWrite(LED_DENY, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT); pinMode(LED_OK, OUTPUT); pinMode(LED_DENY, OUTPUT);
  SPI.begin(); rfid.PCD_Init();
  Wire.begin(); rtc.begin();
  if (!SD.begin(SD_CS)) Serial.println("SD card missing");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  String uid = readUID();
  int who = -1;
  for (int i = 0; i < N; i++) if (uid == roster[i].uid) who = i;
  bool repeat = who >= 0 && lastTap[who] && millis() - lastTap[who] < 300000UL;
  if (who >= 0 && !repeat) lastTap[who] = millis();

  DateTime t = rtc.now();
  File f = SD.open("/attend.csv", FILE_APPEND);
  if (f) {
    f.printf("%04d-%02d-%02d %02d:%02d,%s,%s,%s\\n",
      t.year(), t.month(), t.day(), t.hour(), t.minute(), uid.c_str(),
      who >= 0 ? roster[who].name : "UNKNOWN", repeat ? "REPEAT" : "OK");
    f.close();
  }
  // ... display: name, or UNKNOWN / ALREADY IN ...
  feedback(who >= 0 && !repeat);
  rfid.PICC_HaltA();
  delay(1000);
}`,
    },
    {
      id: 'a-uno',
      label: 'A · Tap logger (Uno)',
      note: 'Same logger with char buffers to fit 2 KB RAM. The link.println line feeds the ESP-01 bridge in B.',
      board: 'uno',
      versions: ['a', 'b'],
      code: `#include <SPI.h>
#include <Wire.h>
#include <MFRC522.h>
#include <RTClib.h>
#include <SD.h>
#include <SoftwareSerial.h>
#define SS_PIN 10
#define RST_PIN 9
#define SD_CS 4
#define BUZZER 5
#define LED_OK 6
#define LED_DENY 7
MFRC522 rfid(SS_PIN, RST_PIN);
RTC_DS3231 rtc;
SoftwareSerial link(2, 3);  // RX, TX → ESP-01 bridge (B)

struct Student { const char* uid; const char* name; };
const Student roster[] = {{"A1B2C3D4", "Rahim"}, {"E5F60718", "Sara"}};

void setup() {
  pinMode(BUZZER, OUTPUT); pinMode(LED_OK, OUTPUT); pinMode(LED_DENY, OUTPUT);
  link.begin(9600);
  SPI.begin(); rfid.PCD_Init();
  Wire.begin(); rtc.begin();
  SD.begin(SD_CS);
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  char uid[21] = "";
  for (byte i = 0; i < rfid.uid.size; i++) sprintf(uid + 2 * i, "%02X", rfid.uid.uidByte[i]);
  const char* name = "UNKNOWN";
  for (const Student& s : roster) if (strcmp(uid, s.uid) == 0) name = s.name;

  DateTime t = rtc.now();
  char line[56];
  snprintf(line, sizeof(line), "%04d-%02d-%02d %02d:%02d,%s,%s",
    t.year(), t.month(), t.day(), t.hour(), t.minute(), uid, name);
  File f = SD.open("ATTEND.CSV", FILE_WRITE);  // FILE_WRITE appends on AVR
  if (f) { f.println(line); f.close(); }
  link.println(line);

  bool ok = strcmp(name, "UNKNOWN") != 0;
  digitalWrite(ok ? LED_OK : LED_DENY, HIGH);
  digitalWrite(BUZZER, HIGH); delay(ok ? 100 : 600); digitalWrite(BUZZER, LOW);
  digitalWrite(LED_OK, LOW); digitalWrite(LED_DENY, LOW);
  rfid.PICC_HaltA();
  delay(1000);
}`,
    },
    {
      id: 'a-nodemcu',
      label: 'A · Tap logger (NodeMCU)',
      note: 'MFRC522 + RTClib + SD + Adafruit SSD1306. RC522 SDA/RST on D4/D3, SD CS D8, RTC + OLED on D2/D1, buzzer D0. No status LEDs: the OLED shows the name, DENY or ALREADY IN.',
      board: 'nodemcu',
      versions: ['a', 'b'],
      code: `#include <SPI.h>
#include <Wire.h>
#include <MFRC522.h>
#include <RTClib.h>
#include <SD.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SS_PIN D4
#define RST_PIN D3
#define SD_CS D8
#define BUZZER D0
MFRC522 rfid(SS_PIN, RST_PIN);
RTC_DS3231 rtc;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

struct Student { const char* uid; const char* name; };
const Student roster[] = {{"A1B2C3D4", "Rahim"}, {"E5F60718", "Sara"}};
const int N = sizeof(roster) / sizeof(roster[0]);
unsigned long lastTap[N];

String readUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";  // keep 2 hex digits per byte
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase(); return uid;
}

void show(const char* big, const char* small) {  // OLED stands in for the status LEDs
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(2); oled.setCursor(0, 0); oled.print(big);
  oled.setTextSize(1); oled.setCursor(0, 32); oled.print(small);
  oled.display();
}

void feedback(bool ok) {
  digitalWrite(BUZZER, HIGH); delay(ok ? 100 : 600);
  digitalWrite(BUZZER, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  SPI.begin(); rfid.PCD_Init();  // D5/D6/D7 hardware SPI
  Wire.begin(); rtc.begin();     // D2 = SDA, D1 = SCL
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  if (!SD.begin(SD_CS)) Serial.println("SD card missing");
  show("READY", "Tap your card");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  String uid = readUID();
  int who = -1;
  for (int i = 0; i < N; i++) if (uid == roster[i].uid) who = i;
  bool repeat = who >= 0 && lastTap[who] && millis() - lastTap[who] < 300000UL;
  if (who >= 0 && !repeat) lastTap[who] = millis();

  DateTime t = rtc.now();
  File f = SD.open("/attend.csv", FILE_WRITE);  // FILE_WRITE appends on ESP8266
  if (f) {
    f.printf("%04d-%02d-%02d %02d:%02d,%s,%s,%s\\n",
      t.year(), t.month(), t.day(), t.hour(), t.minute(), uid.c_str(),
      who >= 0 ? roster[who].name : "UNKNOWN", repeat ? "REPEAT" : "OK");
    f.close();
  }
  if (who < 0) show("DENY", uid.c_str());
  else show(roster[who].name, repeat ? "ALREADY IN" : "OK");
  feedback(who >= 0 && !repeat);
  rfid.PICC_HaltA();
  delay(1000);
}`,
    },
    {
      id: 'b',
      label: 'B · Sheets push',
      note: 'Add to the A sketch: call setupCloud() in setup() and logTap(uid) after the SD write. Apps Script doGet(e) appends a row; deploy as web app, paste the URL.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const char* SCRIPT = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

void setupCloud() {
  WiFi.begin(SSID, PASS);
  configTime(6 * 3600, 0, "pool.ntp.org");  // GMT+6
  struct tm t;
  if (getLocalTime(&t, 10000))  // NTP keeps the DS3231 honest
    rtc.adjust(DateTime(t.tm_year + 1900, t.tm_mon + 1, t.tm_mday, t.tm_hour, t.tm_min, t.tm_sec));
}

void logTap(const String& uid) {
  if (WiFi.status() != WL_CONNECTED) return;  // SD already has the row
  DateTime t = rtc.now();
  char stamp[24];
  snprintf(stamp, sizeof(stamp), "&d=%04d-%02d-%02d&t=%02d:%02d:%02d",
    t.year(), t.month(), t.day(), t.hour(), t.minute(), t.second());
  HTTPClient http;
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.begin(String(SCRIPT) + "?uid=" + uid + stamp);
  http.GET(); http.end();
}
// Script appends [d, t, uid]. Sheet: =IF(TIMEVALUE(B2)>TIME(9,0,0),"LATE","present")`,
    },
    {
      id: 'b-nodemcu',
      label: 'B · Sheets push (NodeMCU)',
      note: 'Add to the NodeMCU A sketch: call setupCloud() in setup() and logTap(uid) after the SD write. HTTPS goes through WiFiClientSecure with setInsecure(); Apps Script doGet(e) appends a row as in B.',
      board: 'nodemcu',
      versions: ['b'],
      code: `#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <time.h>
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
const char* SCRIPT = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

void setupCloud() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  configTime(6 * 3600, 0, "pool.ntp.org");  // GMT+6
  struct tm t;
  if (getLocalTime(&t, 10000))  // NTP keeps the DS3231 honest
    rtc.adjust(DateTime(t.tm_year + 1900, t.tm_mon + 1, t.tm_mday, t.tm_hour, t.tm_min, t.tm_sec));
}

void logTap(const String& uid) {
  if (WiFi.status() != WL_CONNECTED) return;  // SD already has the row
  DateTime t = rtc.now();
  char stamp[24];
  snprintf(stamp, sizeof(stamp), "&d=%04d-%02d-%02d&t=%02d:%02d:%02d",
    t.year(), t.month(), t.day(), t.hour(), t.minute(), t.second());
  WiFiClientSecure client;
  client.setInsecure();  // classroom only: skips Google's certificate check
  HTTPClient http;
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.begin(client, String(SCRIPT) + "?uid=" + uid + stamp);
  http.GET(); http.end();
}
// Script appends [d, t, uid]. Sheet: =IF(TIMEVALUE(B2)>TIME(9,0,0),"LATE","present")`,
    },
  ],
  tips: [
    { title: 'Time is everything', detail: 'Sync RTC/NTP first — a register with wrong time is worthless.' },
    { title: 'Flag double-taps', detail: 'Same UID within 5 min → ignore + flag. Examiners will try it.' },
    { title: 'Keep offline backup', detail: 'Even cloud builds should log to SD — Wi-Fi dies on demo day.' },
    { title: 'Shared SPI clash', detail: 'If the RC522 stops reading once the SD module is plugged in, that module doesn’t release MISO — use one with a 74LVC125 buffer.' },
    { title: 'Privacy note', detail: 'Store UID→roll mapping, not photos. Mention it in the report.' },
  ],
}
