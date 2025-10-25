import Meal from '@/models/Meal';
import { type Slug, compare, isInstanceOf, objectWithoutEmpty, stringToSlug } from '@noeldemartin/utils';
import type Recipe from '@/models/Recipe';
import type { MealIngredient } from '@/utils/meals';
import type Ingredient from '@/models/Ingredient';

export type IngredientQuantity = number | [number, number];

export const IngredientUnits = {
    Grams: 'grams',
    Milliliters: 'milliliters',
} as const;

export type IngredientUnit = (typeof IngredientUnits)[keyof typeof IngredientUnits];

export type IngredientBreakdown<Q extends IngredientQuantity = IngredientQuantity> = {
    template: string;
    original: string;
    quantity?: Q;
    unit?: IngredientUnit;
    unitMultiplier?: number;

    renderQuantity(quantity: Q): string;
};

type IngredientQuantityParser = (
    quantity: IngredientQuantity,
    originalUnit?: string
) => [IngredientQuantity, IngredientUnit, number, string];

const SPECIAL_QUANTITIES: Record<string, number> = {
    '½': 0.5,
    '¼': 0.25,
};
const SPECIAL_QUANTITIES_VALUES: Record<string, string> = Object.entries(SPECIAL_QUANTITIES).reduce(
    (values, [name, value]) => {
        values[value.toString()] = name;

        return values;
    },
    {} as Record<string, string>,
);

const INGREDIENT_UNIT_QUANTITIES: Record<IngredientUnit, Record<string, number>> = {
    // Some of these conversions depend on the ingredient. For example, a cup of flour
    // is 125g but a cup of water is 240g. But for now, this is fine because these conversions
    // are only used for sorting ingredients. If they are used to do actual conversions, this
    // should be kept in mind.
    [IngredientUnits.Grams]: {
        g: 1,
        grams: 1,
        kg: 1000,
        kilograms: 1000,
        cups: 200,
        lb: 453.5924,
        pounds: 453.5924,
        oz: 28.34952,
        ounces: 28.34952,
        tsp: 5,
        tbsp: 15,
        tbl: 15,
    },
    [IngredientUnits.Milliliters]: {
        ml: 1,
        milliliters: 1,
        l: 1000,
        liters: 1000,
        pt: 473,
        pint: 473,
    },
};

const RENDERED_UNITS: Record<string, string> = {
    cups: ' cups',
    grams: ' grams',
    kilograms: ' kilograms',
    liters: ' liters',
    milliliters: ' milliliters',
    ounces: ' ounces',
    pint: ' pint',
    pounds: ' pounds',
    tbl: ' tbl',
    tbsp: ' tbsp',
    tsp: ' tsp',
};

const QUANTITY_PLACEHOLDER = '{quantity}';
const [INGREDIENT_REGEX, INGREDIENT_REGEX_WITHOUT_UNITS, QUANTITY_RANGE_SEPARATOR_REGEX, QUANTITY_PARSERS] =
    initializeHelpers();

function compareIngredients(a: IngredientBreakdown, b: IngredientBreakdown): number {
    const aIsOptional = a.original.toLowerCase().includes('optional');
    const bIsOptional = b.original.toLowerCase().includes('optional');

    if (aIsOptional && !bIsOptional) return -1;
    if (!aIsOptional && bIsOptional) return 1;
    if (a.unit && !b.unit) return 1;
    if (!a.unit && b.unit) return -1;

    const aQuantity = Array.isArray(a.quantity) ? a.quantity[0] : a.quantity;
    const bQuantity = Array.isArray(b.quantity) ? b.quantity[0] : b.quantity;

    if (!aQuantity && !bQuantity) return compare(b.original, a.original);
    if (aQuantity && !bQuantity) return 1;
    if (!aQuantity && bQuantity) return -1;

    const quantityComparison = compare(aQuantity, bQuantity);

    return quantityComparison === 0 ? compare(b.original, a.original) : quantityComparison;
}

function initializeHelpers(): [RegExp, RegExp, RegExp, Record<string, IngredientQuantityParser>] {
    const quantityRegex = `(?:(?:\\d+[.,\\d]*)|${Object.keys(SPECIAL_QUANTITIES).join('|')})`;
    const quantityRangeSeparator = 'to|-|~';
    const quantityRangeRegex = `${quantityRegex}\\s*(?:${quantityRangeSeparator})\\s*${quantityRegex}`;
    const quantityValueRegex = `(?<quantityValue>(?:${quantityRangeRegex})|(?:${quantityRegex}))`;
    const unitsRegex = Object.values(INGREDIENT_UNIT_QUANTITIES)
        .reduce((units, quantities) => [...units, Object.keys(quantities).join('|')], [] as string[])
        .join('|');

    return [
        new RegExp(`.*?(?<quantity>${quantityValueRegex}\\s*(?:(?<quantityUnit>${unitsRegex})(?:\\s+|$))).*?`, 'i'),
        new RegExp(`.*?(?<quantity>${quantityValueRegex}\\s*).*?`, 'i'),
        new RegExp(quantityRangeSeparator, 'i'),
        Object.entries(INGREDIENT_UNIT_QUANTITIES).reduce(
            (parsers, [unit, quantities]) => {
                Object.entries(quantities).forEach(([alias, multiplier]) => {
                    parsers[alias] = (quantity, originalUnit) => [
                        Array.isArray(quantity)
                            ? [quantity[0] * multiplier, quantity[1] * multiplier]
                            : quantity * multiplier,
                        unit as IngredientUnit,
                        multiplier,
                        RENDERED_UNITS[originalUnit ?? ''] ?? originalUnit ?? '',
                    ];
                });

                return parsers;
            },
            {} as Record<string, IngredientQuantityParser>,
        ),
    ];
}

function parseQuantityString(raw: string): number {
    return SPECIAL_QUANTITIES[raw] ?? parseFloat(raw.replace(',', '.'));
}

function renderQuantityString(quantity: number): string {
    const raw = quantity.toString();

    return SPECIAL_QUANTITIES_VALUES[raw] ?? raw;
}

function parseIngredientQuantity(
    quantity?: string,
    unit?: string,
): [IngredientQuantity?, IngredientUnit?, number?, string?] {
    if (!quantity) return [];

    const parsedQuantity = quantity.match(QUANTITY_RANGE_SEPARATOR_REGEX)
        ? (quantity.split(QUANTITY_RANGE_SEPARATOR_REGEX).map(parseQuantityString) as [number, number])
        : parseQuantityString(quantity);

    return QUANTITY_PARSERS[unit?.trim().toLowerCase() ?? '']?.(parsedQuantity, unit) ?? [parsedQuantity];
}

export function ingredientSlugs(ingredient: Ingredient): Set<Slug> {
    const values = new Set<Slug>();
    const slugs = (text: string) => {
        const singularSlug = stringToSlug(text).replace(/s$/, '') as Slug;
        const pluralSlug = `${singularSlug}s` as Slug;

        return [singularSlug, pluralSlug];
    };
    const addSlug = (name: string) => {
        const [singularSlug, pluralSlug] = slugs(name);

        values.add(singularSlug);
        values.add(pluralSlug);
    };

    addSlug(ingredient.name);

    for (const alias of ingredient.aliases) {
        addSlug(alias);
    }

    return values;
}

export function parseMealIngredients(meal: Meal | Recipe, multiplier: number = 1): MealIngredient[] {
    return (
        (isInstanceOf(meal, Meal) ? meal.recipe : meal)?.ingredientsBreakdown?.map(({ template, quantity, unit }) => ({
            name: template
                .replace('{quantity}', '')
                .trim()
                .replace(/\s*\(optional\)/, ''),
            quantity: (typeof quantity === 'number' ? quantity : 1) * multiplier,
            unit: unit ?? 'servings',
        })) ?? []
    );
}

export function parseIngredientName(ingredient: string | IngredientBreakdown): string {
    const breakdown = typeof ingredient === 'string' ? parseIngredient(ingredient) : ingredient;

    return breakdown.template
        .replace('{quantity}', '')
        .trim()
        .replace(/\s*\(optional\)/, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
}

export function parseIngredient(ingredient: string): IngredientBreakdown {
    const original = ingredient;
    const match = ingredient.match(INGREDIENT_REGEX) ?? ingredient.match(INGREDIENT_REGEX_WITHOUT_UNITS);
    const template = match?.groups?.quantity
        ? ingredient.replace(match.groups.quantity.trim(), QUANTITY_PLACEHOLDER)
        : ingredient;
    const originalUnit = match?.groups?.quantityUnit;
    const [quantity, unit, unitMultiplier, displayUnit] = parseIngredientQuantity(
        match?.groups?.quantityValue,
        originalUnit,
    );

    return objectWithoutEmpty({
        template,
        original,
        quantity,
        unit,
        unitMultiplier,

        renderQuantity:
            typeof quantity !== 'undefined'
                ? Array.isArray(quantity)
                    ? (q: [number, number]) =>
                        template.replace(QUANTITY_PLACEHOLDER, q.map(renderQuantityString).join(' - '))
                    : (q: number) =>
                        template.replace(QUANTITY_PLACEHOLDER, `${renderQuantityString(q)}${displayUnit ?? ''}`)
                : () => original,
    });
}

export function roundIngredientQuantity(quantity: number): number {
    if (quantity < 10) {
        return Math.round(quantity * 100) / 100;
    }

    return Math.round(quantity);
}

export function sortIngredients(ingredients: IngredientBreakdown[]): IngredientBreakdown[] {
    ingredients.sort((a, b) => compareIngredients(b, a));

    return ingredients;
}
