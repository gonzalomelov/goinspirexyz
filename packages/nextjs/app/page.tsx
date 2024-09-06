"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { LightBulbIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-xl mb-2">Welcome to</span>
            <span className="block text-2xl font-bold">goinspire.xyz</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-4xl font-bold">
            Inspire people to take positive actions in group chats using onchain AI-driven experiences
            {/* {" "} */}
            {/* <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code> */}
          </p>
          {/* <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p> */}
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <LightBulbIcon className="h-8 w-8 fill-secondary" />
              <p>
                Want to inspire action?{" "}
                <Link href="/simulations/create" passHref className="link">
                  Create a new onchain inspirational experience
                </Link>{" "}
                and inspire positive change right away.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Manage your onchain experiences on{" "}
                <Link href="/simulations" passHref className="link">
                  My Onchain Inspirational Experiences
                </Link>{" "}
                list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
