"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimulationTable } from "./_components/SimulationTable";

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
      <h1 className="text-3xl font-bold mb-4">My Onchain Simulations</h1>
      <Link href="/simulations/create" className="btn btn-primary mb-4">
        Create Onchain Simulation
      </Link>
      <SimulationTable simulations={simulations} onDelete={handleDelete} onToggle={handleToggle} />
    </div>
  );
};

export default SimulationListPage;
