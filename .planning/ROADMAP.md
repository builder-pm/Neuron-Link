**Current focus:** Phase 3 - Extended Configuration Schema in progress

---

## Current Status

| Metric | Value |
|--------|-------|
| **Current Phase** | 3 of 8 (Extended Configuration Schema) |
| **Overall Progress** | 25.0% |
| **Requirements Complete** | 12/44 |
| **Phases Complete** | 2/8 |

**Last activity:** 2026-02-08 - Completed Phase 02 (Preview Tab - Field Configuration)

---

## Phase Overview

| # | Phase | Goal | Requirements | Est. Complexity |
|---|-------|------|--------------|-----------------|
| 1 | SQL Editor Fix | Query results display correctly | SQL-01 to SQL-05 | Low |
| 2 | Preview Tab - Field Configuration | Users can organize, rename, and manage field visibility | PREV-01 to PREV-07 | Medium |
| 3 | Extended Configuration Schema | Configuration type supports semantic metadata | CONF-01 to CONF-08 | Medium |
| 4 | Schema Registry | Auto-extract and store database schema with PK-FK | SCHM-01 to SCHM-06 | Medium |
| 5 | Metrics System | Global and custom metrics with time intelligence | GMET-01 to GMET-07, CMET-01 to CMET-03 | High |
| 6 | Metric Validation | Validate metrics against model and suggest additions | MVAL-01 to MVAL-04 | Medium |
| 7 | AI Context Enhancement | AI has full semantic context access with tiering | AI-01 to AI-06 | Medium |
| 8 | Integration & Polish | End-to-end flow testing, edge cases, UX polish | Cross-cutting | Low |

---

## Phase 1: SQL Editor Fix

**Goal:** SQL query results display as a proper tabular output below the editor

**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Add results display functionality (state + table + errors)
- [x] 01-03-PLAN.md — UI enhancements (resizable sections, collapsible results, row viewer search, SELECT * optimization)
- [x] 01-02-PLAN.md — Human verification of results display

---

## Phase 2: Preview Tab - Field Configuration

**Goal:** Users can organize fields into groups, rename them, reorder, and manage visibility

**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Preview tab integration with FieldGroupingPanel
- [x] 02-02-PLAN.md — Inline renaming, soft-hide, and reordering
- [x] 02-03-PLAN.md — Pre-built group templates (Dimensions, Measures, Dates, Identifiers)
- [x] 02-04-PLAN.md — Human verification of field management features

---

## Phase 3: Extended Configuration Schema ? Complete

**Goal:** Configuration type includes all semantic metadata fields

**Plans:** 4 plans

Plans:
- [ ] 03-01-PLAN.md — [TDD] State foundation for semantic metadata (types, actions, reducer)
- [ ] 03-02-PLAN.md — Persistence layer & schema extension (Supabase migration, configService)
- [ ] 03-03-PLAN.md — Semantic metadata UI (Description editor, DataType dropdown)
- [ ] 03-04-PLAN.md — On-demand sample scanning (Service implementation & UI integration)

**Requirements:**
- CONF-01: Configuration includes fieldMetadata
- CONF-02: FieldMetadata has description, dataType
- CONF-03: Configuration includes sampleValues
- CONF-04: Configuration includes hiddenFields
- CONF-05: Configuration includes fieldOrder
- CONF-06: Sample values scanned on-demand
- CONF-07: Sample values limited to top 50
- CONF-08: Localized joins stored in Configuration

**Success Criteria:**
1. `Configuration` interface extended with new fields in types.ts
2. Supabase `configurations` table schema updated (migration)
3. Save/Load correctly persists all new fields
4. "Scan Values" button appears next to field, fetches top 50 distinct
5. Scanned values cached in sampleValues, displayed in UI
6. DataType dropdown (dimension/measure/date/identifier/text) per field
7. Description text area per field

**Key Files:**
- `types.ts` (Configuration, FieldMetadata interfaces)
- `supabase/migrations/` (new migration for schema)
- `services/configService.ts` (save/load logic)
- `state/reducer.ts` (new actions for metadata)

**Dependencies:** Phase 2 (Preview tab provides UI surface)

---

## Phase 4: Schema Registry

**Goal:** Auto-extract database schema including PK-FK relationships from Supabase

**Plans:** 3 plans

Plans:
- [ ] 04-01-PLAN.md — Foundations & Core Extraction (Registry table, OpenAPI parser, AI descriptions)
- [ ] 04-02-PLAN.md — Integration & Persistence (Sync lifecycle, drift detection, connection flow)
- [ ] 04-03-PLAN.md — UI & User Management (StructurePanel metadata display, description editing, drift badge)

**Requirements:**
- SCHM-01: Auto-extract PK-FK from information_schema on connect
- SCHM-02: Store in schema_registry Supabase table
- SCHM-03: Table descriptions AI-generated from names
- SCHM-04: User can edit descriptions
- SCHM-05: Schema drift detection
- SCHM-06: One registry per database connection

**Success Criteria:**
1. On Supabase connect, PK-FK relationships auto-extracted
2. `schema_registry` table stores: tables, columns, pk_fk_pairs, descriptions
3. AI generates initial table descriptions (e.g., "Stores customer information")
4. User can edit description in UI, saves to registry
5. On reconnect, if schema changed, warning badge appears
6. Schema registry shared across all configurations for that DB

**Key Files:**
- `services/schemaRegistry.ts` (new - extraction logic)
- `supabase/migrations/` (schema_registry table)
- `components/master/StructurePanel.tsx` (show descriptions)
- `services/gemini.ts` (AI description generation)

**Dependencies:** Phase 3 (needs Configuration infrastructure)

---

## Phase 5: Metrics System

**Goal:** Define global and custom metrics with formula builder and time intelligence

**Requirements:**
- GMET-01: Global metrics at schema level
- GMET-02: Metric structure: id, name, formula, description, format, requiredFields
- GMET-03: Simple metrics via formula builder
- GMET-04: Complex metrics via SQL expression
- GMET-05: Aggregations: SUM, COUNT, AVG, MIN, MAX, COUNT_DISTINCT
- GMET-06: Time intelligence: YoY, MoM, YTD, rolling averages
- GMET-07: Required fields auto-parsed from formula
- CMET-01: Users can create model-specific metrics
- CMET-02: Custom metrics scoped to Configuration
- CMET-03: Same structure as global

**Success Criteria:**
1. Global metrics stored in `metrics` Supabase table
2. MetricsPanel shows list of available metrics
3. "Add Metric" opens formula builder modal
4. Formula builder: select field → select aggregation → preview formula
5. "Advanced" toggle switches to SQL expression editor
6. Time functions available: YoY(field), MoM(field), YTD(field), ROLLING_AVG(field, 7)
7. Required fields auto-detected from formula parsing
8. Custom metrics saved within Configuration.customMetrics[]

**Key Files:**
- `types.ts` (Metric interface already exists - extend)
- `components/master/MetricsPanel.tsx` (expand from stub)
- `components/MetricBuilderModal.tsx` (new)
- `supabase/migrations/` (metrics table)
- `utils/formulaParser.ts` (new - parse required fields)

**Dependencies:** Phase 4 (needs schema registry for field list)

---

## Phase 6: Metric Validation

**Goal:** Validate metric availability and suggest required additions

**Requirements:**
- MVAL-01: Validate metric against current model fields
- MVAL-02: Unavailable metrics grayed with tooltip
- MVAL-03: Click shows suggestion to add fields
- MVAL-04: Suggestion includes specific table.field pairs

**Success Criteria:**
1. Each metric checked against modelConfiguration fields
2. Missing required fields → metric row grayed out
3. Hover shows tooltip: "Missing: inventory.film_id, payment.amount"
4. Click opens modal: "Add these fields to enable metric?"
5. Modal lists tables to add, with "Add All" button
6. Adding fields updates modelConfiguration and enables metric

**Key Files:**
- `components/master/MetricsPanel.tsx` (validation display)
- `components/MetricSuggestionModal.tsx` (new)
- `utils/metricValidator.ts` (new - validation logic)

**Dependencies:** Phase 5 (needs metrics defined)

---

## Phase 7: AI Context Enhancement

**Goal:** AI Assistant has full semantic context with intelligent tiering

**Requirements:**
- AI-01: AI context includes current model
- AI-02: AI context includes global schema
- AI-03: AI context includes field descriptions
- AI-04: AI context includes sample values
- AI-05: Context tiering (trim samples → descriptions → schema)
- AI-06: AI suggests but doesn't modify Configuration

**Success Criteria:**
1. SemanticContext passed to AI includes all metadata
2. System prompt includes field descriptions when available
3. System prompt includes sample values for filter suggestions
4. Token counting implemented, context trimmed if >4000 tokens
5. Trimming priority: sample values first, then descriptions, then schema details
6. AI responses can suggest "Add field X" but user must approve

**Key Files:**
- `services/gemini.ts` (generateSystemPrompt enhancement)
- `utils/contextBuilder.ts` (new - build tiered context)
- `components/AiChatPanel.tsx` (handle suggestions)

**Dependencies:** Phase 4 (schema), Phase 3 (field metadata)

---

## Phase 8: Integration & Polish

**Goal:** End-to-end testing, edge cases, UX improvements

**Requirements:** Cross-cutting polish

**Success Criteria:**
1. Full flow works: Connect → Select tables → Configure fields → Define metrics → Query with AI
2. Edge cases handled: empty tables, null values, disconnection
3. Loading states for all async operations
4. Error boundaries prevent crashes
5. Keyboard navigation for accessibility
6. Mobile-responsive adjustments (if applicable)

**Key Files:** All components

**Dependencies:** Phases 1-7

---

## Dependency Graph

```
Phase 1 (SQL Editor) ───────────────────────────────────────┐
                                                          │
Phase 2 (Preview Tab) ────────┬───────────────────────────┤
                              │                           │
Phase 3 (Config Schema) ──────┴───────┬───────────────────┤
                                      │                   │
Phase 4 (Schema Registry) ────────────┴────┬──────────────┤
                                           │              │
Phase 5 (Metrics System) ──────────────────┴───┬──────────┤
                                               │          │
Phase 6 (Metric Validation) ───────────────────┴──────────┤
                                                          │
Phase 7 (AI Context) ─────────────────────────────────────┤
                                                          │
Phase 8 (Integration) ────────────────────────────────────┘
```

**Parallel Opportunities:**
- Phase 1 and Phase 2 can run in parallel (independent)
- Phase 5 and Phase 7 can partially overlap (metrics doesn't block AI basics)

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| information_schema queries slow on large DBs | Medium | Cache schema, async extraction |
| Token limits exceeded with full context | High | Tiered context trimming (Phase 7) |
| Formula parsing edge cases | Medium | Fallback to manual requiredFields entry |
| Breaking changes to Configuration | High | Migration scripts, backward compat |

---

*Roadmap created: 2025-02-07*
*Last updated: 2026-02-08 after Phase 4 planning*
