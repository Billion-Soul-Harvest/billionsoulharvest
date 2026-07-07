"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "@vnedyalk0v/react19-simple-maps";
import topoData from "world-atlas/countries-110m.json";
import { toTopoName, toDisplayName } from "./country-codes";

interface CountryDatum {
  country: string;
  count: number;
}

interface Props {
  data: CountryDatum[];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function countToColor(count: number, max: number): string {
  if (max === 0) return "#dbeafe";
  const t = Math.min(count / max, 1);
  const r = Math.round(lerp(219, 30, t));
  const g = Math.round(lerp(234, 64, t));
  const b = Math.round(lerp(254, 175, t));
  return `rgb(${r},${g},${b})`;
}

export default function CountryMap({ data }: Props) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const { lookup, max, sorted } = useMemo(() => {
    const lookup = new Map<string, number>();
    let max = 0;
    for (const d of data) {
      const topoName = toTopoName(d.country);
      lookup.set(topoName, (lookup.get(topoName) ?? 0) + d.count);
    }
    for (const v of lookup.values()) {
      if (v > max) max = v;
    }
    const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 10);
    return { lookup, max, sorted };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center text-gray-400 text-sm">
        No country data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold text-gray-900">Contacts by Country</h3>
      </div>
      <div className="flex flex-col lg:flex-row">
        {/* Map */}
        <div className="flex-1 relative min-h-[300px]">
          <ComposableMap
            projectionConfig={{ scale: 147 }}
            className="w-full h-auto"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ZoomableGroup center={[0, 20] as any} zoom={1}>
              <Geographies geography={topoData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name: string = geo.properties.name;
                    const count = lookup.get(name) ?? 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={count > 0 ? countToColor(count, max) : "#f1f5f9"}
                        stroke="#cbd5e1"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: count > 0 ? countToColor(Math.max(count * 0.8, 1), max) : "#e2e8f0", cursor: "pointer" },
                          pressed: { outline: "none" },
                        }}
                        onMouseEnter={(e) => {
                          setTooltip({
                            name: toDisplayName(name),
                            count,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onMouseMove={(e) => {
                          setTooltip((prev) =>
                            prev
                              ? { ...prev, x: e.clientX, y: e.clientY }
                              : null
                          );
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y - 28,
              }}
            >
              {tooltip.name}: {tooltip.count} {tooltip.count === 1 ? "contact" : "contacts"}
            </div>
          )}
        </div>

        {/* Top countries list */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l p-5">
          <h4 className="text-sm font-medium text-gray-500 mb-3">
            Top Countries
          </h4>
          <div className="space-y-2.5">
            {sorted.map((d, i) => (
              <div key={d.country}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">
                    {i + 1}. {d.country}
                  </span>
                  <span className="font-medium text-gray-900">{d.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${max > 0 ? (d.count / max) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
