import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskAlertBanner } from '../components/RiskAlertBanner';
import { MetricCard } from '../components/MetricCard';
import { CashRunwayGauge } from '../components/CashRunwayGauge';
import { ForecastConfidence } from '../components/ForecastConfidence';
import { TodayBriefing } from '../components/TodayBriefing';
import { getFinancials, uploadFinancialDocument } from '../services/api';
import type { FinancialSummary } from '../types';
import { Wallet, HandCoins, Receipt, TrendingUp, AlertCircle, RefreshCw, UploadCloud, Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);
    try {
      const updatedMetrics = await uploadFinancialDocument(file);
      setFinancials(updatedMetrics);
      await fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to parse file.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await getFinancials();
      setFinancials(data);
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

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Title Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Executive Dashboard</h2>
        <p className="text-xs text-gray-400 mt-0.5">Real-time working capital analytics and AI predictions.</p>
      </div>

      {/* File Upload Banner */}
      <div className="bg-white/5 border border-white/10 rounded-[20px] p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Upload Ledger or Invoice Summary</h3>
            <p className="text-[11px] text-gray-400 mt-1">Upload a PDF or CSV file to override default financial metrics using AI synthesis.</p>
          </div>
          <div className="relative shrink-0">
            <input
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="financial-file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="financial-file-upload"
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer select-none
                ${isUploading 
                  ? 'bg-white/10 border-white/20 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white active:scale-95'}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Upload Statement
                </>
              )}
            </label>
          </div>
        </div>
        {uploadError && (
          <p className="text-[11px] text-rose-400 mt-2 font-medium">{uploadError}</p>
        )}
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

      {/* Risk Alert Banner */}
      <RiskAlertBanner onViewAnalysis={handleViewAnalysis} />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Current Cash"
          value={financials?.current_cash}
          isLoading={isLoading}
          icon={Wallet}
          colorClass="text-emerald-400"
          accentClass="bg-emerald-500/10"
        />
        <MetricCard
          title="Pending Receivables"
          value={financials?.total_receivables}
          isLoading={isLoading}
          icon={HandCoins}
          colorClass="text-indigo-400"
          accentClass="bg-indigo-500/10"
        />
        <MetricCard
          title="Upcoming Expenses"
          value={financials?.total_expenses}
          isLoading={isLoading}
          icon={Receipt}
          colorClass="text-rose-400"
          accentClass="bg-rose-500/10"
        />
        <MetricCard
          title="Forecast Position"
          value={financials?.net_forecast_position}
          isLoading={isLoading}
          icon={TrendingUp}
          colorClass="text-cyan-400"
          accentClass="bg-cyan-500/10"
        />
      </div>

      {/* Runway + Confidence Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CashRunwayGauge runwayDays={18} isLoading={isLoading} />
        <ForecastConfidence confidenceScore={82} isLoading={isLoading} />
      </div>

      {/* AI Briefing */}
      <TodayBriefing
        topRiskClient={
          financials?.overdue_invoices?.find(inv => 
            inv.historical_payment_behavior.toLowerCase().includes('chronically')
          )?.client_name || 'Shiva Logistics'
        }
        expectedCash="₹1.2L on Aug 18"
        bestAction={
          financials?.overdue_invoices?.[0]
            ? `Follow up on ${financials.overdue_invoices[0].invoice_id}`
            : 'Follow up today'
        }
        isLoading={isLoading}
      />
    </div>
  );
};
