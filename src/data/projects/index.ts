import type { Project } from '../types'
import { smartAgriculture } from './smart-agriculture'
import { weatherStation } from './iot-weather-station'
import { waterLevel } from './smart-water-level'
import { homeAutomation } from './home-automation'
import { smartDoorLock } from './smart-door-lock'
import { streetlight } from './smart-streetlight'
import { healthMonitor } from './health-monitor'
import { airQuality } from './air-quality-node'
import { gasFireAlert } from './gas-fire-alert'
import { smartParking } from './smart-parking'
import { rfidAttendance } from './rfid-attendance'
import { smartDustbin } from './smart-dustbin'
import { energyMeter } from './smart-energy-meter'
import { vehicleTracker } from './vehicle-tracker'
import { esp32camSecurity } from './esp32cam-security'
import { lineFollowerRobot } from './line-follower-robot'
import { obstacleAvoiderRobot } from './obstacle-avoider-robot'
import { bluetoothRcCar } from './bluetooth-rc-car'
import { wifiFpvRover } from './wifi-fpv-rover'
import { roboticArm } from './robotic-arm'
import { mazeSolverRobot } from './maze-solver-robot'
import { gestureControlCar } from './gesture-control-car'
import { humanFollowerRobot } from './human-follower-robot'
import { fireFighterRobot } from './fire-fighter-robot'
import { selfBalancingRobot } from './self-balancing-robot'
import { pickAndPlaceRover } from './pick-and-place-rover'
import { miniSumoRobot } from './mini-sumo-robot'

/**
 * Project registry. To add a project: create its file under
 * src/data/projects/, import it here, and push it into the array.
 * Home, catalog, search and routing update automatically.
 */
export const projects: Project[] = [
  smartAgriculture,
  homeAutomation,
  weatherStation,
  healthMonitor,
  smartDoorLock,
  airQuality,
  gasFireAlert,
  energyMeter,
  smartParking,
  rfidAttendance,
  smartDustbin,
  vehicleTracker,
  streetlight,
  waterLevel,
  esp32camSecurity,
  lineFollowerRobot,
  obstacleAvoiderRobot,
  bluetoothRcCar,
  wifiFpvRover,
  roboticArm,
  mazeSolverRobot,
  gestureControlCar,
  humanFollowerRobot,
  fireFighterRobot,
  selfBalancingRobot,
  pickAndPlaceRover,
  miniSumoRobot,
]

export const getProject = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug)

export const getProjectsByCategory = (categoryId: string): Project[] =>
  projects.filter((p) => p.categoryId === categoryId)

export const DIFFICULTY_ORDER = ['Basic', 'Medium', 'Advanced'] as const
