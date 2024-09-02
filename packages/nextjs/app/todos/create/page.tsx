"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const CreateTodoPage = () => {
  const [content, setContent] = useState("");
  const router = useRouter();

  const { writeContractAsync } = useScaffoldWriteContract("TodoList");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await writeContractAsync({ functionName: "createTodo", args: [content] });
    router.push("/todos");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create Todo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Enter todo content"
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary">
          Create Todo
        </button>
      </form>
    </div>
  );
};

export default CreateTodoPage;
