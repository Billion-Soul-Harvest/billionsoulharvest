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

export function FaqForm({ content, onChange }: Props) {
  return (
    <div className="space-y-1">
      <Label>Filter by Category (optional)</Label>
      <Select
        value={(content.filter_category as string) ?? "all"}
        onValueChange={(v) => onChange({ ...content, filter_category: v === "all" ? null : v })}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="travel">Travel</SelectItem>
          <SelectItem value="accommodation">Accommodation</SelectItem>
          <SelectItem value="registration">Registration</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
