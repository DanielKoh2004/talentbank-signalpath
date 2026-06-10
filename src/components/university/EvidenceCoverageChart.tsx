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

interface EvidenceCoverageChartProps {
  data: Array<{
    roleFamilyName: string;
    coveragePercent: number;
    denominator: number;
  }>;
}

export default function EvidenceCoverageChart({
  data,
}: EvidenceCoverageChartProps) {
  return (
    <div className="h-64 w-full">
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
            cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
            formatter={(value, _name, item) => [
              `${value}% evidence coverage`,
              `${item.payload.denominator} students`,
            ]}
            labelStyle={{ fontWeight: 700, color: "#111827" }}
          />
          <Bar
            dataKey="coveragePercent"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={72}
          >
            <LabelList
              dataKey="coveragePercent"
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
