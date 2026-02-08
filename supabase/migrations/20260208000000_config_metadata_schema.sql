-- Schema Registry for JSONB config column in configurations table
-- This migration documents the expected structure of the semantic metadata stored in JSONB

COMMENT ON COLUMN public.configurations.config IS '
JSON structure for "db_config":
{
  "selectedFields": string[],
  "modelConfiguration": { [tableName: string]: string[] },
  "confirmedModelConfiguration": { [tableName: string]: string[] },
  "joins": Join[],
  "tablePositions": { [tableName: string]: { top: number, left: number } },
  "fieldGroups": { [groupName: string]: string[] },
  "fieldAliases": { [fieldKey: string]: string },
  "fieldMetadata": { [fieldKey: string]: { description?: string, dataType?: string } },
  "sampleValues": { [fieldKey: string]: string[] },
  "hiddenFields": string[],
  "fieldOrder": string[]
}

JSON structure for "analysis_config":
{
  "pivotConfig": {
    "rows": string[],
    "columns": string[],
    "values": { "field": string, "aggregation": string, "displayName"?: string }[]
  },
  "filters": { "id": string, "field": string, "operator": string, "value": any }[]
}';
