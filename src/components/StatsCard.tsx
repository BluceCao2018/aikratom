export default function StatsCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-6 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-border/50 hover:border-border transition-colors">
      <div className="text-2xl md:text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  )
} 