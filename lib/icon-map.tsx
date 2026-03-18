import {
  Globe, Server, Lock, Monitor, Snowflake, Laptop, Package,
  GraduationCap, Search, Rocket, BarChart3, Coins, Lightbulb,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  globe: Globe,
  server: Server,
  lock: Lock,
  monitor: Monitor,
  snowflake: Snowflake,
  laptop: Laptop,
  package: Package,
  "graduation-cap": GraduationCap,
  search: Search,
  rocket: Rocket,
  "bar-chart-3": BarChart3,
  coins: Coins,
  lightbulb: Lightbulb,
};

export function IconFromName({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
