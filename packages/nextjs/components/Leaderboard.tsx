import { useEffect, useState } from "react";
import { IndexService } from "@ethsign/sp-sdk";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

interface LeaderboardEntry {
  address: string;
  attestationCount: number;
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const indexService = new IndexService("testnet");
      const res = await indexService.queryAttestationList({ page: 1, schemaId: "onchain_evm_84532_0x27b" }); // , limit: 100

      if (res && res.rows) {
        const addressCounts: { [key: string]: number } = {};
        res.rows.forEach(attestation => {
          const attester = attestation.attester;
          addressCounts[attester] = (addressCounts[attester] || 0) + 1;
        });

        const sortedLeaderboard = Object.entries(addressCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([address, count]) => ({ address, attestationCount: count }));

        setLeaderboard(sortedLeaderboard);
      } else {
        console.error("Failed to fetch attestation list");
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-base-100 rounded-3xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center">
        <TrophyIcon className="h-8 w-8 text-primary mr-2" />
        Proof of Inspiration Leaderboard
      </h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="bg-base-200">Rank</th>
              <th className="bg-base-200">Address</th>
              <th className="bg-base-200">People Inspired</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.address} className={index % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                <td className="font-semibold">{index + 1}</td>
                <td>
                  <Address address={entry.address} />
                </td>
                <td className="text-right">{entry.attestationCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
