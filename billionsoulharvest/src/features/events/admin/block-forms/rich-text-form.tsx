import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function RichTextForm({ content, onChange }: Props) {
  return (
    <div className="space-y-1">
      <Label>Content (HTML)</Label>
      <Textarea
        value={(content.html as string) ?? ""}
        onChange={(e) => onChange({ ...content, html: e.target.value })}
        className="min-h-[160px] font-mono text-xs"
        placeholder="<p>Your content here...</p>"
      />
    </div>
  );
}
