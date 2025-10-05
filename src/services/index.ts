import Cookbook from '@/services/Cookbook';
import Goals from './Goals';
import Nutritionix from './Nutritionix';
import Pantry from './Pantry';

export const services = {
    $cookbook: Cookbook,
    $goals: Goals,
    $nutritionix: Nutritionix,
    $pantry: Pantry,
};

export type AppServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends AppServices {}
}
