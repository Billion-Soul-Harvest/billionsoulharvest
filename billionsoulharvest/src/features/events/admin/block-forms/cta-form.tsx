import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function CtaForm({ content, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>Button Text</Label>
        <Input
          value={(content.text as string) ?? "Register Now"}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label>Subtitle (optional)</Label>
        <Input
          value={(content.subtitle as string) ?? ""}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
        />
      </div>
    </div>
  );
}
