import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskAlertBanner } from '../components/RiskAlertBanner';
import { MetricCard } from '../components/MetricCard';
import { CashRunwayGauge } from '../components/CashRunwayGauge';
import { ForecastConfidence } from '../components/ForecastConfidence';
import { TodayBriefing } from '../components/TodayBriefing';
import { DynamicInsights } from '../components/DynamicInsights';
import { useBatchStore } from '../store/batchStore';
import type { FlexibleFinancialData } from '../types';
import { Wallet, HandCoins, Receipt, TrendingUp, AlertCircle, RefreshCw, Upload, Loader2, Coins, Sparkles, FolderOpen } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedBatchId, 
    batches, 
    analytics, 
    documents, 
    loading: storeLoading, 
    error: storeError, 
    uploadDocument,
    selectBatch 
  } = useBatchStore();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activeBatch = batches.find(b => b.id === selectedBatchId);

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

  const handleViewAnalysis = () => {
    navigate('/copilot', { 
      state: { 
        query: 'Analyze the projected cashflow shortfall of ₹1.2 lakh on Aug 18 and advise on remediation actions.' 
      } 
    });
  };

  const getCardDesign = (key: string) => {
    switch (key) {
      case 'current_cash':
        return { icon: Wallet, colorClass: 'text-emerald-400', accentClass: 'bg-emerald-500/10' };
      case 'total_receivables':
        return { icon: HandCoins, colorClass: 'text-indigo-400', accentClass: 'bg-indigo-500/10' };
      case 'total_expenses':
        return { icon: Receipt, colorClass: 'text-rose-400', accentClass: 'bg-rose-500/10' };
      case 'net_forecast_position':
        return { icon: TrendingUp, colorClass: 'text-cyan-400', accentClass: 'bg-cyan-500/10' };
      default:
        return { icon: Coins, colorClass: 'text-indigo-400', accentClass: 'bg-indigo-500/10' };
    }
  };

  // Convert aggregated batch analytics to the frontend FlexibleFinancialData interface
  const financials: FlexibleFinancialData | null = analytics ? {
    metrics: {
      current_cash: { value: analytics.kpis.current_cash, confidence: 1.0 },
      total_receivables: { value: analytics.kpis.total_receivables, confidence: 1.0 },
      total_expenses: { value: analytics.kpis.total_expenses, confidence: 1.0 },
      net_forecast_position: { value: analytics.kpis.net_forecast_position, confidence: 1.0 }
    },
    dynamicFields: Object.entries(analytics.dynamic_fields).reduce((acc, [k, v]) => {
      acc[k] = { value: v.value, confidence: v.confidence };
      return acc;
    }, {} as any),
    alerts: analytics.risk_signals,
    invoices: analytics.invoices
  } : null;

  const briefingText = analytics?.executive_briefing || "Upload document statements to calculate runway and collections risk.";

  const briefing = {
    topRiskClient: financials?.invoices?.find(inv => 
      inv.historical_payment_behavior.toLowerCase().includes('chronically')
    )?.client_name || 'Shiva Logistics',
    expectedCash: '₹1.2L on Aug 18',
    bestAction: financials?.invoices?.length ? `Prioritize invoice ${financials.invoices[0].invoice_id}` : 'Follow up today',
  };

  // Onboarding On Empty State check
  const isWorkspaceEmpty = documents.length === 0;

  if (isWorkspaceEmpty && !storeLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
        <div className="max-w-xl w-full text-center space-y-6 bg-charcoal-card border border-charcoal-border rounded-[28px] p-8 md:p-12 relative overflow-hidden glow-card">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Start your financial analysis
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto font-medium">
              Upload bank statements, invoices, or transaction CSV files to generate KPIs, forecasts, and AI insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <label className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 w-full sm:w-auto justify-center">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload Documents</span>
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
            <button
              onClick={() => navigate('/batches')}
              className="flex items-center gap-2 px-5 py-3 bg-charcoal-dark border border-charcoal-border hover:border-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all w-full sm:w-auto justify-center cursor-pointer"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Manage Workspaces</span>
            </button>
          </div>

          {uploadError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-xs font-medium text-left">
              <span className="font-bold">Error:</span> {uploadError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {activeBatch ? activeBatch.name : 'Executive Dashboard'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time working capital analytics and AI predictions.</p>
        </div>

        {/* Dynamic PDF/CSV uploader */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Statement</span>
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
      </div>

      {/* Backend connection warning alert */}
      {storeError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-[20px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Connection Offline</p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                {storeError}
              </p>
            </div>
          </div>
          <button 
            onClick={() => selectedBatchId && selectBatch(selectedBatchId)}
            className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/35 rounded-xl text-[11px] font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* File processing error display */}
      {uploadError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-[20px] p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <p className="text-xs font-medium">
            <span className="font-bold">Extraction Failed:</span> {uploadError}
          </p>
        </div>
      )}

      {/* Risk Alert Banner */}
      <RiskAlertBanner onViewAnalysis={handleViewAnalysis} />

      {/* 4 Metric Cards Grid - Mapped dynamically */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {financials?.metrics ? (
          Object.entries(financials.metrics).map(([key, metric]) => {
            const design = getCardDesign(key);
            return (
              <MetricCard
                key={key}
                title={key}
                value={metric.value}
                confidence={metric.confidence}
                isLoading={storeLoading}
                icon={design.icon}
                colorClass={design.colorClass}
                accentClass={design.accentClass}
              />
            );
          })
        ) : (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="glow-card bg-charcoal-card rounded-[22px] p-6 relative overflow-hidden animate-pulse min-h-[140px]">
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              <div className="h-8 bg-gray-800 rounded w-3/4 mt-4"></div>
            </div>
          ))
        )}
      </div>

      {/* Runway + Confidence Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CashRunwayGauge 
          runwayDays={analytics?.kpis?.cash_runway_days} 
          isLoading={storeLoading} 
        />
        <ForecastConfidence 
          confidenceScore={88} 
          isLoading={storeLoading} 
        />
      </div>

      {/* Today's AI Briefing Card */}
      <TodayBriefing
        topRiskClient={briefing.topRiskClient}
        expectedCash={briefing.expectedCash}
        bestAction={briefing.bestAction}
        briefingText={briefingText}
        isLoading={storeLoading}
      />

      {/* Dynamic Insights Panel for unknown metrics */}
      {financials && <DynamicInsights dynamicFields={financials.dynamicFields} />}
    </div>
  );
};
export default DashboardPage;
