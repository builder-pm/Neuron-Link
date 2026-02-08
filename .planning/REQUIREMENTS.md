# Requirements: NeuronLink DB Config & Semantic Context

**Defined:** 2025-02-07
**Core Value:** Users can define semantic meaning for their data models enabling AI to accurately query without hallucination

## v1 Requirements

### SQL Editor

- [x] **SQL-01**: Query results display as tabular output below the editor in SQLPanel
- [x] **SQL-02**: Results table shows column headers, row data, row count
- [x] **SQL-03**: Empty results show "No rows returned" state
- [x] **SQL-04**: SQL errors display inline with syntax highlighting
- [x] **SQL-05**: Large results (>100 rows) paginated or virtually scrolled

### Preview Tab (Field Configuration)

- [x] **PREV-01**: Preview tab shows organized field list (not data table)
- [x] **PREV-02**: Fields can be renamed inline (edits fieldAliases)
- [x] **PREV-03**: Fields can be dragged into custom groups (collapsible folders)
- [x] **PREV-04**: Fields can be reordered within groups via drag-drop
- [x] **PREV-05**: Fields can be soft-hidden (struck-through, requires confirmation to use)
- [x] **PREV-06**: Pre-built group templates available: Dimensions, Measures, Dates, Identifiers
- [x] **PREV-07**: Integrate with existing FieldGroupingPanel.tsx (don't duplicate)

### Extended Configuration (Semantic Context)

Extending existing `Configuration` type instead of separate entity:

- [x] **CONF-01**: Configuration includes fieldMetadata: `Record<string, FieldMetadata>`
- [x] **CONF-02**: FieldMetadata has: description, dataType (dimension|measure|date|identifier|text)
- [x] **CONF-03**: Configuration includes sampleValues: `Record<string, string[]>` (cached)
- [x] **CONF-04**: Configuration includes hiddenFields: `string[]` (soft-deleted fields)
- [x] **CONF-05**: Configuration includes fieldOrder: `string[]` (custom ordering)
- [x] **CONF-06**: Sample values scanned on-demand (user clicks scan button)
- [x] **CONF-07**: Sample values limited to top 50 distinct values per field
- [x] **CONF-08**: Localized joins stored in Configuration (can differ from global PK-FK)

### Schema Registry (Master Context) - Supabase Only

- [x] **SCHM-01**: Auto-extract PK-FK relationships from information_schema on connect
- [x] **SCHM-02**: Store extracted schema in `schema_registry` Supabase table
- [x] **SCHM-03**: Table descriptions optional, AI-generates placeholders from names
- [x] **SCHM-04**: User can edit/override AI-generated descriptions
- [x] **SCHM-05**: Schema drift detection: flag when DB schema changes
- [x] **SCHM-06**: One schema registry per database connection (not per user)

### Global Metrics

- [ ] **GMET-01**: Global metrics defined at schema level (admin)
- [ ] **GMET-02**: Metric has: id, name, formula, description, format, requiredFields[]
- [ ] **GMET-03**: Simple metrics via formula builder (pick field + aggregation)
- [ ] **GMET-04**: Complex metrics via SQL expression with validation
- [ ] **GMET-05**: Aggregation options: SUM, COUNT, AVG, MIN, MAX, COUNT_DISTINCT
- [ ] **GMET-06**: Time intelligence: YoY, MoM, YTD, rolling averages
- [ ] **GMET-07**: Required fields auto-parsed from formula when possible

### Custom Metrics (Model-Level)

- [ ] **CMET-01**: Users can create model-specific metrics
- [ ] **CMET-02**: Custom metrics scoped to Configuration, not global
- [ ] **CMET-03**: Same structure as global metrics

### Metric Validation

- [ ] **MVAL-01**: Validate metric availability against current model fields
- [ ] **MVAL-02**: Unavailable metrics shown grayed with "missing fields" tooltip
- [ ] **MVAL-03**: Click unavailable metric shows suggestion to add required tables/fields
- [ ] **MVAL-04**: Suggestion includes specific table.field pairs needed

### AI Assistant Enhancement

- [ ] **AI-01**: AI context includes current model (tables, fields, joins)
- [ ] **AI-02**: AI context includes global schema (for model change suggestions)
- [ ] **AI-03**: AI context includes field descriptions (when available)
- [ ] **AI-04**: AI context includes sample values (when scanned)
- [ ] **AI-05**: Context tiering: trim sample values first, then descriptions, then schema
- [ ] **AI-06**: AI can suggest adding fields but cannot modify Configuration directly

## v2 Requirements (Deferred)

### Multi-Database Master Context
- **V2-01**: PK-FK extraction for Athena connections
- **V2-02**: Manual relationship entry for SQLite

### Advanced Features
- **V2-03**: Query history with re-run capability
- **V2-04**: Export results to CSV/JSON
- **V2-05**: Metric version history
- **V2-06**: Collaborative editing of descriptions

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time collaboration | Complexity; single-user sufficient for v1 |
| Custom SQL functions/UDFs | Not needed for semantic context goals |
| BI tool export (Tableau/PowerBI) | Future integration, not core value |
| Athena/SQLite master context | Focus on Supabase where schema introspection works |
| AI modifying configuration | Safety concern; AI suggests, user approves |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SQL-01 to SQL-05 | Phase 1 | Complete |
| PREV-01 to PREV-07 | Phase 2 | Complete |
| CONF-01 to CONF-07 | Phase 3 | Complete |
| CONF-08 | Phase 3 | Pending |
| SCHM-01 to SCHM-06 | Phase 4 | Complete |
| GMET-01 to GMET-07 | Phase 5 | Pending |
| CMET-01 to CMET-03 | Phase 5 | Pending |
| MVAL-01 to MVAL-04 | Phase 6 | Pending |
| AI-01 to AI-06 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0 ✓
- Complete: 25/44 (56.8%)

---
*Requirements defined: 2025-02-07*
*Last updated: 2026-02-09 after Phase 3 & 4 completion*
