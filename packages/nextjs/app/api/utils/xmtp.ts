import { Client } from "@xmtp/mls-client";
import * as fs from "fs";
import { createWalletClient, http, toBytes } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

// // Function to send a message to a specific group
// async function sendMessageToGroup(client: Client, groupId: any, messageContent: string) {
//   const conversation = client.conversations.getConversationById(groupId);
//   if (!conversation) {
//     console.log(`No conversation found with ID: ${groupId}`);
//     return;
//   }
//   await conversation.send(messageContent);
//   console.log(`Message sent to group ${groupId}: ${messageContent}`);
// }

// Function to create a wallet from a private key
async function createWallet() {
  let key = process.env.KEY as `0x${string}`;
  if (!key) {
    key = generatePrivateKey();
    console.error("KEY not set. Using random one. For using your own wallet , set the KEY environment variable.");
    console.log("Random private key: ", key);
  }

  const account = privateKeyToAccount(key);
  const wallet = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });
  console.log(`Init wallet ${account.address}`);
  return wallet;
}

// Function to create and setup the XMTP client
async function setupClient(wallet: any, config = {}) {
  const initialConfig = {
    env: "production" as const,
  };
  const finalConfig = { ...initialConfig, ...config };

  const client = await Client.create(wallet.account?.address, finalConfig);
  console.log("Inbox id: ", client.inboxId);
  return client;
}

// Function to register the client if not already registered
async function registerClient(client: Client, wallet: any) {
  if (!client.isRegistered) {
    const signature = toBytes(
      await wallet.signMessage({
        message: client.signatureText,
      }),
    );
    client.addEcdsaSignature(signature);
    await client.registerIdentity();
  }
}

// Function to handle conversations
async function handleConversations(client: Client) {
  await client.conversations.sync();
  const conversations = await client.conversations.list();
  console.log(`Total conversations: ${conversations.length}`);
  for (const conv of conversations) {
    console.log(`Handling conversation with ID: ${conv.id}`);
    await conv.sync();
    const messages = await conv.messages();
    console.log(`Total messages in conversation: ${messages.length}`);
    for (let i = 0; i < messages.length; i++) {
      console.log(`Message ${i}: ${messages[i].content}`);
    }
  }
}
// // Function to stream all messages and respond to new ones
// async function streamAndRespond(client: Client) {
//   console.log("Started streaming messages");
//   const stream = await client.conversations.streamAllMessages();
//   for await (const message of stream) {
//     console.log(`Streamed message: ${message.content}`);
//     if (message.senderInboxId !== client.inboxId) {
//       sendMessageToGroup(client, message.conversationId, "gm");
//     }
//   }
// }

async function createGroupConversation(
  client: Client,
  groupName: string,
  groupDescription: string,
  groupImageUrlSquare: string,
  memberAddresses: string[],
) {
  // Create the group conversation
  const conversation = await client.conversations.newConversation(memberAddresses, {
    groupName,
    groupDescription,
    groupImageUrlSquare,
  });
  return conversation;
}

export async function createGroupChat(botAddress: string) {
  console.log("Creating group chat with bot address: ", botAddress);

  // Create a new wallet instance
  const wallet = await createWallet();
  // Set up the XMTP client with the wallet and database path
  if (!fs.existsSync(`.cache`)) {
    fs.mkdirSync(`.cache`);
  }
  const client = await setupClient(wallet, {
    dbPath: `.cache/${wallet.account?.address}-${"prod"}`,
  });
  // Register the client with the XMTP network if not already registered
  await registerClient(client, wallet);
  // Handle existing conversations
  try {
    await handleConversations(client);
  } catch (error) {
    console.error("Error handling conversations:", error);
  }
  // Run message streaming in a parallel thread to respond to new messages
  // (async () => {
  //   await streamAndRespond(client);
  // })();
  // Example usage of createGroupConversation
  const groupName = "🖤🤍 Juve Fanatics 🤍🖤";
  const groupDescription = "Juve Fanatics Group";
  const groupImageUrlSquare = "https://cdn-icons-png.freepik.com/512/824/824724.png";
  // const groupName = "All Things Blockchain ⛓️";
  // const groupDescription = "All Things Blockchain ⛓️";
  // const groupImageUrlSquare =
  //   "https://lime-odd-deer-974.mypinata.cloud/ipfs/QmREefCFq3A3jEoXf5wdDssXs653Lfoxsyht6Csc2P6zGN";
  const memberAddresses = [
    "0x372082138ea420eBe56078D73F0359D686A7E981", // Creator
    "0xD372466Cf58590c86DE87073C5CeB33268Ee5937", // Other (Creator FIX) XMTP iPhone 15 Pro Max
    "0xC05E75867e5e3a45E2ccF214e53A234E21dBF115", // Target (Bob)        XMTP iPhone 15
    "0x0D79E8F6A3F81420DDbFfaDAc4CD651335777a9D", // LeadAgent
    "0xeEE998Beb137A331bf47Aa5Fc366033906F1dB34", // TECH_AGENT_KEY
    "0xE67b3617E9CbAf456977CA9d4b9beAb8944EFc37", // SOCIAL_AGENT_KEY
    "0xfA568f302F93Ed732C88a8F1999dCe8e841E14EC", // DATA_AGENT_KEY
  ];
  const groupConversation = await createGroupConversation(
    client,
    groupName,
    groupDescription,
    groupImageUrlSquare,
    memberAddresses,
  );
  console.log(`Group "${groupName}" created with id: ${groupConversation.id}`);

  // You can now use this conversation to send messages, etc.
  // await sendMessageToGroup(client, groupConversation.id, "Welcome to the group!");
  return groupConversation;
}
