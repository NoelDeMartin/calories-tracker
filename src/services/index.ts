import Cookbook from './Cookbook';
import Meals from './Meals';

export const services = {
    $cookbook: Cookbook,
    $meals: Meals,
};

export type AppServices = typeof services;

declare module 'vue' {
    interface ComponentCustomProperties extends AppServices {}
}
