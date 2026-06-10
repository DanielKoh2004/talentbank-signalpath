"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReadinessChartProps {
  data: Array<{
    roleFamilyName: string;
    readinessPercent: number;
    denominator: number;
  }>;
}

export default function ReadinessChart({ data }: ReadinessChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 16, left: 4, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="roleFamilyName"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
            formatter={(value, _name, item) => [
              `${value}% of readiness benchmark`,
              `${item.payload.denominator} students`,
            ]}
            labelStyle={{ fontWeight: 700, color: "#111827" }}
          />
          <Bar
            dataKey="readinessPercent"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
            maxBarSize={72}
          >
            <LabelList
              dataKey="readinessPercent"
              position="top"
              formatter={(value) => `${Number(value ?? 0)}%`}
              style={{ fill: "#374151", fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
