import React, { useEffect, useState } from "react";
import RWAToken from "./RWAToken";
import { readContract } from "thirdweb";
import { useKBRTokenContext } from "../../context/context";

const BuyRWA: React.FC = () => {
  const { PropertyNFTContract, PeopleContract } = useKBRTokenContext();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getAllNFTs = async () => {
      try {
        const nftData = await readContract({
          contract: PropertyNFTContract,
          method:
            "function getAllNFTs() view returns ((uint256 tokenId, address owner, address seller, uint256 price, bool currentlyListed, string location, string size, string papers, bool forSale)[])",
          params: [],
        });
        console.log("NFT Data:", nftData);

        setNfts(Array.from(nftData));
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching NFTs", error);
        setLoading(false);
      }
    };

    getAllNFTs();
  }, [PropertyNFTContract, PeopleContract]);

  if (loading) {
    return <p className="text-white">Loading NFTs...</p>;
  }

  if (!nfts.length) {
    return <p className="text-white">No NFTs available for sale.</p>;
  }

  console.log(nfts);

  return (
    <div className="h-screen p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 overflow-y-auto no-scrollbar mt-12">
        {nfts.map((nft, index) => (
          <RWAToken
            key={`${nft.tokenId.toString()}-${index}`}
            papers={nft.papers}
            creatorAddress={nft.owner}
            sellerAddress={nft.seller}
            price={nft.price}
            uri={nft.papers}
            tokenId={nft.tokenId.toString()}
            forSale={nft.forSale}
            location={nft.location}
            size={nft.size}
          />
        ))}
      </div>
    </div>
  );
};

export default BuyRWA;
