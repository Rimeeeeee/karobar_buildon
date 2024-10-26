import React, { useEffect, useState } from "react";
import { prepareContractCall, readContract, sendTransaction } from "thirdweb";
import { useKBRTokenContext } from "../../context/context";
import { download } from "thirdweb/storage";
import { useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { ethers } from "ethers";
import { AiOutlineCheckCircle } from "react-icons/ai";

interface NFTProps {
  papers: boolean;
  creatorAddress: string;
  sellerAddress: string;
  price: number;
  uri: string;
  tokenId: string;
  forSale: boolean;
  location: string;
  size: string | number;
}

const RWAToken: React.FC<NFTProps> = ({
  papers,
  creatorAddress,
  sellerAddress,
  price,
  uri,
  tokenId,
  forSale,
  location,
  size,
}) => {
  const [image, setImage] = useState("");
  const { PropertyNFTContract, client } = useKBRTokenContext();
  const activeAccountAddress = useActiveAccount()?.address;
  console.log("papers:", papers);
  console.log("creatorAddress:", creatorAddress);
  console.log("sellerAddress:", sellerAddress);
  console.log("price:", price);
  console.log("uri:", uri);
  console.log("tokenId:", tokenId);
  console.log("forSale:", forSale);
  console.log("location:", location);
  console.log("size:", size);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const tokenURI = await readContract({
          contract: PropertyNFTContract,
          method: "function tokenURI(uint256 tokenId) view returns (string)",
          params: [BigInt(parseInt(tokenId)) as bigint],
        });
        console.log(tokenURI);
        const response = await download({
          client,
          uri: `${tokenURI}`,
        });
        const fileBlob = await response.blob();
        const fileUrl = URL.createObjectURL(fileBlob);
        setImage(fileUrl);
      } catch (error) {
        console.error("Error fetching image: ", error);
      }
    };

    fetchImage();
  }, [uri, tokenId, PropertyNFTContract, client]);

  const buyNFTs = async (tokenId: number, price: number) => {
    try {
      const wallet = createWallet("io.metamask");
      const account = await wallet.connect({ client });

      const transaction = await prepareContractCall({
        contract: PropertyNFTContract,
        method: "function executeSale(uint256 tokenId) payable",
        params: [BigInt(tokenId)],
        value: BigInt(price.toString()),
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      console.log("Transaction successful:", transactionHash);
    } catch (error) {
      console.error("Failed to buy NFT:", error);
    }
  };

  return (
    <div
      className={`w-full z-10 max-w-xs mx-auto p-4 rounded-lg shadow-lg text-white ${
        forSale ? "border-2 border-green-500" : "border-2 border-white"
      }`}
    >
      <div>
        <img src={image} alt={`NFT`} className="w-full rounded-md" />
      </div>
      <div className="flex items-center mb-4 mt-2 border-y-2 p-2 border-white">
        <div className="ml-4 flex">
          {/* Verified Tick Icon */}
          <span className="flex items-center flex-col">
            <span className="flex items-center flex-row">
              <AiOutlineCheckCircle className="text-green-500 mr-1" /> Owner
              Verified
            </span>
            <p className="text-lg text-gray-100 mt-2">
              {sellerAddress.slice(0, 8) + "..." + sellerAddress.slice(-6)}
            </p>
          </span>
        </div>
      </div>
      <div className="mb-2">
        <h4 className="text-md font-medium">Location:</h4>
        <p className="text-sm text-gray-300">{location}</p>
      </div>
      <div className="mb-4">
        <h4 className="text-md font-medium">Size:</h4>
        <p className="text-sm text-gray-300">{size}</p>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <div className="flex flex-row">
          <h3 className="text-xl font-bold">Price:</h3>
          <p className="text-xl font-bold text-blue-400">
            {" "}
            {ethers.formatEther(price.toString())} ETH
          </p>
        </div>
        {sellerAddress !== activeAccountAddress && (
          <button
            className="buy-now-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => buyNFTs(Number(tokenId), price)}
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
};

export default RWAToken;
