"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

interface ActionMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A row-action dropdown menu that renders via portal to avoid
 * z-index / overflow clipping issues with table containers and pagination.
 */
export function ActionMenu({ open, onToggle, onClose, children }: ActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 180;
      const top = spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4;
      setPos({ top, right: window.innerWidth - rect.right });
    }
    onToggle();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); onClose(); }} />
          <div
            ref={menuRef}
            className="fixed w-48 bg-white rounded-lg shadow-lg border py-1 z-[70]"
            style={{ top: pos.top, right: pos.right }}
          >
            {children}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
