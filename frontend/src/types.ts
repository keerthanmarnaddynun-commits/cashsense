export interface OverdueInvoice {
  invoice_id: string;
  client_name: string;
  amount: number;
  due_date: string;
  status: string;
  historical_payment_behavior: string;
}

export interface FinancialSummary {
  current_cash: number;
  total_receivables: number;
  total_expenses: number;
  at_risk_amount: number;
  net_forecast_position: number;
  overdue_invoices: OverdueInvoice[];
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}
