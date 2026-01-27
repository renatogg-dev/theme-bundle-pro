"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Users, Code, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Animated stat card that counts up when entering viewport
function AnimatedStatCard({
  title,
  targetValue,
  change,
  trend,
  icon,
  incrementEveryMs = 4000,
}: {
  title: string;
  targetValue: number;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  incrementEveryMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(targetValue);
  const hasAnimated = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setCount(targetValue);
  }, [targetValue]);

  useEffect(() => {
    const startIncrementing = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      intervalRef.current = window.setInterval(() => {
        setCount((prev) => prev + 1);
      }, incrementEveryMs);
    };

    const checkInView = () => {
      if (!ref.current || hasAnimated.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportTrigger = window.innerHeight * 0.85;
      if (rect.top <= viewportTrigger && rect.bottom >= 0) {
        startIncrementing();
      }
    };

    checkInView();
    window.addEventListener("scroll", checkInView, { passive: true });
    window.addEventListener("resize", checkInView);

    return () => {
      window.removeEventListener("scroll", checkInView);
      window.removeEventListener("resize", checkInView);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [incrementEveryMs]);

  const formattedValue = new Intl.NumberFormat("en-US").format(count);

  return (
    <div ref={ref}>
      <StatCard
        title={title}
        value={formattedValue}
        change={change}
        trend={trend}
        icon={icon}
      />
    </div>
  );
}

export function PreviewStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <AnimatedStatCard
        title="Active Users"
        targetValue={12849}
        change="+12.5%"
        trend="up"
        icon={<Users className="h-5 w-5" />}
        incrementEveryMs={4000}
      />
      <StatCard
        title="Components"
        value="48"
        change="+3"
        trend="up"
        icon={<Code className="h-5 w-5" />}
      />
      <StatCard
        title="Themes Used"
        value="13"
        change="+2"
        trend="up"
        icon={<Palette className="h-5 w-5" />}
      />
    </div>
  );
}
