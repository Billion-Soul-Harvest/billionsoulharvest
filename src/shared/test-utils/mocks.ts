import { vi } from "vitest";

export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  delete: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  neq: vi.fn(() => mockSupabaseClient),
  in: vi.fn(() => mockSupabaseClient),
  ilike: vi.fn(() => mockSupabaseClient),
  contains: vi.fn(() => mockSupabaseClient),
  order: vi.fn(() => mockSupabaseClient),
  range: vi.fn(() => mockSupabaseClient),
  limit: vi.fn(() => mockSupabaseClient),
  single: vi.fn(() => mockSupabaseClient),
  maybeSingle: vi.fn(() => mockSupabaseClient),
  rpc: vi.fn(() => mockSupabaseClient),
  then: vi.fn(),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: "test" }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/test.jpg" } })),
    })),
  },
};

export function mockSupabaseResponse(data: unknown, error: unknown = null) {
  return Promise.resolve({ data, error, count: Array.isArray(data) ? data.length : null });
}

vi.mock("@/shared/utils/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));
