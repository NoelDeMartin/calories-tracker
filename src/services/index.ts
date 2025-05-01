import Nutritionix from './Nutritionix';

export const services = {
    $nutritionix: Nutritionix,
};

export type AppServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends AppServices {}
}
