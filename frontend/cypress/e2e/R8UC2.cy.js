describe('Test cases for R8UC2', () => {
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
  
    // Test case 1: Verify that a todo item can be marked as done when the user clicks on the checkbox icon
    it('Test case 1: Verify that a todo item can be marked as done when the user clicks on the checkbox icon.', () => {
      cy.get('.title-overlay').last().click()

      cy.get('.todo-list .todo-item')
        .eq(0)
        .find('[class^=checker]')
        .trigger('click', { force: true }) // Check the checkbox
        .should('have.class', 'unchecked') // Ensure that the checkbox has the class "done"  
    })

    it('Test case 2: Verify that a todo item can be marked as active when the user clicks on the checkbox icon agein.', () => {
      cy.get('.title-overlay').last().click()
      // Open the first todo item
      cy.get('.todo-list .todo-item')
        .eq(0)
        .find('[class^=checker]')
        .trigger('click', { force: true }) // Uncheck the checkbox
        .should('have.class', 'checked') // Ensure that the checkbox has the class "done"s
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
  