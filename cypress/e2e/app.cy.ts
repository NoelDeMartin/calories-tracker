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
        cy.see('We couldn\'t find any recipes in your POD');
    });

    it('Logs meals', () => {
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
        cy.fixtureWithReplacements('sparql/create-meal.sparql', {
            name: 'Ramen',
            sameAs: podUrl('/cookbook/ramen#it'),
            calories: '357 calories',
            carbs: '72.17 grams',
            fat: '4.1 grams',
            protein: '14.38 grams',
        }).then((sparql) => {
            cy.get('@createMeal').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal').its('request.body').should('be.sparql', sparql);
        });

        // Assert - Ingredients
        cy.ariaLabel('Navigate').click();
        cy.press('Ingredients');
        cy.see('Wheat Noodles');

        cy.get('@createIngredient.all').should('have.length', 1);
        cy.fixtureWithReplacements('sparql/create-ingredient.sparql', {
            name: 'Wheat Noodles',
            sameAs: 'https://www.nutritionix.com/food/wheat-noodles',
            serving: '160 grams',
            calories: '238 calories',
            carbs: '48.11 grams',
            fat: '2.74 grams',
            protein: '9.58 grams',
        }).then((sparql) => {
            cy.get('@createIngredient.1').its('response.statusCode').should('eq', 201);
            cy.get('@createIngredient.1').its('request.body').should('be.sparql', sparql);
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

        cy.see(`1 meal on ${now} (357 kcal)`);
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
    cy.intercept('POST', 'https://trackapi.nutritionix.com/v2/natural/nutrients', {
        fixture: 'json/wheat-noodles.json',
    });
}
