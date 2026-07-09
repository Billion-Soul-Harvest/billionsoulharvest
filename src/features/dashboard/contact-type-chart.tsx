"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ContactTypeDatum {
  name: string;
  value: number;
}

const COLORS: Record<string, string> = {
  pastor: "#3b82f6",
  leader: "#8b5cf6",
  donor: "#10b981",
  attendee: "#f59e0b",
  subscriber: "#06b6d4",
  other: "#9ca3af",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ContactTypeChart({ data }: { data: ContactTypeDatum[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Types</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
          No contact data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Contact Types</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name.toLowerCase()] ?? COLORS.other}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [String(value), capitalize(String(name))]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 justify-center">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-sm text-gray-700">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[entry.name.toLowerCase()] ?? COLORS.other }}
            />
            <span>{capitalize(entry.name)}</span>
            <span className="text-gray-400">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
