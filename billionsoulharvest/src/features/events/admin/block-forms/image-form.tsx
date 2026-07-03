import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function ImageForm({ content, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Image URL</Label>
        <Input
          value={(content.url as string) ?? ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://..."
        />
      </div>
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
