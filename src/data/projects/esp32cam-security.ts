import type { Project } from '../types'

/** AI-Thinker ESP32-CAM pin map + init, shared by both sketches (needs PSRAM enabled in Tools menu). */
const CAMERA_INIT = `bool initCamera() {
  camera_config_t c = {};
  c.ledc_channel = LEDC_CHANNEL_0; c.ledc_timer = LEDC_TIMER_0;
  c.pin_d0 = 5;  c.pin_d1 = 18; c.pin_d2 = 19; c.pin_d3 = 21;
  c.pin_d4 = 36; c.pin_d5 = 39; c.pin_d6 = 34; c.pin_d7 = 35;
  c.pin_xclk = 0; c.pin_pclk = 22; c.pin_vsync = 25; c.pin_href = 23;
  c.pin_sccb_sda = 26; c.pin_sccb_scl = 27;
  c.pin_pwdn = 32; c.pin_reset = -1;
  c.xclk_freq_hz = 20000000;
  c.pixel_format = PIXFORMAT_JPEG;
  c.frame_size = FRAMESIZE_SVGA;   // 800x600
  c.jpeg_quality = 12;             // 10-63, lower = better
  c.fb_count = 2;
  c.fb_location = CAMERA_FB_IN_PSRAM;
  c.grab_mode = CAMERA_GRAB_LATEST;
  return esp_camera_init(&c) == ESP_OK;
}`

export const esp32camSecurity: Project = {
  slug: 'esp32cam-security',
  categoryId: 'iot',
  title: 'ESP32-CAM Security Camera',
  tagline: 'Motion-triggered snapshots to Telegram + live stream.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳1,800–3,200',
  boards: ['ESP32-CAM'],
  defaultBoard: 'esp32cam',
  support: {
    uno: {
      ok: false,
      reason: 'No camera interface and only 2 KB RAM — it can’t capture or send a JPEG. It could only be a PIR trigger, which isn’t this build.',
    },
    esp32: {
      ok: false,
      reason: 'A DevKit has no camera connector or PSRAM. This build needs the OV2640 + PSRAM that come on the ESP32-CAM board.',
    },
    nodemcu: {
      ok: false,
      reason: 'The ESP8266 has no camera interface and ~50 KB of RAM — too little for even one JPEG frame.',
    },
    esp32cam: { ok: true },
  },
  skills: ['OV2640 camera', 'PIR trigger', 'Telegram API', 'MJPEG stream'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32cam', 'esp32', 'pir', 'microsd', 'telegram-docs'],
  rig: { sensor: null, extras: ['pir'] },
  options: [
    {
      id: 'a',
      title: 'A. Telegram spy-cam',
      level: 'Medium · core build',
      blurb: 'PIR motion triggers the camera, snaps a photo, and pushes it to your Telegram chat in seconds.',
      points: ['Instant phone photos', 'Works on any Wi-Fi', 'No port forwarding'],
      weeks: '2 weeks',
      cost: '৳1,800–2,500',
    },
    {
      id: 'b',
      title: 'B. Stream + record',
      level: 'Medium+ · best demo',
      blurb: 'Live MJPEG web stream plus motion snapshots saved to microSD with timestamps.',
      points: ['Live browser stream', 'SD event recorder', 'Night flash LED'],
      weeks: '3 weeks',
      cost: '৳2,200–3,200',
    },
  ],
  parts: [
    { name: 'ESP32-CAM (AI-Thinker, OV2640)', qty: '1', role: 'Camera + Wi-Fi', price: '৳650–950', boards: ['esp32cam'] },
    { name: 'FTDI programmer (3.3V) or ESP32-CAM-MB', qty: '1', role: 'Flashing (no USB!)', price: '৳250–450', boards: ['esp32cam'] },
    { name: 'PIR motion sensor (HC-SR501)', qty: '1', role: 'Motion trigger', price: '৳120–220' },
    { name: 'MicroSD card 8–32GB (FAT32)', qty: '1', role: 'Photo storage', price: '৳350–600', versions: ['b'] },
    { name: '5V 2A supply', qty: '1', role: 'Clean camera power', price: '৳200–350' },
    { name: 'Jumper wires + mount', qty: '1 set', role: 'Rig + aiming', price: '৳150–300' },
    { name: 'Enclosure (optional)', qty: '1', role: 'Wall housing', price: '৳200–400' },
  ],
  wiring: [
    {
      id: 'esp32cam',
      label: 'ESP32-CAM build',
      board: 'AI-Thinker ESP32-CAM',
      boards: ['esp32cam'],
      pins: [
        { from: 'PIR → OUT', to: 'GPIO13 (3.3V output — safe)' },
        { from: 'PIR → VCC / GND', to: '5V / GND' },
        { from: 'Flash LED →', to: 'GPIO4 (built-in)' },
        { from: 'MicroSD →', to: 'onboard slot, 1-bit mode: GPIO2/14/15 (version B)' },
        { from: 'Power →', to: '5V 2A supply (USB-serial power is flaky)' },
      ],
    },
    {
      id: 'ftdi',
      label: 'Programming (FTDI)',
      board: 'ESP32-CAM + FTDI',
      boards: ['esp32cam'],
      pins: [
        { from: 'FTDI logic jumper →', to: '3.3V (ESP32 pins aren’t 5V-tolerant)' },
        { from: 'FTDI → TX / RX', to: 'CAM U0R / U0T (crossed!)' },
        { from: 'CAM 5V / GND ←', to: '5V supply (GND shared with FTDI)' },
        { from: 'CAM IO0 →', to: 'GND only while flashing' },
        { from: 'After flash →', to: 'remove IO0 jumper, press RST' },
        { from: 'Easier option →', to: 'ESP32-CAM-MB USB board does all of this' },
      ],
    },
  ],
  steps: [
    {
      id: 'install-esp32-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → “esp32 by Espressif” (3.x), then pick “AI Thinker ESP32-CAM” (PSRAM on).',
    },
    {
      id: 'flash-camera-web-server',
      title: 'Flash CameraWebServer first',
      detail: 'IO0→GND, upload the CameraWebServer example (CAMERA_MODEL_AI_THINKER), remove the jumper, press RST. Confirm the stream before adding anything.',
    },
    {
      id: 'stabilize-power',
      title: 'Stabilize power',
      detail: 'Brown-outs ("camera init failed") almost always mean weak power — use a real 5V/2A supply.',
    },
    {
      id: 'add-pir-trigger',
      title: 'Add PIR trigger',
      detail: 'PIR on GPIO13. Let it settle ~60s after power-up, then wave → Serial prints MOTION. Tune the sensitivity pot for your room.',
    },
    {
      id: 'telegram-bot',
      title: 'Telegram bot',
      detail: 'BotFather → token, @userinfobot → chat ID. The motion handler captures a frame and sends it in ~3s.',
      versions: ['a'],
    },
    {
      id: 'sd-recorder',
      title: 'SD recorder',
      detail: 'Mount the card in 1-bit mode, save /img_YYYYMMDD_HHMMSS.jpg on motion. Verify files by reading the card on a laptop.',
      versions: ['b'],
    },
    {
      id: 'mount-and-demo',
      title: 'Mount + demo',
      detail: 'Aim at the demo doorway, walk through, and show the result live: Telegram photo, or the stream tab + timestamped SD files.',
    },
  ],
  simulator: {
    viz: 'lamp',
    intro: 'Same rule as the firmware: motion above sensitivity with cooldown expired snaps a photo.',
    sliders: [
      { id: 'motion', label: 'Motion level', unit: '%', min: 0, max: 100, value: 20 },
      { id: 'cool', label: 'Cooldown left', unit: 's', min: 0, max: 60, value: 0 },
    ],
    threshold: { id: 'thr', label: 'Snap above', unit: '%', min: 10, max: 80, value: 40 },
    watch: 'motion',
    rule: 'above',
    actuator: 'Shutter',
    onText: 'SNAP',
    offText: 'idle',
    lcd: ['Mot:{motion}% Cd:{cool}s', 'Cam:{act}'],
    demoSlider: 'motion',
    demoFrom: 10,
    demoTo: 85,
    barLabel: 'Motion level',
  },
  code: [
    {
      id: 'a',
      label: 'A · Telegram photo',
      note: 'Libraries: UniversalTelegramBot + ArduinoJson. Token from BotFather, chat ID from @userinfobot. Board: AI Thinker ESP32-CAM, PSRAM enabled.',
      board: 'esp32cam',
      versions: ['a'],
      code: `#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include "esp_camera.h"
#define PIR 13
#define FLASH 4
const char* SSID = "YOUR_WIFI";
const char* PASS = "YOUR_PASS";
#define BOT_TOKEN "YOUR_BOT_TOKEN"
#define CHAT_ID "YOUR_CHAT_ID"
WiFiClientSecure secured;
UniversalTelegramBot bot(BOT_TOKEN, secured);
camera_fb_t* fb = nullptr;
bool dataAvailable = false;
unsigned long lastSnap = 0;

${CAMERA_INIT}

bool isMoreDataAvailable() {  // whole frame is sent as one buffer
  if (!dataAvailable) return false;
  dataAvailable = false;
  return true;
}
byte* getNextBuffer() { return fb ? fb->buf : nullptr; }
int getNextBufferLen() { return fb ? fb->len : 0; }

void sendPhoto() {
  esp_camera_fb_return(esp_camera_fb_get());  // drop the stale frame
  fb = esp_camera_fb_get();
  if (!fb) return;
  dataAvailable = true;
  bot.sendPhotoByBinary(CHAT_ID, "image/jpeg", fb->len,
                        isMoreDataAvailable, nullptr, getNextBuffer, getNextBufferLen);
  esp_camera_fb_return(fb);
  fb = nullptr;
}

void setup() {
  pinMode(PIR, INPUT); pinMode(FLASH, OUTPUT);
  if (!initCamera()) { delay(1000); ESP.restart(); }  // usually loose ribbon or weak 5V
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  secured.setCACert(TELEGRAM_CERTIFICATE_ROOT);
}

void loop() {
  if (digitalRead(PIR) && millis() - lastSnap > 15000) {
    lastSnap = millis();
    digitalWrite(FLASH, HIGH);
    sendPhoto();
    digitalWrite(FLASH, LOW);
  }
  delay(200);
}`,
    },
    {
      id: 'b',
      label: 'B · Stream + SD snapshot',
      note: 'Open the CameraWebServer example, replace its main .ino with this sketch and keep its other tabs (app_httpd.cpp etc. — startCameraServer() serves the live stream). SD in 1-bit mode keeps GPIO4 + GPIO13 free.',
      board: 'esp32cam',
      versions: ['b'],
      code: `#include <WiFi.h>
#include "FS.h"
#include "SD_MMC.h"
#include "esp_camera.h"
#include "time.h"
#define PIR 13
#define FLASH 4
void startCameraServer();  // from app_httpd.cpp
unsigned long lastSnap = 0;

${CAMERA_INIT}

void savePhoto() {
  struct tm t;
  if (!getLocalTime(&t)) return;  // no NTP time yet
  digitalWrite(FLASH, HIGH);
  esp_camera_fb_return(esp_camera_fb_get());  // drop the stale frame
  camera_fb_t* fb = esp_camera_fb_get();
  digitalWrite(FLASH, LOW);
  if (!fb) return;
  char path[32];
  strftime(path, sizeof(path), "/img_%Y%m%d_%H%M%S.jpg", &t);
  File f = SD_MMC.open(path, FILE_WRITE);
  if (f) { f.write(fb->buf, fb->len); f.close(); }
  esp_camera_fb_return(fb);
}

void setup() {
  pinMode(PIR, INPUT); pinMode(FLASH, OUTPUT);
  if (!initCamera()) { delay(1000); ESP.restart(); }
  WiFi.begin("YOUR_WIFI", "YOUR_PASS");
  while (WiFi.status() != WL_CONNECTED) delay(500);
  startCameraServer();               // live stream at http://<ip>
  SD_MMC.begin("/sdcard", true);     // true = 1-bit mode
  configTime(6 * 3600, 0, "pool.ntp.org");  // Bangladesh UTC+6
}

void loop() {
  if (digitalRead(PIR) && millis() - lastSnap > 15000) {
    lastSnap = millis();
    savePhoto();
  }
  delay(200);
}`,
    },
  ],
  tips: [
    { title: 'Power first', detail: '"Camera init failed" = weak supply 9 times out of 10. Use 5V/2A.' },
    { title: 'Cooldown', detail: '15s between snaps stops Telegram spam and SD flooding.' },
    { title: 'Focus', detail: 'OV2640 lens screws in/out — focus it for your demo distance.' },
    { title: 'SD pins', detail: 'SD_MMC.begin() defaults to 4-bit mode, which steals GPIO4/12/13 — always pass true for 1-bit.' },
    { title: 'Privacy', detail: 'Point at your own demo area only; say so in the presentation.' },
  ],
}
