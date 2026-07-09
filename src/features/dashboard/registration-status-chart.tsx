"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { name: string; value: number }[];
}

const COLOR_MAP: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  cancelled: "#ef4444",
  waitlisted: "#3b82f6",
};

const DEFAULT_COLOR = "#9ca3af";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getColor(status: string): string {
  return COLOR_MAP[status.toLowerCase()] ?? DEFAULT_COLOR;
}

export default function RegistrationStatusChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          Registration Status
        </h3>
        <div className="flex items-center justify-center" style={{ height: 250 }}>
          <p className="text-gray-400 text-sm">No registration data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Registration Status</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              value,
              capitalize(String(name)),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: getColor(entry.name) }}
            />
            <span className="text-gray-600">
              {capitalize(entry.name)}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
