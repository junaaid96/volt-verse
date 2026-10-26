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
