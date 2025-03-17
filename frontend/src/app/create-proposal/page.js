"use client";

import { useState, useEffect, Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { createProposal } from "../../utils/contract";

// 3D Background Component
function Background() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas>
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        <Stars count={5000} factor={4} radius={50} />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}

// Animation variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function CreateProposal() {
  const { publicKey, connected, wallet, signTransaction } = useWallet();
  const router = useRouter();
  
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposalType, setProposalType] = useState("Idea");
  const [options, setOptions] = useState(["Yes", "No"]);
  const [endDate, setEndDate] = useState("");
  
  useEffect(() => {
    if (connected && wallet) {
      checkCreatorStatus();
    } else {
      setLoading(false);
    }
  }, [connected, wallet]);
  
  const checkCreatorStatus = async () => {
    try {
      setLoading(true);
      
      // In a real app, you'd check if the user has a creator profile
      // For now, we'll just simulate this with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For now, we'll assume the user is a creator
      setIsCreator(true);
      setLoading(false);
    } catch (err) {
      console.error("Error checking creator status:", err);
      setError("Failed to verify creator status");
      setIsCreator(false);
      setLoading(false);
    }
  };
  
  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    
    if (!endDate) {
      setError("End date is required");
      return;
    }
    
    const endDateTime = new Date(endDate).getTime();
    if (endDateTime <= Date.now()) {
      setError("End date must be in the future");
      return;
    }
    
    // Validate options
    const filteredOptions = options.filter(opt => opt.trim());
    if (filteredOptions.length < 2) {
      setError("At least two options are required");
      return;
    }
    
    try {
      setError(null);
      setSubmitting(true);
      
      const transaction = await createProposal(
        wallet,
        publicKey, 
        title, 
        description, 
        filteredOptions, 
        proposalType, 
        endDateTime
      );

      const signedTx = await signTransaction(transaction);
      console.log(signedTx);
      
      // Success!
      setSuccess(true);
      setSubmitting(false);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/proposals");
      }, 2000);
    } catch (err) {
      console.error("Error creating proposal:", err);
      setError("Failed to create proposal. Please try again.");
      setSubmitting(false);
    }
  };
  
  // Calculate minimum date for the datepicker (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <header className="flex justify-between items-center p-6 bg-black/30 backdrop-blur-sm">
          <Link href="/" className="text-2xl font-bold">SM-DAO</Link>
          <div>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Create a Proposal</h1>
            <p className="mb-8">Please connect your wallet to create a proposal</p>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0120] to-black text-white">
      <Background />
      
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
            Create Proposal
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
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="max-w-2xl mx-auto">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl flex font-bold mb-6 text-pink-300"
          >
        <Link href="/proposals" className="inline-block mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </Link>
        <p className="pl-4">
            Create a Proposal
        </p>
          </motion.h1>
          
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-pink-500/20 border border-pink-500 rounded-lg p-6 text-center"
            >
              {/* ...success content... */}
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="bg-[#2a0a2f]/50 backdrop-blur-sm rounded-xl p-6 border border-pink-900/30"
            >
              {/* Modified form fields with pink theme */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="mb-6"
              >
                <label htmlFor="title" className="block text-sm font-medium text-pink-300 mb-2">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a clear, descriptive title"
                  className="w-full bg-[#1a0120] text-white p-3 rounded-lg border border-pink-700/30 focus:border-pink-500 focus:outline-none transition-colors"
                  required
                  disabled={submitting}
                />
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.01 }} className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about your proposal"
                  className="w-full bg-[#1a0120] text-white p-3 rounded-lg border border-pink-700/30 focus:border-pink-500 focus:outline-none transition-colors"
                  required
                  disabled={submitting}
                ></textarea>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.01 }} className="mb-6">
                <label htmlFor="proposalType" className="block text-sm font-medium text-gray-400 mb-2">Proposal Type</label>
                <select
                  id="proposalType"
                  value={proposalType}
                  onChange={(e) => setProposalType(e.target.value)}
                  className="w-full bg-[#1a0120] text-white p-3 rounded-lg border border-pink-700/30 focus:border-pink-500 focus:outline-none transition-colors"
                  disabled={submitting}
                >
                  <option value="Idea">Idea (Low stake requirement)</option>
                  <option value="Proposal">Proposal (Higher stake requirement)</option>
                </select>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.01 }} className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Voting Options</label>
                <p className="text-xs text-gray-500 mb-3">Add between 2-5 options for voters to choose from</p>
                
                {options.map((option, index) => (
                  <motion.div whileHover={{ scale: 1.01 }} key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="w-full bg-[#1a0120] text-white p-3 rounded-lg border border-pink-700/30 focus:border-pink-500 focus:outline-none transition-colors"
                      required
                      disabled={submitting}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="bg-red-900 hover:bg-red-800 p-3 rounded-lg"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </motion.div>
                ))}
                
                {options.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 flex items-center text-purple-400 hover:text-purple-300"
                    disabled={submitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Option
                  </button>
                )}
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.01 }} className="mb-8">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={minDate}
                  className="w-full bg-[#1a0120] text-white p-3 rounded-lg border border-pink-700/30 focus:border-pink-500 focus:outline-none transition-colors"
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">When the voting period will end</p>
              </motion.div>
              
              {error && (
                <motion.div whileHover={{ scale: 1.01 }} className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6 text-red-400" >
                  {error}
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || !isCreator}
                className={`w-full py-3 px-4 rounded-lg font-bold ${
                  submitting || !isCreator 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-pink-600 hover:bg-pink-700 transition-colors'
                }`}
              >
                {submitting ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating Proposal...
                  </div>
                ) : (
                  'Create Proposal'
                )}
              </motion.button>
            </motion.form>
          )}
        </div>
      </motion.main>
    </div>
  );
}