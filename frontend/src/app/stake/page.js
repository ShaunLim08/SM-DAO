"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Profile() {
  const { publicKey, connected, wallet } = useWallet();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [creatorData, setCreatorData] = useState(null);
  const [error, setError] = useState(null);
  
  // Stake/Unstake/Claim states
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionType, setActionType] = useState("");  // "stake", "unstake", "claim"
  
  // Creator profile form
  const [creatorName, setCreatorName] = useState("");
  const [platformLinks, setPlatformLinks] = useState([""]);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  
  useEffect(() => {
    if (connected && wallet) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [connected, wallet]);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would fetch actual data from the blockchain
      // For now, we'll just simulate this with mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock user data
      const mockUserData = {
        wallet: publicKey.toString(),
        staked_amount: 250,
        rewards_earned: 15,
        last_claim_time: Date.now() - 86400000 * 3, // 3 days ago
        voting_history: [
          {
            proposal_id: 1,
            option_index: 0,
            vote_weight: 100,
            timestamp: Date.now() - 86400000 * 2 // 2 days ago
          },
          {
            proposal_id: 2,
            option_index: 1,
            vote_weight: 50,
            timestamp: Date.now() - 86400000 * 1 // 1 day ago
          }
        ]
      };
      
      // Mock creator data - exists for this user
      const mockCreatorData = {
        initialized: true,
        owner: publicKey.toString(),
        name: "Crypto Creator",
        platform_links: ["https://twitter.com/cryptocreator", "https://youtube.com/cryptocreator"],
        proposals: [1, 3],
        token_pool: 500
      };
      
      // Set the user data
      setUserData(mockUserData);
      
      // Check if user is a creator
      setIsCreator(true); // For mock, assume they are
      setCreatorData(mockCreatorData);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load your account data");
      setLoading(false);
    }
  };
  
  const handleStake = async (e) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError("Please enter a valid amount to stake");
      return;
    }
    
    try {
      setProcessing(true);
      setActionType("stake");
      setError(null);
      
      // In a real app, you would call the contract
      // await stakeTokens(wallet, parseFloat(stakeAmount));
      
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the UI
      setUserData(prev => ({
        ...prev,
        staked_amount: prev.staked_amount + parseFloat(stakeAmount)
      }));
      
      setStakeAmount("");
      setProcessing(false);
      setActionType("");
    } catch (err) {
      console.error("Error staking tokens:", err);
      setError("Failed to stake tokens");
      setProcessing(false);
      setActionType("");
    }
  };
  
  const handleUnstake = async (e) => {
    e.preventDefault();
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError("Please enter a valid amount to unstake");
      return;
    }
    
    if (parseFloat(unstakeAmount) > userData.staked_amount) {
      setError(`You cannot unstake more than your staked amount (${userData.staked_amount} tokens)`);
      return;
    }
    
    try {
      setProcessing(true);
      setActionType("unstake");
      setError(null);
      
      // In a real app, you would call the contract
      // await unstakeTokens(wallet, parseFloat(unstakeAmount));
      
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the UI
      setUserData(prev => ({
        ...prev,
        staked_amount: prev.staked_amount - parseFloat(unstakeAmount)
      }));
      
      setUnstakeAmount("");
      setProcessing(false);
      setActionType("");
    } catch (err) {
      console.error("Error unstaking tokens:", err);
      setError("Failed to unstake tokens");
      setProcessing(false);
      setActionType("");
    }
  };
  
  const handleClaimRewards = async () => {
    try {
      setProcessing(true);
      setActionType("claim");
      setError(null);
      
      // In a real app, you would call the contract
      // await claimRewards(wallet);
      
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the UI - reset rewards to 0 and update last claim time
      setUserData(prev => ({
        ...prev,
        rewards_earned: 0,
        last_claim_time: Date.now()
      }));
      
      setProcessing(false);
      setActionType("");
    } catch (err) {
      console.error("Error claiming rewards:", err);
      setError("Failed to claim rewards");
      setProcessing(false);
      setActionType("");
    }
  };
  
  const addPlatformLinkField = () => {
    setPlatformLinks([...platformLinks, ""]);
  };
  
  const updatePlatformLink = (index, value) => {
    const updatedLinks = [...platformLinks];
    updatedLinks[index] = value;
    setPlatformLinks(updatedLinks);
  };
  
  const removePlatformLink = (index) => {
    const updatedLinks = platformLinks.filter((_, i) => i !== index);
    setPlatformLinks(updatedLinks);
  };
  
  const handleCreateCreatorProfile = async (e) => {
    e.preventDefault();
    
    if (!creatorName.trim()) {
      setError("Please enter a creator name");
      return;
    }
    
    // Filter out empty platform links
    const filteredLinks = platformLinks.filter(link => link.trim() !== "");
    
    try {
      setSubmittingProfile(true);
      setError(null);
      
      // In a real app, you would call the contract
      // await initializeCreator(wallet, creatorName, filteredLinks);
      
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the UI
      setIsCreator(true);
      setCreatorData({
        initialized: true,
        owner: publicKey.toString(),
        name: creatorName,
        platform_links: filteredLinks,
        proposals: [],
        token_pool: 0
      });
      
      setSubmittingProfile(false);
    } catch (err) {
      console.error("Error creating creator profile:", err);
      setError("Failed to create creator profile");
      setSubmittingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
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

      <main className="container mx-auto px-4 py-8">
        {!connected ? (
          <div className="text-center py-10">
            <h3 className="text-xl mb-4">Connect your wallet to view your profile</h3>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={loadUserData}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: User profile & voting history */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="bg-purple-600 text-white p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  Your Profile
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                    <div className="font-medium truncate">{userData.wallet}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Staked</div>
                    <div className="text-2xl font-bold text-purple-400">{userData.staked_amount} tokens</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-1">Unclaimed Rewards</div>
                  <div className="flex items-end">
                    <div className="text-2xl font-bold text-green-400 mr-3">{userData.rewards_earned} tokens</div>
                    <button 
                      onClick={handleClaimRewards}
                      disabled={processing || userData.rewards_earned <= 0}
                      className={`py-1 px-3 rounded text-sm font-medium
                        ${processing && actionType === "claim"
                          ? 'bg-green-700 cursor-wait'
                          : userData.rewards_earned <= 0
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                      {processing && actionType === "claim" ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Claiming...
                        </div>
                      ) : "Claim Rewards"}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Last claimed: {new Date(userData.last_claim_time).toLocaleDateString()}
                  </div>
                </div>
                
                {isCreator && (
                  <div className="bg-purple-900/30 p-4 rounded-lg mb-6">
                    <div className="flex items-center mb-2">
                      <div className="bg-purple-600 text-white p-1 rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                      </div>
                      <span className="text-lg font-semibold">Creator Profile</span>
                    </div>
                    <div className="text-sm mb-1">Name: {creatorData.name}</div>
                    <div className="text-sm mb-2">Created proposals: {creatorData.proposals.length}</div>
                    <div className="text-sm">Platform Links:</div>
                    <ul className="list-disc list-inside text-sm text-purple-300">
                      {creatorData.platform_links.map((link, index) => (
                        <li key={index} className="truncate">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </span>
                  Your Voting History
                </h2>
                
                {userData.voting_history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 px-4">Proposal ID</th>
                          <th className="text-left py-2 px-4">Option</th>
                          <th className="text-left py-2 px-4">Vote Weight</th>
                          <th className="text-left py-2 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.voting_history.map((vote, index) => (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="py-3 px-4">
                              <Link href={`/proposals/${vote.proposal_id}`} className="text-blue-400 hover:underline">
                                #{vote.proposal_id}
                              </Link>
                            </td>
                            <td className="py-3 px-4">Option {vote.option_index}</td>
                            <td className="py-3 px-4">{vote.vote_weight} tokens</td>
                            <td className="py-3 px-4">{new Date(vote.timestamp).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    You haven&apos;t voted on any proposals yet
                  </div>
                )}
              </div>
              
              {!isCreator && (
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl mb-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <span className="bg-purple-600 text-white p-2 rounded-lg mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    Create Creator Profile
                  </h2>
                  
                  <form onSubmit={handleCreateCreatorProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Creator Name</label>
                      <input
                        type="text"
                        value={creatorName}
                        onChange={(e) => setCreatorName(e.target.value)}
                        className="w-full bg-gray-900 text-white p-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter your creator name"
                        disabled={submittingProfile}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Platform Links</label>
                      {platformLinks.map((link, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={link}
                            onChange={(e) => updatePlatformLink(index, e.target.value)}
                            className="flex-grow bg-gray-900 text-white p-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                            placeholder="https://example.com/your-profile"
                            disabled={submittingProfile}
                          />
                          <button
                            type="button"
                            onClick={() => removePlatformLink(index)}
                            className="ml-2 text-red-500 hover:text-red-400 p-2"
                            disabled={platformLinks.length <= 1 || submittingProfile}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addPlatformLinkField}
                        className="mt-2 text-sm text-purple-400 hover:text-purple-300 flex items-center"
                        disabled={submittingProfile}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Add Another Link
                      </button>
                    </div>
                    
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={submittingProfile}
                      className={`w-full py-3 px-4 rounded-lg font-bold ${
                        submittingProfile ? 'bg-purple-700 cursor-wait' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {submittingProfile ? (
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Creating Profile...
                        </div>
                      ) : (
                        'Create Creator Profile'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
            
            {/* Right column: Stake & unstake */}
            <div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl mb-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="bg-green-600 text-white p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Stake Tokens
                </h2>
                
                <div className="text-sm mb-4">
                  Stake your tokens to gain voting power and earn rewards. The more tokens you stake, the more influence you&apos;ll have in governance.
                </div>
                
                <form onSubmit={handleStake} className="mb-6">
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Amount to Stake</label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                      placeholder="Enter amount"
                      step="0.1"
                      min="0"
                      disabled={processing && actionType === "stake"}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={processing && actionType === "stake"}
                    className={`w-full py-3 px-4 rounded-lg font-bold ${
                      processing && actionType === "stake" ? 'bg-green-700 cursor-wait' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {processing && actionType === "stake" ? (
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Staking...
                      </div>
                    ) : (
                      'Stake Tokens'
                    )}
                  </button>
                </form>
                
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="bg-red-600 text-white p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </span>
                  Unstake Tokens
                </h2>
                
                <form onSubmit={handleUnstake}>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Amount to Unstake</label>
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder={`Max: ${userData.staked_amount}`}
                      step="0.1"
                      min="0"
                      max={userData.staked_amount}
                      disabled={processing && actionType === "unstake"}
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={(processing && actionType === "unstake") || userData.staked_amount <= 0}
                    className={`w-full py-3 px-4 rounded-lg font-bold ${
                      (processing && actionType === "unstake") || userData.staked_amount <= 0
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {processing && actionType === "unstake" ? (
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Unstaking...
                      </div>
                    ) : userData.staked_amount <= 0 ? (
                      'No Tokens to Unstake'
                    ) : (
                      'Unstake Tokens'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}