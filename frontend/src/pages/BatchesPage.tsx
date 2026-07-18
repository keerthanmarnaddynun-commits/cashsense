import React, { useState } from 'react';
import { useBatchStore } from '../store/batchStore';
import { DocumentManager } from '../components/DocumentManager';
import { Plus, Briefcase, Trash2, Calendar, FileText, Upload, Loader2, AlertCircle } from 'lucide-react';


export const BatchesPage: React.FC = () => {

  const { 
    batches, 
    selectedBatchId, 
    selectBatch, 
    createBatch, 
    deleteBatch, 
    uploadDocument 
  } = useBatchStore();

  const [newBatchName, setNewBatchName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activeBatch = batches.find(b => b.id === selectedBatchId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;
    try {
      await createBatch(newBatchName);
      setNewBatchName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this workspace batch? All uploaded documents and chat histories will be deleted.")) {
      try {
        await deleteBatch(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      await uploadDocument(file);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Workspaces</h2>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Create separate analyses for different companies, months, or scenarios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Workspaces List panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glow-card bg-[#181b25] border border-white/5 rounded-[24px] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Workspace Profiles
            </h3>

            {/* Create new Workspace */}
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                placeholder="New workspace name..."
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/40 border border-charcoal-border rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shrink-0 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {batches.map(b => (
                <div
                  key={b.id}
                  onClick={() => selectBatch(b.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer hover:bg-white/[0.02] border transition-all ${
                    b.id === selectedBatchId 
                      ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400 shadow-md shadow-indigo-500/5' 
                      : 'border-white/5 bg-black/10 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Briefcase className={`h-4.5 w-4.5 shrink-0 ${b.id === selectedBatchId ? 'text-indigo-400' : 'text-gray-500'}`} />
                    <div className="truncate">
                      <span className="text-xs font-bold block truncate">{b.name}</span>
                      <span className="text-[9px] text-gray-500 block mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(b.id);
                    }}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-500 hover:text-rose-400 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Workspace Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeBatch ? (
            <div className="glow-card bg-[#181b25] border border-white/5 rounded-[24px] p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/[0.04]">
                <div>
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">Active Workspace</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeBatch.name}</h3>
                </div>

                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing File...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Document</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept=".pdf,.csv" 
                    onChange={handleFileUpload} 
                    disabled={uploading} 
                    className="hidden" 
                  />
                </label>
              </div>

              {uploadError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  <p className="text-xs font-medium">
                    <span className="font-bold">Reprocessing Error:</span> {uploadError}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    Uploaded Documents
                  </h4>
                </div>

                <DocumentManager />
              </div>

            </div>
          ) : (
            <div className="glow-card bg-[#181b25] border border-white/5 border-dashed rounded-[24px] p-12 text-center text-gray-500 text-xs">
              Select or create a workspace batch from the left panel to begin.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default BatchesPage;
