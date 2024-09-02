"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const examples = {
  empty: {
    target: "",
    situation: "",
    privateInfo: "",
    groupTitle: "",
    groupImage: "",
  },
  example1: {
    target: "0x372082138ea420eBe56078D73F0359D686A7E981",
    situation: "Buy Juventus Fan Token",
    privateInfo: "Her last Juventus shirt came unstitched and she needs a new one",
    groupTitle: "🖤🤍 Juve Fanatics 🤍🖤",
    groupImage: "https://lime-odd-deer-974.mypinata.cloud/ipfs/QmeRGEqsFiNiJ4GJCHCWB54ww8sNJ1dGFXqrnxLhgsAU1m",
  },
  example2: {
    target: "0x372082138ea420eBe56078D73F0359D686A7E981",
    situation: "Buy Bored Ape NFT",
    privateInfo: "Loves the apes at his local zoo",
    groupTitle: "All Things Blockchain ⛓️",
    groupImage: "https://lime-odd-deer-974.mypinata.cloud/ipfs/QmREefCFq3A3jEoXf5wdDssXs653Lfoxsyht6Csc2P6zGN",
  },
};

const CreateSimulationPage = () => {
  const [target, setTarget] = useState(examples.empty.target);
  const [situation, setSituation] = useState(examples.empty.situation);
  const [privateInfo, setPrivateInfo] = useState(examples.empty.privateInfo);
  const [groupTitle, setGroupTitle] = useState(examples.empty.groupTitle);
  const [groupImage, setGroupImage] = useState(examples.empty.groupImage);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/simulations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, situation, privateInfo, groupTitle, groupImage }),
    });
    if (response.ok) {
      router.push("/simulations");
    } else {
      console.error("Failed to create simulation");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create New Simulation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Target (Who are you trying to target?)</label>
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="EVM address or ENS name"
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Situation (What are you trying to achieve?)
          </label>
          <input
            type="text"
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Buy Bored Ape NFT"
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Private Info (What else should I know about the target that could help me on the situation?)
          </label>
          <input
            type="text"
            value={privateInfo}
            onChange={e => setPrivateInfo(e.target.value)}
            placeholder="Loves the apes at his local zoo"
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Group Title</label>
          <input
            type="text"
            value={groupTitle}
            onChange={e => setGroupTitle(e.target.value)}
            placeholder="All Things Blockchain ⛓️"
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Group Image URL</label>
          <input
            type="text"
            value={groupImage}
            onChange={e => setGroupImage(e.target.value)}
            placeholder="https://lime-odd-deer-974.mypinata.cloud/ipfs/QmREefCFq3A3jEoXf5wdDssXs653Lfoxsyht6Csc2P6zGN"
            className="input input-bordered w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Create Simulation
        </button>
      </form>
    </div>
  );
};

export default CreateSimulationPage;
