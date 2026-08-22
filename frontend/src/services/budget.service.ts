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

const MOCK_BUDGET: TripBudget = {
  total: 82450,
  days: 8,
  daily_average: 10306,
  by_category: {
    transport: 18000,
    accommodation: 32000,
    activities: 14500,
    meals: 17950
  }
};

export const budgetService = {
  async getBudget(tripId: string): Promise<TripBudget> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
           ...MOCK_BUDGET
        });
      }, 700);
    });
  }
};
