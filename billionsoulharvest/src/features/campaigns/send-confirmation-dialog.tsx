"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  recipientCount: number;
  onConfirm: () => Promise<void>;
}

export function SendConfirmationDialog({
  open,
  onOpenChange,
  campaignName,
  recipientCount,
  onConfirm,
}: Props) {
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      await onConfirm();
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Campaign?</DialogTitle>
          <DialogDescription>
            You are about to send &quot;{campaignName}&quot; to{" "}
            <strong>{recipientCount.toLocaleString()}</strong> recipient
            {recipientCount !== 1 ? "s" : ""}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : `Send to ${recipientCount.toLocaleString()} recipients`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
