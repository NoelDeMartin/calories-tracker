import Cookbook from './Cookbook';
import Meals from './Meals';
import Nutritionix from './Nutritionix';

export const services = {
    $cookbook: Cookbook,
    $meals: Meals,
    $nutritionix: Nutritionix,
};

export type AppServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends AppServices {}
}
