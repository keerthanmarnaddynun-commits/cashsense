import type { FinancialSummary, ChatResponse } from '../types';

const BASE_URL = 'http://127.0.0.1:8000';

export async function getFinancials(): Promise<FinancialSummary> {
  const response = await fetch(`${BASE_URL}/api/financials`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.statusText}`);
  }
  return response.json();
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    // Attempt to extract detail from 500 or other errors
    let errorDetail = 'AI service temporarily unavailable';
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorDetail = errData.detail;
      }
    } catch {
      // ignore JSON parse error, use default statusText or error details
    }
    
    const err = new Error(errorDetail);
    (err as any).status = response.status;
    throw err;
  }

  return response.json();
}
