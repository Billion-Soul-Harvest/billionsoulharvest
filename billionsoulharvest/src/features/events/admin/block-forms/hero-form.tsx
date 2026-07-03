import { Label } from "@/components/ui/label";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function HeroForm({ content, onChange }: Props) {
  return (
    <div className="flex gap-6">
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={(content.show_dates as boolean) ?? true}
          onChange={(e) => onChange({ ...content, show_dates: e.target.checked })}
          className="rounded"
        />
        <Label className="cursor-pointer">Show dates & location</Label>
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={(content.show_cta as boolean) ?? true}
          onChange={(e) => onChange({ ...content, show_cta: e.target.checked })}
          className="rounded"
        />
        <Label className="cursor-pointer">Show registration button</Label>
      </label>
    </div>
  );
}
