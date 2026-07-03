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

export function SpeakersForm({ content, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>Layout</Label>
        <Select
          value={(content.layout as string) ?? "grid"}
          onValueChange={(v) => onChange({ ...content, layout: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Filter by Role (optional)</Label>
        <Select
          value={((content.filter_roles as string[])?.join(",")) ?? "all"}
          onValueChange={(v) => onChange({ ...content, filter_roles: v === "all" ? undefined : [v] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Speakers</SelectItem>
            <SelectItem value="keynote">Keynote Only</SelectItem>
            <SelectItem value="speaker">Speakers Only</SelectItem>
            <SelectItem value="worship">Worship Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
