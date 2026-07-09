import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function RichTextForm({ content, onChange }: Props) {
  return (
    <div className="space-y-1">
      <Label>Content</Label>
      <WysiwygEditor
        value={(content.html as string) ?? ""}
        onChange={(html) => onChange({ ...content, html })}
      />
    </div>
  );
}
