// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email) => {
    cy.visit('http://localhost:3000');
    cy.get('input[name="email"]').type(email);
    cy.get('input[type="submit"]').contains('Login').click();
});

Cypress.Commands.add('deleteUser', uid => {
    cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/users/${uid}`
    }).then((response) => {
        cy.log(response.body);
        cy.visit('http://localhost:3000');
    });;
});

Cypress.Commands.add('createUser', () => {
  return cy.fixture('user.json').then((user) => {
    return cy.request({
      method: 'POST',
      url: 'http://localhost:5000/users/create',
      form: true,
      body: user
    }).then((response) => {
      const newUser = {
        uid: response.body._id.$oid,
        name: user.firstName + ' ' + user.lastName,
        email: user.email
      };
      return cy.wrap(newUser);
    });
  });
});



Cypress.Commands.add('addTask', task => {
    cy.get('input[name="title"]').type(task.title);
    cy.get('input[name="url"]').type(task.url);
    cy.get('input[type="submit"]').contains('Create new Task').click();
})
