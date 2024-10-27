import React, { useState } from "react";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useKBRTokenContext } from "../context/context";
import { useActiveAccount } from "thirdweb/react";

interface ProductProps {
  pid: number;
  name: string;
  imageHash: string;
  description: string;
  price: string;
  qty: number;
  onBuy: (pid: number) => void;
}

const Product: React.FC<ProductProps> = ({
  pid,
  name,
  imageHash,
  description,
  price,
  qty,
  onBuy,
}) => {
  const { Marketplace, client } = useKBRTokenContext();
  const address = useActiveAccount()?.address;
  const [loading, setLoading] = useState(false); // Loading state

  const handleBuy = async () => {
    setLoading(true); // Set loading state
    try {
      const wallet = createWallet("io.metamask");
      const account = await wallet.connect({ client });

      const transaction = await prepareContractCall({
        contract: Marketplace,
        method: "function buy(uint256 _pid)",
        params: [BigInt(pid + 1)],
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      console.log(`Transaction successful: ${transactionHash}`);
      onBuy(pid);
    } catch (error) {
      console.error("Buy failed", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="bg-gray-800 text-white shadow-lg w-full max-w-sm mx-auto rounded-lg overflow-hidden transition-transform transform hover:scale-105"> {/* Added scale effect */}
      {imageHash && (
        <div className="relative w-full h-64 overflow-hidden mb-4 mt-2">
          <img
            src={imageHash}
            alt={name}
            className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-75" 
            style={{ width: "100%", height: "100%", objectFit: "contain",marginTop:5}}// Added hover effect
          />
        </div>
      )}
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">{name}</h1>
        <p className="text-gray-300 mb-2">{description}</p>

        <div className="mb-2">
          <p className="font-semibold">Price: {Number(price)} KBR</p>
          <p className="text-gray-300">Available: {Number(qty)}</p>
        </div>

        <button
          onClick={handleBuy}
          disabled={loading} // Disable button while loading
          className={`w-full py-2 rounded-md text-white font-bold transition-all ${
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
          }`}
        >
          {loading ? "Processing..." : "Buy Now"} {/* Loading text */}
        </button>
      </div>
    </div>
  );
};

export default Product;
