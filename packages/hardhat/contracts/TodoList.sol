//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract TodoList {
    struct Todo {
        uint256 id;
        string content;
        bool isCompleted;
        uint256 createdAt;
        address user;
    }

    mapping(address => Todo[]) private userTodos;
    mapping(address => uint256) private userTodoCount;

    event TodoCreated(address indexed user, uint256 id, string content);
    event TodoCompleted(address indexed user, uint256 id);
    event TodoDeleted(address indexed user, uint256 id);

    function createTodo(string memory _content) public {
        uint256 todoId = userTodoCount[msg.sender];
        userTodos[msg.sender].push(Todo(todoId, _content, false, block.timestamp, msg.sender));
        userTodoCount[msg.sender]++;
        emit TodoCreated(msg.sender, todoId, _content);
    }

    function getTodos() public view returns (Todo[] memory) {
        return userTodos[msg.sender];
    }

    function completeTodo(uint256 _id) public {
        require(_id < userTodoCount[msg.sender], "Todo does not exist");
        require(userTodos[msg.sender][_id].user == msg.sender, "Only the creator can complete this todo");
        userTodos[msg.sender][_id].isCompleted = true;
        emit TodoCompleted(msg.sender, _id);
    }

    function deleteTodo(uint256 _id) public {
        require(_id < userTodoCount[msg.sender], "Todo does not exist");
        require(userTodos[msg.sender][_id].user == msg.sender, "Only the creator can delete this todo");
        for (uint i = _id; i < userTodos[msg.sender].length - 1; i++) {
            userTodos[msg.sender][i] = userTodos[msg.sender][i + 1];
        }
        userTodos[msg.sender].pop();
        userTodoCount[msg.sender]--;
        emit TodoDeleted(msg.sender, _id);
    }
}