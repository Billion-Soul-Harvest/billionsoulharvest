"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  priorityData: { name: string; value: number }[];
  overdueCount: number;
  completionRate: number;
  totalCount: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#3b82f6",
  low: "#9ca3af",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function FollowupOverviewChart({
  priorityData,
  overdueCount,
  completionRate,
  totalCount,
}: Props) {
  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Follow-up Overview</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
          No follow-up data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Follow-up Overview</h3>

      <div className="flex flex-row gap-4">
        {/* Left: Donut chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {priorityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PRIORITY_COLORS[entry.name.toLowerCase()] ?? PRIORITY_COLORS.medium}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [String(value), capitalize(String(name))]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Stat boxes */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <div className="text-center">
            <p
              className={`text-3xl font-bold ${
                overdueCount > 0 ? "text-red-600" : "text-gray-400"
              }`}
            >
              {overdueCount}
            </p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
            <div className="mt-1 mx-auto w-3/4 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 justify-center">
        {priorityData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-sm text-gray-700">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  PRIORITY_COLORS[entry.name.toLowerCase()] ?? PRIORITY_COLORS.medium,
              }}
            />
            <span>{capitalize(entry.name)}</span>
            <span className="text-gray-400">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
