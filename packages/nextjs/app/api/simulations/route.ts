import { NextResponse } from "next/server";
import { createGroupChat } from "../utils/xmtp";

// In-memory storage for simulations
const simulations: {
  id: number;
  target: string;
  targetFirstName: string;
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
  const { target, targetFirstName, situation, privateInfo, groupTitle, groupImage } = await request.json();

  try {
    const botAddress = "0x0D79E8F6A3F81420DDbFfaDAc4CD651335777a9D";

    // Create the XMTP group conversation
    const xmtpChat = await createGroupChat(botAddress, groupTitle, situation, groupImage, [
      "0x372082138ea420eBe56078D73F0359D686A7E981", // Creator
      "0x64161EE01D3Fba1994aC1d33983211B9704ddBeA", // Other (Creator FIX) XMTP iPhone 15 Pro Max
      "0x1A37266CD5ABF45f7519e4A860907FBc9964a77E", // Target (Bob)        XMTP iPhone 15
      botAddress, // LeadAgent
      "0xeEE998Beb137A331bf47Aa5Fc366033906F1dB34", // TECH_AGENT_KEY
      "0xE67b3617E9CbAf456977CA9d4b9beAb8944EFc37", // SOCIAL_AGENT_KEY
      "0xfA568f302F93Ed732C88a8F1999dCe8e841E14EC", // DATA_AGENT_KEY
      // target, // Add the target address to the group
    ]);

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
        situation,
        privateInfo,
        groupTitle,
        groupImage,
        groupId: xmtpChat.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const groupChatData = await response.json();

    // const groupChatData = {
    //   podName: "simulation-bot-pod",
    //   message: "Hello, this is a test message from the bot",
    // };

    const newSimulation = {
      id: simulations.length + 1,
      target,
      targetFirstName,
      situation,
      privateInfo,
      groupTitle,
      groupImage,
      isCompleted: false,
      groupId: xmtpChat.id,
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
  const { id, target, targetFirstName, situation, privateInfo, groupTitle, groupImage, isCompleted } =
    await request.json();
  const simulationIndex = simulations.findIndex(simulation => simulation.id === id);
  if (simulationIndex === -1) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }
  simulations[simulationIndex] = {
    ...simulations[simulationIndex],
    target,
    targetFirstName,
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
