export function Marquee({ items }: { items: string[] }) {
  const track = Array(4).fill(items).flat();
  return (
    <div className="relative z-10 overflow-hidden bg-[#1ecdec] text-[#0a0a0a] py-3.5">
      <div className="flex w-max animate-bsh-marquee font-[family-name:var(--font-geist-mono)] text-[13px] font-medium tracking-[0.24em] uppercase">
        {track.map((label, i) => (
          <span key={i} className="pr-11">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
