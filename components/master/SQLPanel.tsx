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
        </div>
    );
};

export default SQLPanel;
