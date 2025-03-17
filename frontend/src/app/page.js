"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program } from "@project-serum/anchor";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";

// Animated 3D background component with Three.js
function AnimatedSphere() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere visible args={[1, 100, 200]} scale={2.5} ref={meshRef}>
      <MeshDistortMaterial
        color="#ff49db"
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  );
}

// Chart data visualization component
const TokenDistributionChart = () => {
  const chartRef = useRef(null);
  const segments = [
    { percentage: 40, color: "#ff49db", label: "Community Rewards" },
    { percentage: 30, color: "#bd4bda", label: "Creator Incentives" },
    { percentage: 20, color: "#9013fe", label: "Development" },
    { percentage: 10, color: "#6d00c1", label: "Treasury" },
  ];

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    let startAngle = 0;

    segments.forEach((segment) => {
      const sliceAngle = (segment.percentage / 100) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = segment.color;
      ctx.fill();

      startAngle += sliceAngle;
    });
  }, []);

  return (
    <div className="relative">
      <canvas ref={chartRef} width="200" height="200" className="mx-auto" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: segment.color }}></div>
            <span className="text-gray-300">
              {segment.label}{" "}
              <span className="font-bold">{segment.percentage}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Animated metrics counter
const AnimatedCounter = ({ value, label, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const duration = 2000;
  const countRef = useRef(0);
  const previousTimeRef = useRef(0);

  useEffect(() => {
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </motion.div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(255, 73, 219, 0.2)",
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
};

// Floating animation for icons
const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: "easeInOut",
    },
  },
};

export default function Home() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [showWhitepaperTooltip, setShowWhitepaperTooltip] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const openWhitepaper = () => {
    window.open("https://www.canva.com/design/DAGh5LsjigY/QPz0ATv7BqyZajTX5AT1Dg/view?utm_content=DAGh5LsjigY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=ha9c7dba6df", "_blank");
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-900">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="w-12 h-12 bg-pink-500"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-50 -z-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AnimatedSphere />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Glowing orbs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-pink-600/20 blur-3xl"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl"></div>
      <div className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full bg-pink-700/20 blur-3xl"></div>

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
            Social Media DAO
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}>
          <WalletMultiButton className="!bg-gradient-to-r !from-pink-500 !to-purple-600 !rounded-lg !transition-all hover:!shadow-lg hover:!shadow-pink-500/25" />
        </motion.div>
        <div className="flex items-center space-x-4">
          {/* Add whitepaper button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
            onMouseEnter={() => setShowWhitepaperTooltip(true)}
            onMouseLeave={() => setShowWhitepaperTooltip(false)}>
            <motion.button
              onClick={openWhitepaper}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center bg-gradient-to-r from-purple-500 to-pink-600 
                px-4 py-2 rounded-lg border border-pink-500/30 shadow-lg shadow-pink-500/10
                hover:shadow-pink-500/30 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Whitepaper
            </motion.button>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: showWhitepaperTooltip ? 1 : 0,
                y: showWhitepaperTooltip ? 0 : 10,
              }}
              className="absolute -bottom-12 left-50 transform -translate-x-1/2 bg-black/80 backdrop-blur-md
                px-3 py-2 rounded text-sm whitespace-nowrap border border-pink-500/20">
              Read our detailed documentation
            </motion.div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Social Media DAO
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl mb-12 max-w-2xl text-gray-300">
          A decentralized autonomous organization for social media creators to
          collaborate, vote on proposals, and earn rewards through
          participation.
        </motion.p>

        {/* Key Metrics Row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl mb-12">
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/10">
            <AnimatedCounter
              value={2500}
              label="Community Members"
              prefix="+"
            />
          </motion.div>
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/10">
            <AnimatedCounter value={150} label="Active Proposals" />
          </motion.div>
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/10">
            <AnimatedCounter value={500000} label="Tokens Staked" />
          </motion.div>
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/10">
            <AnimatedCounter value={98} label="Success Rate" suffix="%" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 w-full max-w-4xl mb-16">
          <Link href="/stake">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl border border-pink-500/10 hover:border-pink-500/30 transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="mb-6 text-pink-500 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Stake Tokens</h3>
              <p className="mb-6 text-gray-400">
                Stake your tokens to gain voting power and earn rewards in the
                ecosystem.
              </p>
              <div
                className={`${
                  connected
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/25 cursor-pointer"
                    : "bg-gray-700 cursor-not-allowed pointer-events-none opacity-60"
                } text-white font-bold py-2 px-6 rounded-lg transition-all inline-block`}>
                {connected ? "Stake Now" : "Connect Wallet to Stake"}
              </div>
            </motion.div>
          </Link>

          <Link href="/proposals">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl border border-pink-500/10 hover:border-pink-500/30 transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="mb-6 text-pink-500 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Vote on Proposals</h3>
              <p className="mb-6 text-gray-400">
                Browse active proposals and cast your vote to shape the
                community&apos;s future.
              </p>
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all hover:shadow-lg hover:shadow-pink-500/25 inline-block">
                Explore Proposals
              </div>
            </motion.div>
          </Link>

          <Link href="/create-proposal">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl border border-pink-500/10 hover:border-pink-500/30 transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="mb-6 text-pink-500 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Create Proposal</h3>
              <p className="mb-6 text-gray-400">
                Have an idea? Create a proposal for the community to vote on and
                shape the DAO.
              </p>
              <div
                className={`${
                  connected
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/25"
                    : "bg-gray-700 pointer-events-none"
                } text-white font-bold py-2 px-6 rounded-lg transition-all inline-block`}>
                {connected ? "Create New Proposal" : "Connect Wallet to Create"}
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            How it Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl relative overflow-hidden border border-pink-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
              <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 w-14 h-14 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-pink-500/20">
                1
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Stake Your Tokens</h3>
              <p className="text-gray-400">
                Lock your SM tokens to gain voting power within the DAO
                ecosystem and earn ongoing rewards.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl relative overflow-hidden border border-pink-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
              <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 w-14 h-14 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-pink-500/20">
                2
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Vote & Participate</h3>
              <p className="text-gray-400">
                Cast votes on proposals and actively participate in governance
                to shape platform decisions.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl relative overflow-hidden border border-pink-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
              <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 w-14 h-14 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-pink-500/20">
                3
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-gray-400">
                Get rewards for your participation and contributions to help the
                DAO grow and succeed.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Token Distribution Infographic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-full max-w-4xl mt-16 mb-16">
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Token Distribution
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-pink-500/10">
              <TokenDistributionChart />
            </motion.div>

            <div className="space-y-6">
              <motion.div
                variants={cardVariants}
                className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-pink-500">
                <h3 className="font-bold text-lg mb-1">
                  Community & Fan Rewards (40%)
                </h3>
                <p className="text-gray-400 text-sm">
                  Incentivizing active participation, staking, and governance
                  engagement within the DAO ecosystem.
                </p>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#bd4bda]">
                <h3 className="font-bold text-lg mb-1">
                  Creator Incentives (30%)
                </h3>
                <p className="text-gray-400 text-sm">
                  Supporting content creators through grants, rewards, and
                  fan-driven funding mechanisms.
                </p>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#9013fe]">
                <h3 className="font-bold text-lg mb-1">
                  Development & Platform Growth (20%)
                </h3>
                <p className="text-gray-400 text-sm">
                  Funding continuous platform enhancements, security audits, and
                  ecosystem expansion.
                </p>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#6d00c1]">
                <h3 className="font-bold text-lg mb-1">
                  Treasury & Governance Reserve (10%)
                </h3>
                <p className="text-gray-400 text-sm">
                  Managed by the DAO for long-term sustainability, market
                  stabilization, and emergency funding.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Governance Process Infographic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full max-w-4xl mb-16">
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Governance Process
          </h2>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500 z-0"></div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  ),
                  title: "Proposal Creation",
                  description:
                    "Members submit detailed proposals outlining changes, initiatives, or resource allocations.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Discussion Period",
                  description:
                    "7-day period for community discussion, feedback, and proposal refinement.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Voting Phase",
                  description:
                    "5-day voting period where staked token holders cast votes proportional to their stake.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  ),
                  title: "Implementation",
                  description:
                    "Upon approval, the proposal is executed through smart contracts or designated implementers.",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/10 relative z-10">
                  <motion.div
                    variants={floatAnimation}
                    initial="initial"
                    animate="animate"
                    className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 flex items-center justify-center mb-4 mx-auto shadow-lg shadow-pink-500/20">
                    {step.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-center">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
