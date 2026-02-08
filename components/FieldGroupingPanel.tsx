import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDrop, useDrag } from 'react-dnd';
import { 
    ChevronDownIcon, 
    PlusIcon, 
    XIcon, 
    MoveIcon, 
    EyeIcon, 
    EyeSlashIcon,
    WandIcon,
    CalculatorIcon,
    FolderIcon,
    CalendarIcon,
    KeyIcon
} from './icons';
import { FieldGroups, ItemTypes, FieldAliases } from '../types';

interface FieldGroupingPanelProps {
    groups: FieldGroups;
    fieldAliases: FieldAliases;
    hiddenFields: Set<string>;
    setGroups?: React.Dispatch<React.SetStateAction<FieldGroups>>;
    onGroupsChange?: (newGroups: FieldGroups) => void;
    onFieldRename: (fieldKey: string, alias: string) => void;
    onFieldVisibilityToggle: (fieldKey: string, isHidden: boolean) => void;
    allFields: string[];
}

interface DraggableFieldProps {
    fieldName: string;
    groupName: string;
    fieldIndex: number;
    displayName: string;
    isHidden: boolean;
    onRename: (newName: string) => void;
    onToggleVisibility: () => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({
    fieldName,
    groupName,
    fieldIndex,
    displayName,
    isHidden,
    onRename,
    onToggleVisibility
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(displayName);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.FIELD,
        item: { name: fieldName, sourceGroup: groupName, sourceIndex: fieldIndex },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [fieldName, groupName, fieldIndex]);

    drag(dragRef);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editValue.trim() && editValue !== displayName) {
            onRename(editValue.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditValue(displayName);
            setIsEditing(false);
        }
    };

    return (
        <div ref={dragRef} className={`flex items-center group/field p-1 pl-2 text-sm cursor-grab ${isDragging ? 'opacity-50' : ''}`}>
            <MoveIcon className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <div className="flex-1 min-w-0 mr-2">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-full px-1 py-0.5 text-sm bg-background border border-primary outline-none text-foreground"
                    />
                ) : (
                    <span
                        onClick={() => {
                            setEditValue(displayName);
                            setIsEditing(true);
                        }}
                        className={`truncate block cursor-pointer hover:text-primary transition-colors hover:underline ${isHidden ? 'line-through text-muted-foreground opacity-60' : 'text-foreground'}`}
                        title="Click to rename"
                    >
                        {displayName}
                    </span>
                )}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility();
                }}
                className={`p-1 rounded transition-colors opacity-0 group-hover/field:opacity-100 ${isHidden ? 'text-destructive hover:bg-destructive/20 opacity-100' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                title={isHidden ? 'Field is hidden' : 'Hide this field'}
            >
                {isHidden ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
        </div>
    );
};

const FIELD_TEMPLATES: Record<string, (fields: string[]) => string[]> = {
    'Dimensions': (fields) =>
        fields.filter(f => !/(sum|count|total|amount|revenue|avg|min|max|_id|id)/i.test(f)),

    'Measures': (fields) =>
        fields.filter(f => /(sum|count|total|amount|revenue|sales|cost|avg|min|max|price|quantity)/i.test(f)),

    'Dates': (fields) =>
        fields.filter(f => /(date|time|_at|created|updated|posted|year|month|day|timestamp)/i.test(f)),

    'Identifiers': (fields) =>
        fields.filter(f => /(id|_id|uid|key|uuid|code)/i.test(f)),
};

interface DraggableGroupProps {
    groupName: string;
    fields: string[];
    fieldAliases: FieldAliases;
    hiddenFields: Set<string>;
    onFieldDrop: (targetGroup: string, fieldName: string, sourceGroup: string, sourceIndex: number) => void;
    onRemoveField: (groupName: string, fieldName: string) => void;
    onRemoveGroup: (groupName: string) => void;
    onFieldRename: (fieldKey: string, alias: string) => void;
    onFieldVisibilityToggle: (fieldKey: string, isHidden: boolean) => void;
}

const GroupDropZone: React.FC<DraggableGroupProps> = ({
    groupName,
    fields,
    fieldAliases,
    hiddenFields,
    onFieldDrop,
    onRemoveField,
    onRemoveGroup,
    onFieldRename,
    onFieldVisibilityToggle
}) => {
    const dropRef = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.FIELD,
        drop: (item: { name: string; sourceGroup: string; sourceIndex: number }, monitor) => {
            if (!monitor.didDrop()) {
                onFieldDrop(groupName, item.name, item.sourceGroup, item.sourceIndex);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [groupName, onFieldDrop]);

    drop(dropRef);

    return (
        <details className="group" open>
            <summary className="flex items-center justify-between p-2 text-sm font-semibold bg-muted/30 border-y border-border cursor-pointer list-none uppercase tracking-wide">
                <span className="text-foreground">{groupName} ({fields.length})</span>
                <div className="flex items-center">
                    {groupName !== 'Uncategorized' && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onRemoveGroup(groupName);
                            }}
                            className="p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors mr-2"
                        >
                            <XIcon className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                    <ChevronDownIcon className="h-5 w-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                </div>
            </summary>
            <div ref={dropRef} className={`p-1 space-y-0.5 min-h-[2rem] transition-colors ${isOver ? 'bg-primary/10' : 'bg-transparent'}`}>
                {fields.map((field, index) => (
                    <div key={field} className="flex items-center justify-between hover:bg-muted group/row">
                        <DraggableField
                            fieldName={field}
                            groupName={groupName}
                            fieldIndex={index}
                            displayName={fieldAliases[field] || field}
                            isHidden={hiddenFields.has(field)}
                            onRename={(newName) => onFieldRename(field, newName)}
                            onToggleVisibility={() => onFieldVisibilityToggle(field, !hiddenFields.has(field))}
                        />
                        <button
                            onClick={() => onRemoveField(groupName, field)}
                            className="p-1 opacity-0 group-hover/row:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all shrink-0"
                        >
                            <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>
                ))}
                {fields.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4 italic">Empty group</p>}
            </div>
        </details>
    );
};

const FieldGroupingPanel: React.FC<FieldGroupingPanelProps> = ({
    groups,
    fieldAliases,
    hiddenFields,
    setGroups,
    onGroupsChange,
    onFieldRename,
    onFieldVisibilityToggle,
    allFields
}) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const templateMenuRef = useRef<HTMLDivElement>(null);

    const updateGroups = (newGroups: FieldGroups) => {
        if (onGroupsChange) {
            onGroupsChange(newGroups);
        } else if (setGroups) {
            setGroups(newGroups);
        }
    };

    // Close template menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
                setShowTemplates(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFieldDrop = (targetGroup: string, fieldName: string, sourceGroup: string, sourceIndex: number) => {
        const newGroups = { ...groups };

        // Remove from source (in all groups to be safe)
        Object.keys(newGroups).forEach(g => {
            newGroups[g] = (newGroups[g] || []).filter(f => f !== fieldName);
        });

        // Add to target
        if (!newGroups[targetGroup]) newGroups[targetGroup] = [];

        // Simple reorder: if same group, we just filtered it out, now push to end
        // For cross-group: also push to end
        newGroups[targetGroup].push(fieldName);

        updateGroups(newGroups);
    };

    const handleRemoveField = (groupName: string, fieldName: string) => {
        const newGroups = { ...groups };
        newGroups[groupName] = (newGroups[groupName] || []).filter(f => f !== fieldName);
        if (!newGroups['Uncategorized']) newGroups['Uncategorized'] = [];
        if (!newGroups['Uncategorized'].includes(fieldName)) {
            newGroups['Uncategorized'].push(fieldName);
        }
        updateGroups(newGroups);
    }

    const applyTemplate = (templateName: string) => {
        const matcher = FIELD_TEMPLATES[templateName];
        if (!matcher) return;

        // Get all available fields (not already in other groups)
        const assignedFields = new Set(Object.values(groups).flat());
        const availableFields = allFields.filter(f => !assignedFields.has(f));

        // Match fields using template pattern
        const matchingFields = matcher(availableFields);

        if (matchingFields.length === 0) {
            toast.error(`No fields match ${templateName} pattern`);
            return;
        }

        if (groups[templateName]) {
            toast.error(`Group "${templateName}" already exists`);
            return;
        }

        // Create group with matched fields
        const newGroups = {
            ...groups,
            [templateName]: matchingFields
        };
        updateGroups(newGroups);

        toast.success(`${templateName}: ${matchingFields.length} fields added`);
        setShowTemplates(false);
    };

    const handleAddGroup = () => {
        if (!newGroupName.trim() || groups[newGroupName.trim()]) return;

        const newGroups = { ...groups, [newGroupName.trim()]: [] };
        updateGroups(newGroups);
        setNewGroupName('');
    };

    const handleRemoveGroup = (groupName: string) => {
        const newGroups = { ...groups };
        const fieldsToMove = newGroups[groupName] || [];
        delete newGroups[groupName];
        if (!newGroups['Uncategorized']) newGroups['Uncategorized'] = [];
        newGroups['Uncategorized'] = [...new Set([...newGroups['Uncategorized'], ...fieldsToMove])];
        updateGroups(newGroups);
    }

    const uncategorizedFields = allFields.filter(field => !Object.values(groups).flat().includes(field));
    const finalGroups = { ...groups };
    if (finalGroups['Uncategorized']) {
        finalGroups['Uncategorized'] = [...new Set([...finalGroups['Uncategorized'], ...uncategorizedFields])];
    } else {
        finalGroups['Uncategorized'] = uncategorizedFields;
    }

    const templates = [
        { name: 'Dimensions', icon: <FolderIcon className="h-4 w-4" /> },
        { name: 'Measures', icon: <CalculatorIcon className="h-4 w-4" /> },
        { name: 'Dates', icon: <CalendarIcon className="h-4 w-4" /> },
        { name: 'Identifiers', icon: <KeyIcon className="h-4 w-4" /> },
    ];

    return (
        <div className="w-full h-full flex flex-col bg-card">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-4 border-b-2 border-border bg-card">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Field Groups</h3>

                    <div className="flex items-center gap-2 relative">
                        {/* Template Trigger */}
                        <div className="relative" ref={templateMenuRef}>
                            <button
                                onClick={() => setShowTemplates(!showTemplates)}
                                className={`p-2 border-2 border-border transition-all hover:shadow-brutal ${showTemplates ? 'bg-primary text-black' : 'bg-card text-muted-foreground hover:text-primary'}`}
                                title="Auto-populate from templates"
                            >
                                <WandIcon className="h-4 w-4" />
                            </button>

                            {showTemplates && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-card border-2 border-border shadow-brutal z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 border-b border-border bg-muted/30">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Apply Template</span>
                                    </div>
                                    <div className="py-1">
                                        {templates.map((t) => (
                                            <button
                                                key={t.name}
                                                onClick={() => applyTemplate(t.name)}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold hover:bg-primary hover:text-black transition-colors"
                                            >
                                                <span className="opacity-70">{t.icon}</span>
                                                <span>{t.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Group Input */}
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                                placeholder="New group name..."
                                className="brutal-input flex-1 text-sm bg-background h-9"
                            />
                            <button
                                onClick={handleAddGroup}
                                className="px-3 bg-primary text-black border-2 border-border hover:shadow-brutal transition-all flex items-center justify-center"
                                title="Create custom group"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-foreground">
                    {Object.entries(finalGroups).map(([groupName, fields]) => (
                        <GroupDropZone
                            key={groupName}
                            groupName={groupName}
                            fields={fields}
                            fieldAliases={fieldAliases}
                            hiddenFields={hiddenFields}
                            onFieldDrop={handleFieldDrop}
                            onRemoveField={handleRemoveField}
                            onRemoveGroup={handleRemoveGroup}
                            onFieldRename={onFieldRename}
                            onFieldVisibilityToggle={onFieldVisibilityToggle}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FieldGroupingPanel;
