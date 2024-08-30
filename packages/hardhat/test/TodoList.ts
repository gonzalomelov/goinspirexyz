import { expect } from "chai";
import { ethers } from "hardhat";
import { TodoList } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TodoList", function () {
  let todoList: TodoList;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const TodoListFactory = await ethers.getContractFactory("TodoList");
    todoList = (await TodoListFactory.deploy()) as TodoList;
    await todoList.waitForDeployment();
  });

  describe("Todo Operations", function () {
    it("Should create a new todo", async function () {
      await expect(todoList.createTodo("Test Todo"))
        .to.emit(todoList, "TodoCreated")
        .withArgs(owner.address, 0, "Test Todo");

      const todos = await todoList.getTodos();
      expect(todos.length).to.equal(1);
      expect(todos[0].content).to.equal("Test Todo");
      expect(todos[0].isCompleted).to.be.false;
    });

    it("Should complete a todo", async function () {
      await todoList.createTodo("Test Todo");
      await expect(todoList.completeTodo(0)).to.emit(todoList, "TodoCompleted").withArgs(owner.address, 0);

      const todos = await todoList.getTodos();
      expect(todos[0].isCompleted).to.be.true;
    });

    it("Should delete a todo", async function () {
      await todoList.createTodo("Todo to delete");
      await expect(todoList.deleteTodo(0)).to.emit(todoList, "TodoDeleted").withArgs(owner.address, 0);

      const todos = await todoList.getTodos();
      expect(todos.length).to.equal(0);
    });

    it("Should revert when completing non-existent todo", async function () {
      await expect(todoList.completeTodo(99)).to.be.revertedWith("Todo does not exist");
    });

    it("Should revert when deleting non-existent todo", async function () {
      await expect(todoList.deleteTodo(99)).to.be.revertedWith("Todo does not exist");
    });

    it("Should not allow non-creator to complete a todo", async function () {
      await todoList.connect(user1).createTodo("User1 Todo");
      await expect(todoList.connect(user2).completeTodo(0)).to.be.revertedWith("Todo does not exist");
    });

    it("Should not allow non-creator to delete a todo", async function () {
      await todoList.connect(user1).createTodo("User1 Todo");
      await expect(todoList.connect(user2).deleteTodo(0)).to.be.revertedWith("Todo does not exist");
    });

    it("Should allow creator to complete their own todo", async function () {
      await todoList.connect(user1).createTodo("User1 Todo");
      await expect(todoList.connect(user1).completeTodo(0))
        .to.emit(todoList, "TodoCompleted")
        .withArgs(user1.address, 0);

      const todos = await todoList.connect(user1).getTodos();
      expect(todos[0].isCompleted).to.be.true;
    });

    it("Should allow creator to delete their own todo", async function () {
      await todoList.connect(user1).createTodo("User1 Todo");
      await expect(todoList.connect(user1).deleteTodo(0)).to.emit(todoList, "TodoDeleted").withArgs(user1.address, 0);

      const todos = await todoList.connect(user1).getTodos();
      expect(todos.length).to.equal(0);
    });
  });
});
