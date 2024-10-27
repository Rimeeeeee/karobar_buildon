import React from "react"
import { FaInfoCircle } from "react-icons/fa" 

const TestnetInfo: React.FC = () => {
  return (
    <div
      className="flex flex-col items-start bg-transparent border-blue-500 text-blue-700 p-4"
      role="alert"
    >
      <div className="flex">
        <FaInfoCircle className="mr-2 mt-1 text-green-600" />
        <p className="font-bold text-white">
          Currently on Base Sepolia Testnet
        </p>
      </div>
      <p className="text-blue-200">
        More tokens will be available when the app is live on Base Mainnet
      </p>
    </div>
  )
}

export default TestnetInfo
