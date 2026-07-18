import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PriorityActionQueue } from '../components/PriorityActionQueue';

export const ActionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate brief load for page transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleTriggerChat = (query: string) => {
    navigate('/copilot', { state: { query } });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Prescriptive Actions</h2>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Liquidity adjustments advised by Gemma AI.</p>
      </div>

      {/* Priority Action Queue Widget */}
      <PriorityActionQueue
        onTriggerChat={handleTriggerChat}
        isLoading={isLoading}
      />
    </div>
  );
};
