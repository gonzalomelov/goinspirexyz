"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const examples = {
  empty: {
    target: "",
    targetFirstName: "",
    targetFriend: "",
    situation: "",
    privateInfo: "",
    groupTitle: "",
    groupImage: "",
  },
  example1: {
    target: "0x372082138ea420eBe56078D73F0359D686A7E981",
    targetFirstName: "Bob",
    targetFriend: "Jack",
    situation: "UsdcDonation", // "Donate to charity by sending 10 usdc to @charity.eth in a transaction directly within this chat using /send 10 usdc @charity.eth",
    situationAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    privateInfo: "He usually donates to charity but using GoFundMe",
    groupTitle: "Give Love ❤️",
    groupImage: "https://lime-odd-deer-974.mypinata.cloud/ipfs/QmWU41NsdaEQ8BGdgkMD3ktCAjbeKfyBsnUxuHFkTRDX1k",
  },
  example2: {
    target: "0x372082138ea420eBe56078D73F0359D686A7E981",
    targetFirstName: "Bob",
    targetFriend: "Jack",
    situation: "NftMint", // "Mint a World of Women NFT to give to charity and help women in need by minting directly within this chat using /mint 0x73a333cb82862d4f66f0154229755b184fb4f5b0 1",
    situationAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    privateInfo: "",
    groupTitle: "All Things NFT ⛓️",
    groupImage: "https://lime-odd-deer-974.mypinata.cloud/ipfs/QmWU41NsdaEQ8BGdgkMD3ktCAjbeKfyBsnUxuHFkTRDX1k",
  },
};

const CreateSimulationPage = () => {
  const [target, setTarget] = useState(examples.example1.target);
  const [targetFirstName, setTargetFirstName] = useState(examples.example1.targetFirstName);
  const [targetFriend, setTargetFriend] = useState(examples.example1.targetFriend);
  const [situation, setSituation] = useState<"UsdcDonation" | "NftMint">(
    examples.example1.situation as "UsdcDonation" | "NftMint",
  );
  const [situationAddress, setSituationAddress] = useState(examples.example1.situationAddress);
  const [privateInfo, setPrivateInfo] = useState(examples.example1.privateInfo);
  const [groupTitle, setGroupTitle] = useState(examples.example1.groupTitle);
  const [groupImage, setGroupImage] = useState(examples.example1.groupImage);
  const router = useRouter();
  const { address: connectedAddress } = useAccount();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/simulations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target,
        targetFirstName,
        targetFriend,
        situation,
        situationAddress,
        privateInfo,
        groupTitle,
        groupImage,
        creator: connectedAddress,
      }),
    });
    if (response.ok) {
      router.push("/simulations");
    } else {
      console.error("Failed to create simulation");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create Onchain Inspirational Experience</h1>
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
          <label className="block mb-2 text-sm font-medium text-gray-700">Target&apos;s First Name</label>
          <input
            type="text"
            value={targetFirstName}
            onChange={e => setTargetFirstName(e.target.value)}
            placeholder={examples.example1.targetFirstName}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Target&apos;s Friend</label>
          <input
            type="text"
            value={targetFriend}
            onChange={e => setTargetFriend(e.target.value)}
            placeholder={examples.example1.targetFriend}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Situation (What are you trying to achieve?)
          </label>
          <select
            value={situation}
            onChange={e => setSituation(e.target.value as "UsdcDonation" | "NftMint")}
            className="select select-bordered w-full"
          >
            <option value="UsdcDonation">Donate USDC</option>
            <option value="NftMint">Mint Charity NFT</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Situation Address</label>
          <input
            type="text"
            value={situationAddress}
            onChange={e => setSituationAddress(e.target.value)}
            placeholder="ETH address to verify"
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
            placeholder={examples.example1.privateInfo}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Group Title</label>
          <input
            type="text"
            value={groupTitle}
            onChange={e => setGroupTitle(e.target.value)}
            placeholder={examples.example1.groupTitle}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Group Image URL</label>
          <input
            type="text"
            value={groupImage}
            onChange={e => setGroupImage(e.target.value)}
            placeholder={examples.example1.groupImage}
            className="input input-bordered w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateSimulationPage;
