describe('Test cases for R8UC1', () => {
  // Variables to store user information
  let uid;
  let email;

  // Before hook to create a user and login before each test
  before(() => {
    cy.fixture('user.json').then((user) => {
      // Create a user
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((response) => {
        uid = response.body._id.$oid;
        email = user.email;

        // Log in the user
        cy.visit('http://localhost:3000');
        cy.contains('div', 'Email Address').find('input[type=text]').type(email);
        cy.get('form').submit();
        cy.get('#title').type('My New Task');
        cy.get('#url').type('dQw4w9WgXcQ');
        cy.get('form').submit();
      });
    });
  });

  // Before each hook to login before each test
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.contains('div', 'Email Address').find('input[type=text]').type(email);
    cy.get('form').submit();
  });

  // Test case 1: should create a new todo item when a non-empty description is entered and the "Add" button is clicked
  it('Test case 1: should create a new todo item when a non-empty description is entered and the "Add" button is clicked', () => {
    const todoDescription = 'Buy groceries';

    // Click on the task to open it
    cy.get('.title-overlay').last().click();
    cy.wait(2000);

    // Enter todo description and click "Add"
    cy.get('.inline-form input[type="text"]').type(todoDescription);
    cy.get('.inline-form').submit();

    // Check if the new todo item is created
    cy.get('.todo-list').should('contain', todoDescription);
  });

  // Test case 2: should not create a new todo item when an empty description is entered and the "Add" button is clicked
  it('Test case 2: should not create a new todo item when an empty description is entered and the "Add" button is clicked', () => {
    // Click on the task to open it
    cy.get('.title-overlay').last().click();
    cy.wait(2000);

    // Ensure the input field is empty
    cy.get('.inline-form input[type="text"]').should('have.value', '');

    // Click "Add" without entering a description
    cy.get('.inline-form').submit();

    // Check if no new todo item is created
    cy.get('.todo-list').should('not.contain', '.todo-item');
  });

  // After hook to delete the user after all tests
  after(() => {
    // Clean up by deleting the user from the database
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`
    }).then((response) => {
      cy.log(response.body);
    });
  });
});
