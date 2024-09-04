import { NextResponse } from "next/server";

// import { createGroupChat } from "../utils/xmtp";

// In-memory storage for simulations
const simulations: {
  id: number;
  target: string;
  targetFirstName: string;
  targetFriend: string;
  situation: string;
  privateInfo: string;
  groupTitle: string;
  groupImage: string;
  isCompleted: boolean;
  groupId: string;
}[] = [];

export async function GET() {
  return NextResponse.json(simulations);
}

export async function POST(request: Request) {
  const { target, targetFirstName, targetFriend, situation, privateInfo, groupTitle, groupImage, connectedAddress } =
    await request.json();

  try {
    // Create the chat in Galadriel
    // TODO: Move from group-chat to nextjs
    const response = await fetch("http://localhost:3001/group-chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target,
        targetFirstName,
        targetFriend,
        situation,
        privateInfo,
        groupTitle,
        groupImage,
        connectedAddress,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const groupChatData = await response.json();

    // const groupChatData = {
    //   message: "Group chat instance created",
    //   workerId: '123123213',
    //   groupId: '21312321',
    // };

    const newSimulation = {
      id: simulations.length + 1,
      target,
      targetFirstName,
      targetFriend,
      situation,
      privateInfo,
      groupTitle,
      groupImage,
      isCompleted: false,
      groupId: groupChatData.groupId,
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
  const { id, target, targetFirstName, targetFriend, situation, privateInfo, groupTitle, groupImage, isCompleted } =
    await request.json();
  const simulationIndex = simulations.findIndex(simulation => simulation.id === id);
  if (simulationIndex === -1) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }
  simulations[simulationIndex] = {
    ...simulations[simulationIndex],
    target,
    targetFirstName,
    targetFriend,
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
