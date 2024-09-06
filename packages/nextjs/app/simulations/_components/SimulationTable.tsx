import { SimulationItem } from "./SimulationItem";
import { Simulation } from "~~/types";

export const SimulationTable = ({ simulations }: { simulations: Simulation[] }) => {
  return (
    <div className="overflow-x-auto bg-base-100">
      <table className="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Situation</th>
            <th>Target</th>
            <th>Group Title</th>
            <th>Group ID</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {simulations.map(simulation => (
            <SimulationItem key={simulation.id} simulation={simulation} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
