"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimulationItem } from "./_components/SimulationItem";

interface Simulation {
  id: number;
  content: string;
  isCompleted: boolean;
  botAddress: string;
}

const SimulationListPage = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);

  const fetchSimulations = async () => {
    try {
      const response = await fetch("/api/simulations");
      if (!response.ok) {
        throw new Error("Failed to fetch simulations");
      }
      const data = await response.json();
      setSimulations(data);
    } catch (error) {
      console.error("Error fetching simulations:", error);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const handleDelete = async (id: number) => {
    setSimulations(simulations.filter(simulation => simulation.id !== id));
  };

  const handleToggle = async (id: number) => {
    setSimulations(
      simulations.map(simulation =>
        simulation.id === id ? { ...simulation, isCompleted: !simulation.isCompleted } : simulation,
      ),
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Simulation List</h1>
      <Link href="/simulations/create" className="btn btn-primary mb-4">
        Create New Simulation
      </Link>
      <div className="space-y-2">
        {simulations.map(simulation => (
          <SimulationItem key={simulation.id} simulation={simulation} onDelete={handleDelete} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
};

export default SimulationListPage;
