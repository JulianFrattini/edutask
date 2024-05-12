const taskTitle = 'Complete Cypress setup';
const taskUrl = 'dQw4w9WgXcQ';
let todo = "new todo";

describe('Todo Item Descriptin Entry', () => {
  beforeEach(() => {
    // Ensures that each test starts with a logged-in user and the necessary task setup
    cy.createUser();
    cy.login();
    cy.createTask(taskTitle, taskUrl);  // Creates the task that will be used in the tests
    cy.clickTask(taskTitle);  // Navigate to the specific task
    cy.get('.popup').should('be.visible');
});

  // Test case to check the button remains disabled when description is empty
  it('should keep the Add button disabled when no description is entered', () => {
    // Ensure the input field for the new todo item is empty
    cy.get('input[placeholder="Add a new todo item"]').should('have.value', '');

    // Check if the Add button is disabled
    cy.get('input[type="submit"][value="Add"]').should('be.disabled');
  });

    // Test case R8UC1 test Id 3
  it("R8UC1 add button disabled", () => {
    cy.get(".popup-inner").find("input[type=submit]").should("be.disabled");
  });

    // Test case R8UC1 test Id 1 and 2
  it('Enter description in input field, the description should appear coorectly and Add should be enabled', () => {
    cy.get('input[placeholder="Add a new todo item"]').type(todo, {
      force: true,
    });
    cy.get(".inline-form").submit();
    cy.get(".todo-item:last").should("contain.text", todo);
    cy.get(".todo-item")
        .its("length")
        .then((len) => {
            expect(len).to.be.greaterThan(0);
        });
    });

      // Test case R8UC2 test ID 1
  it("R8UC2 click on the item and set to done with line through", () => {
    cy.contains(".popup-inner .todo-item", todo)
      .find(".checker")
      .click();
    cy.wait(500);
      // Check that text is struck through
    cy.contains("li", todo)
    .find(".editable")
    .invoke("css", "text-decoration")
    .should("include", "line-through");
  });
    
    // Test case R8UC2 test ID 2
  it("R8UC2 sets item to active with no line through", () => {
    cy.contains(".popup-inner .todo-item", todo)
      .find(".checker")
      .click(); 
      cy.get(".todo-item:first .editable").should(
        "not.have.css",
        "text-decoration-line",
        "line-through"
    );
  });

   // Test case R8UC3 test id 1
  it("Should remove the last item from the todo list when X symbol is clicked", () => {
    // Get all todo items
    cy.get(".todo-item").then($todoItems => {
      // Get the last todo item and find its remover
      const lastTodoItem = $todoItems.last();
      const lastTodoRemover = lastTodoItem.find(".remover");

      // Remove the last item by clicking on X
      lastTodoRemover.click();

      // Make sure that the last item is removed from the todo list
      cy.get(".todo-item").should("have.length", $todoItems.length - 1);
    });
  });

  after(() => {
        // Clean up and delete the user after the tests are completed
    cy.deleteUser();
  });

})