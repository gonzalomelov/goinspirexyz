"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateSimulationPage = () => {
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/simulations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
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
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Enter simulation content"
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
