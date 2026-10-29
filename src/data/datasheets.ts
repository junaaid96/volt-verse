import type { Datasheet } from './types'

/**
 * Verified documentation registry. Every URL below returned HTTP 200
 * when checked (Oct 2026). Projects reference entries via `sheets: [...]`.
 * Unknown keys are ignored by the UI, so typos fail safe.
 */
export const datasheets: Record<string, Datasheet> = {
  'esp32': {
    key: 'esp32',
    label: 'ESP32 Datasheet (Espressif)',
    url: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf',
    kind: 'PDF',
  },
  'esp8266': {
    key: 'esp8266',
    label: 'ESP8266EX Datasheet (Espressif)',
    url: 'https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf',
    kind: 'PDF',
  },
  'esp32cam': {
    key: 'esp32cam',
    label: 'ESP32-CAM Guide (Random Nerd)',
    url: 'https://randomnerdtutorials.com/esp32-cam-video-streaming-face-recognition-arduino-ide/',
    kind: 'Guide',
  },
  'arduino-uno': {
    key: 'arduino-uno',
    label: 'Arduino Uno Rev3 Docs',
    url: 'https://docs.arduino.cc/hardware/uno-rev3/',
    kind: 'Docs',
  },
  'dht22': {
    key: 'dht22',
    label: 'DHT22 / AM2302 Datasheet',
    url: 'https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf',
    kind: 'PDF',
  },
  'bme280': {
    key: 'bme280',
    label: 'BME280 Datasheet (Bosch)',
    url: 'https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf',
    kind: 'PDF',
  },
  'hcsr04': {
    key: 'hcsr04',
    label: 'HC-SR04 Datasheet',
    url: 'https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf',
    kind: 'PDF',
  },
  'mfrc522': {
    key: 'mfrc522',
    label: 'MFRC522 Datasheet (NXP via Octopart)',
    url: 'https://datasheet.octopart.com/MFRC52201HN1%2C151-NXP-Semiconductors-datasheet-15937754.pdf',
    kind: 'PDF',
  },
  'max30102': {
    key: 'max30102',
    label: 'MAX3010x Library + Docs (SparkFun)',
    url: 'https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library',
    kind: 'Docs',
  },
  'ds18b20': {
    key: 'ds18b20',
    label: 'DS18B20 Datasheet',
    url: 'https://cdn-shop.adafruit.com/datasheets/DS18B20.pdf',
    kind: 'PDF',
  },
  'ds3231': {
    key: 'ds3231',
    label: 'DS3231 RTC Guide (Adafruit)',
    url: 'https://learn.adafruit.com/adafruit-ds3231-precision-rtc-breakout',
    kind: 'Guide',
  },
  'pms5003': {
    key: 'pms5003',
    label: 'PMS5003 Air Sensor Guide (Adafruit)',
    url: 'https://learn.adafruit.com/pm25-air-quality-sensor',
    kind: 'Guide',
  },
  'mq2': {
    key: 'mq2',
    label: 'MQ-2 Gas Sensor Wiki (Seeed)',
    url: 'https://wiki.seeedstudio.com/Grove-Gas_Sensor-MQ2/',
    kind: 'Guide',
  },
  'sim800l': {
    key: 'sim800l',
    label: 'SIM800L Hardware Design V1.00 (SIMCom mirror)',
    url: 'https://www.egloff.eu/images/arduino/SIM800L_Hardware_Design_V1.00.pdf',
    kind: 'PDF',
  },
  'acs712': {
    key: 'acs712',
    label: 'ACS712 Datasheet (Allegro)',
    url: 'https://www.allegromicro.com/-/media/files/datasheets/acs712-datasheet.ashx',
    kind: 'PDF',
  },
  'neo6m': {
    key: 'neo6m',
    label: 'NEO-6 Series (u-blox)',
    url: 'https://www.u-blox.com/en/product/neo-6-series',
    kind: 'Docs',
  },
  'pzem-manual': {
    key: 'pzem-manual',
    label: 'PZEM-004T Library + Docs',
    url: 'https://github.com/mandulaj/PZEM-004T-v30',
    kind: 'Docs',
  },
  'sx1278': {
    key: 'sx1278',
    label: 'SX1278 LoRa (Semtech)',
    url: 'https://www.semtech.com/products/wireless-rf/lora-connect/sx1278',
    kind: 'Docs',
  },
  'tp4056': {
    key: 'tp4056',
    label: 'TP4056 Datasheet',
    url: 'https://dlnmh9ip6v2uc.cloudfront.net/datasheets/Prototyping/TP4056.pdf',
    kind: 'PDF',
  },
  'blynk-docs': {
    key: 'blynk-docs',
    label: 'Blynk IoT Documentation',
    url: 'https://docs.blynk.io/',
    kind: 'Docs',
  },
  'thingspeak-docs': {
    key: 'thingspeak-docs',
    label: 'ThingSpeak Documentation',
    url: 'https://www.mathworks.com/help/thingspeak/',
    kind: 'Docs',
  },
  'firebase-docs': {
    key: 'firebase-docs',
    label: 'Firebase RTDB Documentation',
    url: 'https://firebase.google.com/docs/database',
    kind: 'Docs',
  },
  'l298n': {
    key: 'l298n',
    label: 'L298N Motor Driver Guide (Random Nerd)',
    url: 'https://randomnerdtutorials.com/esp8266-nodemcu-dc-motor-l298n-motor-driver-control-speed-direction/',
    kind: 'Guide',
  },
  'sg90': {
    key: 'sg90',
    label: 'SG90 Servo Pinout + Datasheet (Components101)',
    url: 'https://components101.com/motors/servo-motor-basics-pinout-datasheet',
    kind: 'Guide',
  },
  'hc05': {
    key: 'hc05',
    label: 'HC-05 Bluetooth Module (Components101)',
    url: 'https://components101.com/wireless/hc-05-bluetooth-module',
    kind: 'Guide',
  },
  'mpu6050': {
    key: 'mpu6050',
    label: 'MPU6050 IMU Guide (Adafruit)',
    url: 'https://learn.adafruit.com/mpu6050-6-dof-accelerometer-and-gyro',
    kind: 'Guide',
  },
  'esp32servo': {
    key: 'esp32servo',
    label: 'ESP32Servo Library + Docs',
    url: 'https://github.com/madhephaestus/ESP32Servo',
    kind: 'Docs',
  },
  'espnow': {
    key: 'espnow',
    label: 'ESP-NOW Protocol Docs (Espressif)',
    url: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/network/esp_now.html',
    kind: 'Docs',
  },
  'telegram-docs': {
    key: 'telegram-docs',
    label: 'Telegram Bot API',
    url: 'https://core.telegram.org/bots/api',
    kind: 'Docs',
  },
  'apps-script': {
    key: 'apps-script',
    label: 'Apps Script Web Apps (Google)',
    url: 'https://developers.google.com/apps-script',
    kind: 'Docs',
  },
  'ssd1306': {
    key: 'ssd1306',
    label: 'SSD1306 OLED Guide (Adafruit)',
    url: 'https://learn.adafruit.com/monochrome-oled-breakouts',
    kind: 'Guide',
  },
  'lcd16x2': {
    key: 'lcd16x2',
    label: '16x2 I2C LCD Guide (LastMinuteEngineers)',
    url: 'https://lastminuteengineers.com/i2c-lcd-arduino-tutorial/',
    kind: 'Guide',
  },
  'relay-5v': {
    key: 'relay-5v',
    label: '5V Relay Module Guide (LastMinuteEngineers)',
    url: 'https://lastminuteengineers.com/one-channel-relay-module-arduino-tutorial/',
    kind: 'Guide',
  },
  'pir': {
    key: 'pir',
    label: 'HC-SR501 PIR Guide (LastMinuteEngineers)',
    url: 'https://lastminuteengineers.com/pir-sensor-arduino-tutorial/',
    kind: 'Guide',
  },
  'tcrt5000': {
    key: 'tcrt5000',
    label: 'TCRT5000 Line Sensor Guide (Osoyoo)',
    url: 'https://osoyoo.com/2017/07/25/tcrt5000-ir-track-sensor/',
    kind: 'Guide',
  },
  'ir-obstacle': {
    key: 'ir-obstacle',
    label: 'IR Obstacle Sensor Guide (ArduinoIntro)',
    url: 'https://arduinointro.com/articles/projects/detecting-objects-using-the-infrared-ir-obstacle-sensor',
    kind: 'Guide',
  },
  'esp-01': {
    key: 'esp-01',
    label: 'ESP8266 Wi-Fi Module Guide (ElectroPeak)',
    url: 'https://electropeak.com/learn/using-esp8266-wifi-module-arduino-ide-full-guide/',
    kind: 'Guide',
  },
  'level-shifter': {
    key: 'level-shifter',
    label: 'Logic Level Shifter Guide (SparkFun)',
    url: 'https://learn.sparkfun.com/tutorials/bi-directional-logic-level-converter-hookup-guide',
    kind: 'Guide',
  },
  'flame-sensor': {
    key: 'flame-sensor',
    label: 'Flame Sensor Guide (CircuitDigest)',
    url: 'https://circuitdigest.com/microcontroller-projects/interfacing-flame-sensor-with-arduino',
    kind: 'Guide',
  },
  'mq135': {
    key: 'mq135',
    label: 'MQ135 Library + Docs (GeorgK)',
    url: 'https://github.com/GeorgK/MQ135',
    kind: 'Docs',
  },
  'soil-capacitive': {
    key: 'soil-capacitive',
    label: 'Capacitive Soil Sensor Guide (LastMinuteEngineers)',
    url: 'https://lastminuteengineers.com/capacitive-soil-moisture-sensor-arduino/',
    kind: 'Guide',
  },
  'keypad-4x4': {
    key: 'keypad-4x4',
    label: '4x4 Keypad Guide (LastMinuteEngineers)',
    url: 'https://lastminuteengineers.com/arduino-keypad-tutorial/',
    kind: 'Guide',
  },
  'rain-sensor': {
    key: 'rain-sensor',
    label: 'Rain Sensor Guide (LastMinuteEngineers)',
    url: 'https://lastminuteengineers.com/rain-sensor-arduino-tutorial/',
    kind: 'Guide',
  },
  'microsd': {
    key: 'microsd',
    label: 'MicroSD Card Module Guide (LastMinuteEngineers)',
    url: 'https://lastminuteengineers.com/arduino-micro-sd-card-module-tutorial/',
    kind: 'Guide',
  },
  'lm2596': {
    key: 'lm2596',
    label: 'LM2596 Datasheet (TI)',
    url: 'https://www.ti.com/lit/ds/symlink/lm2596.pdf',
    kind: 'PDF',
  },
}

export const getSheets = (keys?: string[]): Datasheet[] => {
  if (!keys) return []
  return keys
    .map((k) => datasheets[k])
    .filter((d): d is Datasheet => Boolean(d))
}
