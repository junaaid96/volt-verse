import type { Project } from '../types'

export const rfidAttendance: Project = {
  slug: 'rfid-attendance',
  categoryId: 'iot',
  title: 'RFID Attendance System',
  tagline: 'Tap-in attendance with cloud log and proxy-proof rules.',
  difficulty: 'Medium',
  weeks: '2 weeks',
  cost: '৳2,000–3,400',
  boards: ['ESP32', 'ESP8266'],
  skills: ['RFID auth', 'NTP time', 'Google Sheets', 'LCD UI'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32', 'mfrc522', 'ds3231'],
  rig: { sensor: 'rc522', extras: ['oled'] },
  options: [
    {
      id: 'a',
      title: 'A. Standalone logger',
      level: 'Medium · core build',
      blurb: 'RC522 + RTC + SD card: tap to log UID + timestamp, OLED confirms the name.',
      points: ['Works offline (RTC+SD)', '50-student roster onboard', 'CSV export via SD'],
      weeks: '1–2 weeks',
      cost: '৳2,000–2,700',
    },
    {
      id: 'b',
      title: 'B. Cloud register',
      level: 'Medium+ · best value',
      blurb: 'ESP32 pushes taps to Google Sheets via Apps Script; teacher dashboard with late flags.',
      points: ['Live Sheets register', 'Late/duplicate detection', 'Monthly % auto-calc'],
      weeks: '2–3 weeks',
      cost: '৳2,200–3,400',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'RC522 RFID kit + cards', qty: '1 + 10', role: 'Reader + student cards', price: '৳350–600' },
    { name: 'DS3231 RTC', qty: '1', role: 'Accurate time (A)', price: '৳180–300' },
    { name: 'MicroSD module', qty: '1', role: 'Offline log (A)', price: '৳150–280' },
    { name: '16×2 LCD / OLED', qty: '1', role: 'Tap feedback', price: '৳250–550' },
    { name: 'Buzzer + LEDs', qty: '1 set', role: 'OK/deny feedback', price: '৳80–150' },
    { name: 'Enclosure + stand', qty: '1', role: 'Desk terminal', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'RC522 → SDA/SCK/MOSI/MISO', to: 'GPIO5/18/23/19' },
        { from: 'RC522 → RST', to: 'GPIO27' },
        { from: 'DS3231 → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'SD → CS/MOSI/MISO/SCK', to: 'GPIO4 / shared SPI' },
        { from: 'Buzzer →', to: 'GPIO15' },
      ],
    },
    {
      id: 'nodemcu',
      label: 'ESP8266 build',
      board: 'ESP8266 NodeMCU',
      pins: [
        { from: 'RC522 → SDA/RST', to: 'D4 / D3 (idle HIGH: safe for boot)' },
        { from: 'RC522 → SCK/MISO/MOSI', to: 'D5 / D6 / D7' },
        { from: 'DS3231 → SDA/SCL', to: 'D2 / D1' },
        { from: 'Buzzer →', to: 'D8 via transistor (D8 LOW at boot: keep idle LOW)' },
      ],
    },
  ],
  steps: [
    { title: 'Enroll the roster', detail: 'Scan each card, record UID → name/roll in a table. Print the mapping for the report.' },
    { title: 'Time source', detail: 'DS3231 for offline (A) or NTP pool.ntp.org for cloud (B). Wrong time = useless register.' },
    { title: 'Tap → feedback', detail: 'Known UID: green + name on LCD + beep. Unknown: red + deny tone. <1s response.' },
    { title: 'Anti-proxy rules', detail: 'Same card twice within 5 min = ignored + flagged. Entry/exit reader pair optional.' },
    { title: 'Cloud register (B)', detail: 'Apps Script web app appends rows: timestamp, UID, name, status. Sheet formulas mark late after 09:00.' },
    { title: 'Demo a class', detail: '10 taps incl. 1 unknown card + 1 double-tap. Show live sheet rows + monthly % pivot.' },
  ],
  simulator: {
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
      note: 'MFRC522 + DS3231 + SD. Roster array maps UID to names.',
      code: `#include <SPI.h>
#include <MFRC522.h>
#include <RTClib.h>
#include <SD.h>
#define SS_PIN 5
#define RST_PIN 27
MFRC522 rfid(SS_PIN, RST_PIN);
RTC_DS3231 rtc;

struct Student { String uid; String name; };
Student roster[] = {{"A1B2C3D4", "Rahim"}, {"E5F60718", "Sara"}};

String readUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) uid += String(rfid.uid.uidByte[i], HEX);
  uid.toUpperCase(); return uid;
}

void setup() {
  SPI.begin(); rfid.PCD_Init(); rtc.begin();
  SD.begin(4);
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;
  String uid = readUID();
  String name = "UNKNOWN";
  for (auto s : roster) if (s.uid == uid) name = s.name;
  DateTime t = rtc.now();
  File f = SD.open("/attend.csv", FILE_APPEND);
  f.printf("%04d-%02d-%02d %02d:%02d,%s,%s\\n",
    t.year(), t.month(), t.day(), t.hour(), t.minute(),
    uid.c_str(), name.c_str());
  f.close();
  // ... LCD: name + OK beep, or UNKNOWN + deny tone ...
  rfid.PICC_HaltA();
  delay(1000);
}`,
    },
    {
      id: 'b',
      label: 'B · Sheets push',
      note: 'Apps Script doGet(uid) appends a row. Deploy as web app, paste URL.',
      code: `#include <WiFi.h>
#include <HTTPClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
const char* SCRIPT = "https://script.google.com/macros/s/XXX/exec";
WiFiUDP ntpUDP;
NTPClient clock(ntpUDP, "pool.ntp.org", 6 * 3600);  // GMT+6

void logTap(String uid) {
  clock.update();
  HTTPClient http;
  http.begin(String(SCRIPT) + "?uid=" + uid + "&t=" + clock.getFormattedTime());
  http.GET(); http.end();
}
// Sheet: =IF(TIMEVALUE(B2)>TIME(9,0,0),"LATE","present")`,
    },
  ],
  tips: [
    { title: 'Time is everything', detail: 'Sync RTC/NTP first — a register with wrong time is worthless.' },
    { title: 'Flag double-taps', detail: 'Same UID within 5 min → ignore + flag. Examiners will try it.' },
    { title: 'Keep offline backup', detail: 'Even cloud builds should log to SD — Wi-Fi dies on demo day.' },
    { title: 'Privacy note', detail: 'Store UID→roll mapping, not photos. Mention it in the report.' },
  ],
}
