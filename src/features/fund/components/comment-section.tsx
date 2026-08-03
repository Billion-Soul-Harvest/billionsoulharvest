"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { FundComment } from "../types";

interface CommentSectionProps {
  campaignId: string;
}

export function CommentSection({ campaignId }: CommentSectionProps) {
  const [comments, setComments] = useState<FundComment[]>([]);
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`/api/fund/comments?campaign_id=${campaignId}`)
      .then((res) => res.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [campaignId]);

  async function handlePost() {
    if (!body.trim()) return;
    setPosting(true);

    try {
      const res = await fetch("/api/fund/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId, body, author_name: authorName || undefined }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setBody("");
      }
    } catch {
      // Silent fail
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">
        Comments ({comments.length})
      </h3>

      {/* New comment form */}
      <div className="space-y-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment..."
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button
          onClick={handlePost}
          disabled={!body.trim() || posting}
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {posting ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">
                {comment.author_name || "Anonymous"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{comment.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
