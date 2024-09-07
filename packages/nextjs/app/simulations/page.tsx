"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimulationTable } from "./_components/SimulationTable";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Simulation } from "~~/types";

interface AgentRunInfo {
  owner: string;
  creator: string;
  target: string;
  targetFirstName: string;
  targetFriend: string;
  situation: string;
  publicInfo: string;
  privateInfo: string;
  groupTitle: string;
  groupImage: string;
  groupId: string;
  responsesCount: bigint;
  max_iterations: number;
  is_finished: boolean;
}

const SimulationListPage = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const { address } = useAccount();

  const { data: agentRuns } = useScaffoldReadContract({
    contractName: "LeadAgent",
    functionName: "getAgentRuns",
    args: [address],
  });

  useEffect(() => {
    const fetchSimulations = async () => {
      if (!address || !agentRuns) return;

      const simulationsData: Simulation[] = await Promise.all(
        agentRuns.map(async (run: AgentRunInfo, index: number) => {
          return {
            id: index,
            owner: run.owner,
            responsesCount: run.responsesCount,
            max_iterations: run.max_iterations,
            is_finished: run.is_finished,
            target: run.target,
            situation: run.situation,
            privateInfo: run.privateInfo,
            groupTitle: run.groupTitle,
            groupImage: run.groupImage,
            isCompleted: run.is_finished,
            groupId: run.groupId,
          };
        }),
      );

      setSimulations(simulationsData);
    };

    fetchSimulations();
  }, [address, agentRuns]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Onchain Inspirational Experiences</h1>
      <Link href="/simulations/create" className="btn btn-primary mb-4">
        Create
      </Link>
      <SimulationTable simulations={simulations} />
    </div>
  );
};

export default SimulationListPage;
