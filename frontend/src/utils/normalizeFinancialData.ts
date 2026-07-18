import type { FlexibleFinancialData, FlexibleMetric, OverdueInvoice } from '../types';

const aliasMap: Record<string, string[]> = {
  current_cash: ['cash_balance', 'bank_balance', 'available_cash', 'current_cash'],
  total_receivables: ['receivables', 'accounts_receivable', 'pending_collections', 'total_receivables'],
  total_expenses: ['expenses', 'monthly_expenses', 'operating_costs', 'total_expenses'],
  net_forecast_position: ['net_forecast_position', 'forecast_position', 'projected_balance', 'net_position'],
  at_risk_amount: ['at_risk_amount', 'risk_amount', 'vulnerable_cash']
};

export function normalizeFinancialData(payload: any): FlexibleFinancialData {
  const metrics: Record<string, FlexibleMetric> = {
    current_cash: { value: null, confidence: 1.0 },
    total_receivables: { value: null, confidence: 1.0 },
    total_expenses: { value: null, confidence: 1.0 },
    net_forecast_position: { value: null, confidence: 1.0 },
    at_risk_amount: { value: null, confidence: 1.0 }
  };
  
  const dynamicFields: Record<string, FlexibleMetric> = {};
  let alerts: string[] = [];
  let invoices: OverdueInvoice[] = [];

  if (!payload || typeof payload !== 'object') {
    return { metrics, dynamicFields, alerts, invoices };
  }

  // Helper to extract value and confidence safely
  const extractMetric = (entry: any): FlexibleMetric => {
    if (entry === null || entry === undefined) {
      return { value: null, confidence: 1.0 };
    }
    if (typeof entry === 'object' && entry.value !== undefined) {
      return {
        value: typeof entry.value === 'number' ? entry.value : parseFloat(entry.value),
        confidence: entry.confidence !== undefined ? entry.confidence : 1.0
      };
    }
    const val = typeof entry === 'number' ? entry : parseFloat(entry);
    return {
      value: isNaN(val) ? null : val,
      confidence: 1.0
    };
  };

  const mappedKeys = new Set<string>();

  // 1. Process canonical fields with aliases
  for (const [canonicalKey, aliases] of Object.entries(aliasMap)) {
    let foundEntry: any = null;
    
    for (const alias of aliases) {
      if (payload[alias] !== undefined) {
        foundEntry = payload[alias];
        mappedKeys.add(alias);
        break;
      }
    }
    
    if (foundEntry === null && payload[canonicalKey] !== undefined) {
      foundEntry = payload[canonicalKey];
      mappedKeys.add(canonicalKey);
    }
    
    if (foundEntry !== null) {
      metrics[canonicalKey] = extractMetric(foundEntry);
      
      for (const alias of aliases) {
        const confKey = `${alias}_confidence`;
        if (payload[confKey] !== undefined) {
          metrics[canonicalKey].confidence = parseFloat(payload[confKey]);
          mappedKeys.add(confKey);
          break;
        }
      }
    }
  }

  // 2. Overdue Invoices
  const invoiceKeys = ['overdue_invoices', 'invoices', 'unpaid_invoices'];
  let rawInvoices: any = null;
  for (const k of invoiceKeys) {
    if (Array.isArray(payload[k])) {
      rawInvoices = payload[k];
      mappedKeys.add(k);
      break;
    }
  }
  if (rawInvoices) {
    invoices = rawInvoices.map((inv: any) => ({
      invoice_id: inv.invoice_id || inv.id || 'N/A',
      client_name: inv.client_name || inv.client || 'Unknown Client',
      amount: typeof inv.amount === 'number' ? inv.amount : parseFloat(inv.amount) || 0,
      due_date: inv.due_date || inv.due || 'N/A',
      status: inv.status || 'Pending',
      historical_payment_behavior: inv.historical_payment_behavior || inv.behavior || 'No history recorded'
    }));
  }

  // 3. Alerts
  const alertKeys = ['alerts', 'notifications', 'warnings'];
  for (const k of alertKeys) {
    if (Array.isArray(payload[k])) {
      alerts = payload[k];
      mappedKeys.add(k);
      break;
    }
  }

  // 4. Mapped everything else to dynamicFields
  for (const [key, val] of Object.entries(payload)) {
    if (mappedKeys.has(key)) continue;
    
    if (key.endsWith('_confidence') || key === 'status' || key === 'message' || key === 'detail') {
      continue;
    }
    
    if (val && typeof val === 'object' && !Array.isArray(val) && (val as any).value === undefined) {
      continue;
    }
    if (Array.isArray(val)) {
      continue;
    }

    const metric = extractMetric(val);
    if (metric.value !== null) {
      dynamicFields[key] = metric;
      const confKey = `${key}_confidence`;
      if (payload[confKey] !== undefined) {
        dynamicFields[key].confidence = parseFloat(payload[confKey]);
      }
    }
  }

  return { metrics, dynamicFields, alerts, invoices };
}
