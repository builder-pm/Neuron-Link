import React, { useState, useEffect, useMemo } from 'react';
import DataModelCanvas from '../DataModelCanvas';
import SQLPanel from '../master/SQLPanel';
import MetricsPanel from '../master/MetricsPanel';
import StructurePanel from '../master/StructurePanel';
import GlobalFiltersPanel from '../master/GlobalFiltersPanel';
import ContextPanel from '../master/ContextPanel';
import { AppState, DataRow, DatabaseType } from '../../types';
import { AppAction, ActionType } from '../../state/actions';
import { SettingsIcon, EyeIcon, RotateCcwIcon, XIcon, SqlIcon } from '../icons';
import toast from 'react-hot-toast';
import { X, Search } from 'lucide-react';

// 1. Central Area: New Structure with Header and Overlay Support
interface CentralAreaProps {
    children: React.ReactNode;
    sqlEditor: React.ReactNode;
    showSql: boolean;
    contextPreview: React.ReactNode;
    showContext: boolean;
    // Header Props
    onToggleSql: () => void;
    onToggleContext: () => void;
    isConnecting: boolean;
    isConnected: boolean;
    dbType: string;
    onRefreshData: () => void;
    onConfigureCredentialsClick: () => void;
    isModelDirty: boolean;
    onConfirmModel: () => void;
}

const CentralArea: React.FC<CentralAreaProps> = ({
    children, sqlEditor, showSql, contextPreview, showContext,
    onToggleSql, onToggleContext, isConnecting, isConnected, dbType, onRefreshData, onConfigureCredentialsClick,
    isModelDirty, onConfirmModel // Destructure
}) => {
    return (
        <div className="flex-1 relative flex flex-col h-full overflow-hidden bg-background min-w-0">
            {/* Unified Top Header Bar */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card shrink-0 z-20 relative">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wide font-mono">Data Model</h2>
                    {isModelDirty && (
                        <button
                            onClick={onConfirmModel}
                            className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest border-2 border-primary-foreground shadow-[4px_4px_0_0_rgba(202,255,88,0.3)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(202,255,88,0.4)] transition-all animate-in fade-in slide-in-from-left-4"
                        >
                            Confirm Changes
                        </button>
                    )}
                </div>

                {/* Integrated Controls */}
                <div className="flex items-center gap-2">
                    {/* DB Controls */}
                    <div className="flex items-center gap-2 pr-3 border-r border-border mr-1">
                        <button
                            onClick={onRefreshData}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded"
                            title="Refresh Data"
                        >
                            <RotateCcwIcon className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onConfigureCredentialsClick}
                            className={`badge-brutal ${isConnected ? 'badge-brutal-success' : 'badge-brutal-error'} hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all`}
                            title="Configure Connection"
                        >
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-black">{isConnected ? 'ONLINE' : 'OFFLINE'} • {dbType}</span>
                        </button>
                    </div>

                    {/* Editor Toggles */}
                    <button
                        onClick={onToggleSql}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all border ${showSql ? 'bg-primary text-black border-primary' : 'text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'}`}
                        title="SQL Editor"
                    >
                        <SqlIcon className="h-4 w-4" />
                        <span className="text-xs font-bold">SQL</span>
                    </button>
                    <button
                        onClick={onToggleContext}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all border ${showContext ? 'bg-primary text-black border-primary' : 'text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'}`}
                        title="Semantic Context"
                    >
                        <SettingsIcon className="h-4 w-4" />
                        <span className="text-xs font-bold">CONTEXT</span>
                    </button>
                </div>
            </div>

            {/* Main Canvas Layer */}
            <div className="flex-1 relative z-0 overflow-hidden">
                {children}

                {/* SQL Editor Overlay (Full height coverage) */}
                {showSql && (
                    <div className="absolute inset-0 bg-card z-10 flex flex-col animate-in fade-in duration-200">
                        <div className="flex-1 overflow-hidden relative">
                            {sqlEditor}
                        </div>
                    </div>
                )}

                {/* Semantic Context Overlay */}
                {showContext && (
                    <div className="absolute top-4 right-4 w-[500px] max-h-[80%] bg-card z-20 border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className="p-3 border-b border-border bg-muted/30 font-bold text-xs uppercase tracking-wider flex justify-between">
                            <span>Semantic Graph Context</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 prose prose-invert max-w-none text-xs">
                            {contextPreview}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Row Viewer Component - Vertical display of a single row
const RowViewer = ({ row, columns, onClose }: {
    row: DataRow;
    columns: string[];
    onClose: () => void;
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Filter columns based on search query
    const filteredColumns = useMemo(() => {
        if (!searchQuery.trim()) return columns;

        const query = searchQuery.toLowerCase();
        return columns.filter(col => {
            // Match column name
            if (col.toLowerCase().includes(query)) return true;

            // Match value (stringified)
            const value = row[col];
            const valueStr = value !== null && value !== undefined ? String(value).toLowerCase() : '';
            return valueStr.includes(query);
        });
    }, [columns, row, searchQuery]);

    // Keyboard shortcut: Ctrl/Cmd+F to focus search, Escape to clear
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('row-viewer-search')?.focus();
            }
            if (e.key === 'Escape' && searchQuery) {
                setSearchQuery('');
                document.getElementById('row-viewer-search')?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery]);

    return (
        <div className="flex flex-col h-full">
            <div className="h-12 border-b-2 border-primary bg-primary/10 flex items-center justify-between px-4 shrink-0">
                <span className="text-xs font-black uppercase tracking-widest text-primary">Row Viewer</span>
                <button
                    onClick={onClose}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Close Row Viewer"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3 border-b border-border bg-background sticky top-0 z-10">
                <div className="relative">
                    <div className="absolute left-3 top-2.5 flex items-center pointer-events-none">
                        <Search size={14} className="text-muted-foreground" />
                    </div>
                    <input
                        id="row-viewer-search"
                        type="text"
                        placeholder="Search columns or values..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-xs bg-card border border-border focus:border-primary focus:outline-none font-mono transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filtered Results */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredColumns.length > 0 ? (
                    filteredColumns.map((col) => (
                        <div key={col} className="border-b border-border">
                            <div className="px-4 py-2 bg-muted/30">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{col}</span>
                            </div>
                            <div className="px-4 py-3 font-mono text-sm text-foreground break-all">
                                {row[col] !== null && row[col] !== undefined
                                    ? String(row[col])
                                    : <span className="text-muted-foreground italic">null</span>
                                }
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center p-8">
                        <div className="text-xs text-muted-foreground text-center font-mono">
                            <div className="mb-2">No matches found</div>
                            <div className="text-[10px] text-muted-foreground/60">
                                Try a different search term
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 2. Fixed Right Panel: Tables & Preview
const FixedRightPanel = ({ state, dispatch, onPreviewTable, previewData, onClearPreview, selectedRow, selectedRowColumns, isRowViewerActive, onCloseRowViewer }: {
    state: AppState,
    dispatch: React.Dispatch<AppAction>,
    onPreviewTable: (tableName: string) => void,
    previewData: { name: string, data: any[] } | null,
    onClearPreview?: () => void,
    selectedRow?: DataRow | null,
    selectedRowColumns?: string[],
    isRowViewerActive?: boolean,
    onCloseRowViewer?: () => void
}) => {
    const [activeTab, setActiveTab] = useState<'tables' | 'preview'>('tables');

    // Auto-switch to preview tab when data arrives
    useEffect(() => {
        if (previewData) {
            setActiveTab('preview');
        }
    }, [previewData]);

    // Show Row Viewer when active and row is selected
    if (isRowViewerActive && selectedRow && selectedRowColumns && selectedRowColumns.length > 0) {
        return (
            <div className="w-[320px] bg-card border-l border-border flex flex-col h-full z-30 shadow-xl relative">
                <RowViewer
                    row={selectedRow}
                    columns={selectedRowColumns}
                    onClose={onCloseRowViewer || (() => {})}
                />
            </div>
        );
    }

    return (
        <div className="w-[320px] bg-card border-l border-border flex flex-col h-full z-30 shadow-xl relative">
            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('tables')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'tables' ? 'bg-muted/50 text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/20'}`}
                >
                    Tables
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'preview' ? 'bg-muted/50 text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/20'}`}
                >
                    Preview
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-background">
                {activeTab === 'tables' ? (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        <StructurePanel
                            state={state}
                            dispatch={dispatch}
                            onPreviewTable={onPreviewTable}
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="p-2 border-b border-border bg-muted/20 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase">
                                {previewData ? `Preview: ${previewData.name}` : 'Output Preview'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {previewData && (
                                    <>
                                        <span className="text-[10px] text-muted-foreground">{previewData.data.length} rows</span>
                                        {onClearPreview && (
                                            <button
                                                onClick={onClearPreview}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                title="Clear Preview"
                                            >
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar p-2">
                            {previewData && previewData.data.length > 0 ? (
                                <div className="border border-border rounded-md overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted text-muted-foreground font-medium sticky top-0 z-10">
                                            <tr>
                                                {Object.keys(previewData.data[0]).map(key => (
                                                    <th key={key} className="px-2 py-1.5 border-b border-border whitespace-nowrap font-mono uppercase tracking-widest text-[9px]">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {previewData.data.slice(0, 50).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-muted/30">
                                                    {Object.values(row).map((val: any, i) => (
                                                        <td key={i} className="px-2 py-1 border-r border-border/50 last:border-0 whitespace-nowrap overflow-hidden max-w-[150px] truncate font-mono text-[10px]">
                                                            {val === null ? <span className="text-muted-foreground/50 italic">null</span> : String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {previewData.data.length > 50 && (
                                        <div className="p-2 text-center text-[10px] text-muted-foreground bg-muted/20 uppercase font-bold tracking-widest font-mono border-t border-border">
                                            Showing first 50 rows
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2 p-4 mt-10">
                                    <div className="p-3 border border-border rounded bg-muted/10 text-center">
                                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest font-mono">
                                            {previewData ? "Table is empty." : (
                                                <>Select a table eye icon <EyeIcon className="h-3 w-3 inline" /> to preview data here.</>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 3. Collapsible Drawer: Slides OUT from the LEFT of the Fixed Panel
const CollapsibleDrawer = ({ isOpen, onClose, state, dispatch }: { isOpen: boolean, onClose: () => void, state: AppState, dispatch: React.Dispatch<AppAction> }) => {
    // Width of fixed panel is 320px. Drawer is 350px.
    // It should sit to the LEFT of the fixed panel.
    return (
        <div
            className={`
                absolute top-14 bottom-0 w-[350px] z-20 
                bg-card border-r border-border shadow-2xl
                transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
            style={{
                right: '320px', // Anchored to the left edge of Fixed Panel
                // If it's closed, translate-x-full pushes it 350px to the RIGHT (under the Fixed Panel or off screeen)
                // Wait, if it's right: 320px
                // translate-x-full (100%) = +350px (Rightwards).
                // So it moves INTO the Fixed Panel area (hidden behind it if Z is lower).
                // Open (translate-x-0) = Stops at right: 320px (visible).
            }}
        >
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <h2 className="font-bold text-primary uppercase tracking-widest text-sm">Builder</h2>
                <button onClick={onClose} className="hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar border-l border-primary/20">
                {/* Global Filters Section */}
                <GlobalFiltersPanel state={state} dispatch={dispatch} />

                {/* Metrics Section */}
                <MetricsPanel state={state} dispatch={dispatch} />

                {/* Contexts Section */}
                <ContextPanel state={state} dispatch={dispatch} />
            </div>
        </div>
    );
};


interface MasterViewProps {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    sqlQuery: string;
    executeQuery: (query: string) => Promise<DataRow[]>;
    onPreviewTable: (tableName: string) => void;
    // DB Connection Props
    onConfigureCredentialsClick: () => void;
    onRefreshData: () => void;
    isConnecting: boolean;
    isConnected: boolean;
    dbType: DatabaseType;
    previewData?: { name: string, data: any[] } | null;
    onClearPreview?: () => void;
}

export const MasterView: React.FC<MasterViewProps> = ({
    state, dispatch, sqlQuery, executeQuery, onPreviewTable,
    onConfigureCredentialsClick, onRefreshData, isConnecting, isConnected, dbType,
    previewData, onClearPreview
}) => {
    const [showSqlEditor, setShowSqlEditor] = useState(false);
    const [showContextPreview, setShowContextPreview] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    // Row Viewer State
    const [isRowViewerActive, setIsRowViewerActive] = useState(false);
    const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
    const [selectedRowColumns, setSelectedRowColumns] = useState<string[]>([]);

    const handleExecuteQuery = async () => {
        setIsExecuting(true);
        try {
            await executeQuery(sqlQuery);
            toast.success("Query Executed Successfully");
        } catch (e) {
            toast.error("Execution Failed");
        } finally {
            setIsExecuting(false);
        }
    };

    const handleRowSelect = (row: DataRow | null, columns: string[]) => {
        setSelectedRow(row);
        setSelectedRowColumns(columns);
    };

    // Open row viewer (called on double-click)
    const handleOpenRowViewer = () => {
        setIsRowViewerActive(true);
    };

    const handleCloseRowViewer = () => {
        setIsRowViewerActive(false);
        setSelectedRow(null);
        setSelectedRowColumns([]);
    };

    // Auto-close row viewer when SQL panel closes
    useEffect(() => {
        if (!showSqlEditor && isRowViewerActive) {
            handleCloseRowViewer();
        }
    }, [showSqlEditor]);

    const tablesForCanvas = useMemo(() => {
        return state.discoveredTables
            .filter(t => state.modelConfiguration[t.name])
            .map(t => ({
                name: t.name,
                fields: state.modelConfiguration[t.name] || []
            }));
    }, [state.discoveredTables, state.modelConfiguration]);

    return (
        <div className="flex flex-1 w-full h-full overflow-hidden bg-background relative">

            {/* 1. Central Canvas Area & Layout */}
            {/* Wrapper ensures CentralArea takes available space left of FixedPanel */}
            <CentralArea
                showSql={showSqlEditor}
                onToggleSql={() => setShowSqlEditor(!showSqlEditor)}
                onToggleContext={() => setShowContextPreview(!showContextPreview)}
                sqlEditor={
                    <SQLPanel
                        sqlQuery={sqlQuery}
                        onQueryChange={(q) => dispatch({ type: ActionType.UPDATE_SQL_QUERY, payload: q })}
                        onExecute={handleExecuteQuery}
                        isExecuting={isExecuting}
                        onRowSelect={handleRowSelect}
                        onOpenRowViewer={handleOpenRowViewer}
                    />
                }
                showContext={showContextPreview}
                contextPreview={
                    <div className="space-y-4">
                        <p><strong>Active Tables:</strong> {state.discoveredTables.length}</p>
                        <p><strong>Defined Joins:</strong> {state.joins.length}</p>
                        <p><em>Semantic context generation would appear here as markdown.</em></p>
                    </div>
                }
                isConnecting={isConnecting}
                isConnected={isConnected}
                dbType={dbType}
                onRefreshData={onRefreshData}
                onConfigureCredentialsClick={onConfigureCredentialsClick}
                isModelDirty={state.isModelDirty}
                onConfirmModel={() => {
                    /* Placeholder: wiring to App.tsx dispatch would go here if not already handled */
                    toast.success("Model Confirmed (Mock)");
                    dispatch({ type: ActionType.CONFIRM_MODEL });
                }}
            >
                {/* Visual Graph Component */}
                <DataModelCanvas
                    joins={state.joins}
                    onJoinsChange={(j) => dispatch({ type: ActionType.SET_JOINS, payload: j })}
                    tablePositions={state.tablePositions}
                    onTablePositionsChange={(positions) => {
                        const newPositions = typeof positions === 'function' ? positions(state.tablePositions) : positions;
                        dispatch({ type: ActionType.SET_TABLE_POSITIONS, payload: newPositions });
                    }}
                    tables={tablesForCanvas}
                    onPreviewTable={onPreviewTable}
                    fieldAliases={state.fieldAliases}
                    isModelDirty={state.isModelDirty}
                    onConfirmModel={() => dispatch({ type: ActionType.CONFIRM_MODEL })}
                />
            </CentralArea>

            {/* 2. Collapsible Drawer (Rendered before Fixed Panel to handle Z-indexing implicitly if needed, but explicit Z used) */}
            <CollapsibleDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                state={state}
                dispatch={dispatch}
            />

            {/* 3. Fixed Right Panel (Tables/Preview) with Attached Builder Toggle */}
            <div className="relative flex h-full z-30">
                {/* The "Builder" Toggle Strip (Attached to left of panel) */}
                <div className="w-10 bg-card border-l border-border flex flex-col items-center py-4 gap-4 z-40 shadow-xl h-full border-r border-border mt-14">
                    <button
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        className={`p-2 rounded-md transition-all ${isDrawerOpen ? 'bg-primary text-black' : 'text-muted-foreground hover:text-primary'}`}
                        title="Toggle Builder"
                    >
                        <SettingsIcon className="h-5 w-5" />
                    </button>
                    <div className="h-px w-6 bg-border" />
                </div>

                {/* The Main Fixed Right Panel */}
                <FixedRightPanel
                    state={state}
                    dispatch={dispatch}
                    onPreviewTable={onPreviewTable}
                    previewData={previewData || null}
                    onClearPreview={onClearPreview}
                    selectedRow={selectedRow}
                    selectedRowColumns={selectedRowColumns}
                    isRowViewerActive={isRowViewerActive}
                    onCloseRowViewer={handleCloseRowViewer}
                />
            </div>

        </div>
    );
};
export default MasterView;
