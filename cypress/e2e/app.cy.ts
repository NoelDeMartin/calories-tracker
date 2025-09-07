import { podUrl, webId } from '@aerogel/cypress';
import { stringToSlug, uuid } from '@noeldemartin/utils';

describe('App', () => {

    beforeEach(() => {
        cy.solidReset();
        cy.visit('/');
    });

    it('Logs in without recipes', () => {
        // Act
        cy.ariaInput('Login url').type(`${webId()}{enter}`);
        cy.solidLogin();

        // Assert
        cy.see('Today\'s meals');
    });

    it('Logs recipes', () => {
        // Arrange
        setupAccount();

        cy.solidLogin();
        cy.waitSync();

        cy.intercept('PATCH', podUrl('/meals/*')).as('createMeal');
        cy.intercept('PATCH', podUrl('/ingredients/*')).as('createIngredient');

        // Act
        cy.press('Log meal');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - Meal
        cy.see('Ramen');

        cy.get('@createMeal.all').should('have.length', 1);
        cy.fixtureWithReplacements('sparql/create-meal-from-recipe.sparql', {
            name: 'Ramen',
            sameAs: podUrl('/cookbook/ramen#it'),
            calories: '443 calories',
            protein: '20.42 grams',
            carbs: '80.64 grams',
            fat: '6.98 grams',
        }).then((sparql) => {
            cy.get('@createMeal').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal').its('request.body').should('be.sparql', sparql);
        });

        // Assert - Ingredients
        cy.ariaLabel('Navigate').click();
        cy.press('Ingredients');
        cy.see('Wheat Noodles');

        cy.get('@createIngredient.all').should('have.length', 3);

        cy.fixtureWithReplacements('sparql/create-ingredient.sparql', {
            name: 'Broth',
            sameAs: 'https://www.nutritionix.com/food/broth',
            serving: '240 grams',
            calories: '86 calories',
            protein: '6.05 grams',
            carbs: '8.47 grams',
            fat: '2.88 grams',
        }).then((sparql) => {
            cy.get('@createIngredient.1').its('response.statusCode').should('eq', 201);
            cy.get('@createIngredient.1').its('request.body').should('be.sparql', sparql);
        });

        cy.fixtureWithReplacements('sparql/create-ingredient.sparql', {
            name: 'Wheat Noodles',
            sameAs: 'https://www.nutritionix.com/food/wheat-noodles',
            serving: '160 grams',
            calories: '238 calories',
            protein: '9.58 grams',
            carbs: '48.11 grams',
            fat: '2.74 grams',
        }).then((sparql) => {
            cy.get('@createIngredient.2').its('response.statusCode').should('eq', 201);
            cy.get('@createIngredient.2').its('request.body').should('be.sparql', sparql);
        });

        cy.fixtureWithReplacements('sparql/create-ingredient-not-found.sparql', {
            name: 'Toppings',
        }).then((sparql) => {
            cy.get('@createIngredient.3').its('response.statusCode').should('eq', 201);
            cy.get('@createIngredient.3').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Logs meals', () => {
        // Arrange
        setupAccount({
            ingredients: ['Eggplant', 'Zucchini', 'Onion', 'Tomatoes'],
        });

        cy.solidLogin();
        cy.waitSync();

        cy.intercept('PATCH', podUrl('/meals/*')).as('createMeal');
        cy.intercept('PATCH', podUrl('/ingredients/*')).as('createIngredient');

        // Act - new meal
        cy.press('Log meal');
        cy.comboboxSelect('Meal', 'New recipe');
        cy.get('input[name="name"]').type('Pisto');
        cy.press('Add ingredient');
        cy.get('input[list="ingredient-names"]').last().type('Eggplant');
        cy.get('#ingredients-0-quantity').clear().type('50');
        cy.press('Add ingredient');
        cy.get('input[list="ingredient-names"]').last().type('Zucchini');
        cy.press('Add ingredient');
        cy.get('input[list="ingredient-names"]').last().type('Onion');
        cy.press('Add ingredient');
        cy.get('input[list="ingredient-names"]').last().type('Tomatoes');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - new meal
        cy.see('Pisto');

        cy.get('@createMeal.all').should('have.length', 1);
        cy.fixtureWithReplacements('sparql/create-meal.sparql', {
            name: 'Pisto',
            calories: '153 calories',
            protein: '4.76 grams',
            carbs: '35.53 grams',
            fat: '0.67 grams',
            ingredients: '"50g Eggplant", "100g Zucchini", "100g Onion", "100g Tomatoes"',
        }).then((sparql) => {
            cy.get('@createMeal').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal').its('request.body').should('be.sparql', sparql);
        });

        // Act - repeated meal
        cy.press('Log meal');
        cy.get('input[name="mealServings"]').clear().type('2');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - repeated meal
        cy.see('Pisto (2)');

        cy.get('@createMeal.all').should('have.length', 2);
        cy.fixtureWithReplacements('sparql/create-meal-from-meal.sparql', {
            name: 'Pisto',
            calories: '306 calories',
            protein: '9.52 grams',
            carbs: '71.06 grams',
            fat: '1.34 grams',
            servings: '2',
            ingredients: '"100g Eggplant", "200g Zucchini", "200g Onion", "200g Tomatoes"',
        }).then((sparql) => {
            cy.get('@createMeal.2').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal.2').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Edits logs', () => {
        // Arrange
        setupAccount();

        cy.solidLogin();
        cy.waitSync();
        cy.press('Log meal');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        cy.intercept('PATCH', podUrl('/meals/*')).as('updateMeal');

        // Act
        const timezoneOffset = (new Date().getTimezoneOffset() * 60000) / (1000 * 60 * 60);

        cy.get('[aria-label="Edit"]').click();
        cy.comboboxSelect('Recipe', 'None');
        cy.get('input[name="name"]').clear().type('Spaghetti Carbonara');
        cy.get('input[name="calories"]').clear().type('450');
        cy.get('input[name="protein"]').clear().type('18');
        cy.get('input[name="carbs"]').clear().type('45');
        cy.get('input[name="fat"]').clear().type('22');
        cy.get('input[name="consumedAt"]')
            .clear()
            .type(`2025-01-01T${(10 - timezoneOffset).toString().padStart(2, '0')}:00:00`);
        cy.press('Save');
        cy.waitSync();

        cy.ariaLabel('Navigate').click();
        cy.press('History');
        cy.get('.month-picker button').click();
        cy.press('Jan');

        // Assert
        cy.see('Spaghetti Carbonara');
        cy.see('450 kcal');
        cy.see('18g protein');
        cy.see('45g carbs');
        cy.see('22g fat');
        cy.see('1/1/2025');

        cy.get('@updateMeal.all').should('have.length', 1);
        cy.fixtureWithReplacements('sparql/update-meal.sparql', {
            name: 'Spaghetti Carbonara',
            calories: '450 calories',
            protein: '18 grams',
            carbs: '45 grams',
            fat: '22 grams',
            consumedAt: '2025-01-01T10:00:00.000Z',
        }).then((sparql) => {
            cy.get('@updateMeal').its('response.statusCode').should('eq', 205);
            cy.get('@updateMeal').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Shows history', () => {
        // Arrange
        setupAccount();

        cy.solidLogin();
        cy.waitSync();

        cy.press('Log meal');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Act
        cy.ariaLabel('Navigate').click();
        cy.press('History');

        // Assert
        const now = new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        cy.see(`1 meal on ${now} (443 kcal)`);
    });

    it('Deletes ingredients', () => {
        // Arrange
        setupAccount({ ingredients: ['Wheat Noodles'] });

        cy.solidLogin();
        cy.waitSync();

        cy.ariaLabel('Navigate').click();
        cy.press('Ingredients');
        cy.see('Wheat Noodles');

        cy.intercept('PATCH', podUrl('/ingredients/*')).as('updateIngredient');

        // Act
        cy.ariaLabel('Delete Wheat Noodles').click();
        cy.waitSync();

        // Assert
        cy.dontSee('Wheat Noodles');

        cy.get('@updateIngredient.all').should('have.length', 1);
        cy.fixtureWithReplacements('sparql/delete-ingredient.sparql', {
            name: 'Wheat Noodles',
            serving: '94 grams',
            calories: '41 calories',
            protein: '1.28 grams',
            carbs: '9.54 grams',
            fat: '0.18 grams',
        }).then((sparql) => {
            cy.get('@updateIngredient').its('response.statusCode').should('eq', 205);
            cy.get('@updateIngredient').its('request.body').should('be.sparql', sparql);
        });
    });

});

function setupAccount(options: { ingredients?: string[] } = {}) {
    cy.solidCreateDocument('/cookbook/ramen', 'turtle/ramen.ttl');
    cy.solidCreateDocument('/settings/privateTypeIndex', '<> a <http://www.w3.org/ns/solid/terms#TypeIndex> .');
    cy.solidUpdateDocument('/settings/privateTypeIndex', 'sparql/register-cookbook.sparql');
    cy.solidUpdateDocument('/profile/card', 'sparql/declare-type-index.sparql');

    for (const ingredient of options.ingredients ?? []) {
        cy.solidUpdateDocument('/settings/privateTypeIndex', 'sparql/register-ingredients.sparql');

        cy.solidCreateDocument(`/ingredients/${stringToSlug(ingredient)}`, 'turtle/ingredient.ttl', {
            name: ingredient,
            serving: '94 grams',
            calories: '41 calories',
            protein: '1.28 grams',
            carbs: '9.54 grams',
            fat: '0.18 grams',
        });
    }

    cy.ariaInput('Login url').type(`${webId()}{enter}`);

    cy.service('$nutritionix').then((Nutritionix) => {
        Nutritionix.appId = uuid();
        Nutritionix.appKey = uuid();
    });
    cy.intercept('POST', 'https://trackapi.nutritionix.com/v2/natural/nutrients', (request) => {
        let fixture = null;
        const { query } = request.body as { query?: string };

        switch (query) {
            case 'Wheat Noodles':
                fixture = 'json/wheat-noodles.json';
                break;
            case 'Broth':
                fixture = 'json/broth.json';
                break;
        }

        if (!fixture) {
            request.reply({
                statusCode: 404,
                body: JSON.stringify({
                    id: uuid(),
                    message: 'We couldn\'t match any of your foods',
                }),
            });

            return;
        }

        request.reply({ fixture });
    });
}
