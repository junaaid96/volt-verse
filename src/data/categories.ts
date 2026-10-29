import type { Category } from './types'

/**
 * Category registry. To add a future track (Robotics, VLSI, ...):
 * 1. flip its status to 'live'
 * 2. add project files under src/data/projects and register them in index.ts
 * Nothing else needs to change — home, catalog and routing read this file.
 */
export const categories: Category[] = [
  {
    id: 'iot',
    name: 'IoT Systems',
    tagline: 'Sensors, Wi-Fi & cloud dashboards',
    description:
      'Fifteen complete builds on ESP32, ESP8266 and Arduino — every one with versions, wiring, steps, a live logic simulator and copy-paste code.',
    icon: 'wifi',
    status: 'live',
  },
  {
    id: 'robotics',
    name: 'Robotics',
    tagline: 'Motion, control & autonomy',
    description:
      'Twelve complete builds on Arduino, ESP32 and ESP8266 — every one with versions, wiring, steps, a live logic simulator and copy-paste code.',
    icon: 'bot',
    status: 'live',
  },
  // Planned lineup (5): Wi-Fi attack detector, BLE tracker detector, RFID
  // cloning lab, encrypted LoRa messenger, attack-tested password vault.
  // Vetted: rogue-AP merged into the detector (same radio + technique),
  // honeypot cut (real ones need a Pi, sim too thin), brute-force rig merged
  // into the vault as its test story.
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    tagline: 'Detectors, crypto & hardening',
    description:
      'ESP32 and Arduino builds: a Wi-Fi attack detector, BLE tracker detector, RFID cloning lab, encrypted LoRa messenger and an attack-tested password vault.',
    icon: 'shield',
    status: 'soon',
    planned: 5,
  },
  // Planned lineup (6): TinyML person detector, voice switch, IMU gesture
  // remote, motor anomaly monitor, fall detector, vision waste sorter. Vetted:
  // crop spotter cut (third CAM classifier, weakest differentiation),
  // forecaster cut (needs days of data — undemoable for coursework).
  {
    id: 'ai-ml',
    name: 'AI & ML',
    tagline: 'TinyML & edge intelligence',
    description:
      'ESP32-CAM and sensor builds that think on-device: person detection, voice switches, gesture remotes, anomaly monitors and a vision waste sorter — trained, deployed and running offline.',
    icon: 'brain',
    status: 'soon',
    planned: 6,
  },
  // Planned lineup (6): MQTT sensor network, telemetry web app + rig, BLE
  // app + rover, OTA fleet updater, field logger + analytics, calibration
  // bench. Vetted: voice relay cut (cloud-dependent, duplicates the KWS demo),
  // HIL rig cut (always-on runner hardware out of student reach).
  {
    id: 'software',
    name: 'Software',
    tagline: 'Devices, dashboards & apps',
    description:
      'Hardware builds with software you own: an MQTT sensor network, telemetry web app, BLE rover app, OTA fleet server, field logger and a calibration bench.',
    icon: 'app',
    status: 'soon',
    planned: 6,
  },
  // Planned lineup (6): ESP-NOW mesh network, LoRa relay + range mapper,
  // Wi-Fi field kit (extender + portal + watchdog), nRF24 sensor network,
  // dual-uplink failover node (Wi-Fi + GSM), RS-485 Modbus bus. Vetted: BLE
  // mesh swapped for nRF24 (provisioning too heavy for coursework), portal and
  // watchdog merged into the field kit (too thin standalone).
  {
    id: 'networking',
    name: 'Networking',
    tagline: 'Mesh, LoRa & links',
    description:
      'Wireless builds where the link is the project: ESP-NOW mesh, LoRa relays, a Wi-Fi field kit, nRF24 and RS-485 sensor networks, plus a dual-uplink failover node.',
    icon: 'network',
    status: 'soon',
    planned: 6,
  },
  {
    id: 'embedded',
    name: 'Embedded C',
    tagline: 'Bare-metal & RTOS',
    description:
      'STM32, AVR and PIC builds: drivers from scratch, interrupts, timers and FreeRTOS labs.',
    icon: 'cpu',
    status: 'soon',
    planned: 10,
  },
  {
    id: 'vlsi',
    name: 'VLSI & FPGA',
    tagline: 'HDL & digital design',
    description:
      'Verilog labs, FPGA boards andTiny Tapeout-style flows for digital-design courses.',
    icon: 'circuit',
    status: 'soon',
    planned: 8,
  },
  {
    id: 'drones',
    name: 'Drones & RC',
    tagline: 'Flight controllers & telemetry',
    description:
      'Quadcopter builds, PID tuning, FPV telemetry and payload-drop mechanisms.',
    icon: 'plane',
    status: 'soon',
    planned: 6,
  },
  {
    id: 'energy',
    name: 'Renewable Energy',
    tagline: 'Solar, storage & metering',
    description:
      'Solar trackers, MPPT chargers, smart inverters and energy-monitoring rigs.',
    icon: 'solar',
    status: 'soon',
    planned: 8,
  },
]

export const getCategory = (id: string) => categories.find((c) => c.id === id)
