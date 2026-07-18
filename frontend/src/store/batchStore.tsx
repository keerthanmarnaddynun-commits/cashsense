import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { OverdueInvoice } from '../types';

const BASE_URL = 'http://127.0.0.1:8000';

export interface Batch {
  id: string;
  name: string;
  created_at: string;
}

export interface DocumentMetadata {
  id: number;
  filename: string;
  file_type: string;
  created_at: string;
  status: string;
}

export interface BatchAnalytics {
  kpis: {
    current_cash: number;
    total_receivables: number;
    total_expenses: number;
    net_forecast_position: number;
    cash_runway_days: number;
    burn_rate: number;
    receivable_risk_ratio: number;
    liquidity_buffer: number;
  };
  invoices: OverdueInvoice[];
  dynamic_fields: Record<string, { value: number | null; confidence?: number }>;
  risk_signals: string[];
  executive_briefing: string;
  forecast_series: { date: string; value: number }[];
}

interface BatchStoreContextType {
  selectedBatchId: string | null;
  batches: Batch[];
  analytics: BatchAnalytics | null;
  documents: DocumentMetadata[];
  loading: boolean;
  error: string | null;
  selectBatch: (batchId: string) => Promise<void>;
  createBatch: (name: string) => Promise<string>;
  deleteBatch: (batchId: string) => Promise<void>;
  fetchBatches: () => Promise<void>;
  fetchAnalytics: (batchId: string) => Promise<void>;
  fetchDocuments: (batchId: string) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (docId: number) => Promise<void>;
  reprocessDocument: (docId: number) => Promise<void>;
}

const BatchStoreContext = createContext<BatchStoreContextType | undefined>(undefined);

export const BatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(() => {
    return localStorage.getItem('cashsense_selected_batch_id');
  });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [analytics, setAnalytics] = useState<BatchAnalytics | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/batches`);
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      const data = await res.json();
      setBatches(data);
      
      // Auto-select first batch if none selected
      if (data.length > 0 && !selectedBatchId) {
        await selectBatch(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error listing workspaces');
    }
  };

  const selectBatch = async (batchId: string) => {
    setSelectedBatchId(batchId);
    localStorage.setItem('cashsense_selected_batch_id', batchId);
    setError(null);
    setLoading(true);
    try {
      await Promise.all([
        fetchAnalytics(batchId),
        fetchDocuments(batchId)
      ]);
    } catch (err: any) {
      setError(err.message || 'Error loading batch workspace');
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (name: string): Promise<string> => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Failed to create workspace');
      const newBatch = await res.json();
      
      setBatches(prev => [newBatch, ...prev]);
      await selectBatch(newBatch.id);
      return newBatch.id;
    } catch (err: any) {
      setError(err.message || 'Error creating batch');
      throw err;
    }
  };

  const deleteBatch = async (batchId: string) => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/batches/${batchId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete workspace');
      
      const updated = batches.filter(b => b.id !== batchId);
      setBatches(updated);
      
      if (selectedBatchId === batchId) {
        if (updated.length > 0) {
          await selectBatch(updated[0].id);
        } else {
          setSelectedBatchId(null);
          localStorage.removeItem('cashsense_selected_batch_id');
          setAnalytics(null);
          setDocuments([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting batch');
      throw err;
    }
  };

  const fetchAnalytics = async (batchId: string) => {
    const res = await fetch(`${BASE_URL}/api/batches/${batchId}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const data = await res.json();
    setAnalytics(data);
  };

  const fetchDocuments = async (batchId: string) => {
    const res = await fetch(`${BASE_URL}/api/batches/${batchId}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents list');
    const data = await res.json();
    setDocuments(data);
  };

  const uploadDocument = async (file: File) => {
    if (!selectedBatchId) throw new Error('No active workspace selected');
    setError(null);
    setLoading(true);
    
    const formData = new FormData();
    formData.append('batch_id', selectedBatchId);
    formData.append('file', file);
    
    try {
      const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Upload failed');
      }
      
      // Update analytics and documents instantly
      const updatedAnalytics = await res.json();
      setAnalytics(updatedAnalytics);
      await fetchDocuments(selectedBatchId);
    } catch (err: any) {
      setError(err.message || 'Failed to process document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId: number) => {
    if (!selectedBatchId) return;
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/documents/${docId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete document');
      
      setDocuments(prev => prev.filter(d => d.id !== docId));
      await fetchAnalytics(selectedBatchId);
    } catch (err: any) {
      setError(err.message || 'Error deleting document');
      throw err;
    }
  };

  const reprocessDocument = async (docId: number) => {
    if (!selectedBatchId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/documents/${docId}/reprocess`, {
        method: 'POST'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Reprocessing failed');
      }
      
      const updatedAnalytics = await res.json();
      setAnalytics(updatedAnalytics);
      await fetchDocuments(selectedBatchId);
    } catch (err: any) {
      setError(err.message || 'Failed to reprocess document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <BatchStoreContext.Provider value={{
      selectedBatchId,
      batches,
      analytics,
      documents,
      loading,
      error,
      selectBatch,
      createBatch,
      deleteBatch,
      fetchBatches,
      fetchAnalytics,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
      reprocessDocument
    }}>
      {children}
    </BatchStoreContext.Provider>
  );
};

export const useBatchStore = () => {
  const context = useContext(BatchStoreContext);
  if (!context) {
    throw new Error('useBatchStore must be used within a BatchProvider');
  }
  return context;
};
