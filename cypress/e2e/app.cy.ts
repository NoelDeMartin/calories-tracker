import { podUrl, webId } from '@aerogel/cypress';
import { stringToSlug, uuid } from '@noeldemartin/utils';

describe('App', () => {

    beforeEach(() => {
        cy.solidReset();
        cy.visit('/');
        cy.see('Hi there! Are you ready to start tracking your calories?');
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
        cy.get('input[name="meal"]').type('Ramen{enter}');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - Meal
        cy.see('Ramen');

        cy.get('@createMeal.all').should('have.length', 1);
        cy.fixture('sparql/create-meal-from-recipe.sparql').then((sparql) => {
            cy.get('@createMeal').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal').its('request.body').should('be.sparql', sparql);
        });

        // Assert - Ingredients
        cy.press('Ingredients');
        cy.see('Wheat Noodles');
        cy.see('Broth');

        cy.get('@createIngredient.all').should('have.length', 3);

        cy.fixtureWithReplacements('sparql/create-ingredient.sparql', {
            name: 'Broth',
            imageUrl: 'https://nix-tag-images.s3.amazonaws.com/1089_thumb.jpg',
            sameAs: 'https://www.nutritionix.com/food/broth',
            serving: '240 grams',
            calories: '86 calories',
            protein: '6.05 grams',
            carbs: '8.47 grams',
            fat: '2.88 grams',
            alternateServing: '236.59 milliliters',
        }).then((sparql) => {
            cy.get('@createIngredient.1').its('response.statusCode').should('eq', 201);
            cy.get('@createIngredient.1').its('request.body').should('be.sparql', sparql);
        });

        cy.fixtureWithReplacements('sparql/create-ingredient.sparql', {
            name: 'Wheat Noodles',
            imageUrl: 'https://nix-tag-images.s3.amazonaws.com/1798_thumb.jpg',
            sameAs: 'https://www.nutritionix.com/food/wheat-noodles',
            serving: '117 grams',
            calories: '174 calories',
            protein: '7.01 grams',
            carbs: '35.18 grams',
            fat: '2 grams',
            alternateServing: '231.32 milliliters',
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

    it('Logs recipes with customized ingredients', () => {
        // Arrange
        setupAccount();

        cy.solidLogin();
        cy.waitSync();

        cy.intercept('PATCH', podUrl('/meals/*')).as('createMeal');
        cy.intercept('PATCH', podUrl('/ingredients/*')).as('createIngredient');

        // Act
        cy.press('Log meal');
        cy.get('input[name="meal"]').type('Ramen{enter}');
        cy.press('Customize ingredients');
        cy.get('#ingredients-2-delete').click();
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Eggs{enter}');
        cy.get('#ingredients-2-quantity').clear().type('50');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert
        cy.see('Ramen');

        cy.ariaLabel('View Ramen').click();
        cy.see('Eggs');
        cy.dontSee('Toppings');
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
        cy.get('input[name="meal"]').type('Pisto{enter}');
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Eggplant{enter}');
        cy.get('#ingredients-0-quantity').clear().type('50');
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Zucchini{enter}');
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Onion{enter}');
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Tomatoes{enter}');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - new meal
        cy.see('Pisto');

        cy.get('@createMeal.all').should('have.length', 1);
        cy.fixture('sparql/create-meal.sparql').then((sparql) => {
            cy.get('@createMeal').its('response.statusCode').should('eq', 201);
            cy.get('@createMeal').its('request.body').should('be.sparql', sparql);
        });

        // Act - repeated meal
        cy.press('Log meal');
        cy.get('input[name="meal"]').type('Pisto{enter}');
        cy.get('input[name="mealServings"]').clear().type('2');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Assert - repeated meal
        cy.see('Pisto (2)');

        cy.get('@createMeal.all').should('have.length', 2);
        cy.fixture('sparql/create-meal-from-meal.sparql').then((sparql) => {
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
        cy.get('input[name="meal"]').type('Ramen{enter}');
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
        cy.fixture('sparql/update-meal.sparql').then((sparql) => {
            cy.get('@updateMeal').its('response.statusCode').should('eq', 205);
            cy.get('@updateMeal').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Edits log ingredients', () => {
        // Arrange
        setupAccount();

        cy.solidLogin();
        cy.waitSync();
        cy.press('Log meal');
        cy.get('input[name="meal"]').type('Ramen{enter}');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        cy.intercept('PATCH', podUrl('/meals/*')).as('updateMeal');

        // Act
        cy.get('[aria-label="Edit"]').click();
        cy.contains('Recalculate nutrients').click({ force: true });
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Broth{enter}');
        cy.get('#ingredients-0-quantity').clear().type('200');
        cy.comboboxSelect('Unit', 'Milliliters');
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Wheat Noodles{enter}');
        cy.press('Save');
        cy.waitSync();

        // Assert
        cy.see('221 kcal');
        cy.see('11g protein');
        cy.see('37g carbs');
        cy.see('4g fat');

        cy.get('@updateMeal.all').should('have.length', 1);
        cy.fixture('sparql/update-meal-ingredients.sparql').then((sparql) => {
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
        cy.get('input[name="meal"]').type('Ramen{enter}');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Act
        cy.press('History');

        // Assert
        const now = new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        cy.see(`1 meal on ${now}`);
        cy.see('539 kcal');
    });

    it('Edits ingredients', () => {
        // Arrange
        setupAccount({ ingredients: ['Wheat Noodles'] });

        cy.solidLogin();
        cy.waitSync();

        cy.press('Ingredients');

        cy.intercept('PATCH', podUrl('/ingredients/*')).as('updateIngredient');

        // Act
        cy.ariaLabel('Edit').click();
        cy.get('input[name="servingInGrams"]').clear().type('122');
        cy.get('input[name="servingInMilliliters"]').clear().type('273');
        cy.get('input[name="calories"]').clear().type('23');
        cy.press('Add alias');
        cy.get('#aliases-0').clear().type('Noodles');
        cy.press('Save');
        cy.waitSync();

        // Assert
        cy.see('122g');
        cy.see('19 kcal');

        cy.get('@updateIngredient.all').should('have.length', 1);
        cy.fixture('sparql/update-ingredient.sparql').then((sparql) => {
            cy.get('@updateIngredient').its('response.statusCode').should('eq', 205);
            cy.get('@updateIngredient').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Deletes ingredients', () => {
        // Arrange
        setupAccount({ ingredients: ['Wheat Noodles'] });

        cy.solidLogin();
        cy.waitSync();

        cy.press('Ingredients');
        cy.see('Wheat Noodles');

        cy.intercept('PATCH', podUrl('/ingredients/*')).as('updateIngredient');

        // Act
        cy.ariaLabel('Delete Wheat Noodles').click();
        cy.waitSync();

        // Assert
        cy.dontSee('Wheat Noodles');

        cy.get('@updateIngredient.all').should('have.length', 1);
        cy.fixture('sparql/delete-ingredient.sparql').then((sparql) => {
            cy.get('@updateIngredient').its('response.statusCode').should('eq', 205);
            cy.get('@updateIngredient').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Sets goals', () => {
        // Arrange
        cy.press('Log meal');
        cy.get('input[name="meal"]').type('First meal{enter}');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));

        cy.ariaLabel('Configuration').click();
        cy.press('Settings');

        // Act
        cy.press('Help me decide');
        cy.comboboxSelect('Sex', 'Man');
        cy.get('input[name="weight"]').clear().type('80');
        cy.get('input[name="height"]').clear().type('180');
        cy.get('input[name="age"]').clear().type('42');
        cy.comboboxSelect('Lifestyle', 'Lightly Active');
        cy.comboboxSelect('Goal', 'Gain Muscle');
        cy.press('Calculate');

        cy.see('+250 from daily expenditure');
        cy.press('Set goals');

        // Assert
        cy.see('0 / 2,615 kcal');
        cy.see('0 / 112g');
    });

    it('Shows insights', () => {
        // Arrange
        setupAccount();

        cy.solidLogin();
        cy.waitSync();

        cy.press('Log meal');
        cy.get('input[name="meal"]').type('Ramen{enter}');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        cy.press('Log meal');
        cy.get('input[name="meal"]').type('Ramen{enter}');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.waitSync();

        // Act
        cy.press('Weekly insights');

        // Assert
        cy.see('There are 2 incomplete meals');
        cy.see('1,077 kcal');
        cy.see('54g');
        cy.see('20g');
        cy.see('180g');
    });

    it('Updates all meal instances', () => {
        // Arrange
        setupNutritionixFixtures();

        cy.press('Log meal');
        cy.get('input[name="meal"]').type('Cookies{enter}');
        cy.press('Add ingredient');
        cy.get('input[placeholder="Ingredient"]').last().type('Cookie{enter}');
        cy.get('#ingredients-0-quantity').clear().type('1');
        cy.comboboxSelect('Unit', 'Servings');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.see('148 kcal');

        cy.press('Log meal');
        cy.get('input[name="meal"]').type('Cookies{enter}');
        cy.get('input[name="mealServings"]').clear().type('2');
        cy.get('[role="dialog"]').within(() => cy.press('Log'));
        cy.see('296 kcal');

        // Act
        cy.get('[aria-label="Edit"]').click();
        cy.contains('Recalculate nutrients').click({ force: true });
        cy.contains('Update all instances of this meal').click({ force: true });
        cy.get('#ingredients-0-quantity').clear().type('2');
        cy.press('Save');

        // Assert
        cy.see('592 kcal');
        cy.see('6g protein');
        cy.see('78g carbs');
        cy.see('30g fat');
        cy.see('296 kcal');
        cy.see('3g protein');
        cy.see('39g carbs');
        cy.see('15g fat');
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

    setupNutritionixFixtures();
}

function setupNutritionixFixtures() {
    cy.service('$nutritionix').then((Nutritionix) => {
        Nutritionix.appId = uuid();
        Nutritionix.appKey = uuid();
    });
    cy.intercept('POST', 'https://trackapi.nutritionix.com/v2/natural/nutrients', (request) => {
        let fixture = null;
        const { query } = request.body as { query?: string };

        switch (query) {
            case '100g Wheat Noodles':
                fixture = 'json/wheat-noodles-100g.json';
                break;
            case '100ml Wheat Noodles':
                fixture = 'json/wheat-noodles-100ml.json';
                break;
            case '100g Broth':
                fixture = 'json/broth-100g.json';
                break;
            case '100ml Broth':
                fixture = 'json/broth-100ml.json';
                break;
            case '100g Cookie':
                fixture = 'json/cookie-100g.json';
                break;
            case '100ml Cookie':
                fixture = 'json/cookie-100ml.json';
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
