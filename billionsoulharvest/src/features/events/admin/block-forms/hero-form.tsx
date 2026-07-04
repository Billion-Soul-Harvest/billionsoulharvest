import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/shared/components/image-upload";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  eventId: string;
}

export function HeroForm({ content, onChange, eventId }: Props) {
  return (
    <div className="space-y-4">
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
      <ImageUpload
        value={(content.background_url as string) ?? ""}
        onChange={(url) => onChange({ ...content, background_url: url })}
        folder={eventId}
        label="Background Image (optional)"
      />
    </div>
  );
}
