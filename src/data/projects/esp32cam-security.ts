import type { Project } from '../types'

export const esp32camSecurity: Project = {
  slug: 'esp32cam-security',
  categoryId: 'iot',
  title: 'ESP32-CAM Security Camera',
  tagline: 'Motion-triggered snapshots to Telegram + live stream.',
  difficulty: 'Medium',
  weeks: '2–3 weeks',
  cost: '৳1,800–3,200',
  boards: ['ESP32-CAM', 'ESP32'],
  skills: ['OV2640 camera', 'PIR trigger', 'Telegram API', 'MJPEG stream'],
  scene: 'secure',
  updated: 'Oct 2026',
  sheets: ['esp32', 'esp32cam', 'blynk-docs'],
  rig: { sensor: null, extras: ['pir'] },
  options: [
    {
      id: 'a',
      title: 'A. Telegram spy-cam',
      level: 'Medium · core build',
      blurb: 'PIR motion wakes the camera, snaps a photo, and pushes it to your Telegram chat in seconds.',
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
    { name: 'ESP32-CAM (OV2640)', qty: '1', role: 'Camera + Wi-Fi', price: '৳650–950' },
    { name: 'FTDI programmer', qty: '1', role: 'Flashing (no USB!)', price: '৳250–450' },
    { name: 'PIR motion sensor', qty: '1', role: 'Motion trigger', price: '৳120–220' },
    { name: 'MicroSD card 8–32GB', qty: '1', role: 'Photo storage (B)', price: '৳350–600' },
    { name: '5V 2A supply', qty: '1', role: 'Clean camera power', price: '৳200–350' },
    { name: 'Jumper wires + mount', qty: '1 set', role: 'Rig + aiming', price: '৳150–300' },
    { name: 'Enclosure (optional)', qty: '1', role: 'Wall housing', price: '৳200–400' },
  ],
  wiring: [
    {
      id: 'ftdi',
      label: 'Programming (FTDI)',
      board: 'ESP32-CAM + FTDI',
      pins: [
        { from: 'FTDI → TX / RX', to: 'CAM U0R / U0T (crossed!)' },
        { from: 'FTDI → 5V / GND', to: 'CAM 5V / GND' },
        { from: 'CAM GPIO0 →', to: 'GND only while flashing' },
        { from: 'After flash →', to: 'remove GPIO0 jumper, press RST' },
      ],
    },
    {
      id: 'run',
      label: 'Run mode + PIR',
      board: 'ESP32-CAM',
      pins: [
        { from: 'PIR → OUT', to: 'GPIO13' },
        { from: 'PIR → VCC/GND', to: '5V / GND' },
        { from: 'Flash LED →', to: 'GPIO4 (built-in)' },
        { from: 'Buzzer →', to: 'GPIO12 (idle LOW: safe for boot)' },
        { from: 'Power →', to: '5V 2A supply (USB-serial power is flaky)' },
      ],
    },
  ],
  steps: [
    { title: 'Flash the blink of cameras', detail: 'GPIO0→GND, upload CameraWebServer, remove jumper, reset. Confirm the stream before adding anything.' },
    { title: 'Stabilize power', detail: 'Brown-outs ("camera init failed") almost always mean weak power — use a real 5V/2A supply.' },
    { title: 'Add PIR wake', detail: 'PIR on GPIO13. Test: wave → serial prints MOTION. Tune sensitivity pot for your room.' },
    { title: 'Telegram bot (A)', detail: 'BotFather → token + chat ID. Motion handler captures a frame and sendPhoto in ~3s.' },
    { title: 'SD recorder (B)', detail: 'Save /img_YYYYMMDD_HHMMSS.jpg on motion. Verify files by reading the card on a laptop.' },
    { title: 'Mount + demo', detail: 'Aim at the demo doorway, walk through, show Telegram photo + timestamps + live stream tab.' },
  ],
  simulator: {
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
      note: 'Libraries: UniversalTelegramBot. Get token from BotFather, chat ID from @userinfobot.',
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
unsigned long lastSnap = 0;

void sendPhoto() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) return;
  bot.sendPhotoByBinary(CHAT_ID, "image/jpeg", fb->len,
    []() -> uint8_t* { return fb->buf; }, []() -> size_t { return fb->len; });
  // NOTE: simplified; real sketch streams fb in 1024B chunks
  esp_camera_fb_return(fb);
}

void setup() {
  pinMode(PIR, INPUT); pinMode(FLASH, OUTPUT);
  // ... camera config (see CameraWebServer example) ...
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  secured.setInsecure();  // classroom only
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
      label: 'B · SD snapshot',
      note: 'Save timestamped JPEGs to microSD on every motion event.',
      code: `#include "FS.h"
#include "SD_MMC.h"
#include "esp_camera.h"
#include "time.h"
#define PIR 13

void savePhoto() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) return;
  struct tm t;
  getLocalTime(&t);
  char path[32];
  strftime(path, sizeof(path), "/img_%Y%m%d_%H%M%S.jpg", &t);
  File f = SD_MMC.open(path, FILE_WRITE);
  f.write(fb->buf, fb->len);
  f.close();
  esp_camera_fb_return(fb);
}

void setup() {
  pinMode(PIR, INPUT);
  // ... camera config ...
  SD_MMC.begin();  // 1-bit mode default on ESP32-CAM
  configTime(6 * 3600, 0, "pool.ntp.org");
}

void loop() {
  if (digitalRead(PIR)) { savePhoto(); delay(10000); }
  delay(200);
}`,
    },
  ],
  tips: [
    { title: 'Power first', detail: '"Camera init failed" = weak supply 9 times out of 10. Use 5V/2A.' },
    { title: 'Cooldown', detail: '15s between snaps stops Telegram spam and SD flooding.' },
    { title: 'Focus', detail: 'OV2640 lens screws in/out — focus it for your demo distance.' },
    { title: 'Privacy', detail: 'Point at your own demo area only; say so in the presentation.' },
  ],
}
