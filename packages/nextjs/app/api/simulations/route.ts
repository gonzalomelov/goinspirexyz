import { NextResponse } from "next/server";
import { createGroupChat } from "../utils/xmtp";

// In-memory storage for simulations
const simulations: {
  id: number;
  target: string;
  situation: string;
  privateInfo: string;
  groupTitle: string;
  groupImage: string;
  isCompleted: boolean;
  botAddress: string;
  chatId: string;
}[] = [];

export async function GET() {
  return NextResponse.json(simulations);
}

export async function POST(request: Request) {
  const { target, situation, privateInfo, groupTitle, groupImage } = await request.json();

  try {
    // Create bot instance that will run in the XMTP group, and the chat in Galadriel
    const response = await fetch("http://localhost:3001/group-chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target,
        situation,
        privateInfo,
        groupTitle,
        groupImage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const groupChatData = await response.json();

    // Create the XMTP group chat
    const xmtpChat = await createGroupChat("0x361fd8769c1295Eb75F4E8f51015bc074Eb937B2");

    const newSimulation = {
      id: simulations.length + 1,
      target,
      situation,
      privateInfo,
      groupTitle,
      groupImage,
      isCompleted: false,
      botAddress: groupChatData.botAddress,
      chatId: xmtpChat.id,
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
  const { id, target, situation, privateInfo, groupTitle, groupImage, isCompleted } = await request.json();
  const simulationIndex = simulations.findIndex(simulation => simulation.id === id);
  if (simulationIndex === -1) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }
  simulations[simulationIndex] = {
    ...simulations[simulationIndex],
    target,
    situation,
    privateInfo,
    groupTitle,
    groupImage,
    isCompleted,
  };
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
