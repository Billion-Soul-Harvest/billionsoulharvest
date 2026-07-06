export interface Attachment {
  name: string;
  type: string; // MIME type
  data: string; // base64
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  operation?: AIOperation;
  timestamp: number;
}

export type AIOperationType =
  | "generate_full_page"
  | "edit_node"
  | "add_nodes"
  | "suggest_content";

export interface AIOperation {
  type: AIOperationType;
  fullPageJson?: Record<string, unknown>;
  nodeEdits?: Array<{ nodeId: string; props: Record<string, unknown> }>;
  nodesToAdd?: {
    parentId: string;
    index?: number;
    tree: Record<string, unknown>;
  };
  explanation: string;
}

export interface AIBuilderRequest {
  messages: Array<{ role: "user" | "assistant"; content: string; attachments?: Attachment[] }>;
  context: {
    currentCanvasJson: string;
    selectedNodeId?: string;
    selectedNodeJson?: string;
    eventData: {
      title: string;
      description: string | null;
      location: string | null;
      startDate: string | null;
      endDate: string | null;
      slug: string;
    };
  };
}

export interface AIBuilderResponse {
  content: string;
  operation?: AIOperation;
}
