-- Migration: Create Metrics Tables
-- Created at: 2026-02-09
-- Description: Database schema for metrics_library and model_metrics tables

CREATE TABLE IF NOT EXISTS public.metrics_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    formula TEXT NOT NULL,
    description TEXT,
    format TEXT CHECK (format IN ('currency', 'percent', 'number', 'decimal')) DEFAULT 'number',
    required_fields TEXT[] NOT NULL DEFAULT '{}',
    aggregation_type TEXT CHECK (aggregation_type IN ('SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'COUNT_DISTINCT')),
    category TEXT,
    is_global BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.metrics_library IS 'Global metrics library shared across all configurations';
COMMENT ON COLUMN public.metrics_library.required_fields IS 'Array of field names referenced in formula (auto-extracted)';

CREATE TABLE IF NOT EXISTS public.model_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL,
    name TEXT NOT NULL,
    formula TEXT NOT NULL,
    description TEXT,
    format TEXT CHECK (format IN ('currency', 'percent', 'number', 'decimal')) DEFAULT 'number',
    required_fields TEXT[] NOT NULL DEFAULT '{}',
    aggregation_type TEXT CHECK (aggregation_type IN ('SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'COUNT_DISTINCT')),
    category TEXT,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(config_id, name)
);

COMMENT ON TABLE public.model_metrics IS 'Custom metrics specific to model configurations';
COMMENT ON COLUMN public.model_metrics.config_id IS 'FK to configurations.id - constraint will be added in future migration once configurations table exists';
COMMENT ON COLUMN public.model_metrics.required_fields IS 'Array of field names referenced in formula (auto-extracted)';

-- Enable RLS
ALTER TABLE public.metrics_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated read access to metrics_library"
ON public.metrics_library FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated full access to model_metrics"
ON public.model_metrics FOR ALL
TO authenticated
USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_model_metrics_config_id ON public.model_metrics(config_id);
CREATE INDEX IF NOT EXISTS idx_metrics_library_category ON public.metrics_library(category);
