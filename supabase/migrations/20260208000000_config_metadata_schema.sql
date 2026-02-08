-- Documentation Migration: Configuration JSONB Schema
-- This migration does not change the table structure but documents the expected schema for the 'config' JSONB column.

-- The 'configurations' table holds user-defined data models and analysis states.
-- The 'config' column uses JSONB to support flexible semantic metadata.

/*
Expected structure for configurations.config (Partial<AppState>):

{
  "selectedFields": string[],          -- Universe of fields for this config
  "fieldMetadata": {                   -- Semantic context per field
    "tableName.fieldName": {
      "description": string,           -- User-defined or AI-generated description
      "dataType": "dimension" | "measure" | "date" | "identifier" | "text" | "boolean"
    }
  },
  "sampleValues": {                    -- Cached top 50 distinct values
    "tableName.fieldName": string[]
  },
  "hiddenFields": string[],            -- Array of fields to be soft-hidden in UI
  "fieldOrder": string[],              -- Custom ordering of fields
  "fieldGroups": {                     -- Organization of fields into collapsible UI folders
    "GroupName": string[]
  },
  "fieldAliases": {                    -- Friendly display names for fields
    "tableName.fieldName": string
  },
  "joins": Join[],                     -- Localized join logic for this configuration
  "tablePositions": Record<string, { top: number, left: number }>,
  "pivotConfig": PivotConfig,          -- Analysis specific state
  "filters": Filter[]                  -- Analysis specific filters
}
*/

COMMENT ON COLUMN configurations.config IS 'Flexible JSONB blob for application state. See migration 20260208000000_config_metadata_schema.sql for expected internal schema.';