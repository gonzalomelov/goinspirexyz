"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateSimulationPage = () => {
  const [target, setTarget] = useState("0x372082138ea420eBe56078D73F0359D686A7E981");
  const [situation, setSituation] = useState("Buy Juventus Fan Token");
  const [privateInfo, setPrivateInfo] = useState("Her last Juventus shirt came unstitched and she needs a new one");
  const [groupTitle, setGroupTitle] = useState("🖤🤍 Juve Fanatics 🤍🖤");
  const [groupImage, setGroupImage] = useState(
    "https://lime-odd-deer-974.mypinata.cloud/ipfs/QmeRGEqsFiNiJ4GJCHCWB54ww8sNJ1dGFXqrnxLhgsAU1m",
  );
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
        <input
          type="text"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="Enter target (EVM address or ENS name)"
          className="input input-bordered w-full"
        />
        <input
          type="text"
          value={situation}
          onChange={e => setSituation(e.target.value)}
          placeholder="Enter situation"
          className="input input-bordered w-full"
        />
        <input
          type="text"
          value={privateInfo}
          onChange={e => setPrivateInfo(e.target.value)}
          placeholder="Enter private info"
          className="input input-bordered w-full"
        />
        <input
          type="text"
          value={groupTitle}
          onChange={e => setGroupTitle(e.target.value)}
          placeholder="Enter group title"
          className="input input-bordered w-full"
        />
        <input
          type="text"
          value={groupImage}
          onChange={e => setGroupImage(e.target.value)}
          placeholder="Enter group image URL"
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary">
          Create Simulation
        </button>
      </form>
    </div>
  );
};

export default CreateSimulationPage;
