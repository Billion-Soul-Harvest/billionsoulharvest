"use client";

import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { InsertPanel } from "./insert-panel";
import { SettingsPanel } from "./settings-panel";
import { EmailText } from "./blocks/email-text";
import { EmailImage } from "./blocks/email-image";
import { EmailButton } from "./blocks/email-button";
import { EmailDivider } from "./blocks/email-divider";
import { EmailSpacer } from "./blocks/email-spacer";
import { EmailColumns, EmailColumnCell } from "./blocks/email-columns";
import { EmailContainer } from "./blocks/email-container";

const resolver = {
  EmailText,
  EmailImage,
  EmailButton,
  EmailDivider,
  EmailSpacer,
  EmailColumns,
  EmailColumnCell,
  EmailContainer,
};

export interface EmailBuilderHandle {
  getJson: () => string;
}

interface EmailBuilderProps {
  initialJson: string | null;
  onJsonChange?: (json: string) => void;
}

export const EmailBuilder = forwardRef<EmailBuilderHandle, EmailBuilderProps>(
  function EmailBuilder({ initialJson, onJsonChange }, ref) {
    const onJsonChangeRef = useRef(onJsonChange);
    onJsonChangeRef.current = onJsonChange;
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleNodesChange = useCallback((query: { serialize: () => string }) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        try {
          const json = query.serialize();
          onJsonChangeRef.current?.(json);
        } catch {
          // ignore serialization errors during editing
        }
      }, 300);
    }, []);

    return (
      <Editor resolver={resolver} enabled onNodesChange={handleNodesChange}>
        <BuilderLayout initialJson={initialJson} ref={ref} />
      </Editor>
    );
  }
);

const BuilderLayout = forwardRef<EmailBuilderHandle, { initialJson: string | null }>(
  function BuilderLayout({ initialJson }, ref) {
    const { actions, query } = useEditor();
    const initializedRef = useRef(false);

    // Expose getJson to parent
    useImperativeHandle(ref, () => ({
      getJson: () => query.serialize(),
    }), [query]);

    // Load initial JSON
    useEffect(() => {
      if (initialJson && !initializedRef.current) {
        try {
          actions.deserialize(initialJson);
          initializedRef.current = true;
        } catch (e) {
          console.error("Failed to deserialize email builder JSON:", e);
        }
      }
    }, [initialJson, actions]);

    return (
      <div className="flex border rounded-lg overflow-hidden bg-white" style={{ minHeight: "600px" }}>
        {/* Left: Insert Panel */}
        <div className="w-[180px] border-r bg-gray-50 overflow-y-auto flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-3">
            Blocks
          </p>
          <InsertPanel />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 bg-[#f3f3f4] overflow-auto p-6">
          <div
            className="mx-auto bg-white shadow-lg"
            style={{ maxWidth: "600px", minHeight: "400px" }}
          >
            {/* BSH Header (static) */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "16px 20px",
                textAlign: "center",
                borderBottom: "1px solid #c4c6cc",
              }}
            >
              <p
                style={{
                  color: "#000000",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "22px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Billion Soul Harvest
              </p>
            </div>

            {/* Editable Canvas */}
            <div style={{ padding: "40px 20px" }}>
              <Frame>
                <Element
                  is={EmailContainer}
                  canvas
                  backgroundColor="transparent"
                  padding={0}
                >
                  <EmailText text="<p>Start building your email by dragging blocks from the left panel.</p>" />
                </Element>
              </Frame>
            </div>

            {/* BSH Footer (static) */}
            <div
              style={{
                backgroundColor: "#f3f3f4",
                borderTop: "1px solid #c4c6cc",
                padding: "40px 20px",
              }}
            >
              <p
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#1a1c1c",
                  textAlign: "center",
                  margin: "0 0 12px",
                }}
              >
                Billion Soul Harvest
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#44474c",
                  textAlign: "center",
                  margin: "0 0 12px",
                }}
              >
                Privacy Policy &middot; Contact Us &middot; Unsubscribe
              </p>
              <p
                style={{
                  color: "#44474c",
                  fontSize: "12px",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                &copy; {new Date().getFullYear()} Billion Soul Harvest. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Settings Panel */}
        <div className="w-[220px] border-l bg-gray-50 overflow-y-auto flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-3 mb-1">
            Settings
          </p>
          <SettingsPanel />
        </div>
      </div>
    );
  }
);
