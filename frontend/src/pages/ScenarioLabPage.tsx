import React, { useState, useEffect } from 'react';
import { ScenarioLab } from '../components/ScenarioLab';

export const ScenarioLabPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Scenario Lab</h2>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Model payment buffer shifts and capital risks.</p>
      </div>

      {/* Simulator Widget */}
      <ScenarioLab isLoading={isLoading} />
    </div>
  );
};
