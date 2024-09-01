import Image from "next/image";
import { Address } from "~~/components/scaffold-eth";

interface Simulation {
  id: number;
  target: string;
  situation: string;
  privateInfo: string;
  groupTitle: string;
  groupImage: string;
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
    <tr>
      <td>{simulation.id}</td>
      <td>
        <Image src={simulation.groupImage} alt="Group" width={24} height={24} className="inline-block rounded-full" />
      </td>
      <td className={`text-base ${simulation.isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
        <div className="whitespace-normal">{simulation.situation}</div>
      </td>
      <td>
        <Address address={simulation.target} />
      </td>
      <td>
        <Address address={simulation.botAddress} />
      </td>
      <td>{simulation.chatId}</td>
      <td>
        <button
          onClick={handleToggle}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {simulation.isCompleted ? "Undo" : "Complete"}
        </button>
      </td>
      <td>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};
