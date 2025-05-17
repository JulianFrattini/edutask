/**
 * As an authenticated user I want to manipulate the todolist associated to a task,
 * i.e., add a new, toggle an existing, or delete an existing todo item.
**/

describe('R8UC1: Create a task', () => {
  before(() => {
    cy.createUser().then((user) => {
      Cypress.env('user', user);
    });
  });

  beforeEach(() => {
    const user = Cypress.env('user');
    cy.login(user.email);
  });

  after(() => {
    const user = Cypress.env('user');
    cy.deleteUser(user.uid);
  });

  it('Should display task', () => {
    cy.get('h1').contains('Your tasks, ');
    cy.get('.container-element').children('a').should('exist');
  });

  it('Should add a new todo item if input is not empty', () => {
    cy.get('input[name="title"]').type('New todo item');
    cy.get('input[type=submit]').contains('Create new Task').should('not.be.disabled').click();
    cy.get('.container-element').children('a').last().should('contain', 'New todo item');
  });

  it('Should not add a new todo item if input is empty', () => {
    cy.get('input[name="title"]').clear();
    cy.get('input[type=submit]').contains('Create new Task').should('be.disabled');
  });
});


describe('R8UC2: Toggle task todo', () => {
  before(() => {
    cy.createUser().then((user) => {
      Cypress.env('user', user);
    });
  });

  beforeEach(() => {
    const user = Cypress.env('user');
    cy.visit('http://localhost:3000');
    cy.login(user.email);

    cy.addTask({
      title: "Hello Task",
      description: "Task 1 description",
      userid: user.uid,
      url: "dQw4w9WgXcQ",
      todos: "watch video"
    });

    cy.get('h1').contains('Your tasks, ');
    cy.get('.container-element').children('a').last().click();
    cy.get('.popup-inner').contains('Hello Task');
  });

  after(() => {
    const user = Cypress.env('user');
    cy.deleteUser(user.uid);
  });

  it('Toggle from active to done', () => {
    cy.get('span.editable').contains('Watch video').should('exist').first().as('titleElem');
    cy.get('@titleElem').prev('span.checker').should('have.class', 'unchecked').as('checkerElem');
    cy.get('@checkerElem').click();
    cy.get('@checkerElem').should('have.class', 'checked');
    cy.get('@titleElem').invoke('css', 'text-decoration').should('include', 'line-through');
  });

  it('Toggle from done to active', () => {
    cy.get('span.editable').contains('Watch video').should('exist').first().as('titleElem');
    cy.get('@titleElem').prev('span.checker').then(($el) => {
      if ($el.hasClass('unchecked')) {
        cy.wrap($el).click().should('have.class', 'checked');
      }
    }).as('checkerElem');
    cy.get('@checkerElem').click();
    cy.get('@checkerElem').should('have.class', 'unchecked');
    cy.get('@titleElem').invoke('css', 'text-decoration').should('not.include', 'line-through');
  });
});


describe('R8UC3: Delete task todo', () => {
  before(() => {
    cy.createUser().then((user) => {
      Cypress.env('user', user);
    });
  });

  beforeEach(() => {
    const user = Cypress.env('user');
    cy.visit('http://localhost:3000');
    cy.login(user.email);

    cy.addTask({
      title: "Hello Task",
      description: "Task 1 description",
      userid: user.uid,
      url: "dQw4w9WgXcQ",
      todos: "watch video"
    });

    cy.get('h1').contains('Your tasks, ');
    cy.get('.container-element').children('a').last().click();
    cy.get('.popup-inner').contains('Hello Task');
  });

  after(() => {
    const user = Cypress.env('user');
    cy.deleteUser(user.uid);
  });

  it('removes a todo item from the task', () => {
    cy.intercept('DELETE', 'http://localhost:5000/todos/byid/*').as('deleteTodo');

    cy.contains('li.todo-item', 'Watch video').should('exist');

    cy.contains('li.todo-item', 'Watch video')
      .find('span.remover')
      .click();

    cy.wait('@deleteTodo').its('response.statusCode').should('eq', 200);

    // There is a bug in the app that the popup does not close after deleting a todo item
    // so, we need to manually close the popup and open it again
    cy.get('.close-btn').should('exist');
    cy.get('.close-btn').click({force: true});
    cy.get('.container-element').children('a').last().click();
    cy.get('.popup-inner').contains('Hello Task');



    cy.contains('li.todo-item', 'Watch video').should('not.exist');
  });
});
