import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MailOpen, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const { verifyEmail, user } = useAuth();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyEmail();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setResending(false);
    setResent(true);
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#121626] border border-white/5 rounded-[24px] p-8 glow-card relative z-10 text-center">
        
        {/* Brand header */}
        <div className="flex flex-col items-center space-y-3 mb-6">
          <div className="p-3 bg-indigo-600/15 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white m-0">Verify Your Email</h2>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">
              Final Account Setup
            </p>
          </div>
        </div>

        {/* Status display */}
        <div className="my-8 flex flex-col items-center">
          <div className="relative">
            <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400">
              <MailOpen className="h-10 w-10 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-[#121626]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          
          <p className="text-sm font-semibold text-white mt-5">
            Verification link sent
          </p>
          <p className="text-xs text-gray-400 mt-2 max-w-[280px] leading-relaxed mx-auto">
            We sent a verification link to <span className="font-semibold text-gray-200">{user?.email || 'your email'}</span>. Complete verification to activate CashSense Copilot features.
          </p>
        </div>

        {/* Response messaging */}
        {resent && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs font-semibold mb-6 animate-fade-in">
            Verification link resent successfully! Check your inbox.
          </div>
        )}

        <div className="space-y-4">
          {/* Verify and Continue CTA */}
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying link...</span>
              </>
            ) : (
              <>
                <span>Verify and Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || verifying}
            className="w-full bg-[#191e36] hover:bg-white/[0.03] border border-white/5 disabled:text-gray-600 text-gray-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Resending...</span>
              </>
            ) : (
              'Resend Verification Link'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
