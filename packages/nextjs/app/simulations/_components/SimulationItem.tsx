interface Simulation {
  id: number;
  content: string;
  isCompleted: boolean;
  botAddress: string;
  chatId: string;
}

export const SimulationItem = ({
  simulation,
  onDelete,
  onToggle,
}: {
  simulation: Simulation;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}) => {
  const handleDelete = async () => {
    try {
      const response = await fetch("/api/simulations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: simulation.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete simulation");
      }

      onDelete(simulation.id);
    } catch (error) {
      console.error("Error deleting simulation:", error);
      // Handle error (e.g., show error notification)
    }
  };

  const handleToggle = async () => {
    try {
      const response = await fetch("/api/simulations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: simulation.id, isCompleted: !simulation.isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update simulation");
      }

      onToggle(simulation.id);
    } catch (error) {
      console.error("Error updating simulation:", error);
      // Handle error (e.g., show error notification)
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div>
        <span className={simulation.isCompleted ? "line-through" : ""}>{simulation.content}</span>
        <span className="ml-2 text-sm text-gray-500">Bot Address: {simulation.botAddress}</span>
        <span className="ml-2 text-sm text-gray-500">Chat ID: {simulation.chatId}</span>
      </div>
      <div>
        <button onClick={handleToggle} className="btn btn-sm btn-primary mr-2">
          {simulation.isCompleted ? "Undo" : "Complete"}
        </button>
        <button onClick={handleDelete} className="btn btn-sm btn-error">
          Delete
        </button>
      </div>
    </div>
  );
};
