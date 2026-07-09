import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function VideoForm({ content, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>Video URL</Label>
        <Input
          value={(content.url as string) ?? ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
      <div className="space-y-1">
        <Label>Aspect Ratio</Label>
        <Select
          value={(content.aspect as string) ?? "16:9"}
          onValueChange={(v) => onChange({ ...content, aspect: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="16:9">16:9</SelectItem>
            <SelectItem value="4:3">4:3</SelectItem>
            <SelectItem value="1:1">1:1</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
