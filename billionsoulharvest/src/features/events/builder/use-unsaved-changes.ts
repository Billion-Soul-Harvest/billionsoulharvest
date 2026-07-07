"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Tracks unsaved changes in the page builder.
 * - Listens for beforeunload to prevent accidental refresh/close
 * - Provides confirmNavigation() for intercepting in-app navigation
 */
export function useUnsavedChanges(serialize: () => string) {
  const savedSnapshotRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);

  // Check if canvas has changed since last save
  const checkDirty = useCallback(() => {
    if (!savedSnapshotRef.current) return false;
    try {
      const current = serialize();
      return current !== savedSnapshotRef.current;
    } catch {
      return false;
    }
  }, [serialize]);

  // Mark current state as saved (call after successful save)
  const markSaved = useCallback(() => {
    try {
      savedSnapshotRef.current = serialize();
      isDirtyRef.current = false;
    } catch {
      // ignore
    }
  }, [serialize]);

  // Set initial snapshot (call once canvas is loaded)
  const setInitialSnapshot = useCallback(() => {
    // Delay slightly to let Craft.js finish deserializing
    setTimeout(() => {
      try {
        savedSnapshotRef.current = serialize();
      } catch {
        // ignore
      }
    }, 500);
  }, [serialize]);

  // beforeunload handler
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (checkDirty()) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [checkDirty]);

  // Returns true if navigation should proceed, false to cancel
  const confirmNavigation = useCallback((): boolean => {
    if (!checkDirty()) return true;
    return window.confirm("You have unsaved changes. Are you sure you want to leave?");
  }, [checkDirty]);

  return { markSaved, setInitialSnapshot, confirmNavigation };
}
