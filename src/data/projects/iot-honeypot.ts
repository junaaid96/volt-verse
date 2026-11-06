import type { Project } from '../types'

export const iotHoneypot: Project = {
  slug: 'iot-honeypot',
  categoryId: 'cybersecurity',
  title: 'IoT Honeypot Node',
  tagline: 'A fake login that logs whoever knocks — deception on a desk budget.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳900–1,600',
  boards: ['ESP32'],
  defaultBoard: 'esp32',
  support: {
    uno: {
      ok: false,
      reason: 'No Wi-Fi radio: the Uno cannot host the bait access point or web login.',
    },
    esp32: { ok: true },
    nodemcu: {
      ok: false,
      reason: 'The guide targets the ESP32 WebServer + WiFiServer combo; the ESP8266 port is untested and Espressif marks the chip NRND (not for new designs).',
    },
    esp32cam: {
      ok: false,
      reason: 'No USB for flashing and too few free pins for the OLED + buzzer once the camera is attached.',
    },
  },
  skills: ['Deception', 'Honeypots', 'ATT&CK mapping', 'Log analysis'],
  scene: 'secure',
  updated: 'Nov 2026',
  sheets: ['esp32', 'ssd1306', 'cowrie-docs', 'mitre-attack', 'owasp-iot'],
  rig: { sensor: 'oled', extras: ['buzzer'] },
  options: [
    {
      id: 'a',
      title: 'A. Fake web login',
      level: 'Medium · core build',
      blurb: 'Open bench AP serving a fake router login; every attempt is logged with IP, user and password, and bursts trip the alarm.',
      points: ['Bench-only bait AP', 'Credential logging', 'Burst alarm + OLED'],
      weeks: '2 weeks',
      cost: '৳900–1,200',
    },
    {
      id: 'b',
      title: 'B. Multi-service trap',
      level: 'Medium+ · best value',
      blurb: 'Adds a fake Telnet login on port 23, per-IP tracking with a top-offender display, and a Cowrie pairing path on a PC.',
      points: ['Web + Telnet traps', 'Per-IP offender table', 'Cowrie + ATT&CK mapping'],
      weeks: '2–3 weeks',
      cost: '৳900–1,600',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit V1', qty: '1', role: 'Bait AP + web/telnet traps + logger', price: '৳470–850' },
    { name: '0.96" SSD1306 OLED (I²C)', qty: '1', role: 'Knock counts + top offender', price: '৳250–450' },
    { name: 'Active buzzer + red LED', qty: '1 set', role: 'Intrusion alarm', price: '৳60–120' },
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
        { from: 'Buzzer →', to: 'GPIO15 via NPN + 1k' },
        { from: 'Red LED →', to: 'GPIO2 via 220Ω (onboard LED pin — doubles as alarm light)' },
        { from: 'Silence button →', to: 'GPIO0 to GND (BOOT button doubles as the input — no extra wiring)' },
        { from: 'ESP32 VIN / GND', to: 'USB 5V / common GND' },
      ],
    },
    {
      id: 'lab',
      label: 'Lab network setup',
      board: 'Your own bench',
      pins: [
        { from: 'Honeypot AP →', to: 'Open SSID "HONEYPOT-LAB" hosted by the ESP32 itself — join it only with YOUR laptop/phone' },
        { from: 'Isolation →', to: 'Never bridge the bait AP to the internet or a campus network; deception that touches others is out of scope' },
        { from: 'Attacker →', to: 'Your own Kali VM or laptop running Nmap + login attempts against YOUR honeypot IP (192.168.4.1)' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-core',
      title: 'Install arduino-esp32 3.x',
      detail: 'Boards Manager → esp32 by Espressif 3.3.x. The traps use the core WebServer and WiFiServer libraries — no extra installs beyond the OLED libraries.',
    },
    {
      id: 'wire-feedback',
      title: 'Wire the feedback',
      detail: 'OLED on GPIO21/22, buzzer on GPIO15 through an NPN transistor, alarm LED on GPIO2. The BOOT button (GPIO0) silences the alarm without clearing the log.',
    },
    {
      id: 'flash-bait',
      title: 'Flash the bait',
      detail: 'Flash sketch A and join "HONEYPOT-LAB" with your phone. Open 192.168.4.1: a fake router login appears. Every submit is logged over Serial with IP, username and password — the login always fails.',
    },
    {
      id: 'invite-scans',
      title: 'Attack your own trap',
      detail: 'From YOUR laptop on the bait AP, run Nmap against 192.168.4.1 and try common logins (admin/admin) in the browser. Watch the OLED knock counter climb and the alarm trip past 5 attempts per window.',
    },
    {
      id: 'add-telnet',
      title: 'Add the Telnet trap',
      detail: 'Flash sketch B: port 23 now answers with a fake "LabRouter login:" prompt. Probe it with telnet or nc from your own machine and confirm each guess lands in the Serial log with the source IP.',
      versions: ['b'],
    },
    {
      id: 'track-offenders',
      title: 'Track per-IP offenders',
      detail: 'Sketch B keeps a per-IP table (up to 8 addresses) and shows the top offender on the OLED. Scan from two of your own devices and confirm both appear with independent counts.',
      versions: ['b'],
    },
    {
      id: 'map-attack',
      title: 'Map knocks to ATT&CK',
      detail: 'Label each observed technique with its MITRE ATT&CK ID: port scan (T1046), brute force (T1110), valid-account probing (T1078). Tabulate technique → count → first-seen time for the report.',
    },
    {
      id: 'cowrie-next',
      title: 'Graduate to Cowrie (optional)',
      detail: 'On a lab PC, run the Cowrie SSH/Telnet honeypot in Docker and compare its JSON logs with the ESP32 Serial log: same deception idea, production-grade tooling. Keep it on the bench network only.',
      versions: ['b'],
    },
  ],
  simulator: {
    viz: 'lock',
    intro: 'Same rule as the firmware: login knocks past the threshold inside one 5-minute window trip the intrusion alarm.',
    sliders: [
      { id: 'knocks', label: 'Login knocks', unit: '/5m', min: 0, max: 60, value: 6 },
      { id: 'ips', label: 'Unique IPs', unit: '', min: 0, max: 8, value: 1 },
    ],
    threshold: { id: 'thr', label: 'Alarm above', unit: '/5m', min: 3, max: 30, value: 5 },
    watch: 'knocks',
    rule: 'above',
    actuator: 'Alarm',
    onText: 'INTRUSION',
    offText: 'quiet',
    lcd: ['Knocks:{knocks}/5m', 'Alarm:{act}'],
    demoSlider: 'knocks',
    demoFrom: 0,
    demoTo: 30,
    barLabel: 'Login knocks / 5 min',
  },
  code: [
    {
      id: 'a',
      label: 'A · Fake web login',
      note: 'Libraries: Adafruit SSD1306 + GFX. Open AP on purpose — the bait must be easy to find. Never bridge it to the internet.',
      board: 'esp32',
      versions: ['a'],
      code: `#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define AP_SSID "HONEYPOT-LAB"  // bench-only bait: never bridge this to the internet
#define ALARM_KNOCKS 5          // attempts per window that trip the alarm
#define WINDOW_MS 300000        // 5-minute window

WebServer server(80);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
uint32_t knocks = 0, windowKnocks = 0, windowStart = 0;
String lastUser = "-", lastIP = "-";

const char LOGIN_PAGE[] PROGMEM = R"page(
<!doctype html><html><body>
<h2>LabRouter Admin</h2>
<form method="POST" action="/login">
User <input name="user"><br>Pass <input name="pass" type="password"><br>
<input type="submit" value="Login">
</form></body></html>
)page";

void handleLogin() {
  String user = server.arg("user");
  String pass = server.arg("pass");
  String ip = server.client().remoteIP().toString();
  knocks++;
  windowKnocks++;
  lastUser = user.length() ? user : "(empty)";
  lastIP = ip;
  Serial.printf("KNOCK #%lu from %s user='%s' pass='%s'\\n",
    (unsigned long)knocks, ip.c_str(), user.c_str(), pass.c_str());
  if (windowKnocks >= ALARM_KNOCKS) {
    digitalWrite(BUZZER, HIGH);
    digitalWrite(LED, HIGH);
  }
  server.send(200, "text/html", "<h2>Login failed</h2><a href=\\"/\\">retry</a>");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(0, INPUT_PULLUP);  // BOOT button = silence alarm
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID);  // open on purpose: the bait must be easy to find
  Serial.print("Honeypot up at ");
  Serial.println(WiFi.softAPIP());
  server.on("/", []() { server.send_P(200, "text/html", LOGIN_PAGE); });
  server.on("/login", HTTP_POST, handleLogin);
  server.begin();
  windowStart = millis();
}

void loop() {
  server.handleClient();
  if (millis() - windowStart >= WINDOW_MS) {
    windowStart = millis();
    windowKnocks = 0;
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED, LOW);
  }
  if (digitalRead(0) == LOW) {  // silence the alarm, keep the log
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED, LOW);
  }
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(windowKnocks >= ALARM_KNOCKS ? "INTRUSION" : "listening");
  oled.setTextSize(1);
  oled.setCursor(0, 24);
  oled.printf("knocks %lu total", (unsigned long)knocks);
  oled.setCursor(0, 36);
  oled.printf("last %s", lastIP.c_str());
  oled.setCursor(0, 48);
  oled.printf("user %s", lastUser.c_str());
  oled.display();
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · Multi-service trap',
      note: 'Adds a fake Telnet login on port 23 plus a per-IP offender table. Probe it only from your own machines on the bait AP.',
      board: 'esp32',
      versions: ['b'],
      code: `#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define OLED_ADDR 0x3C
#define BUZZER 15
#define LED 2
#define AP_SSID "HONEYPOT-LAB"  // bench-only bait: never bridge this to the internet
#define ALARM_KNOCKS 5
#define WINDOW_MS 300000

WebServer server(80);
WiFiServer trap(23);  // fake Telnet login
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
uint32_t knocks = 0, windowKnocks = 0, windowStart = 0;
String lastUser = "-", lastIP = "-";
WiFiClient intruder;
String line, tUser;
uint8_t stage = 0;  // 0 idle, 1 want user, 2 want pass
String ips[8];
uint16_t hits[8] = { 0 };
uint8_t nip = 0;

const char LOGIN_PAGE[] PROGMEM = R"page(
<!doctype html><html><body>
<h2>LabRouter Admin</h2>
<form method="POST" action="/login">
User <input name="user"><br>Pass <input name="pass" type="password"><br>
<input type="submit" value="Login">
</form></body></html>
)page";

void recordIP(const String &ip) {
  for (uint8_t i = 0; i < nip; i++)
    if (ips[i] == ip) { hits[i]++; return; }
  if (nip < 8) { ips[nip] = ip; hits[nip] = 1; nip++; }
}

void knock(const String &ip, const String &user, const String &pass, const char *via) {
  knocks++;
  windowKnocks++;
  lastUser = user.length() ? user : "(empty)";
  lastIP = ip;
  recordIP(ip);
  Serial.printf("%s KNOCK #%lu from %s user='%s' pass='%s'\\n",
    via, (unsigned long)knocks, ip.c_str(), user.c_str(), pass.c_str());
  if (windowKnocks >= ALARM_KNOCKS) {
    digitalWrite(BUZZER, HIGH);
    digitalWrite(LED, HIGH);
  }
}

void handleLogin() {
  knock(server.client().remoteIP().toString(), server.arg("user"), server.arg("pass"), "WEB");
  server.send(200, "text/html", "<h2>Login failed</h2><a href=\\"/\\">retry</a>");
}

void pollTelnet() {
  if (!intruder || !intruder.connected()) {
    intruder = trap.available();
    if (intruder) { stage = 1; line = ""; intruder.print("LabRouter login: "); }
    return;
  }
  while (intruder.available()) {
    char c = intruder.read();
    if (c == '\\r') continue;
    if (c != '\\n') {
      if (line.length() < 32) line += c;
      continue;
    }
    if (stage == 1) {
      tUser = line;
      stage = 2;
      intruder.print("Password: ");
    } else if (stage == 2) {
      knock(intruder.remoteIP().toString(), tUser, line, "TELNET");
      intruder.println("Login incorrect");
      stage = 1;
      intruder.print("LabRouter login: ");
    }
    line = "";
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(0, INPUT_PULLUP);  // BOOT button = silence alarm
  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  oled.setTextColor(SSD1306_WHITE);
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID);
  Serial.print("Honeypot up at ");
  Serial.println(WiFi.softAPIP());
  server.on("/", []() { server.send_P(200, "text/html", LOGIN_PAGE); });
  server.on("/login", HTTP_POST, handleLogin);
  server.begin();
  trap.begin();
  windowStart = millis();
}

void loop() {
  server.handleClient();
  pollTelnet();
  if (millis() - windowStart >= WINDOW_MS) {
    windowStart = millis();
    windowKnocks = 0;
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED, LOW);
  }
  if (digitalRead(0) == LOW) {
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED, LOW);
  }
  uint8_t top = 0;
  for (uint8_t i = 1; i < nip; i++)
    if (hits[i] > hits[top]) top = i;
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(windowKnocks >= ALARM_KNOCKS ? "INTRUSION" : "listening");
  oled.setTextSize(1);
  oled.setCursor(0, 24);
  oled.printf("knocks %lu ips %u", (unsigned long)knocks, nip);
  oled.setCursor(0, 36);
  oled.print(nip ? ips[top] : "no knocks yet");
  if (nip) {
    oled.setCursor(0, 48);
    oled.printf("top offender x%u", hits[top]);
  }
  oled.display();
  delay(200);
}`,
    },
  ],
  tips: [
    { title: 'Bench only, always', detail: 'The bait AP is open so your own test devices can reach it. Never bridge it to the internet or a shared network — deception that touches other people is out of scope.' },
    { title: 'Attack yourself first', detail: 'A honeypot nobody tests teaches nothing. Nmap it, guess logins, and telnet at it from your own laptop — every probe should appear in the Serial log.' },
    { title: 'Logs are the deliverable', detail: 'Timestamp, source IP, service, username and password per knock. The report table matters more than the hardware photo.' },
    { title: 'Map to ATT&CK', detail: 'Scans (T1046), brute force (T1110) and account probing (T1078) turn a knock list into analyst vocabulary employers recognize.' },
    { title: 'Mind the consent', detail: 'Get supervisor sign-off that running a credential-capturing trap on the lab bench is in scope before you power it on.' },
  ],
}
