import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { XIcon, PaperAirplaneIcon } from './icons';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: 'field' | 'preset' | 'metric';
  itemName: string;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, contextType, itemName }) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the issue.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`Issue reported for ${contextType} "${itemName}". Thank you!`);
      setIsSubmitting(false);
      setDescription('');
      onClose();
    }, 800);
  };

  return createPortal(
    <div className="brutal-overlay p-4">
      <div className="bg-card w-full max-w-lg border-2 border-border shadow-brutal p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="text-destructive">🚩</span> Report Issue
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <p className="text-sm text-foreground mb-4">
          Reporting issue with {contextType}: <strong className="text-primary">{itemName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              Issue Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="brutal-input w-full p-3 min-h-[120px] text-sm resize-y text-foreground font-mono"
              placeholder="Describe the discrepancy or issue you found..."
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold uppercase border-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border text-sm font-bold uppercase shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Sending...' : (
                <>
                  <span>Send Report</span>
                  <PaperAirplaneIcon className="h-4 w-4 inline-block ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReportIssueModal;
