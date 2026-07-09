"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function FinanceChart({ data }: { data: { dia: string; ingresos: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} width={40} />
        <Tooltip
          formatter={(v: number) => [formatCurrency(v), "Ingresos"]}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
        />
        <Area type="monotone" dataKey="ingresos" stroke="hsl(var(--brand))" strokeWidth={2} fill="url(#ing)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
