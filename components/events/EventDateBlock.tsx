'use client'
interface Props {
  date: string;
  isOngoing?: boolean;
}

const EventDateBlock = ({ date, isOngoing }: Props) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString("sv-SE", { month: "short" }).toUpperCase();
  const weekday = d.toLocaleDateString("sv-SE", { weekday: "short" }).toUpperCase();

  return (
    <div className="relative w-[72px] h-[72px] shrink-0 rounded-lg bg-card border border-border flex flex-col items-center justify-center">
      <span className="text-[10px] font-bold uppercase text-primary tracking-wider">{month}</span>
      <span className="text-2xl font-bold text-foreground leading-none">{day}</span>
      <span className="text-[10px] text-muted-foreground">{weekday}</span>
      {isOngoing && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </div>
  );
};

export default EventDateBlock;
