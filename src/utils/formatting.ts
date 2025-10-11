import { translate } from '@aerogel/core';
import { type Nullable, isObject } from '@noeldemartin/utils';

function applyBankerRounding(value: number, all: number[] = []) {
    if (all.length === 0) {
        return value;
    }

    const rounded = all.map((v) => Math.floor(v));
    const remainders = all.map((v, i) => ({ index: i, remainder: v - rounded[i] }));
    const total = rounded.reduce((a, b) => a + b, 0);
    const totalRemainder = 100 - total;

    remainders.sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < totalRemainder; i++) {
        rounded[remainders[i].index]++;
    }

    return rounded[all.indexOf(value)];
}

export type FormatUnit = 'percentage' | 'grams' | 'calories' | 'milliliters' | 'hours';

export interface FormatOptions {
    unit?: FormatUnit;
    fallback?: string;
    digits?: number;
}

export function formatPercentage(value: number, all: number[] = []): string {
    return formatNumber(
        applyBankerRounding(
            value * 100,
            all.map((v) => v * 100),
        ) / 100,
        'percentage',
    );
}

export function formatNumber(value: Nullable<number>, unit?: FormatUnit): string;
export function formatNumber(value: Nullable<number>, options: FormatOptions): string;
export function formatNumber(value: Nullable<number>, unitOrOptions?: FormatUnit | FormatOptions): string {
    const options: FormatOptions = isObject(unitOrOptions) ? unitOrOptions : { unit: unitOrOptions };

    if (typeof value !== 'number') {
        return options.fallback ?? (options.unit ? translate(`units.${options.unit}`, { n: '?' }) : '?');
    }

    switch (options.unit) {
        case 'percentage': {
            const formatter = new Intl.NumberFormat(undefined, {
                style: 'percent',
                maximumFractionDigits: 0,
            });

            return formatter.format(value);
        }

        case 'grams':
        case 'calories':
        case 'milliliters':
        case 'hours':
            return translate(`units.${options.unit}`, { n: Math.round(value).toLocaleString() });

        default:
            return value.toLocaleString();
    }
}
