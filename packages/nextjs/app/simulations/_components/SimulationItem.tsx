import { useState } from "react";
import Image from "next/image";
import { Address } from "~~/components/scaffold-eth";
import { Simulation } from "~~/types";

const simulationTypeMap = {
  UsdcDonation: "Donate USDC",
  NftMint: "Mint Charity NFT",
};

export const SimulationItem = ({ simulation }: { simulation: Simulation }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyAction = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/simulations/${simulation.id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetAddress: simulation.target }),
      });

      if (response.ok) {
        // Handle successful verification
        console.log("Action verified successfully");
      } else {
        // Handle verification failure
        console.error("Verification failed");
      }
    } catch (error) {
      console.error("Error during verification:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <tr>
      <td>{simulation.id}</td>
      <td>
        <Image src={simulation.groupImage} alt="Group" width={24} height={24} className="inline-block rounded-full" />
      </td>
      <td className={`text-base ${simulation.isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
        <div className="whitespace-normal">
          {simulationTypeMap[simulation.situation]} to <Address address={simulation.situationAddress} />
        </div>
      </td>
      <td>
        <Address address={simulation.target} />
      </td>
      <td>{simulation.groupTitle}</td>
      <td>{simulation.groupId}</td>
      <td>{simulation.is_finished ? "Completed" : "In Progress"}</td>
      <td>
        {simulation.responsesCount} / {simulation.max_iterations}
      </td>
      <td>
        <button
          onClick={verifyAction}
          disabled={isVerifying}
          className={`btn btn-sm ${isVerifying ? "btn-disabled" : "btn-primary"}`}
        >
          {isVerifying ? "Verifying..." : "Verify Action"}
        </button>
      </td>
    </tr>
  );
};
