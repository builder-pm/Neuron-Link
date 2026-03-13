
import React, { useState, useRef, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { SearchIcon, ChevronDownIcon, InfoIcon, FlagIcon, FolderIcon, SpinnerIcon } from './icons';
import { ItemTypes, FieldGroups, FieldAliases, Configuration } from '../types';
import { prettifyFieldName } from '../utils/stringUtils';
import { configService } from '../services/configService';
import { toast } from 'react-hot-toast';
import ReportIssueModal from './ReportIssueModal';

interface DataFieldsPanelProps {
    selectedFields: string[];
    onFieldChange: (field: string, isSelected: boolean) => void;
    fieldGroups: FieldGroups;
    allAvailableFields: string[];
    fieldAliases: FieldAliases;
    metrics: import('../types').Metric[];
    hiddenFields: Set<string>;
    fieldMetadata: Record<string, import('../types').FieldMetadata>;
    onLoadConfig: (config: any, name: string) => void;
    configName: string;
}

interface DraggableFieldItemProps {
    field: string;
    alias?: string;
    isChecked: boolean;
    onToggle: (field: string, isChecked: boolean) => void;
    metadata?: import('../types').FieldMetadata;
    metric?: import('../types').Metric;
    onReport: (itemName: string) => void;
}

const DraggableFieldItem: React.FC<DraggableFieldItemProps> = ({ field, alias, isChecked, onToggle, metadata, metric, onReport }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.FIELD,
        item: { name: field },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    drag(ref);

    return (
        <div ref={ref} className={`flex items-center space-x-2 p-2 cursor-grab group/field ${isDragging ? 'opacity-50 bg-primary/20' : 'hover:bg-muted'}`}>
            <label className="flex items-center space-x-2 flex-1 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onToggle(field, e.target.checked)}
                    className="brutal-checkbox cursor-pointer"
                    title={`${isChecked ? 'Remove' : 'Add'} ${field}`}
                />
                <div className="flex flex-col">
                    <span className={`text-sm ${alias ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {alias || prettifyFieldName(field)}
                    </span>
                    {alias && (
                        <span className="text-[10px] text-muted-foreground italic -mt-1">
                            orig: {field}
                        </span>
                    )}
                </div>
            </label>
            <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity ml-2 shrink-0">
                <div className="group/tooltip relative flex items-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded cursor-help"
                        aria-label="View business definition"
                    >
                        <InfoIcon className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-card border-2 border-border shadow-brutal z-[100] invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all text-xs font-mono text-foreground break-words text-left rounded-none before:content-[''] before:absolute before:top-full before:right-3 before:border-4 before:border-transparent before:border-t-border pointer-events-none">
                        <strong className="block mb-1 text-primary">{alias || prettifyFieldName(field)}</strong>
                        {metric?.description || metadata?.description || <span className="text-muted-foreground italic">Business definition is not yet configured.</span>}
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onReport(alias || prettifyFieldName(field));
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                    title="Report issue with this field"
                >
                    <FlagIcon className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};


const DataFieldsPanel: React.FC<DataFieldsPanelProps> = ({ selectedFields, onFieldChange, fieldGroups, allAvailableFields, fieldAliases, metrics, hiddenFields, fieldMetadata, onLoadConfig, configName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportItemDetails, setReportItemDetails] = useState<{ type: 'preset' | 'field' | 'metric', name: string } | null>(null);

    // Preset Selector State
    const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
    const [presetConfigs, setPresetConfigs] = useState<Configuration[]>([]);
    const [presetSearch, setPresetSearch] = useState('');
    const [isLoadingPresets, setIsLoadingPresets] = useState(false);

    React.useEffect(() => {
        if (isPresetMenuOpen) {
            setIsLoadingPresets(true);
            configService.getConfigs('db_config')
                .then(configs => {
                    setPresetConfigs(configs);
                })
                .catch(err => {
                    toast.error('Failed to load presets: ' + err.message);
                })
                .finally(() => {
                    setIsLoadingPresets(false);
                });
        }
    }, [isPresetMenuOpen]);

    const filteredPresets = useMemo(() => {
        if (!presetSearch) return presetConfigs;
        const lower = presetSearch.toLowerCase();
        return presetConfigs.filter(c =>
            c.name.toLowerCase().includes(lower) ||
            (c.description && c.description.toLowerCase().includes(lower))
        );
    }, [presetConfigs, presetSearch]);

    const displayedGroups = useMemo(() => {
        // Filter out hidden fields first
        const visibleAvailableFields = allAvailableFields.filter(f => !hiddenFields.has(f));

        const allGroupedFields = new Set(Object.values(fieldGroups).flat());
        const uncategorized = visibleAvailableFields.filter(f => !allGroupedFields.has(f));

        const fullFieldGroups: FieldGroups = { ...fieldGroups };
        if (uncategorized.length > 0) {
            fullFieldGroups['Uncategorized'] = [...(fullFieldGroups['Uncategorized'] || []), ...uncategorized];
        }

        const seenFields = new Set<string>();

        return Object.entries(fullFieldGroups).map(([groupName, fieldsInGroup]) => {
            const uniqueFields = [...new Set(fieldsInGroup)];
            const visibleFields = uniqueFields
                .filter(field => {
                    // Check if field is hidden or already seen
                    if (hiddenFields.has(field) || seenFields.has(field)) return false;

                    const exists = visibleAvailableFields.includes(field);
                    const matchesSearch = field.toLowerCase().includes(searchTerm.toLowerCase());
                    if (exists && matchesSearch) {
                        seenFields.add(field);
                        return true;
                    }
                    return false;
                });

            return { groupName, fields: visibleFields };
        }).filter(group => group.fields.length > 0);
    }, [fieldGroups, allAvailableFields, searchTerm, hiddenFields]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 flex-shrink-0 border-b-2 border-border bg-card/50">
                <div className="flex justify-between items-center mb-4 gap-2">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest font-mono truncate">Fields ({selectedFields.length})</h2>
                    
                    {/* PRESET SELECTOR DROPDOWN */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setIsPresetMenuOpen(!isPresetMenuOpen)}
                            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-primary bg-primary/10 hover:bg-primary/20 transition-all border-2 border-primary/30 rounded max-w-[200px] shadow-sm"
                            title={configName || "Select Preset"}
                        >
                            <FolderIcon className="h-3 w-3" />
                            <span className="truncate">{configName || "Select Preset"}</span>
                            <ChevronDownIcon className={`h-3 w-3 transition-transform ${isPresetMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isPresetMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 bg-card border-2 border-border shadow-brutal z-[110] w-80 flex flex-col max-h-[350px]">
                                <div className="p-2 border-b-2 border-border bg-muted/30">
                                    <input
                                        type="text"
                                        placeholder="Search presets..."
                                        className="brutal-input w-full text-[10px] py-1 px-2"
                                        value={presetSearch}
                                        onChange={e => setPresetSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto min-h-[80px]">
                                    {isLoadingPresets ? (
                                        <div className="flex justify-center p-4">
                                            <SpinnerIcon className="animate-spin h-4 w-4 text-primary" />
                                        </div>
                                    ) : filteredPresets.length === 0 ? (
                                        <div className="text-center p-4 text-[10px] text-muted-foreground italic">
                                            No presets found.
                                        </div>
                                    ) : (
                                        filteredPresets.map(preset => (
                                            <div
                                                key={preset.id}
                                                className={`w-full text-left border-b border-border last:border-0 hover:bg-muted transition-colors group flex items-start justify-between relative ${configName === preset.name ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                            >
                                                <button
                                                    className="flex-1 px-3 py-2 text-left w-full overflow-hidden"
                                                    onClick={() => {
                                                        onLoadConfig(preset.config, preset.name);
                                                        setIsPresetMenuOpen(false);
                                                    }}
                                                >
                                                    <span className={`text-[11px] font-bold truncate block ${configName === preset.name ? 'text-primary' : 'group-hover:text-primary'}`}>{preset.name}</span>
                                                    {preset.description && (
                                                        <span className="text-[9px] text-muted-foreground truncate block mt-0.5 group-hover:text-foreground/80">{preset.description}</span>
                                                    )}
                                                </button>
                                                <div className="flex items-center gap-1 px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <div className="group/preset-tooltip relative flex items-center">
                                                        <button className="text-muted-foreground hover:text-primary p-0.5 rounded" aria-label="View description">
                                                            <InfoIcon className="h-3 w-3" />
                                                        </button>
                                                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-40 p-2 bg-card border-2 border-border shadow-brutal z-[120] invisible opacity-0 group-hover/preset-tooltip:visible group-hover/preset-tooltip:opacity-100 transition-all text-[10px] font-mono text-foreground break-words text-left pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-right-2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-l-border">
                                                            <strong className="block mb-1 text-primary">{preset.name}</strong>
                                                            {preset.description || <span className="text-muted-foreground italic text-[9px]">No description</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                                                        title="Report issue"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setReportItemDetails({ type: 'preset', name: preset.name });
                                                            setReportModalOpen(true);
                                                        }}
                                                    >
                                                        <FlagIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search fields (e.g. country)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="brutal-input w-full !pl-12 pr-4 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
                {displayedGroups.length > 0 ? displayedGroups.map(({ groupName, fields }) => (
                    <details key={groupName} className="group/sub" open>
                        <summary className="flex justify-between items-center p-2 cursor-pointer hover:bg-muted list-none">
                            <span className="font-semibold text-sm text-foreground uppercase tracking-wide">{groupName}</span>
                            <ChevronDownIcon className="h-5 w-5 text-muted-foreground group-open/sub:rotate-180 transition-transform" />
                        </summary>
                        <div className="pl-4 pt-1 border-l-2 border-border ml-2">
                            {fields.map(field => {
                                const metric = metrics.find(m => m.id === field);
                                const displayName = metric ? metric.name : (fieldAliases[`${groupName.toLowerCase()}.${field}`] || fieldAliases[`${groupName}.${field}`] || prettifyFieldName(field));

                                return (
                                    <DraggableFieldItem
                                        key={field}
                                        field={field}
                                        isChecked={selectedFields.includes(field)}
                                        onToggle={onFieldChange}
                                        alias={metric ? displayName : (fieldAliases[`${groupName.toLowerCase()}.${field}`] || fieldAliases[`${groupName}.${field}`])}
                                        metadata={fieldMetadata[`${groupName.toLowerCase()}.${field}`] || fieldMetadata[field]}
                                        metric={metric}
                                        onReport={(itemName: string) => {
                                            setReportItemDetails({ type: metric ? 'metric' : 'field', name: itemName });
                                            setReportModalOpen(true);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </details>
                )) : (
                    <p className="px-4 py-2 text-sm text-muted-foreground">
                        {searchTerm ? 'No matching fields found.' : 'No fields available. Select tables in the DB Configuration panel.'}
                    </p>
                )}
            </div>
            <ReportIssueModal
                isOpen={reportModalOpen}
                onClose={() => {
                    setReportModalOpen(false);
                    setReportItemDetails(null);
                }}
                contextType={reportItemDetails?.type || 'field'}
                itemName={reportItemDetails?.name || ''}
            />
        </div>
    );
};

export default DataFieldsPanel;
