# Tag Management Design

## Data Model

### `tags` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| name | text UNIQUE NOT NULL | Tag display name |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### `taggables` join table (polymorphic)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| tag_id | uuid FK | REFERENCES tags(id) ON DELETE CASCADE |
| taggable_id | uuid NOT NULL | ID of the tagged entity |
| taggable_type | text NOT NULL | e.g. 'contact', 'event' |
| created_at | timestamptz | DEFAULT now() |
| UNIQUE | | (tag_id, taggable_id, taggable_type) |

### Migration
- Create tables with RLS, triggers, grants
- Seed `tags` from `SELECT DISTINCT unnest(tags) FROM contacts`
- Populate `taggables` from existing `contacts.tags`
- Keep `contacts.tags` text[] column (no breaking change)
- RPC: `rename_tag(old, new)` — updates tags table + contacts.tags array
- RPC: `delete_tag(name)` — deletes from tags + removes from contacts.tags array

## UI

### Route
`/admin/tags` under People Management nav group

### Page
- Header: "Manage tags" + subtitle + "+ Create new tag" button
- Search input with client-side filter
- "All tags" count badge
- Table: checkbox, Name (sortable), Contacts count (sortable), Date created (sortable), 3-dot actions menu
- Default sort: created_at DESC
- Bulk delete via checkbox selection

### Dialogs
- Create tag: name input (max 255, char counter), Cancel/Create
- Rename tag: pre-filled name input, Cancel/Save
- Delete tag: confirmation with affected contact count, Cancel/Delete

### Tag operations
- Create: INSERT into tags
- Rename: UPDATE tags.name + array_replace on contacts.tags
- Delete: DELETE from tags (cascades taggables) + array_remove on contacts.tags
