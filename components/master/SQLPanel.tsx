import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'sql-formatter';
import { DataRow } from '../types';
import { executeQuery } from '../services/database';

interface SQLPanelProps {
    sqlQuery: string;
    onQueryChange: (query: string) => void;
    onExecute: () => void;
    isExecuting: boolean;
}

const SQLPanel: React.FC<SQLPanelProps> = ({ sqlQuery, onQueryChange, onExecute, isExecuting }) => {
    const [queryResults, setQueryResults] = useState<DataRow[] | null>(null);
    const [executionError, setExecutionError] = useState<string | null>(null);
    const [isExecutingQuery, setIsExecutingQuery] = useState<boolean>(false);
    const handleFormat = () => {
        try {
            const formatted = format(sqlQuery);
            onQueryChange(formatted);
            toast.success('SQL formatted');
        } catch (e) {
            toast.error('Failed to format SQL');
        }
    };

    const handleExecute = async () => {
        if (!sqlQuery.trim()) return;

        setIsExecutingQuery(true);
        try {
            const results = await executeQuery(sqlQuery);
            setQueryResults(results);
            setExecutionError(null);
            toast.success(`Query executed. ${results.length} rows returned.`);
        } catch (error: any) {
            console.error("Query execution failed:", error);
            const errorMessage = error.message || "An unknown error occurred during query execution.";
            setExecutionError(errorMessage);
            setQueryResults(null);
            toast.error("Failed to execute query.");
        } finally {
            setIsExecutingQuery(false);
        }

        // Also call the parent's onExecute if provided
        onExecute();
    };

    return (
        <div className="flex flex-col h-full bg-background relative group">
            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    language="sql"
                    value={sqlQuery}
                    onChange={(val) => onQueryChange(val || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 20 },
                        automaticLayout: true,
                    }}
                />

                {/* Floating Action Bar */}
                <div className="absolute bottom-6 right-6 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleFormat}
                        className="p-3 bg-card border border-border shadow-lg rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
                        title="Format SQL"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={handleExecute}
                        className="p-3 bg-primary text-primary-foreground shadow-lg rounded-full hover:bg-primary/90 transition-all flex items-center justify-center animate-in zoom-in"
                        title="Run Query"
                        disabled={isExecutingQuery}
                    >
                        <Play size={20} className={isExecutingQuery ? "animate-spin" : "ml-1"} />
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="flex-1 overflow-auto p-4 bg-background">
                {isExecutingQuery ? (
                    <div className="text-muted-foreground text-center mt-10 animate-pulse">
                        Executing query...
                    </div>
                ) : executionError ? (
                    <div className="p-4 border-2 border-destructive bg-destructive/10 text-destructive font-mono text-sm whitespace-pre-wrap overflow-auto max-h-full">
                        <div className="font-bold mb-2 uppercase tracking-wide">SQL Execution Error</div>
                        {executionError}
                    </div>
                ) : queryResults ? (
                    queryResults.length > 0 ? (
                        <>
                            <div className="overflow-auto max-w-full">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-muted sticky top-0 z-10">
                                        <tr>
                                            {Object.keys(queryResults[0]).map(header => (
                                                <th key={header} className="px-4 py-2 font-semibold text-foreground whitespace-nowrap uppercase tracking-wide text-xs font-mono border-b-2 border-border">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {queryResults.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/50">
                                                {Object.values(row).map((cell, j) => (
                                                    <td key={j} className="px-4 py-2 whitespace-nowrap text-foreground max-w-xs truncate border-r border-border last:border-r-0">
                                                        {cell !== null && cell !== undefined ? String(cell) : <span className="text-muted-foreground italic">null</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-2 border-t-2 border-border bg-card text-xs text-muted-foreground font-mono">
                                {queryResults.length} rows returned
                            </div>
                        </>
                    ) : (
                        <div className="text-muted-foreground text-center mt-10">No rows returned.</div>
                    )
                ) : (
                    <div className="text-muted-foreground text-center mt-10">Run a query to see results here.</div>
                )}
            </div>
        </div>
    );
};

export default SQLPanel;
