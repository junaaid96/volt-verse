# VoltVerse — University Hardware Project Hub

Live site: <https://volt-verse-ums.vercel.app>

Hands-on IoT and electronics project guides for university students. Each guide
covers one build end to end: versions to choose from, components with
street-price ranges, wiring maps, ordered build steps, a logic simulator, and
Arduino sketches — per board (Uno, ESP32, NodeMCU, ESP32-CAM).

## Features

- 15 build guides (weather stations, health monitors, home automation, vehicle
  tracking, access control, and more), each with Basic → Advanced versions
- Per-board parts, wiring maps, and step text with board-specific details
- 71 Arduino sketches, one per board/version, all compile-verified
- Interactive 3D bench viewer, threshold-logic simulators, progress tracking,
  bookmarks, dark mode, and print-to-PDF guides

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint     # oxlint
```

## Sketch verification

Guide sketches live in `src/data/projects/*.ts` as `code` variants. Two checks
keep them honest:

```bash
npm run check:guides              # sketch ↔ board/version pairing rules
scripts/compile-sketches.sh       # compile every sketch with arduino-cli
```

Compiling needs `arduino-cli` with the `arduino:avr`, `esp32:esp32`, and
`esp8266:esp8266` cores plus the guides' libraries (Adafruit Sensor/BME280/
SSD1306/GFX, Blynk + BlynkESP8266_Lib, DallasTemperature, DHT, ESP32Servo,
ESP_SSLClient, FirebaseClient, Keypad, LiquidCrystal I2C, LoRa, MFRC522,
MPU6050, OneWire, PZEM004Tv30, RTClib, SD, Servo, SparkFun MAX3010x,
ThingSpeak, TinyGPSPlus, U8g2, UniversalTelegramBot).

`scripts/extract-sketches.ts` also reports versions a supported board has no
sketch for — see the gap list before adding a new board to a guide.

> Compiling proves the code builds, not that it works on real sensors. Several
> sketches (notably the NodeMCU ports) still need flash-testing on hardware.

## Layout

- `src/data/projects/` — guide content: parts, wiring, steps, simulator, code
- `src/data/guideView.ts` — board/version selection and sketch pairing logic
- `src/components/board/` — 3D bench viewer · `src/components/sim/` — simulator
- `src/pages/` — Home, Catalog, ProjectDetail · `scripts/` — sketch tooling

## Contributing

Issues and pull requests are welcome. New or changed sketches must pass
`scripts/compile-sketches.sh`, and new guides should follow the shape of the
existing entries in `src/data/projects/`.

## Safety

Some builds switch mains voltage or charge lithium cells. If you are unsure
about relay isolation, fusing, or battery protection, build the low-voltage
version first and ask someone experienced to review your wiring.

## License

MIT — see [LICENSE](LICENSE).
