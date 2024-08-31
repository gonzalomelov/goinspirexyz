import { NextResponse } from "next/server";

// In-memory storage for simulations
const simulations: { id: number; content: string; isCompleted: boolean; botAddress: string }[] = [];

export async function GET() {
  return NextResponse.json(simulations);
}

export async function POST(request: Request) {
  const { content } = await request.json();

  try {
    // Make a POST request to the group-chats API
    const response = await fetch("http://localhost:3001/group-chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }), // You might need to adjust this based on what the API expects
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const groupChatData = await response.json();

    const newSimulation = {
      id: simulations.length + 1,
      content,
      isCompleted: false,
      botAddress: groupChatData.botAddress,
    };
    simulations.push(newSimulation);

    return NextResponse.json(
      {
        ...newSimulation,
        podName: groupChatData.podName,
        message: groupChatData.message,
      },
      { status: 201 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating group chat instance:", errorMessage);
    return NextResponse.json(
      {
        error: "Failed to create group chat instance",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const { id, content, isCompleted } = await request.json();
  const simulationIndex = simulations.findIndex(simulation => simulation.id === id);
  if (simulationIndex === -1) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }
  simulations[simulationIndex] = { ...simulations[simulationIndex], content, isCompleted };
  return NextResponse.json(simulations[simulationIndex]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const simulationIndex = simulations.findIndex(simulation => simulation.id === id);
  if (simulationIndex === -1) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }
  simulations.splice(simulationIndex, 1);
  return NextResponse.json({ message: "Simulation deleted successfully" });
}
