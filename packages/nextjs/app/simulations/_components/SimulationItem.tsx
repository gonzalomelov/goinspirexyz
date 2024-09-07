import Image from "next/image";
import Link from "next/link";
import { Address } from "~~/components/scaffold-eth";
import { Simulation } from "~~/types";

const simulationTypeMap = {
  UsdcDonation: "Donate USDC",
  NftMint: "Mint Charity NFT",
};

export const SimulationItem = ({ simulation }: { simulation: Simulation }) => {
  return (
    <tr>
      <td>{simulation.id}</td>
      <td>
        <Image src={simulation.groupImage} alt="Group" width={24} height={24} className="inline-block rounded-full" />
      </td>
      <td className={`text-base ${simulation.isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
        <div className="whitespace-normal">{simulationTypeMap[simulation.situation]}</div>
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
        <Link href={`/simulations/${simulation.id}`} className="btn btn-sm btn-primary">
          View
        </Link>
      </td>
    </tr>
  );
};
