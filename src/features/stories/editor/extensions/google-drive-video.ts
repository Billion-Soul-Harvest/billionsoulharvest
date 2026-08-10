import { Node, mergeAttributes } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface GoogleDriveVideoOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    googleDriveVideo: {
      setGoogleDriveVideo: (options: { src: string }) => ReturnType;
    };
  }
}

const DRIVE_URL_REGEX =
  /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;

export const GoogleDriveVideo = Node.create<GoogleDriveVideoOptions>({
  name: "googleDriveVideo",

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
      width: { default: "100%" },
      height: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-google-drive-video]",
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const iframe = el.querySelector("iframe");
          return iframe ? { src: iframe.getAttribute("src") } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-google-drive-video": "" }),
      [
        "iframe",
        mergeAttributes(this.options.HTMLAttributes, {
          src: HTMLAttributes.src,
          width: "100%",
          style: "aspect-ratio: 16/9; border: 0;",
          allow: "autoplay",
          allowfullscreen: "true",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setGoogleDriveVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addPasteRules() {
    return [];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("googleDriveVideoPaste"),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData("text/plain");
            if (!text) return false;
            const match = text.match(DRIVE_URL_REGEX);
            if (!match) return false;
            const fileId = match[1];
            const src = `https://drive.google.com/file/d/${fileId}/preview`;
            const { tr } = view.state;
            const node = view.state.schema.nodes.googleDriveVideo.create({
              src,
            });
            tr.replaceSelectionWith(node);
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});
