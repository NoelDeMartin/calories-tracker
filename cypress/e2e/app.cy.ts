import { webId } from '@aerogel/cypress';

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
        cy.see('No recipes were found in your POD');
    });

    it('Logs meals', () => {
        // Arrange
        cy.solidCreateDocument('/cookbook/ramen', 'turtle/ramen.ttl');
        cy.solidCreateDocument('/settings/privateTypeIndex', '<> a <http://www.w3.org/ns/solid/terms#TypeIndex> .');
        cy.solidUpdateDocument('/settings/privateTypeIndex', 'sparql/register-cookbook.sparql');
        cy.solidUpdateDocument('/profile/card', 'sparql/declare-type-index.sparql');
        cy.ariaInput('Login url').type(`${webId()}{enter}`);
        cy.solidLogin();

        // Act
        cy.press('Log meal');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));

        // Assert
        cy.see('Ramen');
        cy.see('350 / 2000 kcal');
    });

});
