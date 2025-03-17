"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, SpotLight, Stars } from "@react-three/drei";
import { voteOnProposal } from "@/utils/contract";

// Add 3D Background Component
function AnimatedBackground() {
  return (
    <>
      <Stars count={1000} factor={4} radius={50} fade speed={1} />
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <mesh>
          <torusGeometry args={[3, 0.5, 16, 100]} />
          <meshStandardMaterial
            color="#ff69b4"
            roughness={0.4}
            metalness={0.7}
            wireframe
          />
        </mesh>
      </Float>
    </>
  );
}

// Add animation variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.8,
    },
  },
};

export default function ProposalDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { publicKey, connected, wallet, signTransaction } = useWallet();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voteWeight, setVoteWeight] = useState(0);
  const [userStake, setUserStake] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (connected && wallet) {
      fetchProposalAndUserData();
    } else {
      setLoading(false);
    }
  }, [connected, wallet, id]);

  const fetchProposalAndUserData = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch the actual proposal data
      // from the blockchain using the program and proposal PDA

      // Mock proposal data
      const mockProposal = {
        id: parseInt(id),
        title: "Superteam OnlyFans",
        description:
          "Create a proposal to get Superteam to create an OnlyFans account. This will help increase clout and engagement for Superteam and Solana.",
        creator: "5xjDe5TmBgdekHaGB5d4iLcGbKjPy7gLbr6KNQXVGxWN",
        creatorName: "Ricknesh",
        options: ["Support", "Don't Support"],
        votes: [150, 50, 20],
        totalVotes: 220,
        createTime: new Date().getTime() - 172800000, // 2 days ago
        endTime: new Date().getTime() + 86400000, // 1 day from now
        isActive: true,
        proposalType: "Proposal",
      };

      // Mock user data
      const mockUserStake = 200; // User has 200 tokens staked

      setProposal(mockProposal);
      setUserStake(mockUserStake);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching proposal data:", error);
      setError("Failed to load proposal data");
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption && selectedOption !== 0) {
      setError("Please select an option");
      return;
    }
  
    if (voteWeight <= 0) {
      setError("Please enter a positive vote weight");
      return;
    }
  
    if (voteWeight > userStake) {
      setError(
        `You cannot vote with more than your staked amount (${userStake} tokens)`
      );
      return;
    }
  
    try {
      setVoting(true);
      setError(null);
  
      // Create and send the vote transaction
      const transaction = await voteOnProposal(
        publicKey,
        wallet,
        proposal.id,
        selectedOption,
        voteWeight
      );
  
      // Sign and send transaction
      try {
        const signedTx = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(signature, "processed");
  
        // Update UI after successful vote
        setProposal((prev) => {
          const newVotes = [...prev.votes];
          newVotes[selectedOption] += voteWeight;
          return {
            ...prev,
            votes: newVotes,
            totalVotes: prev.totalVotes + voteWeight,
          };
        });
  
        // Reset form
        setSelectedOption(null);
        setVoteWeight(0);
      } catch (err) {
        console.error("Transaction failed:", err);
        setError("Failed to submit vote. Please try again.");
      }
  
      setVoting(false);
    } catch (error) {
      console.error("Error voting:", error);
      setError("Failed to submit vote");
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0014] text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <Canvas>
          <ambientLight intensity={0.2} />
          <SpotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={1}
            intensity={2}
            color="#ff69b4"
          />
          <AnimatedBackground />
        </Canvas>
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="relative z-10">
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
              Proposal #{id}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}>
            <WalletMultiButton className="!bg-gradient-to-r !from-pink-500 !to-purple-600 !rounded-lg !transition-all hover:!shadow-lg hover:!shadow-pink-500/25" />
          </motion.div>
        </header>

        <motion.main
          variants={cardVariants}
          className="container mx-auto px-4 py-8">
          {!connected ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center py-10 bg-black/40 backdrop-blur-xl rounded-xl border border-pink-500/20">
              <h3 className="text-xl mb-4">
                Connect your wallet to view proposal details
              </h3>
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
            </motion.div>
          ) : proposal ? (
            <motion.div
              variants={cardVariants}
              className="bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-pink-500/20 shadow-xl hover:shadow-pink-500/10 transition-all duration-300">
              <div className="mb-6">
                <Link
                  href="/proposals"
                  className="text-purple-400 hover:text-purple-300 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to Proposals
                </Link>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl mb-8">
                <div className="flex justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <div className="flex gap-2 mb-4">
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
                    <h1 className="text-3xl font-bold">{proposal.title}</h1>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      Created{" "}
                      {new Date(proposal.createTime).toLocaleDateString()}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        proposal.isActive ? "text-green-400" : "text-red-400"
                      }`}>
                      {proposal.isActive
                        ? `Ends in ${Math.floor(
                            (proposal.endTime - new Date().getTime()) / 86400000
                          )}d ${Math.floor(
                            ((proposal.endTime - new Date().getTime()) %
                              86400000) /
                              3600000
                          )}h`
                        : "Ended"}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="text-sm text-gray-400 mb-1">Creator</div>
                  <div className="flex items-center">
                    <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                      {proposal.creatorName.charAt(0)}
                    </div>
                    <div>
                      <div>{proposal.creatorName}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">
                        {proposal.creator}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-sm text-gray-400 mb-2">Description</div>
                  <p className="whitespace-pre-line">{proposal.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Total Votes</span>
                    <span className="font-medium">
                      {proposal.totalVotes} tokens
                    </span>
                  </div>

                  {proposal.options.map((option, i) => (
                    <div key={i} className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{option}</span>
                        <span>
                          {proposal.votes[i]} tokens (
                          {Math.round(
                            (proposal.votes[i] / proposal.totalVotes) * 100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            i === 0
                              ? "bg-green-500"
                              : i === 1
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${
                              (proposal.votes[i] / proposal.totalVotes) * 100
                            }%`,
                          }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {proposal.isActive && (
                  <div className="space-y-6">
                    {/* Voting Options */}
                    <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {proposal.options.map((option, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedOption(i)}
                          className={`p-3 rounded-lg border transition-colors duration-300 ${
                            selectedOption === i
                              ? "border-pink-500 bg-pink-500/20"
                              : "border-gray-700 hover:border-pink-400"
                          }`}>
                          {option}
                        </motion.button>
                      ))}
                    </motion.div>

                    {/* Vote Weight Input */}
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-400">
                        Vote weight (tokens)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={voteWeight}
                          onChange={(e) =>
                            setVoteWeight(
                              Math.min(parseInt(e.target.value) || 0, userStake)
                            )
                          }
                          className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          placeholder="Enter amount of tokens"
                          disabled={voting}
                        />
                        <div className="flex justify-between mt-1 px-1">
                          <span className="text-xs text-gray-500">Min: 1</span>
                          <button
                            className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
                            onClick={() => setVoteWeight(userStake)}>
                            Max: {userStake}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {error}
                      </motion.div>
                    )}

                    {/* Vote Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleVote}
                      disabled={
                        voting ||
                        (!selectedOption && selectedOption !== 0) ||
                        voteWeight <= 0
                      }
                      className={`w-full py-4 px-6 rounded-lg font-bold transition-all duration-300
        ${
          voting || (!selectedOption && selectedOption !== 0) || voteWeight <= 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg hover:shadow-pink-500/25"
        }`}>
                      {voting ? (
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        "Cast Vote"
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </motion.main>
      </motion.div>
    </div>
  );
}
