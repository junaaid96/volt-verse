import { Bot, Boxes, CircuitBoard, Cpu, Plane, Wifi, Zap, type LucideIcon } from 'lucide-react'

const map: Record<string, LucideIcon> = {
  wifi: Wifi,
  bot: Bot,
  cpu: Cpu,
  circuit: CircuitBoard,
  plane: Plane,
  solar: Zap,
}

export function CategoryIcon({ icon, className = 'h-5 w-5' }: { icon: string; className?: string }) {
  const Cmp = map[icon] ?? Boxes
  return <Cmp className={className} aria-hidden="true" />
}
