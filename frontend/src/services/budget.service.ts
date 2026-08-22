import { apiClient } from '../utils/api';

export interface BudgetCategory {
  name: string;
  amount: number;
  color: string;
}

export interface TripBudget {
  total: number;
  by_category: Record<string, number>;
  daily_average: number;
  days: number;
}

export const budgetService = {
  async getBudget(tripId: string): Promise<TripBudget> {
    const rawBudget = await apiClient(`/trips/${tripId}/budget`, { method: 'GET' });
    
    // The backend `BudgetResponse` has:
    // total: float
    // by_category: Dict[str, float]
    // daily_average: float
    // We need to also calculate 'days' if we want, or default to whatever frontend needs.
    // The backend computed days but didn't return it. We can derive it:
    
    let days = 1;
    if (rawBudget.daily_average > 0) {
      days = Math.round(rawBudget.total / rawBudget.daily_average);
    }
    
    return {
      total: rawBudget.total,
      by_category: rawBudget.by_category,
      daily_average: rawBudget.daily_average,
      days: days
    };
  }
};
