import type { EventSpeaker } from "@/shared/types/database";

interface Props {
  speakers: EventSpeaker[];
}

const roleLabels: Record<string, string> = {
  keynote: "Keynote Speaker",
  speaker: "Speaker",
  panelist: "Panelist",
  worship: "Worship Leader",
};

export function EventSpeakers({ speakers }: Props) {
  if (speakers.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-10 text-center">
          Speakers
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
            >
              {speaker.photo_url ? (
                <img
                  src={speaker.photo_url}
                  alt={speaker.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-[#c69c3f]/20 flex items-center justify-center">
                  <span className="text-[#c69c3f] font-bold text-xl">
                    {speaker.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              )}
              <h3 className="text-white font-semibold text-lg">{speaker.name}</h3>
              <p className="text-[#c69c3f] text-sm font-medium">{speaker.title}</p>
              {speaker.organization && (
                <p className="text-gray-400 text-xs mt-0.5">{speaker.organization}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{roleLabels[speaker.role] ?? speaker.role}</p>
              {speaker.bio && (
                <p className="text-gray-400 text-xs mt-3 line-clamp-3">{speaker.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
