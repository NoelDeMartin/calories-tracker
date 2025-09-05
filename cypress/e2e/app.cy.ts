import { podUrl, webId } from '@aerogel/cypress';
import { uuid } from '@noeldemartin/utils';

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
        setupAccount();

        cy.solidLogin();
        cy.waitSync();

        cy.intercept('PATCH', podUrl('/meals/*')).as('createMeal');
        cy.intercept('PATCH', podUrl('/ingredients/*')).as('createIngredient');

        // Act - new meal
        cy.press('Log meal');
        cy.comboboxSelect('Meal', 'Other');
        cy.get('input[name="name"]').type('Pisto');
        cy.get('input[name="calories"]').type('191');
        cy.get('input[name="protein"]').type('6');
        cy.get('input[name="carbs"]').type('39');
        cy.get('input[name="fat"]').type('2');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - new meal
        cy.see('Pisto');

        cy.get('@createMeal.all').should('have.length', 1);
        cy.fixtureWithReplacements('sparql/create-meal.sparql', {
            name: 'Pisto',
            calories: '191 calories',
            protein: '6 grams',
            carbs: '39 grams',
            fat: '2 grams',
        }).then((sparql) => {
            cy.get('@createMeal').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal').its('request.body').should('be.sparql', sparql);
        });

        // Act - repeated meal
        cy.press('Log meal');
        cy.comboboxSelect('Meal', 'Pisto');
        cy.get('input[name="mealServings"]').type('2');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - repeated meal
        cy.see('Pisto (2)');

        cy.get('@createMeal.all').should('have.length', 2);
        cy.fixtureWithReplacements('sparql/create-meal-from-meal.sparql', {
            name: 'Pisto',
            calories: '382 calories',
            protein: '12 grams',
            carbs: '78 grams',
            fat: '4 grams',
            servings: '2',
        }).then((sparql) => {
            cy.get('@createMeal.2').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal.2').its('request.body').should('be.sparql', sparql);
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

});

function setupAccount() {
    cy.solidCreateDocument('/cookbook/ramen', 'turtle/ramen.ttl');
    cy.solidCreateDocument('/settings/privateTypeIndex', '<> a <http://www.w3.org/ns/solid/terms#TypeIndex> .');
    cy.solidUpdateDocument('/settings/privateTypeIndex', 'sparql/register-cookbook.sparql');
    cy.solidUpdateDocument('/profile/card', 'sparql/declare-type-index.sparql');
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
