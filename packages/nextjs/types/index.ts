export interface Simulation {
  id: number;
  owner: string;
  responsesCount: bigint;
  max_iterations: number;
  is_finished: boolean;
  target: string;
  situation: "UsdcDonation" | "NftMint";
  privateInfo: string;
  groupTitle: string;
  groupImage: string;
  isCompleted: boolean;
  groupId: string;
}
