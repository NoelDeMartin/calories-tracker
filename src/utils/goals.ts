export type Sex = (typeof sexOptions)[number];
export type Lifestyle = (typeof lifestyleOptions)[number];
export type Goal = (typeof goalOptions)[number];

// FIXME these multipliers could be wrong, maybe we should use the Institute of Medicine equation instead
// https://www.reddit.com/r/Fitness/comments/1dm5zw/lets_talk_about_activity_level_multipliers_for/
// https://en.wikipedia.org/wiki/Institute_of_Medicine_Equation
const lifestyleMultipliers = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extremelyActive: 1.9,
} as const;

const goalDeltas = {
    maintainWeight: 0,
    loseWeight: -500,
    gainMuscle: 250,
    loseAndGain: 0,
} as const;

// Necesidades proteicas de los deportistas y pautas diétetico-nutricionales para la ganancia de masa muscular
// https://doi.org/10.14306/renhyd.16.1.103
const proteinMultipliers = [
    [/sedentary-.*/, 0.8],
    [/lightlyActive-loseWeight/, 1],
    [/lightlyActive-(maintainWeight|loseAndGain)/, 1.2],
    [/lightlyActive-gainMuscle/, 1.4],
    [/.*-loseWeight/, 1.4],
    [/.*-(maintainWeight|loseAndGain)/, 1.6],
    [/.*-gainMuscle/, 1.8],
] as const;

function calculateBMR(profile: GoalsProfile) {
    // Mifflin St Jeor equation
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + (profile.sex === 'man' ? 5 : -161);
}

export interface GoalsProfile {
    sex: Sex;
    weight: number;
    height: number;
    age: number;
    lifestyle: Lifestyle;
    goal: Goal;
}

export const sexOptions = ['man', 'woman'] as const;
export const lifestyleOptions = [
    'sedentary',
    'lightlyActive',
    'moderatelyActive',
    'veryActive',
    'extremelyActive',
] as const;
export const goalOptions = ['maintainWeight', 'loseWeight', 'gainMuscle', 'loseAndGain'] as const;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getGoalRecommendations(profile: GoalsProfile) {
    const bmr = calculateBMR(profile);
    const baseCalories = bmr * lifestyleMultipliers[profile.lifestyle];
    const proteinMatcher = `${profile.lifestyle}-${profile.goal}`;
    const proteinMultiplier = proteinMultipliers.find(([matcher]) => matcher.test(proteinMatcher))?.[1] ?? 1;

    return {
        baseCalories: Math.round(baseCalories),
        calories: Math.max(1200, Math.round(baseCalories + goalDeltas[profile.goal])),
        protein: Math.round(profile.weight * proteinMultiplier),
    };
}
