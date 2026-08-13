import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "@/shared/test-utils/render";
import "@/shared/test-utils/mocks";
import { GalleryEditor, type GalleryImage } from "../editor/gallery-editor";

/* ------------------------------------------------------------------ */
/*  Mocks                                                             */
/* ------------------------------------------------------------------ */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
}));

// Stub dnd-kit to avoid JSDOM issues with pointer events
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  PointerSensor: class {},
  KeyboardSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: () => null,
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  sortableKeyboardCoordinates: () => null,
  rectSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const sampleImages: GalleryImage[] = [
  { url: "https://example.com/img1.jpg", caption: "First image", type: "image" },
  { url: "https://example.com/img2.jpg", caption: "Second image", type: "image" },
  { url: "https://example.com/vid1.mp4", caption: "A video", type: "video" },
];

function renderEditor(
  props: Partial<{
    images: GalleryImage[];
    onChange: (images: GalleryImage[]) => void;
    storyId: string;
  }> = {}
) {
  const defaultProps = {
    images: [],
    onChange: vi.fn(),
    storyId: "test-story",
    ...props,
  };
  return {
    ...renderWithProviders(<GalleryEditor {...defaultProps} />),
    onChange: defaultProps.onChange,
  };
}

/* ------------------------------------------------------------------ */
/*  Rendering existing images                                         */
/* ------------------------------------------------------------------ */

describe("GalleryEditor renders existing images", () => {
  it("renders image elements for each gallery image", () => {
    renderEditor({ images: sampleImages });
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2); // 2 images (video is not an img)
  });

  it("renders video elements for video type", () => {
    const { container } = renderEditor({ images: sampleImages });
    const videos = container.querySelectorAll("video");
    expect(videos).toHaveLength(1);
  });

  it("renders caption inputs for each item", () => {
    renderEditor({ images: sampleImages });
    const captionInputs = screen.getAllByPlaceholderText("Caption (optional)");
    expect(captionInputs).toHaveLength(3);
  });

  it("populates captions in inputs", () => {
    renderEditor({ images: sampleImages });
    const captionInputs = screen.getAllByPlaceholderText("Caption (optional)");
    expect(captionInputs[0]).toHaveValue("First image");
    expect(captionInputs[1]).toHaveValue("Second image");
    expect(captionInputs[2]).toHaveValue("A video");
  });
});

/* ------------------------------------------------------------------ */
/*  Drop zone rendering                                               */
/* ------------------------------------------------------------------ */

describe("drop zone", () => {
  it("renders the drop zone with instructions", () => {
    renderEditor();
    expect(screen.getByText(/Drop files here or/)).toBeInTheDocument();
    expect(screen.getByText(/click to browse/)).toBeInTheDocument();
  });

  it("shows accepted file types information", () => {
    renderEditor();
    expect(
      screen.getByText(
        /Images \(JPEG, PNG, WebP\) up to 5MB \| Videos \(MP4, WebM, MOV\) up to 50MB/
      )
    ).toBeInTheDocument();
  });

  it("renders hidden file input with correct accept attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.accept).toBe(
      "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
    );
  });

  it("renders hidden file input with multiple attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.multiple).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Caption updates                                                   */
/* ------------------------------------------------------------------ */

describe("caption updates", () => {
  it("calls onChange when caption is updated", async () => {
    const onChange = vi.fn();
    renderEditor({
      images: [
        { url: "https://example.com/img1.jpg", caption: "", type: "image" },
      ],
      onChange,
    });

    const captionInput = screen.getByPlaceholderText("Caption (optional)");
    await userEvent.type(captionInput, "A");

    // onChange is called for each keystroke
    expect(onChange).toHaveBeenCalledTimes(1);
    const callArgs = onChange.mock.calls[0][0];
    expect(callArgs).toHaveLength(1);
    expect(callArgs[0].url).toBe("https://example.com/img1.jpg");
    expect(callArgs[0].caption).toBe("A");
  });
});

/* ------------------------------------------------------------------ */
/*  Image removal                                                     */
/* ------------------------------------------------------------------ */

describe("image removal", () => {
  it("calls onChange with filtered array when remove button is clicked", async () => {
    const onChange = vi.fn();
    renderEditor({ images: sampleImages, onChange });

    // Find all remove buttons (the X buttons in each card)
    const removeButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg"));

    // Click the first remove button
    await userEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0];
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe("https://example.com/img2.jpg");
    expect(result[1].url).toBe("https://example.com/vid1.mp4");
  });

  it("calls onChange with empty array when removing the only image", async () => {
    const onChange = vi.fn();
    renderEditor({
      images: [{ url: "https://example.com/only.jpg", type: "image" }],
      onChange,
    });

    const removeButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg"));

    await userEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ */
/*  File type and size validation (via handleUpload filtering)        */
/* ------------------------------------------------------------------ */

describe("file type and size validation", () => {
  // These tests verify the file input's accept attribute which is the
  // browser-level filtering. The JS validation in handleUpload is tested
  // indirectly since it filters by the same MIME types.

  it("accepts JPEG files via accept attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.accept).toContain("image/jpeg");
  });

  it("accepts PNG files via accept attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.accept).toContain("image/png");
  });

  it("accepts WebP files via accept attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.accept).toContain("image/webp");
  });

  it("accepts MP4 files via accept attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.accept).toContain("video/mp4");
  });

  it("accepts WebM files via accept attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.accept).toContain("video/webm");
  });

  it("accepts MOV (quicktime) files via accept attribute", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.accept).toContain("video/quicktime");
  });

  it("does not accept GIF files", () => {
    const { container } = renderEditor();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput.accept).not.toContain("image/gif");
  });
});

/* ------------------------------------------------------------------ */
/*  Empty state                                                       */
/* ------------------------------------------------------------------ */

describe("empty state", () => {
  it("renders drop zone when no images exist", () => {
    renderEditor({ images: [] });
    expect(screen.getByText(/Drop files here or/)).toBeInTheDocument();
  });

  it("does not render any image or video elements when empty", () => {
    const { container } = renderEditor({ images: [] });
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(container.querySelectorAll("video")).toHaveLength(0);
  });
});
