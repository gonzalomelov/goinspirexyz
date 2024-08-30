"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TodoItem } from "./_components/TodoItem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TodoListPage = () => {
  const { address: connectedAddress } = useAccount();
  const [todos, setTodos] = useState<Array<{ id: bigint; content: string; isCompleted: boolean; createdAt: bigint }>>(
    [],
  );

  const { data: todoData } = useScaffoldReadContract({
    contractName: "TodoList",
    functionName: "getTodos",
    account: connectedAddress,
  });

  useEffect(() => {
    if (todoData) {
      setTodos([...todoData]);
    }
  }, [todoData]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Todo List</h1>
      <Link href="/todos/create" className="btn btn-primary mb-4">
        Create New Todo
      </Link>
      <div className="space-y-2">
        {todos.map((todo, index) => (
          <TodoItem key={index} todo={todo} />
        ))}
      </div>
    </div>
  );
};

export default TodoListPage;
