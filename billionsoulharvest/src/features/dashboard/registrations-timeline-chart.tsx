"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; count: number }[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatShortMonth(value: string): string {
  const [year, month] = value.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  const shortYear = year.slice(2);
  return `${SHORT_MONTH_NAMES[monthIndex]} '${shortYear}`;
}

function formatFullMonth(value: string): string {
  const [year, month] = value.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg">
      {formatFullMonth(label)}: {payload[0].value} registrations
    </div>
  );
}

export default function RegistrationsTimelineChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          Registrations Over Time
        </h3>
        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
          No registration data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold text-gray-900 mb-4">
        Registrations Over Time
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis
            dataKey="month"
            tickFormatter={formatShortMonth}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
