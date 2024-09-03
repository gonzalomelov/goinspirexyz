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
    // XMTP addresses
    const creatorAddress = "0x372082138ea420eBe56078D73F0359D686A7E981";
    const otherAddress = "0x5B385D961CDD40a54356b72B0A86f8A8dA2f2A62"; // iPhone 15 Pro Max
    const targetAddress = "0x0571dd6bbaBb4Dded78858302664CE3407DF35e0"; // iPhone 15
    const agentAddresses = [
      "0x0D79E8F6A3F81420DDbFfaDAc4CD651335777a9D", // Mario: LEAD_AGENT_XMTP_ADDRESS
      "0xeEE998Beb137A331bf47Aa5Fc366033906F1dB34", // Paul: TECH_AGENT_XMTP_ADDRESS
      "0xE67b3617E9CbAf456977CA9d4b9beAb8944EFc37", // Emile: SOCIAL_AGENT_XMTP_ADDRESS
      "0xfA568f302F93Ed732C88a8F1999dCe8e841E14EC", // Gabriel: DATA_AGENT_XMTP_ADDRESS
    ];
    const groupMembers = [creatorAddress, otherAddress, targetAddress, ...agentAddresses];

    // Create the XMTP group conversation
    const xmtpChat = await createGroupChat(groupTitle, groupImage, groupMembers);

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
