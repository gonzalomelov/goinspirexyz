import { SimulationItem } from "./SimulationItem";

interface Simulation {
  id: number;
  target: string;
  situation: string;
  privateInfo: string;
  groupTitle: string;
  groupImage: string;
  isCompleted: boolean;
  groupId: string;
}

export const SimulationTable = ({
  simulations,
  onDelete,
  onToggle,
}: {
  simulations: Simulation[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}) => {
  return (
    <div className="overflow-x-auto bg-base-100">
      <table className="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Group Title</th>
            <th>Situation</th>
            <th>Target</th>
            <th>Group ID</th>
            <th>Actions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {simulations.map(simulation => (
            <SimulationItem key={simulation.id} simulation={simulation} onDelete={onDelete} onToggle={onToggle} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
