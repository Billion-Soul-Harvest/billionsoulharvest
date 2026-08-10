import { Node, mergeAttributes } from "@tiptap/react";

export interface VideoNodeOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    videoNode: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const VideoNode = Node.create<VideoNodeOptions>({
  name: "videoNode",

  group: "block",
  draggable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        controls: "true",
        preload: "metadata",
        style: "width: 100%; max-width: 100%; border-radius: 0.5rem;",
      }),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
