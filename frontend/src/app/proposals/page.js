"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, SpotLight } from "@react-three/drei";

// 3D Background Component
function AnimatedSphere() {
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#ff69b4"
          roughness={0.4}
          metalness={0.7}
          wireframe
        />
      </mesh>
    </Float>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function ProposalsList() {
  const { publicKey, connected, wallet } = useWallet();
  const router = useRouter();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, ended
  const [sort, setSort] = useState("newest"); // newest, oldest, most-votes

  useEffect(() => {
    fetchProposals();
  }, [connected, filter, sort]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would fetch proposals from the blockchain
      // For now, we'll use mock data
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockProposals = [
        {
          id: 1,
          title: "Get CoinGecko YouTube to post brainrot",
          description:
            "Create a proposal to get CoinGecko YouTube to post brainrot on their channel. This will help increase awareness and adoption on crypto.",
          creator: "5xjDe5TmBgdekHaGB5d4iLcGbKjPy7gLbr6KNQXVGxWN",
          creatorName: "CG Fans",
          options: ["Yes", "No", "Abstain"],
          votes: [150, 50, 20],
          totalVotes: 220,
          createTime: new Date().getTime() - 172800000, // 2 days ago
          endTime: new Date().getTime() + 86400000, // 1 day from now
          isActive: true,
          proposalType: "Proposal",
          imageUrl: "https://pbs.twimg.com/profile_banners/2412652615/1714099870/1500x500", // Add image URL here
        },
        {
          id: 2,
          title: "Superteam OnlyFans",
          description:
            "Create a proposal to get Superteam to create an OnlyFans account. This will help increase clout and engagement for Superteam and Solana.",
          creator: "7nYu5mzzLAzMx2sGgMRW9A4QKD5W1xgZ1GuJGmKJcihM",
          creatorName: "Ricknesh",
          options: ["Support", "Don't Support"],
          votes: [80, 30],
          totalVotes: 110,
          createTime: new Date().getTime() - 432000000, // 5 days ago
          endTime: new Date().getTime() + 172800000, // 2 days from now
          isActive: true,
          proposalType: "Proposal",
          imageUrl: "https://pbs.twimg.com/media/GjrAeOVaYAAZWe6?format=jpg&name=large", // Add image URL here
        },
        {
          id: 3,
          title: "Get Rizzler to do Memecoin Reviews",
          description:
            "Onboard Rizzler to the Solana Ecosystem and get him to review memecoins for exposure.",
          creator: "6uTsfKTtJAJQr8QgAEuQB6aq9pwYijWLi9xCpVvL8Y1G",
          creatorName: "Rizz Expert",
          options: ["Yes", "No"],
          votes: [100, 120],
          totalVotes: 220,
          createTime: new Date().getTime() - 604800000, // 7 days ago
          endTime: new Date().getTime() - 86400000, // 1 day ago
          isActive: false,
          proposalType: "Idea",
          imageUrl: "https://pbs.twimg.com/media/Glot5eUWIAADhbj?format=jpg&name=large", // Add image URL here
        },
      ];

      // Apply filters
      let filteredProposals = mockProposals;

      if (filter === "active") {
        filteredProposals = filteredProposals.filter((p) => p.isActive);
      } else if (filter === "ended") {
        filteredProposals = filteredProposals.filter((p) => !p.isActive);
      }

      // Apply sorting
      if (sort === "newest") {
        filteredProposals.sort((a, b) => b.createTime - a.createTime);
      } else if (sort === "oldest") {
        filteredProposals.sort((a, b) => a.createTime - b.createTime);
      } else if (sort === "most-votes") {
        filteredProposals.sort((a, b) => b.totalVotes - a.totalVotes);
      }

      setProposals(filteredProposals);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError("Failed to load proposals");
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    router.push("/create-proposal");
  };

  return (
    <div className="min-h-screen bg-[#0a0014] text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 opacity-50">
        <Canvas>
          <ambientLight intensity={0.5} />
          <SpotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={1}
            intensity={2}
            color="#ff69b4"
          />
          <AnimatedSphere />
        </Canvas>
      </div>

      <header className="relative flex justify-between items-center p-6 bg-black/40 backdrop-blur-md border-b border-pink-500/10 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center">
          <h1 className="text-2xl font-bold mr-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            SM-DAO
          </h1>
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-xs px-2 py-1 rounded-full">
            Account
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}>
          <WalletMultiButton className="!bg-gradient-to-r !from-pink-500 !to-purple-600 !rounded-lg !transition-all hover:!shadow-lg hover:!shadow-pink-500/25" />
        </motion.div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold">Proposals</h1>
            {connected && (
              <button
                onClick={handleCreateClick}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Proposal
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label
                htmlFor="filter"
                className="block text-sm text-gray-400 mb-1">
                Filter
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="all">All Proposals</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="block text-sm text-gray-400 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-votes">Most Votes</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-black/40 backdrop-blur-xl rounded-xl overflow-hidden border border-pink-500/10 hover:border-pink-500/20 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
                    {/* Image Container */}
                    <div className="relative w-full h-40 overflow-hidden">
                      {proposal.imageUrl ? (
                        <Image
                          src={proposal.imageUrl}
                          alt={proposal.title}
                          fill
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-pink-500/50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            proposal.proposalType === "Idea"
                              ? "bg-blue-600"
                              : "bg-green-600"
                          }`}>
                          {proposal.proposalType}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            proposal.isActive ? "bg-green-600" : "bg-red-600"
                          }`}>
                          {proposal.isActive ? "Active" : "Ended"}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold mb-2 line-clamp-2">
                        {proposal.title}
                      </h2>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {proposal.description}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1 text-gray-400">
                          <span>Total Votes: {proposal.totalVotes}</span><span>
                            {proposal.isActive
                              ? `${Math.ceil(
                                  (proposal.endTime - new Date().getTime()) /
                                    86400000
                                )}d left`
                              : "Ended"}
                          </span>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.round(
                                (proposal.votes[0] / proposal.totalVotes) * 100
                              )}%`,
                            }}></div>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span>
                            {proposal.options[0]}:{" "}
                            {Math.round(
                              (proposal.votes[0] / proposal.totalVotes) * 100
                            )}
                            %
                          </span>
                          <span>
                            {proposal.options[1]}:{" "}
                            {Math.round(
                              (proposal.votes[1] / proposal.totalVotes) * 100
                            )}
                            %
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/proposals/${proposal.id}`}
                        className="block text-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25">
                        {proposal.isActive ? "Vote Now" : "View Results"}
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}