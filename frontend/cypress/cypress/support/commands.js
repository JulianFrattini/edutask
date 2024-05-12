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


// Creating a user
Cypress.Commands.add('createUser', () => {
    cy.fixture('user.json').then(user => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then(response => {
        Cypress.env('uid', response.body._id.$oid);
        Cypress.env('name', user.firstName + ' ' + user.lastName);
        Cypress.env('email', user.email);
      });
    });
  });
  
  // Logging into the system
  Cypress.Commands.add('login', () => {
    cy.visit('http://localhost:3000');
    cy.get('h1').should('contain.text', 'Login');
    cy.contains('div', 'Email Address').find('input[type=text]').type(Cypress.env('email'));
    cy.get('form').submit();
    cy.get('h1').should('contain.text', 'Your tasks, ' + Cypress.env('name'));
  });

  // Creating a task
  Cypress.Commands.add('createTask', (title, url) => {
    cy.get('input#title').type(title);
    cy.get('input#url').type(url);
    cy.get('input[type="submit"]').click();

  });

  // Deleting a Task
  Cypress.Commands.add('deleteTaskViaAPI', (taskId) => {
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/tasks/${taskId}`,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  // Click on the task
  Cypress.Commands.add('clickTask', (taskTitle) => {
    cy.contains('.title-overlay', taskTitle).click();
  });
  
  // Deleting a user
  Cypress.Commands.add('deleteUser', () => {
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${Cypress.env('uid')}`
    }).then(response => {
      cy.log(response.body)
    });
  });