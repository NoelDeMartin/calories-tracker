import { podUrl, webId } from '@aerogel/cypress';

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
        cy.solidCreateDocument('/cookbook/ramen', 'turtle/ramen.ttl');
        cy.solidCreateDocument('/settings/privateTypeIndex', '<> a <http://www.w3.org/ns/solid/terms#TypeIndex> .');
        cy.solidUpdateDocument('/settings/privateTypeIndex', 'sparql/register-cookbook.sparql');
        cy.solidUpdateDocument('/profile/card', 'sparql/declare-type-index.sparql');
        cy.ariaInput('Login url').type(`${webId()}{enter}`);
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
        }).then((sparql) => {
            cy.get('@createMeal').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal').its('request.body').should('be.sparql', sparql);
        });

        // Assert - Ingredients
        cy.ariaLabel('Navigate').click();
        cy.press('Ingredients');
        cy.see('Broth');
        cy.see('Noodles');
        cy.see('Toppings');

        cy.get('@createIngredient.all').should('have.length', 3);
        cy.fixtureWithReplacements('sparql/create-ingredient.sparql', {
            name: 'Broth',
        }).then((sparql) => {
            cy.get('@createIngredient.1').its('response.statusCode').should('eq', 201);
            cy.get('@createIngredient.1').its('request.body').should('be.sparql', sparql);
        });
    });

});
