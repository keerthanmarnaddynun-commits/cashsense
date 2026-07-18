import React, { useState } from 'react';
import { useBatchStore } from '../store/batchStore';
import { ChevronDown, Plus, Check, Briefcase, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BatchSelector: React.FC = () => {
  const navigate = useNavigate();
  const { batches, selectedBatchId, selectBatch, createBatch, deleteBatch } = useBatchStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const activeBatch = batches.find(b => b.id === selectedBatchId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;
    try {
      await createBatch(newBatchName);
      setNewBatchName('');
      setShowInput(false);
      setDropdownOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this workspace batch? All uploaded documents and chat histories will be deleted.")) {
      try {
        await deleteBatch(id);
        setDropdownOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="relative z-50">
      {/* Selector Trigger button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-charcoal-card border border-charcoal-border hover:border-white/15 rounded-xl transition-all text-xs font-semibold text-white select-none cursor-pointer w-full"
      >
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
            <Briefcase className="h-3.5 w-3.5" />
          </span>
          <span className="truncate max-w-[120px] md:max-w-[160px]">
            {activeBatch ? activeBatch.name : 'Select Workspace'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {dropdownOpen && (
        <div className="absolute top-[108%] left-0 right-0 bg-[#161821] border border-charcoal-border rounded-xl shadow-2xl p-2 mt-1 min-w-[220px]">
          <div className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider p-2 mb-1">
            Workspaces
          </div>

          <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
            {batches.map(b => (
              <div
                key={b.id}
                onClick={() => {
                  selectBatch(b.id);
                  setDropdownOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-white/[0.03] transition-colors group ${
                  b.id === selectedBatchId ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'text-gray-300'
                }`}
              >
                <span className="text-xs font-medium truncate max-w-[150px]">{b.name}</span>
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {b.id === selectedBatchId && <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />}
                  <button 
                    onClick={(e) => handleDelete(e, b.id)}
                    className="p-1 hover:bg-rose-500/20 rounded text-gray-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.04] mt-2 pt-2">
            {showInput ? (
              <form onSubmit={handleCreate} className="p-1 space-y-2">
                <input
                  type="text"
                  placeholder="Workspace Name..."
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-charcoal-border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-medium"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setShowInput(false)}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-md font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowInput(true)}
                className="w-full flex items-center justify-center gap-1.5 p-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/15 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default BatchSelector;
