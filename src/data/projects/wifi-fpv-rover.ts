import type { Project } from '../types'

export const wifiFpvRover: Project = {
  slug: 'wifi-fpv-rover',
  categoryId: 'robotics',
  title: 'Wi-Fi FPV Rover',
  tagline: 'Camera rover you drive from a phone browser with live video.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳1,800–3,300',
  boards: ['ESP32-CAM', 'ESP32'],
  defaultBoard: 'esp32cam',
  support: {
    uno: {
      ok: false,
      reason: 'No camera interface and no Wi-Fi for video streaming; the rover needs both on one board.',
    },
    esp32: { ok: true, note: 'Same drive UI without the camera: /shot and /stream answer 501, motors get PWM speed.' },
    nodemcu: {
      ok: false,
      reason: 'No camera port and far too little RAM for MJPEG frames; use the ESP32-CAM build instead.',
    },
    esp32cam: { ok: true, note: 'Full build: snapshot teleop (A) plus MJPEG stream, sonar auto-stop and flash (B).' },
  },
  skills: ['Wi-Fi servers', 'MJPEG video', 'Motor driving', 'Obstacle stop'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32cam', 'esp32', 'hcsr04', 'l298n'],
  rig: { sensor: 'chassis', extras: ['sonic', 'oled'] },
  options: [
    {
      id: 'a',
      title: 'A. Snapshot teleop',
      level: 'Medium · easiest',
      blurb: 'Drive from a phone browser: auto-refreshing snapshots plus F/B/L/R/S buttons over plain WiFiServer HTTP.',
      points: ['Phone-browser driving', 'Auto-refresh snapshots', 'L298N tank steering'],
      weeks: '1–2 weeks',
      cost: '৳1,800–3,000',
    },
    {
      id: 'b',
      title: 'B. Stream + auto-stop',
      level: 'Medium · best value',
      blurb: 'Adds a live MJPEG stream, sonar auto-stop under 25cm and a flash/headlight toggle.',
      points: ['Live MJPEG /stream', 'Sonar auto-stop', 'Flash toggle'],
      weeks: '2–3 weeks',
      cost: '৳2,000–3,300',
    },
  ],
  parts: [
    { name: 'ESP32-CAM (AI-THINKER)', qty: '1', role: 'Controller + camera', price: '৳550–900', boards: ['esp32cam'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller (no camera)', price: '৳470–850', boards: ['esp32'] },
    { name: 'FTDI USB-to-serial programmer', qty: '1', role: 'Flash the ESP32-CAM', price: '৳150–300', boards: ['esp32cam'] },
    { name: '2WD chassis kit (frame + 2 motors + wheels + caster)', qty: '1', role: 'Drive base', price: '৳450–800' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'HC-SR04 ultrasonic', qty: '1', role: 'Auto-stop eye', price: '৳120–250', versions: ['b'] },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'ECHO 5V → 3.3V divider', price: '৳10–30', versions: ['b'] },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Motor + board power', price: '৳300–600' },
    { name: 'Jumpers + standoffs', qty: '1 set', role: 'Wiring + camera mount', price: '৳100–250' },
  ],
  wiring: [
    {
      id: 'esp32cam',
      label: 'ESP32-CAM build',
      board: 'ESP32-CAM (AI-THINKER)',
      boards: ['esp32cam'],
      pins: [
        { from: 'L298N IN1 / IN2 (left motor)', to: 'GPIO12 / GPIO13 (ENA jumper ON — GPIO12 boots low)' },
        { from: 'L298N IN3 / IN4 (right motor)', to: 'GPIO14 / GPIO15 (ENB jumper ON)' },
        { from: 'HC-SR04 → TRIG / ECHO (B)', to: 'GPIO2 / GPIO16 via 1k/2k divider' },
        { from: 'Flash LED (B)', to: 'GPIO4 (onboard flash, sketch toggles it)' },
        { from: 'Camera', to: 'Onboard (PWDN32 XCLK0 SIOD26 SIOC27, D0–D7: 5/18/19/21/36/39/34/35)' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'L298N ENA / IN1 / IN2 (left motor)', to: 'GPIO25 / GPIO26 / GPIO27 (jumpers OFF, PWM speed)' },
        { from: 'L298N IN3 / IN4 / ENB (right motor)', to: 'GPIO14 / GPIO13 / GPIO23' },
        { from: 'HC-SR04 → TRIG / ECHO (B)', to: 'GPIO32 / GPIO34 via 1k/2k divider' },
        { from: 'Headlight LED (B)', to: 'GPIO2 (DevKit onboard LED, sketch toggles it)' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V pin (battery ≤ 12V only)' },
        { from: 'Common GND', to: 'board GND + L298N GND + sensor GND' },
      ],
    },
    {
      id: 'ftdi',
      label: 'ESP32-CAM flashing rig',
      board: 'FTDI programmer',
      boards: ['esp32cam'],
      pins: [
        { from: 'FTDI 5V / GND', to: 'CAM 5V / GND' },
        { from: 'FTDI TX / RX', to: 'CAM U0R / U0T (GPIO3 / GPIO1, crossed)' },
        { from: 'CAM GPIO0', to: 'GND while flashing, remove after upload' },
      ],
    },
  ],
  steps: [
    {
      id: 'assemble-chassis',
      title: 'Assemble the 2WD chassis',
      detail: 'Bolt the motors, wheels, caster and top plate together. Keep the front half of the plate clear: the camera needs an unobstructed view.',
    },
    {
      id: 'mount-camera-board',
      title: 'Mount the controller board',
      detail: 'Seat the ESP32-CAM on standoffs at the front, lens facing forward and level. Route the L298N wires underneath so they never cross the lens.',
      boardDetail: {
        esp32: 'Seat the ESP32 DevKit mid-plate on standoffs. This build has no camera, so mount it wherever the motor wires reach cleanly.',
      },
    },
    {
      id: 'wire-motor-driver',
      title: 'Wire the L298N',
      detail: 'Left channel IN1/IN2 → GPIO12/GPIO13; right channel IN3/IN4 → GPIO14/GPIO15. Leave the ENA/ENB jumpers ON (full speed, no PWM) so GPIO12 boots low.',
      boardDetail: {
        esp32: 'Left channel ENA/IN1/IN2 → GPIO25/26/27; right channel IN3/IN4/ENB → GPIO14/13/23. Pull the ENA/ENB jumpers OFF for PWM speed control.',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x). Select “AI Thinker ESP32-CAM”. No extra libraries: WiFiServer and esp_camera ship with the core.',
      boardDetail: {
        esp32: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() support. Select “ESP32 Dev Module”. No extra libraries needed.',
      },
    },
    {
      id: 'flash-esp32cam',
      title: 'Flash via the FTDI rig',
      detail: 'Wire the FTDI rig, tie GPIO0 to GND, press RST and upload. Remove the GPIO0 jumper and press RST again — the CAM boots and joins Wi-Fi.',
      boards: ['esp32cam'],
    },
    {
      id: 'power-electronics',
      title: 'Power motors and board',
      detail: 'Battery into the L298N motor supply; L298N 5V (jumper on) feeds the board 5V pin. Tie all GNDs together and keep the 5V leads short — brownouts reboot the camera mid-frame.',
    },
    {
      id: 'join-wifi',
      title: 'Join Wi-Fi and find the rover',
      detail: 'Set SSID/PASS in the sketch, upload, and read the IP from the Serial Monitor (115200). Open that IP in a phone browser on the same network.',
    },
    {
      id: 'drive-fpv-test',
      title: 'Drive the FPV test',
      detail: 'Snapshots refresh about once a second; tap F/B/L/R to drive and S to stop. If a side runs backwards, swap that motor’s two leads.',
    },
    {
      id: 'add-sonar-headlight',
      title: 'Add the sonar + flash',
      detail: 'HC-SR04 TRIG → GPIO2, ECHO → GPIO16 via the 1k/2k divider. The flash is the onboard GPIO4 LED — no wiring needed. Upload sketch B.',
      boardDetail: {
        esp32: 'HC-SR04 TRIG → GPIO32, ECHO → GPIO34 via the 1k/2k divider. The headlight is the DevKit’s onboard GPIO2 LED — no wiring needed. Upload sketch B.',
      },
      versions: ['b'],
    },
    {
      id: 'stream-demo',
      title: 'Demo stream + auto-stop',
      detail: 'Open /stream for live MJPEG, then drive at a wall: the motors must cut under 25cm and release past 30cm. Film the drive, the flash toggle and the stop.',
      versions: ['b'],
    },
  ],
  simulator: {
    viz: 'rover',
    intro: 'Same rule as the firmware: an obstacle closer than the limit cuts the motors until the way clears.',
    sliders: [
      { id: 'distance', label: 'Obstacle distance', unit: 'cm', min: 2, max: 200, value: 60 },
      { id: 'throttle', label: 'Throttle', unit: '%', min: 0, max: 100, value: 70 },
    ],
    threshold: { id: 'thr', label: 'Stop under', unit: 'cm', min: 10, max: 60, value: 25 },
    watch: 'distance',
    rule: 'below',
    band: 5,
    actuator: 'Drive',
    onText: 'STOP',
    offText: 'GO',
    lcd: ['Dist:{distance}cm', 'Drive:{act}'],
    demoSlider: 'distance',
    demoFrom: 120,
    demoTo: 8,
    barLabel: 'Clearance',
  },
  code: [
    {
      id: 'a',
      label: 'A · Snapshot teleop',
      note: 'WiFiServer routes / (page), /shot (JPEG) and /go?d=X (drive). AI-THINKER map, VGA/JPEG q12, PSRAM-aware. L298N on GPIO12–15, ENA/ENB jumpers ON — GPIO12 strapping note in the sketch.',
      board: 'esp32cam',
      versions: ['a'],
      code: `// Wi-Fi FPV rover A: snapshot teleop over Wi-Fi STA (manual HTTP, no web framework).
// Routes: / = control page, /shot = single JPEG, /go?d=F|B|L|R|S = drive.
// L298N IN1..IN4 on GPIO12/13/14/15 with ENA/ENB jumpers ON (full speed).
// NOTE: GPIO12 is a boot-strapping pin — keep the ENA/ENB jumpers on so the
// driver inputs float low at boot and the ESP32-CAM boots normally.
#include <WiFi.h>
#include "esp_camera.h"

char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
WiFiServer server(80);

const int IN1 = 12, IN2 = 13, IN3 = 14, IN4 = 15;  // left IN1/IN2, right IN3/IN4

// AI-THINKER ESP32-CAM pin map
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

void drive(char d) {  // F fwd, B back, L left, R right, S stop (tank steering)
  digitalWrite(IN1, d == 'F' || d == 'R');
  digitalWrite(IN2, d == 'B' || d == 'L');
  digitalWrite(IN3, d == 'F' || d == 'L');
  digitalWrite(IN4, d == 'B' || d == 'R');
}

bool initCamera() {
  camera_config_t c;
  c.ledc_channel = LEDC_CHANNEL_0;
  c.ledc_timer = LEDC_TIMER_0;
  c.pin_d7 = Y9_GPIO_NUM;
  c.pin_d6 = Y8_GPIO_NUM;
  c.pin_d5 = Y7_GPIO_NUM;
  c.pin_d4 = Y6_GPIO_NUM;
  c.pin_d3 = Y5_GPIO_NUM;
  c.pin_d2 = Y4_GPIO_NUM;
  c.pin_d1 = Y3_GPIO_NUM;
  c.pin_d0 = Y2_GPIO_NUM;
  c.pin_vsync = VSYNC_GPIO_NUM;
  c.pin_href = HREF_GPIO_NUM;
  c.pin_pclk = PCLK_GPIO_NUM;
  c.pin_pwdn = PWDN_GPIO_NUM;
  c.pin_reset = RESET_GPIO_NUM;
  c.pin_xclk = XCLK_GPIO_NUM;
  c.pin_sscb_sda = SIOD_GPIO_NUM;
  c.pin_sscb_scl = SIOC_GPIO_NUM;
  c.xclk_freq_hz = 20000000;
  c.pixel_format = PIXFORMAT_JPEG;
  c.frame_size = FRAMESIZE_VGA;
  c.jpeg_quality = 12;  // lower = better, 10..20 typical
  c.fb_count = 1;
  if (!psramFound()) c.frame_size = FRAMESIZE_QVGA;  // VGA needs PSRAM
  return esp_camera_init(&c) == ESP_OK;
}

void sendPage(WiFiClient &client) {
  client.println(F("HTTP/1.1 200 OK"));
  client.println(F("Content-Type: text/html"));
  client.println(F("Connection: close"));
  client.println();
  client.println(F("<!doctype html><html><body style='text-align:center;font-family:sans-serif'>"));
  client.println(F("<h2>VoltVerse FPV Rover</h2>"));
  client.println(F("<img id='c' src='/shot' width='320' style='border:1px solid #333'>"));
  client.println(F("<script>setInterval(()=>{c.src='/shot?'+Date.now()},800)</script>"));
  client.println(F("<p><a href='/go?d=F'><button>FWD</button></a></p>"));
  client.println(F("<p><a href='/go?d=L'><button>LEFT</button></a> <a href='/go?d=S'><button>STOP</button></a> <a href='/go?d=R'><button>RIGHT</button></a></p>"));
  client.println(F("<p><a href='/go?d=B'><button>BACK</button></a></p>"));
  client.println(F("</body></html>"));
}

void sendShot(WiFiClient &client) {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    client.println(F("HTTP/1.1 503 Camera busy"));
    client.println(F("Connection: close"));
    client.println();
    return;
  }
  client.println(F("HTTP/1.1 200 OK"));
  client.println(F("Content-Type: image/jpeg"));
  client.print(F("Content-Length: "));
  client.println(fb->len);
  client.println(F("Connection: close"));
  client.println();
  client.write(fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

void sendGo(WiFiClient &client, char d) {
  drive(d);
  client.println(F("HTTP/1.1 303 See Other"));
  client.println(F("Location: /"));
  client.println(F("Connection: close"));
  client.println();
}

void handleClient() {
  WiFiClient client = server.available();
  if (!client) return;
  String req;
  unsigned long t0 = millis();
  while (client.connected() && millis() - t0 < 1500) {
    while (client.available()) {
      req += (char)client.read();
      if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    }
    if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    delay(1);
  }
  if (req.startsWith("GET /shot")) sendShot(client);
  else if (req.startsWith("GET /go?d=")) sendGo(client, req.length() > 10 ? req.charAt(10) : 'S');
  else if (req.startsWith("GET / ")) sendPage(client);
  else {
    client.println(F("HTTP/1.1 404 Not found"));
    client.println(F("Connection: close"));
    client.println();
  }
  delay(10);
  client.stop();
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  drive('S');
  if (!initCamera()) Serial.println(F("Camera init FAILED"));
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print('.'); }
  Serial.println();
  Serial.println(WiFi.localIP());  // open this in a phone browser
  server.begin();
}

void loop() {
  handleClient();
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 teleop (no camera)',
      note: 'Same WiFiServer UI minus the camera: /shot answers 501, the page is drive buttons only. L298N on GPIO25/26/27 + GPIO14/13/23 with PWM speed via analogWrite().',
      board: 'esp32',
      versions: ['a'],
      code: `// Wi-Fi rover A (ESP32, no camera): same WiFiServer teleop UI as the
// ESP32-CAM build, minus the camera. /shot answers 501 'no camera'.
// L298N WITH PWM speed: ENA/ENB jumpers OFF, speed via analogWrite().
#include <WiFi.h>

char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
WiFiServer server(80);

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int SPEED_PWM = 200;  // 0..255 cruise speed

void drive(char d) {  // F fwd, B back, L left, R right, S stop (tank steering)
  bool lF = (d == 'F' || d == 'R'), lB = (d == 'B' || d == 'L');
  bool rF = (d == 'F' || d == 'L'), rB = (d == 'B' || d == 'R');
  digitalWrite(IN1, lF); digitalWrite(IN2, lB);
  analogWrite(ENA, (lF || lB) ? SPEED_PWM : 0);
  digitalWrite(IN3, rF); digitalWrite(IN4, rB);
  analogWrite(ENB, (rF || rB) ? SPEED_PWM : 0);
}

void sendPage(WiFiClient &client) {
  client.println(F("HTTP/1.1 200 OK"));
  client.println(F("Content-Type: text/html"));
  client.println(F("Connection: close"));
  client.println();
  client.println(F("<!doctype html><html><body style='text-align:center;font-family:sans-serif'>"));
  client.println(F("<h2>VoltVerse Rover (no camera)</h2>"));
  client.println(F("<p><a href='/go?d=F'><button>FWD</button></a></p>"));
  client.println(F("<p><a href='/go?d=L'><button>LEFT</button></a> <a href='/go?d=S'><button>STOP</button></a> <a href='/go?d=R'><button>RIGHT</button></a></p>"));
  client.println(F("<p><a href='/go?d=B'><button>BACK</button></a></p>"));
  client.println(F("</body></html>"));
}

void sendNoCam(WiFiClient &client) {
  client.println(F("HTTP/1.1 501 No camera"));
  client.println(F("Content-Type: text/plain"));
  client.println(F("Connection: close"));
  client.println();
  client.println(F("no camera on the ESP32 build"));
}

void sendGo(WiFiClient &client, char d) {
  drive(d);
  client.println(F("HTTP/1.1 303 See Other"));
  client.println(F("Location: /"));
  client.println(F("Connection: close"));
  client.println();
}

void handleClient() {
  WiFiClient client = server.available();
  if (!client) return;
  String req;
  unsigned long t0 = millis();
  while (client.connected() && millis() - t0 < 1500) {
    while (client.available()) {
      req += (char)client.read();
      if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    }
    if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    delay(1);
  }
  if (req.startsWith("GET /shot")) sendNoCam(client);
  else if (req.startsWith("GET /go?d=")) sendGo(client, req.length() > 10 ? req.charAt(10) : 'S');
  else if (req.startsWith("GET / ")) sendPage(client);
  else {
    client.println(F("HTTP/1.1 404 Not found"));
    client.println(F("Connection: close"));
    client.println();
  }
  delay(10);
  client.stop();
}

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  drive('S');
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print('.'); }
  Serial.println();
  Serial.println(WiFi.localIP());  // open this in a phone browser
  server.begin();
}

void loop() {
  handleClient();
}`,
    },
    {
      id: 'b',
      label: 'B · Stream + auto-stop',
      note: 'A plus MJPEG /stream (30 s client timeout), HC-SR04 auto-stop under 25cm (TRIG GPIO2, ECHO GPIO16 via divider) and /flash on the GPIO4 onboard LED.',
      board: 'esp32cam',
      versions: ['b'],
      code: `// Wi-Fi FPV rover B: A + MJPEG /stream, HC-SR04 auto-stop and flash toggle.
// Auto-stop: the motors cut while an obstacle is closer than 25 cm and the
// drive buttons refuse new motion until the way clears (releases past 30 cm).
// Extra pins: TRIG=GPIO2, ECHO=GPIO16 via 1k/2k divider, flash=GPIO4 (onboard).
#include <WiFi.h>
#include "esp_camera.h"

char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
WiFiServer server(80);

const int IN1 = 12, IN2 = 13, IN3 = 14, IN4 = 15;  // ENA/ENB jumpers ON
const int TRIG = 2, ECHO = 16, FLASH = 4;
const int STOP_AT = 25;  // cm: cut the motors below this
bool blocked = false;
bool flashOn = false;
unsigned long lastPing = 0;
long lastCm = 999;

// AI-THINKER ESP32-CAM pin map
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

void drive(char d) {  // F fwd, B back, L left, R right, S stop (tank steering)
  digitalWrite(IN1, d == 'F' || d == 'R');
  digitalWrite(IN2, d == 'B' || d == 'L');
  digitalWrite(IN3, d == 'F' || d == 'L');
  digitalWrite(IN4, d == 'B' || d == 'R');
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

bool initCamera() {
  camera_config_t c;
  c.ledc_channel = LEDC_CHANNEL_0;
  c.ledc_timer = LEDC_TIMER_0;
  c.pin_d7 = Y9_GPIO_NUM;
  c.pin_d6 = Y8_GPIO_NUM;
  c.pin_d5 = Y7_GPIO_NUM;
  c.pin_d4 = Y6_GPIO_NUM;
  c.pin_d3 = Y5_GPIO_NUM;
  c.pin_d2 = Y4_GPIO_NUM;
  c.pin_d1 = Y3_GPIO_NUM;
  c.pin_d0 = Y2_GPIO_NUM;
  c.pin_vsync = VSYNC_GPIO_NUM;
  c.pin_href = HREF_GPIO_NUM;
  c.pin_pclk = PCLK_GPIO_NUM;
  c.pin_pwdn = PWDN_GPIO_NUM;
  c.pin_reset = RESET_GPIO_NUM;
  c.pin_xclk = XCLK_GPIO_NUM;
  c.pin_sscb_sda = SIOD_GPIO_NUM;
  c.pin_sscb_scl = SIOC_GPIO_NUM;
  c.xclk_freq_hz = 20000000;
  c.pixel_format = PIXFORMAT_JPEG;
  c.frame_size = FRAMESIZE_VGA;
  c.jpeg_quality = 12;
  c.fb_count = 1;
  if (!psramFound()) c.frame_size = FRAMESIZE_QVGA;  // VGA needs PSRAM
  return esp_camera_init(&c) == ESP_OK;
}

void sendPage(WiFiClient &client) {
  client.println(F("HTTP/1.1 200 OK"));
  client.println(F("Content-Type: text/html"));
  client.println(F("Connection: close"));
  client.println();
  client.println(F("<!doctype html><html><body style='text-align:center;font-family:sans-serif'>"));
  client.println(F("<h2>VoltVerse FPV Rover B</h2>"));
  client.println(F("<img id='c' src='/shot' width='320' style='border:1px solid #333'>"));
  client.println(F("<script>setInterval(()=>{c.src='/shot?'+Date.now()},800)</script>"));
  client.print(F("<p>Dist: ")); client.print(lastCm); client.print(F("cm — "));
  client.println(blocked ? F("BLOCKED</p>") : F("CLEAR</p>"));
  client.println(F("<p><a href='/go?d=F'><button>FWD</button></a></p>"));
  client.println(F("<p><a href='/go?d=L'><button>LEFT</button></a> <a href='/go?d=S'><button>STOP</button></a> <a href='/go?d=R'><button>RIGHT</button></a></p>"));
  client.println(F("<p><a href='/go?d=B'><button>BACK</button></a></p>"));
  client.println(F("<p><a href='/flash'><button>FLASH</button></a> <a href='/stream'><button>LIVE STREAM</button></a></p>"));
  client.println(F("</body></html>"));
}

void sendShot(WiFiClient &client) {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    client.println(F("HTTP/1.1 503 Camera busy"));
    client.println(F("Connection: close"));
    client.println();
    return;
  }
  client.println(F("HTTP/1.1 200 OK"));
  client.println(F("Content-Type: image/jpeg"));
  client.print(F("Content-Length: "));
  client.println(fb->len);
  client.println(F("Connection: close"));
  client.println();
  client.write(fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

void sendStream(WiFiClient &client) {
  drive('S');  // single-threaded server: park the rover while streaming
  client.println(F("HTTP/1.1 200 OK"));
  client.println(F("Content-Type: multipart/x-mixed-replace; boundary=frame"));
  client.println(F("Connection: close"));
  client.println();
  unsigned long t0 = millis();
  while (client.connected() && millis() - t0 < 30000) {  // 30 s client timeout
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) break;
    client.println(F("--frame"));
    client.println(F("Content-Type: image/jpeg"));
    client.print(F("Content-Length: "));
    client.println(fb->len);
    client.println();
    client.write(fb->buf, fb->len);
    client.println();
    esp_camera_fb_return(fb);
  }
}

void redirectHome(WiFiClient &client) {
  client.println(F("HTTP/1.1 303 See Other"));
  client.println(F("Location: /"));
  client.println(F("Connection: close"));
  client.println();
}

void sendGo(WiFiClient &client, char d) {
  if (d != 'S' && blocked) d = 'S';  // refuse motion while blocked
  drive(d);
  redirectHome(client);
}

void sendFlash(WiFiClient &client) {
  flashOn = !flashOn;
  digitalWrite(FLASH, flashOn);
  redirectHome(client);
}

void handleClient() {
  WiFiClient client = server.available();
  if (!client) return;
  String req;
  unsigned long t0 = millis();
  while (client.connected() && millis() - t0 < 1500) {
    while (client.available()) {
      req += (char)client.read();
      if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    }
    if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    delay(1);
  }
  if (req.startsWith("GET /shot")) sendShot(client);
  else if (req.startsWith("GET /stream")) sendStream(client);
  else if (req.startsWith("GET /flash")) sendFlash(client);
  else if (req.startsWith("GET /go?d=")) sendGo(client, req.length() > 10 ? req.charAt(10) : 'S');
  else if (req.startsWith("GET / ")) sendPage(client);
  else {
    client.println(F("HTTP/1.1 404 Not found"));
    client.println(F("Connection: close"));
    client.println();
  }
  delay(10);
  client.stop();
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(FLASH, OUTPUT);
  drive('S');
  if (!initCamera()) Serial.println(F("Camera init FAILED"));
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print('.'); }
  Serial.println();
  Serial.println(WiFi.localIP());  // open this in a phone browser
  server.begin();
}

void loop() {
  if (millis() - lastPing > 200) {  // sonar guard: cut the motors under 25 cm
    lastPing = millis();
    lastCm = readCm();
    if (lastCm < STOP_AT) { blocked = true; drive('S'); }
    else if (lastCm >= STOP_AT + 5) blocked = false;  // release past 30 cm
  }
  handleClient();
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 auto-stop (no camera)',
      note: 'Same as B without the camera: /shot and /stream answer 501. Sonar on GPIO32/34 (ECHO via divider), headlight on GPIO2 — the DevKit onboard LED.',
      board: 'esp32',
      versions: ['b'],
      code: `// Wi-Fi rover B (ESP32, no camera): B minus the camera — /shot and
// /stream answer 501. Keeps the HC-SR04 auto-stop (<25 cm cuts the motors)
// and the /flash headlight toggle on GPIO2 (the DevKit onboard LED).
// Sonar: TRIG=GPIO32, ECHO=GPIO34 via 1k/2k divider.
#include <WiFi.h>

char SSID[] = "YOUR_WIFI";
char PASS[] = "YOUR_PASS";
WiFiServer server(80);

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int SPEED_PWM = 200;
const int TRIG = 32, ECHO = 34, FLASH = 2;  // GPIO2 = DevKit onboard LED
const int STOP_AT = 25;  // cm: cut the motors below this
bool blocked = false;
bool flashOn = false;
unsigned long lastPing = 0;
long lastCm = 999;

void drive(char d) {  // F fwd, B back, L left, R right, S stop (tank steering)
  bool lF = (d == 'F' || d == 'R'), lB = (d == 'B' || d == 'L');
  bool rF = (d == 'F' || d == 'L'), rB = (d == 'B' || d == 'R');
  digitalWrite(IN1, lF); digitalWrite(IN2, lB);
  analogWrite(ENA, (lF || lB) ? SPEED_PWM : 0);
  digitalWrite(IN3, rF); digitalWrite(IN4, rB);
  analogWrite(ENB, (rF || rB) ? SPEED_PWM : 0);
}

long readCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  return us ? us / 58 : 999;  // 0 = no echo, not "touching"
}

void sendPage(WiFiClient &client) {
  client.println(F("HTTP/1.1 200 OK"));
  client.println(F("Content-Type: text/html"));
  client.println(F("Connection: close"));
  client.println();
  client.println(F("<!doctype html><html><body style='text-align:center;font-family:sans-serif'>"));
  client.println(F("<h2>VoltVerse Rover B (no camera)</h2>"));
  client.print(F("<p>Dist: ")); client.print(lastCm); client.print(F("cm — "));
  client.println(blocked ? F("BLOCKED</p>") : F("CLEAR</p>"));
  client.println(F("<p><a href='/go?d=F'><button>FWD</button></a></p>"));
  client.println(F("<p><a href='/go?d=L'><button>LEFT</button></a> <a href='/go?d=S'><button>STOP</button></a> <a href='/go?d=R'><button>RIGHT</button></a></p>"));
  client.println(F("<p><a href='/go?d=B'><button>BACK</button></a></p>"));
  client.println(F("<p><a href='/flash'><button>HEADLIGHT</button></a></p>"));
  client.println(F("</body></html>"));
}

void sendNoCam(WiFiClient &client) {
  client.println(F("HTTP/1.1 501 No camera"));
  client.println(F("Content-Type: text/plain"));
  client.println(F("Connection: close"));
  client.println();
  client.println(F("no camera on the ESP32 build"));
}

void redirectHome(WiFiClient &client) {
  client.println(F("HTTP/1.1 303 See Other"));
  client.println(F("Location: /"));
  client.println(F("Connection: close"));
  client.println();
}

void sendGo(WiFiClient &client, char d) {
  if (d != 'S' && blocked) d = 'S';  // refuse motion while blocked
  drive(d);
  redirectHome(client);
}

void sendFlash(WiFiClient &client) {
  flashOn = !flashOn;
  digitalWrite(FLASH, flashOn);  // DevKit onboard LED
  redirectHome(client);
}

void handleClient() {
  WiFiClient client = server.available();
  if (!client) return;
  String req;
  unsigned long t0 = millis();
  while (client.connected() && millis() - t0 < 1500) {
    while (client.available()) {
      req += (char)client.read();
      if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    }
    if (req.endsWith("\\r\\n\\r\\n") || req.length() > 2048) break;
    delay(1);
  }
  if (req.startsWith("GET /shot")) sendNoCam(client);
  else if (req.startsWith("GET /stream")) sendNoCam(client);
  else if (req.startsWith("GET /flash")) sendFlash(client);
  else if (req.startsWith("GET /go?d=")) sendGo(client, req.length() > 10 ? req.charAt(10) : 'S');
  else if (req.startsWith("GET / ")) sendPage(client);
  else {
    client.println(F("HTTP/1.1 404 Not found"));
    client.println(F("Connection: close"));
    client.println();
  }
  delay(10);
  client.stop();
}

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(FLASH, OUTPUT);
  drive('S');
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print('.'); }
  Serial.println();
  Serial.println(WiFi.localIP());  // open this in a phone browser
  server.begin();
}

void loop() {
  if (millis() - lastPing > 200) {  // sonar guard: cut the motors under 25 cm
    lastPing = millis();
    lastCm = readCm();
    if (lastCm < STOP_AT) { blocked = true; drive('S'); }
    else if (lastCm >= STOP_AT + 5) blocked = false;  // release past 30 cm
  }
  handleClient();
}`,
    },
  ],
  tips: [
    { title: 'Keep GPIO12 low at boot', detail: 'On the CAM build leave the ENA/ENB jumpers ON — GPIO12 is a strapping pin, and driven inputs there can stop the board booting.' },
    { title: 'Feed the camera clean 5V', detail: 'Brownouts reboot the CAM mid-frame: short thick 5V leads from the L298N, fully charged cells, common GND everywhere.' },
    { title: 'Same network, known IP', detail: 'Phone and rover must share the STA Wi-Fi; read the IP from the Serial Monitor at 115200 after every reset.' },
    { title: 'Snapshots stay responsive', detail: 'The B page uses auto-refreshing snapshots so the buttons keep working — /stream parks the motors and owns the server for 30s.' },
  ],
}
