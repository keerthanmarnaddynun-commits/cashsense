import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskAlertBanner } from '../components/RiskAlertBanner';
import { MetricCard } from '../components/MetricCard';
import { CashRunwayGauge } from '../components/CashRunwayGauge';
import { ForecastConfidence } from '../components/ForecastConfidence';
import { TodayBriefing } from '../components/TodayBriefing';
import { DynamicInsights } from '../components/DynamicInsights';
import { getFinancials } from '../services/api';
import { normalizeFinancialData } from '../utils/normalizeFinancialData';
import type { FlexibleFinancialData } from '../types';
import { Wallet, HandCoins, Receipt, TrendingUp, AlertCircle, RefreshCw, Upload, Loader2, Coins } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [financials, setFinancials] = useState<FlexibleFinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const rawData = await getFinancials();
      const normalized = normalizeFinancialData(rawData);
      setFinancials(normalized);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleViewAnalysis = () => {
    navigate('/copilot', { 
      state: { 
        query: 'Analyze the projected cashflow shortfall of ₹1.2 lakh on Aug 18 and advise on remediation actions.' 
      } 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      // Re-fetch standard payload now that runtime_metrics is updated on backend
      await fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to process document');
    } finally {
      setUploading(false);
    }
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

  const getBriefingData = () => {
    if (!financials || financials.invoices.length === 0) {
      return {
        topRiskClient: 'Shiva Logistics',
        expectedCash: '₹1.2L on Aug 18',
        bestAction: 'Follow up today',
      };
    }
    const highRiskInv = financials.invoices.find(inv => 
      inv.historical_payment_behavior.toLowerCase().includes('chronically')
    ) || financials.invoices[0];

    return {
      topRiskClient: highRiskInv.client_name,
      expectedCash: '₹1.2L on Aug 18',
      bestAction: `Follow up on ${highRiskInv.invoice_id}`,
    };
  };

  const briefing = getBriefingData();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time working capital analytics and AI predictions.</p>
        </div>

        {/* Dynamic PDF/CSV uploader */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10">
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
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-[20px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Connection Offline</p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Unable to contact the financials API. Ensure the server is listening at http://127.0.0.1:8000.
              </p>
            </div>
          </div>
          <button 
            onClick={fetchDashboardData}
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
                isLoading={isLoading}
                icon={design.icon}
                colorClass={design.colorClass}
                accentClass={design.accentClass}
              />
            );
          })
        ) : (
          // Skeletons layout if financials is null
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
          runwayDays={financials?.metrics?.current_cash?.value ? 18 : null} 
          isLoading={isLoading} 
        />
        <ForecastConfidence 
          confidenceScore={financials?.metrics?.current_cash?.confidence !== undefined ? Math.round(financials.metrics.current_cash.confidence * 82) : 82} 
          isLoading={isLoading} 
        />
      </div>

      {/* Today's AI Briefing Card */}
      <TodayBriefing
        topRiskClient={briefing.topRiskClient}
        expectedCash={briefing.expectedCash}
        bestAction={briefing.bestAction}
        isLoading={isLoading}
      />

      {/* Dynamic Insights Panel for unknown metrics */}
      {financials && <DynamicInsights dynamicFields={financials.dynamicFields} />}
    </div>
  );
};
export default DashboardPage;
