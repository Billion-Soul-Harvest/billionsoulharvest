import { Label } from "@/components/ui/label";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function ScheduleForm({ content, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={(content.show_day_tabs as boolean) ?? true}
          onChange={(e) => onChange({ ...content, show_day_tabs: e.target.checked })}
          className="rounded"
        />
        <Label className="cursor-pointer">Show day tabs</Label>
      </label>
    </div>
  );
}
