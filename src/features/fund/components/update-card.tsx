import type { FundUpdate } from "../types";

interface UpdateCardProps {
  update: FundUpdate;
}

export function UpdateCard({ update }: UpdateCardProps) {
  return (
    <div className="border-b border-gray-100 pb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-400">
          {new Date(update.created_at).toLocaleDateString()}
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">{update.title}</h4>
      <div
        className="prose prose-sm max-w-none text-gray-600"
        dangerouslySetInnerHTML={{ __html: update.body_html }}
      />
    </div>
  );
}
