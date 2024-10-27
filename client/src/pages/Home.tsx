import React from "react"
import { motion } from "framer-motion"
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa"
import landing1 from "../landing1.webp"
import { NavLink } from "react-router-dom"
import Rings from "../components/Rings"
import Birds from "../components/Birds"

const Home = () => {

  async function addKBR() {
    const tokenAddress =import.meta.env.VITE_KBR_CONTRACT_ADDRESS as string;  
    const tokenSymbol = 'KBR';  
    const tokenDecimals = 18; 
 
  
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', 
          options: {
            address: tokenAddress, 
            symbol: tokenSymbol, 
            decimals: tokenDecimals, 
            
          },
        },
      });
  
      if (wasAdded) {
        console.log('Token added!');
      } else {
        console.log('Token not added.');
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div
      className="bg-blue-900 min-w-screen text-white overflow-hidden"
      style={{}}
    >
      {/* Hero Section */}{" "}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Birds />
      </div>
      <motion.section
        className="min-h-screen flex flex-col items-center justify-center  text-center p-4 md:p-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          One Stop Solution for All Your DeFi Needs
        </motion.h1>
        <motion.p
          className="text-sm sm:text-md md:text-lg mb-6 md:mb-8 text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          From RWA Properties, Insurance, Crowdfunding, to KBR Token Rewards and
          Credit Score Tracking.
        </motion.p>
        <motion.div
          className="flex flex-col md:flex-row gap-4 md:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="flex items-center bg-blue-600 p-3 rounded-lg shadow-lg hover:bg-blue-500 transition-all">
            <button
              onClick={addKBR}
              className="w-full md:w-64 px-2 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all"
            >
              Add KBR to Wallet
            </button>
          </div>
          <NavLink
            to="/login"
            className="w-full md:w-64 flex items-center justify-center px-2 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all text-center"
          >
            Register
          </NavLink>
        </motion.div>

        {/* Additional Information */}
        <motion.p
          className="mt-6 text-sm sm:text-md md:text-lg text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          This application is currently on the Base Sepolia testnet. For any
          queries, please contact us at{" "}
          <a
            href="mailto:k4r034r@gmail.com"
            className="text-teal-400 hover:underline"
          >
            k4r034r@gmail.com
          </a>
          .
        </motion.p>
      </motion.section>
      {/* Features Section */}
      <motion.section
        className="py-12 px-4 md:px-8 bg-black bg-opacity-100"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-white">
          Our Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Feature 1: RWA Properties */}
          <motion.div
            className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">
              RWA Properties
            </h3>
            <p className="text-gray-300">
              Invest in real-world assets like properties, with full
              transparency and decentralized ownership.
            </p>
          </motion.div>

          {/* Feature 2: Insurance */}
          <motion.div
            className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 text-teal-400">
              Decentralized Insurance
            </h3>
            <p className="text-gray-300">
              Get coverage for your assets and investments through our
              decentralized insurance system.
            </p>
          </motion.div>

          {/* Feature 3: Crowdfunding */}
          <motion.div
            className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">
              Crowdfunding
            </h3>
            <p className="text-gray-300">
              Raise funds for your project or support other initiatives with
              transparent, on-chain crowdfunding.
            </p>
          </motion.div>

          {/* Feature 4: KBR Token */}
          <motion.div
            className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 text-teal-400">
              KBR Token Rewards
            </h3>
            <p className="text-gray-300">
              Earn KBR tokens through transactions, and redeem them for
              exclusive merchandise.
            </p>
          </motion.div>

          {/* Feature 5: Credit Score Tracking */}
          <motion.div
            className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">
              Credit Score Tracking
            </h3>
            <p className="text-gray-300">
              Build and monitor your DeFi credit score based on your on-chain
              activities and credibility.
            </p>
          </motion.div>

          {/* Feature 6: Smart Wallet Integration */}
          <motion.div
            className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 text-teal-400">
              Cross Chain Token Transfer
            </h3>
            <p className="text-gray-300">
              Secure and flexible transfer of multiple tokens over various
              popular chains.
            </p>
          </motion.div>
        </div>
      </motion.section>
      {/* Token Information */}
      <motion.section
        className="py-12 md:py-16 px-4 md:px-8 bg-blue-600 text-white text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Introducing KBR Token
        </h2>
        <p className="text-md md:text-lg mb-6">
          Earn KBR tokens for every transaction on our platform, and redeem them
          for exclusive perks, including merchandise and premium DeFi services.
        </p>
        <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
          <a href="https://github.com/Rimeeeeee/Karobar"><button className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-300 transition-all">
            Learn More About KBR
          </button></a>
          <button
            onClick={addKBR}
            className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-300 transition-all"
          >
            Add KBR to Wallet
          </button>
        </div>
      </motion.section>
      {/* Footer */}
      <motion.footer
        className="py-8 bg-gray-800 text-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-gray-400">© K4R034R. All Rights Reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-white">
          {/* GitHub */}
          <a
            href="https://github.com/Rimeeeeee/Karobar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal-500 transition"
          >
            <FaGithub size={24} />
          </a>

          {/* Founder 1 LinkedIn */}
          <a
            href="https://www.linkedin.com/in/soubhik-singha-mahapatra-487964255/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal-500 transition"
          >
            <FaLinkedin size={24} />
          </a>

          {/* Founder 2 LinkedIn */}
          <a
            href="https://www.linkedin.com/in/ishika-choudhury-b64a68261/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal-500 transition"
          >
            <FaLinkedin size={24} />
          </a>

          {/* Email */}
          <a
            href="mailto:k4r034r@gmail.com"
            className="hover:text-teal-500 transition"
          >
            <FaEnvelope size={24} />
          </a>
        </div>
      </motion.footer>
    </div>
  )
}

export default Home