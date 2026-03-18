"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ProgressChart(props: {
  data: Array<{
    date: string;
    weightKg: number | null;
    adherence: number | null;
  }>;
}) {
  return (
    <div className="soft-panel min-w-0 px-8 py-9 sm:px-10">
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Progress trends</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Weight and adherence over recent entries.
        </p>
      </div>
      <div className="h-80 w-full lg:h-[22rem] 2xl:h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={props.data}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid rgba(112, 186, 182, 0.25)",
                background: "rgba(255,255,255,0.95)",
              }}
              labelFormatter={(value) =>
                new Date(String(value)).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })
              }
            />
            <Line
              type="monotone"
              dataKey="weightKg"
              stroke="rgb(42, 144, 137)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="adherence"
              stroke="rgb(220, 144, 73)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
