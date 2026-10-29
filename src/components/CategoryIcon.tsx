import { AppWindow, Bot, Boxes, Brain, CircuitBoard, Cpu, Network, Plane, ShieldCheck, Wifi, Zap, type LucideIcon } from 'lucide-react'

const map: Record<string, LucideIcon> = {
  wifi: Wifi,
  bot: Bot,
  cpu: Cpu,
  circuit: CircuitBoard,
  plane: Plane,
  solar: Zap,
  shield: ShieldCheck,
  brain: Brain,
  app: AppWindow,
  network: Network,
}

export function CategoryIcon({ icon, className = 'h-5 w-5' }: { icon: string; className?: string }) {
  const Cmp = map[icon] ?? Boxes
  return <Cmp className={className} aria-hidden="true" />
}
