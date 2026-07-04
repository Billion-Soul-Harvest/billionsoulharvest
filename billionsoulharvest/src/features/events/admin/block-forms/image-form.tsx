import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/shared/components/image-upload";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  eventId: string;
}

export function ImageForm({ content, onChange, eventId }: Props) {
  return (
    <div className="space-y-3">
      <ImageUpload
        value={(content.url as string) ?? ""}
        onChange={(url) => onChange({ ...content, url })}
        folder={eventId}
        label="Image"
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Alt Text</Label>
          <Input
            value={(content.alt as string) ?? ""}
            onChange={(e) => onChange({ ...content, alt: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Caption (optional)</Label>
          <Input
            value={(content.caption as string) ?? ""}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
