import type { Project } from '../types'

export const vehicleTracker: Project = {
  slug: 'vehicle-tracker',
  categoryId: 'iot',
  title: 'Vehicle GPS Tracker + Accident Alert',
  tagline: 'Live location by SMS/cloud with crash detection and SOS.',
  difficulty: 'Advanced',
  weeks: '3–4 weeks',
  cost: '৳3,200–5,200',
  boards: ['ESP32', 'Arduino + SIM808'],
  skills: ['GPS parsing', 'GSM/SMS', 'MPU6050 shock', 'Maps links'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['esp32', 'neo6m', 'sim800l', 'blynk-docs'],
  rig: { sensor: 'gps', extras: ['gsm'] },
  options: [
    {
      id: 'a',
      title: 'A. SMS tracker',
      level: 'Advanced · core build',
      blurb: 'NEO-6M + SIM800L: reply to "LOC" SMS with a Google Maps link. Works with zero internet.',
      points: ['SMS command + reply', 'Maps link in text', 'Geo-fence exit alert'],
      weeks: '3 weeks',
      cost: '৳3,200–4,200',
    },
    {
      id: 'b',
      title: 'B. Cloud + crash SOS',
      level: 'Advanced · best value',
      blurb: 'Live Blynk map widget plus MPU6050 crash detection that auto-SMS emergency contacts.',
      points: ['Live map trail', 'Crash auto-SOS', 'Speed-over-limit alert'],
      weeks: '4 weeks',
      cost: '৳3,800–5,200',
    },
  ],
  parts: [
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller + Wi-Fi', price: '৳470–850' },
    { name: 'NEO-6M GPS + antenna', qty: '1', role: 'Position fix', price: '৳750–1,100' },
    { name: 'SIM800L + antenna + SIM', qty: '1', role: 'SMS + GPRS', price: '৳700–1,200' },
    { name: 'MPU6050', qty: '1', role: 'Crash detect (B)', price: '৳150–280' },
    { name: 'SOS button + buzzer', qty: '1 set', role: 'Manual alert', price: '৳120–250' },
    { name: '12V→5V buck + 18650', qty: '1', role: 'Vehicle power', price: '৳400–700' },
    { name: 'Enclosure + mounts', qty: '1', role: 'In-vehicle rig', price: '৳300–500' },
  ],
  wiring: [
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      pins: [
        { from: 'GPS → TX/RX', to: 'GPIO16 / GPIO17 (Serial2 9600)' },
        { from: 'GSM → TX/RX', to: 'GPIO32 / GPIO33 (Serial1 9600)' },
        { from: 'GSM → VCC', to: '4.0V 2A buck (dedicated!)' },
        { from: 'MPU6050 → SDA/SCL', to: 'GPIO21 / GPIO22' },
        { from: 'SOS button →', to: 'GPIO15 (INPUT_PULLUP)' },
      ],
    },
    {
      id: 'power',
      label: 'Power tree',
      board: 'Vehicle 12V',
      pins: [
        { from: '12V batt → buck →', to: '5V rail (ESP + GPS)' },
        { from: '12V batt → 2nd buck →', to: '4.0V rail (SIM800L only)' },
        { from: 'All GNDs →', to: 'common ground point' },
        { from: '18650 backup →', to: 'keeps tracking if cut' },
      ],
    },
  ],
  steps: [
    { title: 'Get a GPS fix outdoors', detail: 'NEO-6M needs open sky — first fix takes 1–5 min. Confirm lat/lon on Serial before anything else.' },
    { title: 'Prove SMS both ways', detail: 'Send "LOC", receive Maps link. GSM needs its own 2A supply or texts silently fail.' },
    { title: 'Build the Maps link', detail: 'https://maps.google.com/?q=lat,lon — test the link from the SMS on a real phone.' },
    { title: 'Crash detection (B)', detail: 'MPU6050 total-accel > 3g for 200ms = impact. Confirm with a (gentle) drop test onto foam.' },
    { title: 'Cancel window', detail: 'After impact: 30s buzzer countdown, SOS button cancels. Only then SMS emergency contacts.' },
    { title: 'Road-test + trail', detail: 'Log a rickshaw/car ride, plot the trail, and demo geo-fence + overspeed alerts live.' },
  ],
  simulator: {
    intro: 'Same rule as the firmware: shock above the crash limit starts the SOS countdown.',
    sliders: [
      { id: 'shock', label: 'Impact force', unit: 'g', min: 0, max: 8, value: 1 },
      { id: 'speed', label: 'Speed', unit: 'km/h', min: 0, max: 120, value: 42 },
    ],
    threshold: { id: 'thr', label: 'Crash above', unit: 'g', min: 2, max: 6, value: 3 },
    watch: 'shock',
    rule: 'above',
    actuator: 'SOS',
    onText: 'COUNTDOWN',
    offText: 'idle',
    lcd: ['{shock}g {speed}km/h', 'SOS:{act}'],
    demoSlider: 'shock',
    demoFrom: 1,
    demoTo: 5,
    barLabel: 'Impact force',
  },
  code: [
    {
      id: 'a',
      label: 'A · SMS locator',
      note: 'Libraries: TinyGPS++. GPS on Serial2, GSM on Serial1. Reply "LOC" with Maps link.',
      code: `#include <TinyGPS++.h>
#include <HardwareSerial.h>
HardwareSerial gpsSerial(2), gsm(1);
TinyGPSPlus gps;
const char* OWNER = "+8801XXXXXXXXX";

void sendSMS(String msg) {
  gsm.println("AT+CMGF=1"); delay(300);
  gsm.print("AT+CMGS=\\""); gsm.print(OWNER); gsm.println("\\"");
  delay(300); gsm.print(msg); delay(300); gsm.write(26); delay(3000);
}

void setup() {
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
  gsm.begin(9600, SERIAL_8N1, 32, 33);
  delay(3000);
  gsm.println("AT+CNMI=2,2,0,0,0");  // push incoming SMS to serial
}

void loop() {
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  if (gsm.available()) {
    String s = gsm.readString();
    if (s.indexOf("LOC") >= 0 && gps.location.isValid()) {
      String link = "https://maps.google.com/?q=" +
        String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
      sendSMS(link);
    }
  }
}`,
    },
    {
      id: 'b',
      label: 'B · Crash SOS',
      note: 'MPU6050 impact detect + 30s cancel window + Blynk map point.',
      code: `#include <Wire.h>
#include <MPU6050.h>
MPU6050 mpu;
#define SOS_BTN 15
#define BUZZER 13
unsigned long impactAt = 0;
bool countdown = false;

float totalG() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  return sqrt(ax * ax + ay * ay + az * az) / 16384.0;
}

void loop() {
  float g = totalG();
  if (!countdown && g > 3.0) { countdown = true; impactAt = millis(); }
  if (countdown) {
    digitalWrite(BUZZER, (millis() / 500) % 2);  // beep-beep
    if (digitalRead(SOS_BTN) == LOW) countdown = false;  // "I'm OK"
    if (millis() - impactAt > 30000) {
      countdown = false;
      // sendSMS("CRASH! " + mapsLink());
      // Blynk.logEvent("crash");
    }
  }
  delay(50);
}`,
    },
  ],
  tips: [
    { title: 'Sky view', detail: 'GPS fails indoors — plan outdoor demo time and a window-seat backup.' },
    { title: 'GSM power', detail: 'Dedicated 4V/2A buck. Shared rails cause phantom SMS failures.' },
    { title: 'Cancel window', detail: '30s "I\'m OK" window before SOS is what makes crash alerts credible.' },
    { title: 'SIM credit', detail: 'Top up the demo SIM and test SMS the morning of the presentation.' },
  ],
}
