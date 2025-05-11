describe('Testing todo-items', () => {
    let uid;  // User ID
    let email;  // User's email
    let name;  // User's full name

    before(function () {
        // Create a user
        cy.fixture('user.json')
          .then((user) => {
            cy.request({
              method: 'POST',
              url: `http://localhost:5000/users/create`,
              form: true,
              body: user
            }).then((response) => {
              uid = response.body._id.$oid;
              name = `${user.firstName} ${user.lastName}`;
              email = user.email;
            });
          });
    });

    beforeEach(() => {
        // login
        cy.visit('http://localhost:3000');
        cy.contains('div', 'Email Address').find('input[type=text]').type(email);
        cy.get('form').submit();
        cy.get('h1').should('contain.text', `Your tasks, ${name}`);
    });

    it('R8UC1 - 1: Valid input description of todo item', () => {
        cy.get('input[type="text"][placeholder="Title of your Task"]').type('idrott', { force: true });
        cy.get('input[type="submit"][value="Create new Task"]').click({ force: true });
        cy.get('div.container-element .title-overlay').should('contain', 'idrott');
    });

    it('R8UC1 - 2: Empty input description of todo item', () => {
        cy.get('input[type="text"][placeholder="Title of your Task"]').clear({ force: true });
        cy.get('input[type="submit"][value="Create new Task"]').should('be.disabled');
    });

    it('R8UC2 - 1: Mark todo item as “done”', () => {

        cy.get('.title-overlay').last().click()
        cy.get('ul.todo-list li.todo-item').first().find('span.checker').click().should('have.class', 'unchecked');
    });

    it('R8UC2 - 2: Change “done” item to “active” item', () => {
        cy.get('.title-overlay').last().click()
        cy.get('ul.todo-list li.todo-item').first().find('span.checker').click().should('have.class', 'checked');
    });

    it('R8UC3 - 1: Delete to-do item from the list', () => {
        cy.get('.title-overlay').last().click()
        cy.get('ul.todo-list li.todo-item').first().find('span.remover').click().should('not.exist');
    });

    after(function () {
        cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/users/${uid}`
          }).then(response => {
            cy.log(response.body)
          });
    });
});
