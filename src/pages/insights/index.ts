import type Meal from '@/models/Meal';

export interface Week {
    name: string;
    meals: Meal[];
    hasIncompleteMeals: boolean;
    totalCalories: number;
    caloriesAverage: number;
    proteinAverage: number;
    carbsAverage: number;
    fatAverage: number;
    proteinPercentage: number;
    carbsPercentage: number;
    fatPercentage: number;
}
