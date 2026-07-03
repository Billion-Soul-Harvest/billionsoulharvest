import type { EventProgram, EventSpeaker } from "@/shared/types/database";

interface Props {
  programs: EventProgram[];
  speakers: EventSpeaker[];
}

const typeLabels: Record<string, string> = {
  main_session: "Main Session",
  breakout: "Breakout",
  workshop: "Workshop",
  worship: "Worship",
  meal: "Meal",
  free_time: "Free Time",
};

const typeColors: Record<string, string> = {
  main_session: "bg-[#c69c3f]/20 text-[#c69c3f]",
  breakout: "bg-blue-500/20 text-blue-300",
  workshop: "bg-purple-500/20 text-purple-300",
  worship: "bg-amber-500/20 text-amber-300",
  meal: "bg-green-500/20 text-green-300",
  free_time: "bg-gray-500/20 text-gray-400",
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function EventProgramSchedule({ programs, speakers }: Props) {
  if (programs.length === 0) return null;

  const speakerMap = new Map(speakers.map((s) => [s.id, s]));

  // Group by day
  const days = new Map<string, EventProgram[]>();
  for (const p of programs) {
    const key = p.day_date;
    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push(p);
  }

  // Sort days
  const sortedDays = [...days.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <section className="bg-[#0a1e38] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-10 text-center">
          Program Schedule
        </h2>

        <div className="space-y-10">
          {sortedDays.map(([date, items]) => (
            <div key={date}>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#c69c3f] mb-4 border-b border-white/10 pb-2">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                {items
                  .sort((a, b) => a.start_time.localeCompare(b.start_time) || a.sort_order - b.sort_order)
                  .map((item) => {
                    const speaker = item.speaker_id ? speakerMap.get(item.speaker_id) : null;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 bg-white/5 border border-white/5 rounded-xl p-4"
                      >
                        <div className="shrink-0 w-24 text-right">
                          <p className="text-white text-sm font-medium">{formatTime(item.start_time)}</p>
                          {item.end_time && (
                            <p className="text-gray-500 text-xs">{formatTime(item.end_time)}</p>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium text-sm">{item.title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeColors[item.type] ?? typeColors.free_time}`}>
                              {typeLabels[item.type] ?? item.type}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-gray-400 text-xs">{item.description}</p>
                          )}
                          <div className="flex gap-3 mt-1">
                            {speaker && (
                              <p className="text-[#c69c3f] text-xs">{speaker.name}</p>
                            )}
                            {item.location && (
                              <p className="text-gray-500 text-xs">{item.location}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
