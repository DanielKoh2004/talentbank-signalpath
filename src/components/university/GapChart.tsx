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

interface GapChartProps {
  data: Array<{
    skillName: string;
    missingPercent: number;
    affectedStudents: number;
    denominator: number;
    demandPercent: number | null;
  }>;
}

export default function GapChart({ data }: GapChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 48, left: 24, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <YAxis
            dataKey="skillName"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            width={104}
          />
          <Tooltip
            cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
            formatter={(value, _name, item) => [
              `${value}% missing evidence`,
              `${item.payload.affectedStudents} of ${item.payload.denominator} students`,
            ]}
            labelStyle={{ fontWeight: 700, color: "#111827" }}
          />
          <Bar dataKey="missingPercent" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="missingPercent"
              position="right"
              formatter={(value) => `${Number(value ?? 0)}%`}
              style={{ fill: "#374151", fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
