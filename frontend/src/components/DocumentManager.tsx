import React, { useState } from 'react';
import { useBatchStore } from '../store/batchStore';
import { FileText, RefreshCw, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const DocumentManager: React.FC = () => {
  const { documents, deleteDocument, reprocessDocument } = useBatchStore();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = Math.round((now.getTime() - d.getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
      if (diff < 86400) return `${Math.round(diff / 3600)} hours ago`;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return 'N/A';
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this document? Workspace analytics will automatically recalculate.")) {
      try {
        await deleteDocument(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReprocess = async (id: number) => {
    setProcessingId(id);
    try {
      await reprocessDocument(id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="p-6 bg-charcoal-card/25 border border-dashed border-white/10 rounded-[18px] text-center text-gray-500 text-xs">
        No documents uploaded to this workspace yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-left text-xs font-semibold text-gray-300">
        <thead>
          <tr className="border-b border-white/[0.04] text-[10px] text-gray-500 uppercase tracking-wider">
            <th className="py-3 px-4 font-extrabold">Document</th>
            <th className="py-3 px-4 font-extrabold">Type</th>
            <th className="py-3 px-4 font-extrabold">Uploaded</th>
            <th className="py-3 px-4 font-extrabold">Status</th>
            <th className="py-3 px-4 font-extrabold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.02]">
          {documents.map((doc) => {
            const isProcessing = processingId === doc.id;
            return (
              <tr key={doc.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[180px] md:max-w-[240px]">{doc.filename}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-400 font-medium">
                  {doc.file_type}
                </td>
                <td className="py-3.5 px-4 text-gray-400 font-medium">
                  {formatTimeAgo(doc.created_at)}
                </td>
                <td className="py-3.5 px-4">
                  {isProcessing ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Reprocessing
                    </span>
                  ) : doc.status === 'Processed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Processed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                      <AlertCircle className="h-3 w-3" />
                      {doc.status}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleReprocess(doc.id)}
                      disabled={isProcessing}
                      title="Reprocess Document"
                      className="p-2 bg-charcoal-card border border-charcoal-border hover:border-white/10 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin text-indigo-400' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={isProcessing}
                      title="Delete Document"
                      className="p-2 bg-charcoal-card border border-charcoal-border hover:border-rose-500/20 hover:text-rose-400 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-rose-400" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default DocumentManager;
