import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Todo {
  id: bigint;
  content: string;
  isCompleted: boolean;
}

export const TodoItem = ({ todo }: { todo: Todo }) => {
  const { writeContractAsync } = useScaffoldWriteContract("TodoList");

  const handleDelete = async () => {
    try {
      await writeContractAsync({ functionName: "deleteTodo", args: [todo.id] });
      // Handle successful deletion (e.g., update UI, show notification)
    } catch (error) {
      console.error("Error deleting todo:", error);
      // Handle error (e.g., show error notification)
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <span className={todo.isCompleted ? "line-through" : ""}>{todo.content}</span>
      <div>
        {/* ... other buttons ... */}
        <button onClick={handleDelete} className="btn btn-sm btn-error">
          Delete
        </button>
      </div>
    </div>
  );
};
