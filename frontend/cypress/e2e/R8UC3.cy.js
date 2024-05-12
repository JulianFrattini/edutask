describe('Test cases for R8UC3', () => {
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
  
    // Test case 1: Verify that all todo items can be deleted when the user clicks on the delete icon
    it('Test case 1: Verify that all todo items can be deleted when the user clicks on the delete icon', () => {
      // Click on the task to open it
      cy.get('.title-overlay').last().click();
  
      // Wait for some time to ensure all todo items are loaded
      cy.wait(2000);
  
      // Delete all todo items
      cy.get('.todo-list .todo-item [class^=remover]').each(($el) => {
        cy.wrap($el).click({ force: true });
        cy.wait(2000); // Add a wait time between delete actions if necessary
      });
  
      // Check if all todo items are deleted
      cy.get('.todo-list').should('not.contain', '.todo-item');
    });
  
    // Test case 2: Verify that the todo item list is empty after all todo items are deleted
    it('Test case 2: Verify that the todo item list is empty after all todo items are deleted', () => {
      // Click on the task to open it
      cy.get('.title-overlay').last().click();
  
      // Wait for some time to ensure all todo items are loaded
      cy.wait(2000);
  
      // Check if the todo item list is empty
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
  