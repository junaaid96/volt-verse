import type { Project } from '../types'

export const selfBalancingRobot: Project = {
  slug: 'self-balancing-robot',
  categoryId: 'robotics',
  title: 'Self-Balancing Robot',
  tagline: 'A two-wheel inverted pendulum that stays upright with PID.',
  difficulty: 'Advanced',
  weeks: '3–4 weeks',
  cost: '৳2,600–4,500',
  boards: ['Arduino Uno', 'ESP32'],
  defaultBoard: 'uno',
  support: {
    uno: { ok: true, note: 'Classic build: MPU6050 on A4/A5, 6-wire L298N drive, 100 Hz PID on millis().' },
    esp32: { ok: true, note: 'MPU6050 on GPIO21/22, motor speed via analogWrite(), USB Serial stays free for tuning.' },
    nodemcu: {
      ok: false,
      reason: 'Its only full UART is shared with USB (B’s HC-05 would collide with flashing and debug), the single 0–1 V ADC complicates the battery divider, and motor pins double as boot-strapping pins that can stall boot.',
    },
    esp32cam: {
      ok: false,
      reason: 'Camera, flash and SD card leave only ~4 free GPIO; the 6-wire L298N plus I2C, Bluetooth and battery sense need 10+.',
    },
  },
  skills: ['PID control', 'IMU sensor fusion', 'Motor driving', 'Bluetooth trim'],
  scene: 'city',
  updated: 'Oct 2026',
  sheets: ['arduino-uno', 'esp32', 'mpu6050', 'l298n', 'hc05'],
  rig: { sensor: 'chassis', extras: ['mpu', 'l298n'] },
  options: [
    {
      id: 'a',
      title: 'A. PID balancer',
      level: 'Advanced · core build',
      blurb: 'MPU6050 tilt angle feeds a 100 Hz PID loop driving both wheels back under the fall; motors cut past ±30°.',
      points: ['Raw-Wire MPU6050 + complementary filter', '100 Hz PID with anti-windup', '±30° fall cutout'],
      weeks: '2–3 weeks',
      cost: '৳2,600–3,800',
    },
    {
      id: 'b',
      title: 'B. Remote trim + failsafe',
      level: 'Advanced · full build',
      blurb: 'Adds HC-05 setpoint trim to drive it around, live Kp tuning over Serial and a 6.6 V battery cutout with safe stop.',
      points: ['F/B/S setpoint trim over Bluetooth', 'Live Kp tuning with Serial echo', '6.6 V cutout + safe stop'],
      weeks: '3–4 weeks',
      cost: '৳3,000–4,500',
    },
  ],
  parts: [
    { name: 'Arduino Uno', qty: '1', role: 'Controller', price: '৳750–1,300', boards: ['uno'] },
    { name: 'ESP32 DevKit', qty: '1', role: 'Controller', price: '৳470–850', boards: ['esp32'] },
    { name: '2-wheel balancer chassis (frame + 2 gear motors + wheels, no caster)', qty: '1', role: 'Pendulum body', price: '৳500–900' },
    { name: 'L298N motor driver', qty: '1', role: 'Dual H-bridge', price: '৳180–350' },
    { name: 'MPU6050 IMU module', qty: '1', role: 'Tilt angle (raw Wire)', price: '৳150–320' },
    { name: '2S 18650 holder + cells', qty: '1 set', role: 'Power — mounts HIGH above axle', price: '৳300–600' },
    { name: 'M3 standoffs + rubber feet', qty: '1 set', role: 'Tall battery tray + safety stand', price: '৳80–200' },
    { name: 'HC-05 Bluetooth module', qty: '1', role: 'Remote trim link (9600 baud)', price: '৳280–450', versions: ['b'] },
    { name: '1k + 2k resistors', qty: '1 + 1', role: 'HC-05 RX divider', price: '৳10–30', versions: ['b'] },
    { name: '100k + 47k resistors', qty: '1 + 1', role: 'Battery sense divider', price: '৳10–30', versions: ['b'] },
    { name: 'Jumpers', qty: '1 set', role: 'Wiring', price: '৳60–150' },
  ],
  wiring: [
    {
      id: 'uno',
      label: 'Arduino Uno build',
      board: 'Arduino Uno',
      boards: ['uno'],
      pins: [
        { from: 'L298N ENA / IN1 / IN2 (left motor)', to: 'D5 / D7 / D8' },
        { from: 'L298N IN3 / IN4 / ENB (right motor)', to: 'D9 / D10 / D11' },
        { from: 'MPU6050 VCC / GND', to: '5V / GND (module has a 3V3 regulator)' },
        { from: 'MPU6050 SDA / SCL', to: 'A4 / A5 (X axis along the wheel axle)' },
        { from: 'HC-05 VCC / GND / TX (B)', to: '5V / GND / D2 (SoftwareSerial RX)' },
        { from: 'D3 (SoftwareSerial TX) → 1k/2k divider (B)', to: 'HC-05 RX (3.3V only!)' },
        { from: 'Battery + → 100k/47k divider → (B)', to: 'A0 (divider GND to battery −)' },
      ],
    },
    {
      id: 'esp32',
      label: 'ESP32 build',
      board: 'ESP32 DevKit',
      boards: ['esp32'],
      pins: [
        { from: 'L298N ENA / IN1 / IN2 (left motor)', to: 'GPIO25 / GPIO26 / GPIO27' },
        { from: 'L298N IN3 / IN4 / ENB (right motor)', to: 'GPIO14 / GPIO13 / GPIO23' },
        { from: 'MPU6050 VCC / GND', to: '3V3 / GND' },
        { from: 'MPU6050 SDA / SCL', to: 'GPIO21 / GPIO22 (X axis along the wheel axle)' },
        { from: 'HC-05 VCC / GND / TX (B)', to: '5V / GND / GPIO16 (Serial2 RX)' },
        { from: 'GPIO17 (Serial2 TX) → 1k/2k divider (B)', to: 'HC-05 RX (3.3V only!)' },
        { from: 'Battery + → 100k/47k divider → (B)', to: 'GPIO36 ADC1 (divider GND to battery −)' },
      ],
    },
    {
      id: 'power',
      label: 'Power',
      board: 'Battery',
      pins: [
        { from: 'Battery +/−', to: 'L298N 12V input / GND' },
        { from: 'L298N 5V (jumper on)', to: 'board 5V/VIN (battery ≤ 12V only)' },
        { from: 'HC-05 VCC (B)', to: '5V (the module regulates to 3.3V itself)' },
        { from: 'Battery tray position', to: 'HIGH above the axle — the pendulum mass slows the fall' },
        { from: 'Common GND', to: 'board GND + L298N GND + MPU GND + HC-05 GND' },
      ],
    },
  ],
  steps: [
    {
      id: 'build-pendulum-chassis',
      title: 'Build the pendulum chassis',
      detail: 'Two driven wheels only — no caster. Stack the frame tall and mount the battery tray HIGH above the axle: an inverted pendulum needs its mass up top so it falls slowly enough for the PID loop to catch.',
    },
    {
      id: 'mount-mpu-centered',
      title: 'Mount the MPU6050 flat and centered',
      detail: 'Fix the MPU6050 flat and centered between the wheels with its X axis parallel to the wheel axle and its axes square to the frame. A tilted or off-center IMU reads a phantom lean the PID can never fix — shim it level.',
    },
    {
      id: 'align-wheels-parallel',
      title: 'Align the wheels dead parallel',
      detail: 'Both wheels must be parallel with no toe-in, the same diameter, and spinning freely with equal drag. Toe-in or a dragging gearbox yaws the bot on every correction and no Kp value will save it.',
    },
    {
      id: 'wire-motor-driver',
      title: 'Wire the L298N',
      detail: 'Left channel ENA/IN1/IN2 → D5/D7/D8; right channel IN3/IN4/ENB → D9/D10/D11. Motor leads to OUT1/OUT2 (left) and OUT3/OUT4 (right).',
      boardDetail: {
        esp32: 'Left channel ENA/IN1/IN2 → GPIO25/26/27; right channel IN3/IN4/ENB → GPIO14/13/23. Motor leads to OUT1/OUT2 (left) and OUT3/OUT4 (right).',
      },
    },
    {
      id: 'wire-mpu',
      title: 'Wire the MPU6050',
      detail: 'VCC→5V, GND→GND, SDA→A4, SCL→A5. Keep the I2C wires short and away from the motor leads — motor noise on SDA/SCL shows up as angle jitter.',
      boardDetail: {
        esp32: 'VCC→3V3, GND→GND, SDA→GPIO21, SCL→GPIO22. Keep the I2C wires short and away from the motor leads — motor noise on SDA/SCL shows up as angle jitter.',
      },
    },
    {
      id: 'install-board-core',
      title: 'Install the ESP32 board package',
      detail: 'Boards Manager → esp32 by Espressif (3.x) for analogWrite() and Serial2 support. No MPU6050 library needed — the sketch reads raw Wire registers.',
      boards: ['esp32'],
    },
    {
      id: 'upload-balance-sketch',
      title: 'Upload and bench-test',
      detail: 'Upload sketch A with the wheels off the table: tilt the frame forward by hand and both wheels must spin forward to drive back under the fall. If they spin the wrong way, swap both motor lead pairs (or flip the gyro sign in the sketch). Serial prints the live angle — level must read near 0°.',
    },
    {
      id: 'hand-tune-pid',
      title: 'Tune the PID in your hand',
      detail: 'Start tuning with the robot held in your hand over a pillow, not on the floor. With Ki=0, Kd=0, raise Kp until it oscillates steadily; add Kd until the oscillation damps out; then add a little Ki (0.2–2) to kill slow drift. Only then try a floor release.',
    },
    {
      id: 'add-bt-battery',
      title: 'Add Bluetooth trim + battery sense',
      detail: 'HC-05 TX→D2, D3 → 1k/2k divider → HC-05 RX; battery + through the 100k/47k divider → A0. Upload sketch B: F/B nudge the lean setpoint ±3° to drive, S recenters, +/− tune Kp live with a Serial echo.',
      boardDetail: {
        esp32: 'HC-05 TX→GPIO16 (Serial2 RX), GPIO17 → 1k/2k divider → HC-05 RX; battery + through the 100k/47k divider → GPIO36. Upload sketch B: F/B nudge the lean setpoint ±3° to drive, S recenters, +/− tune Kp live with a Serial echo.',
      },
      versions: ['b'],
    },
    {
      id: 'trim-balance-demo',
      title: 'Film the balance demo',
      detail: 'Film a 30 s free balance plus a driven square (F/B trim with hand steering). Check the Serial voltage against a multimeter, and confirm the motors cut when the pack sags under 6.6 V — angle-vs-time makes an easy report chart.',
      versions: ['b'],
    },
  ],
  simulator: {
    viz: 'gauge',
    intro: 'Same idea as the firmware: lean forward past the trip point and both motors drive FWD to get back under the fall; lean back and they reverse.',
    sliders: [
      { id: 'tilt', label: 'Tilt', unit: '°', min: -30, max: 30, value: 2 },
      { id: 'battery', label: 'Battery', unit: 'V', min: 5, max: 8.4, value: 7.6 },
    ],
    threshold: { id: 'trip', label: 'Trip point', unit: '°', min: 1, max: 10, value: 3 },
    watch: 'tilt',
    rule: 'above',
    actuator: 'Motor',
    onText: 'FWD',
    offText: 'REV',
    lcd: ['Tilt:{tilt}deg', 'Motor:{act}'],
    demoSlider: 'tilt',
    demoFrom: -12,
    demoTo: 12,
    barLabel: 'Tilt',
  },
  code: [
    {
      id: 'a',
      label: 'A · PID balancer',
      note: 'MPU6050 over raw Wire (SDA A4, SCL A5): wake 0x6B=0, accel from 0x3B, gyro X from 0x43, complementary filter, 100 Hz PID to D5/D7/D8 + D9/D10/D11. Motors cut past ±30°; Serial prints the live angle.',
      board: 'uno',
      versions: ['a'],
      code: `// Self-balancing robot A: MPU6050 tilt -> PID -> both L298N motors.
// +angle = leaning forward; both wheels drive the SAME way to get back
// under the fall. MPU: VCC->5V, GND->GND, SDA->A4, SCL->A5, X axis along
// the wheel axle. If it drives AWAY from the fall, swap both motor leads.
// TUNE IN THIS ORDER (hold the robot in your hand, wheels free):
//   1. Ki=0, Kd=0: raise Kp until it oscillates steadily.
//   2. Raise Kd until the oscillation damps out.
//   3. Raise Ki a little (0.2..2) to kill slow drift; too much re-oscillates.
#include <Wire.h>

const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int MPU = 0x68;

float Kp = 35.0, Ki = 0.8, Kd = 1.2;  // start here, then tune (see above)
float angle = 0, integral = 0, prevErr = 0;
unsigned long lastT = 0, lastPrint = 0;

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

void mpuRead(int16_t &ay, int16_t &az, int16_t &gx) {
  Wire.beginTransmission(MPU);  // accel burst from 0x3B: ax, ay, az
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);
  Wire.read(); Wire.read();  // ax unused: X runs along the axle
  ay = ((int16_t)Wire.read() << 8) | Wire.read();
  az = ((int16_t)Wire.read() << 8) | Wire.read();
  Wire.beginTransmission(MPU);  // gyro X rate from 0x43
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  gx = ((int16_t)Wire.read() << 8) | Wire.read();
}

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  Serial.begin(115200);  // live angle debug for tuning
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  Wire.begin();
  mpuWrite(0x6B, 0);  // wake the MPU6050
  delay(100);
}

void loop() {
  unsigned long now = millis();
  if (now - lastPrint > 200) { lastPrint = now; Serial.println(angle); }
  if (now - lastT < 10) return;  // fixed 10 ms tick = ~100 Hz PID
  lastT = now;
  const float dt = 0.01;

  int16_t ay, az, gx;
  mpuRead(ay, az, gx);
  float accelAngle = atan2((float)ay, (float)az) * 180.0 / PI;
  float gyroRate = (float)gx / 131.0;  // deg/s at +/-250 dps full scale
  angle = 0.98 * (angle + gyroRate * dt) + 0.02 * accelAngle;  // complementary filter

  if (fabs(angle) > 30.0) { drive(0, 0); integral = 0; prevErr = 0; return; }  // picked up / fallen

  float err = angle;  // setpoint 0 = upright
  integral = constrain(integral + err * dt, -100.0f, 100.0f);  // anti-windup
  float deriv = (err - prevErr) / dt;
  prevErr = err;
  int out = constrain((int)(Kp * err + Ki * integral + Kd * deriv), -255, 255);
  drive(out, out);  // same direction both wheels: drive under the fall
}`,
    },
    {
      id: 'a-esp32',
      label: 'A · ESP32 PID balancer',
      note: 'Same logic as the Uno sketch. MPU6050 on GPIO21/22 (Wire.begin(21, 22)), motors GPIO25/26/27 + GPIO14/13/23 via analogWrite(), live angle on USB Serial.',
      board: 'esp32',
      versions: ['a'],
      code: `// Self-balancing robot A (ESP32): MPU6050 tilt -> PID -> both motors.
// +angle = leaning forward; both wheels drive the SAME way to get back
// under the fall. MPU: VCC->3V3, GND->GND, SDA->GPIO21, SCL->GPIO22,
// X axis along the wheel axle. If it drives AWAY from the fall, swap
// both motor leads.
// TUNE IN THIS ORDER (hold the robot in your hand, wheels free):
//   1. Ki=0, Kd=0: raise Kp until it oscillates steadily.
//   2. Raise Kd until the oscillation damps out.
//   3. Raise Ki a little (0.2..2) to kill slow drift; too much re-oscillates.
#include <Wire.h>

const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int MPU = 0x68;

float Kp = 35.0, Ki = 0.8, Kd = 1.2;  // start here, then tune (see above)
float angle = 0, integral = 0, prevErr = 0;
unsigned long lastT = 0, lastPrint = 0;

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

void mpuRead(int16_t &ay, int16_t &az, int16_t &gx) {
  Wire.beginTransmission(MPU);  // accel burst from 0x3B: ax, ay, az
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);
  Wire.read(); Wire.read();  // ax unused: X runs along the axle
  ay = ((int16_t)Wire.read() << 8) | Wire.read();
  az = ((int16_t)Wire.read() << 8) | Wire.read();
  Wire.beginTransmission(MPU);  // gyro X rate from 0x43
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  gx = ((int16_t)Wire.read() << 8) | Wire.read();
}

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

void setup() {
  Serial.begin(115200);  // live angle debug for tuning
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  Wire.begin(21, 22);
  mpuWrite(0x6B, 0);  // wake the MPU6050
  delay(100);
}

void loop() {
  unsigned long now = millis();
  if (now - lastPrint > 200) { lastPrint = now; Serial.println(angle); }
  if (now - lastT < 10) return;  // fixed 10 ms tick = ~100 Hz PID
  lastT = now;
  const float dt = 0.01;

  int16_t ay, az, gx;
  mpuRead(ay, az, gx);
  float accelAngle = atan2((float)ay, (float)az) * 180.0 / PI;
  float gyroRate = (float)gx / 131.0;  // deg/s at +/-250 dps full scale
  angle = 0.98 * (angle + gyroRate * dt) + 0.02 * accelAngle;  // complementary filter

  if (fabs(angle) > 30.0) { drive(0, 0); integral = 0; prevErr = 0; return; }  // picked up / fallen

  float err = angle;  // setpoint 0 = upright
  integral = constrain(integral + err * dt, -100.0f, 100.0f);  // anti-windup
  float deriv = (err - prevErr) / dt;
  prevErr = err;
  int out = constrain((int)(Kp * err + Ki * integral + Kd * deriv), -255, 255);
  drive(out, out);  // same direction both wheels: drive under the fall
}`,
    },
    {
      id: 'b',
      label: 'B · Remote trim + failsafe',
      note: 'A plus HC-05 trim on SoftwareSerial D2/D3 (F/B = setpoint ±3°, S = recenter, +/− = Kp with Serial echo) and a 6.6 V battery cutout (resume 7.0 V) read on A0 via 100k/47k.',
      board: 'uno',
      versions: ['b'],
      code: `// Self-balancing robot B: A + HC-05 remote trim + battery failsafe.
// F = drive forward (setpoint +3 deg), B = back (-3 deg), S = recenter.
// '+' / '-' raise/lower Kp live; every change echoes on USB Serial.
// Below 6.6 V the motors cut and the bot settles forward onto its stand
// instead of oscillating on a dying pack (resume above 7.0 V).
#include <Wire.h>
#include <SoftwareSerial.h>

SoftwareSerial bt(2, 3);  // RX=D2 <- HC-05 TX, TX=D3 -> divider -> HC-05 RX
const int ENA = 5, IN1 = 7, IN2 = 8;    // left motor
const int IN3 = 9, IN4 = 10, ENB = 11;  // right motor
const int BATT = A0;  // pack + via 100k/47k divider
const int MPU = 0x68;

float Kp = 35.0, Ki = 0.8, Kd = 1.2;  // tune as in A, then trim live
float setpoint = 0;  // remote lean trim, degrees (+ = forward)
float angle = 0, integral = 0, prevErr = 0;
bool lowBatt = false;
unsigned long lastT = 0;

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

void mpuRead(int16_t &ay, int16_t &az, int16_t &gx) {
  Wire.beginTransmission(MPU);  // accel burst from 0x3B: ax, ay, az
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);
  Wire.read(); Wire.read();  // ax unused: X runs along the axle
  ay = ((int16_t)Wire.read() << 8) | Wire.read();
  az = ((int16_t)Wire.read() << 8) | Wire.read();
  Wire.beginTransmission(MPU);  // gyro X rate from 0x43
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  gx = ((int16_t)Wire.read() << 8) | Wire.read();
}

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

float battV() {  // 100k/47k divider on the 2S pack
  return analogRead(BATT) * 5.0 / 1023.0 * (100.0 + 47.0) / 47.0;
}

void setup() {
  Serial.begin(9600);  // setpoint / Kp echo
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(BATT, INPUT);
  Wire.begin();
  mpuWrite(0x6B, 0);  // wake the MPU6050
  bt.begin(9600);  // HC-05 default baud
  delay(100);
}

void loop() {
  while (bt.available()) {
    char c = bt.read();
    if (c >= 'a' && c <= 'z') c -= 32;  // tolerate lowercase
    if (c == 'F') setpoint = 3;
    else if (c == 'B') setpoint = -3;
    else if (c == 'S') setpoint = 0;
    else if (c == '+') Kp += 1;
    else if (c == '-') { if (Kp > 1) Kp -= 1; }
    else continue;  // ignore anything else
    Serial.print("setpoint="); Serial.print(setpoint);
    Serial.print(" Kp="); Serial.println(Kp);
  }

  float v = battV();
  if (v < 6.6) {
    if (!lowBatt) { Serial.print("LOW BATTERY "); Serial.println(v); }
    lowBatt = true;
  } else if (v > 7.0) {
    lowBatt = false;
  }
  if (lowBatt) { drive(0, 0); integral = 0; prevErr = 0; return; }  // safe stop

  unsigned long now = millis();
  if (now - lastT < 10) return;  // fixed 10 ms tick = ~100 Hz PID
  lastT = now;
  const float dt = 0.01;

  int16_t ay, az, gx;
  mpuRead(ay, az, gx);
  float accelAngle = atan2((float)ay, (float)az) * 180.0 / PI;
  float gyroRate = (float)gx / 131.0;  // deg/s at +/-250 dps full scale
  angle = 0.98 * (angle + gyroRate * dt) + 0.02 * accelAngle;  // complementary filter

  if (fabs(angle) > 30.0) { drive(0, 0); integral = 0; prevErr = 0; return; }  // picked up / fallen

  float err = angle - setpoint;
  integral = constrain(integral + err * dt, -100.0f, 100.0f);  // anti-windup
  float deriv = (err - prevErr) / dt;
  prevErr = err;
  int out = constrain((int)(Kp * err + Ki * integral + Kd * deriv), -255, 255);
  drive(out, out);  // same direction both wheels: drive under the fall
}`,
    },
    {
      id: 'b-esp32',
      label: 'B · ESP32 remote trim + failsafe',
      note: 'Same logic as the Uno sketch on Serial2: HC-05 TX → GPIO16, GPIO17 → divider → HC-05 RX; battery on GPIO36 (ADC1) via 100k/47k with 12-bit ADC math.',
      board: 'esp32',
      versions: ['b'],
      code: `// Self-balancing robot B (ESP32): A + HC-05 trim + battery failsafe.
// F = drive forward (setpoint +3 deg), B = back (-3 deg), S = recenter.
// '+' / '-' raise/lower Kp live; every change echoes on USB Serial.
// Below 6.6 V the motors cut and the bot settles forward onto its stand
// instead of oscillating on a dying pack (resume above 7.0 V).
#include <Wire.h>

const int BT_RX = 16, BT_TX = 17;  // Serial2 RX <- HC-05 TX, TX -> divider -> HC-05 RX
const int ENA = 25, IN1 = 26, IN2 = 27;  // left motor
const int IN3 = 14, IN4 = 13, ENB = 23;  // right motor
const int BATT = 36;  // pack + via 100k/47k divider (ADC1)
const int MPU = 0x68;

float Kp = 35.0, Ki = 0.8, Kd = 1.2;  // tune as in A, then trim live
float setpoint = 0;  // remote lean trim, degrees (+ = forward)
float angle = 0, integral = 0, prevErr = 0;
bool lowBatt = false;
unsigned long lastT = 0;

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

void mpuRead(int16_t &ay, int16_t &az, int16_t &gx) {
  Wire.beginTransmission(MPU);  // accel burst from 0x3B: ax, ay, az
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);
  Wire.read(); Wire.read();  // ax unused: X runs along the axle
  ay = ((int16_t)Wire.read() << 8) | Wire.read();
  az = ((int16_t)Wire.read() << 8) | Wire.read();
  Wire.beginTransmission(MPU);  // gyro X rate from 0x43
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2);
  gx = ((int16_t)Wire.read() << 8) | Wire.read();
}

void drive(int l, int r) {  // -255..255 per side
  digitalWrite(IN1, l >= 0); digitalWrite(IN2, l < 0); analogWrite(ENA, abs(l));
  digitalWrite(IN3, r >= 0); digitalWrite(IN4, r < 0); analogWrite(ENB, abs(r));
}

float battV() {  // 100k/47k divider, 12-bit ADC, ~3.3V full scale
  return analogRead(BATT) * 3.3 / 4095.0 * (100.0 + 47.0) / 47.0;
}

void setup() {
  Serial.begin(115200);  // setpoint / Kp echo
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(BATT, INPUT);
  Wire.begin(21, 22);
  mpuWrite(0x6B, 0);  // wake the MPU6050
  Serial2.begin(9600, SERIAL_8N1, BT_RX, BT_TX);  // HC-05 default baud
  delay(100);
}

void loop() {
  while (Serial2.available()) {
    char c = Serial2.read();
    if (c >= 'a' && c <= 'z') c -= 32;  // tolerate lowercase
    if (c == 'F') setpoint = 3;
    else if (c == 'B') setpoint = -3;
    else if (c == 'S') setpoint = 0;
    else if (c == '+') Kp += 1;
    else if (c == '-') { if (Kp > 1) Kp -= 1; }
    else continue;  // ignore anything else
    Serial.print("setpoint="); Serial.print(setpoint);
    Serial.print(" Kp="); Serial.println(Kp);
  }

  float v = battV();
  if (v < 6.6) {
    if (!lowBatt) { Serial.print("LOW BATTERY "); Serial.println(v); }
    lowBatt = true;
  } else if (v > 7.0) {
    lowBatt = false;
  }
  if (lowBatt) { drive(0, 0); integral = 0; prevErr = 0; return; }  // safe stop

  unsigned long now = millis();
  if (now - lastT < 10) return;  // fixed 10 ms tick = ~100 Hz PID
  lastT = now;
  const float dt = 0.01;

  int16_t ay, az, gx;
  mpuRead(ay, az, gx);
  float accelAngle = atan2((float)ay, (float)az) * 180.0 / PI;
  float gyroRate = (float)gx / 131.0;  // deg/s at +/-250 dps full scale
  angle = 0.98 * (angle + gyroRate * dt) + 0.02 * accelAngle;  // complementary filter

  if (fabs(angle) > 30.0) { drive(0, 0); integral = 0; prevErr = 0; return; }  // picked up / fallen

  float err = angle - setpoint;
  integral = constrain(integral + err * dt, -100.0f, 100.0f);  // anti-windup
  float deriv = (err - prevErr) / dt;
  prevErr = err;
  int out = constrain((int)(Kp * err + Ki * integral + Kd * deriv), -255, 255);
  drive(out, out);  // same direction both wheels: drive under the fall
}`,
    },
  ],
  tips: [
    { title: 'Mass belongs up high', detail: 'A top-heavy bot falls slowly enough for the 10 ms loop to catch; a bottom-heavy one drops faster than full PWM can chase.' },
    { title: 'Level reads 0°', detail: 'With the frame held level, Serial must print near 0° — if not, re-seat the MPU flat before touching Kp.' },
    { title: 'Tune one gain at a time', detail: 'Kp until it oscillates, Kd until it damps, then a whisper of Ki. Changing two at once hides which one fixed it.' },
    { title: 'Hand first, floor later', detail: 'A freshly tuned balancer at full PWM crosses the room in a second — wear the tuning in over a pillow with the bot in hand.' },
  ],
}
