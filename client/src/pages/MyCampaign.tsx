import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Campaign from "../components/Campaign";
import { useKBRTokenContext } from "../context/context";
import { readContract } from "thirdweb";
import { download } from "thirdweb/storage";
import { useActiveAccount } from "thirdweb/react";

const MyCampaign = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const { BetterIndia, client } = useKBRTokenContext();
  const [loading, setLoading] = useState<boolean>(true);
  const address=useActiveAccount()?.address;
  const handleDonate = (amount: number) => {
    console.log(`Donated ${amount} ETH`);
  };

  useEffect(() => {
    const getAllCampaigns = async () => {
      try {
        const campaignData = await readContract({
          contract: BetterIndia,
          method:
            "function getGifts() view returns ((string title, string description, string imageHash, address creator, uint256 deadline, uint256 amountCollected, address[] donators)[])",
          params: [],
        });

        console.log("Campaign Data:", campaignData);

        const campaignsWithImages = await Promise.all(
          campaignData.map(async (campaign: any) => {
            if (campaign.imageHash) {
              const response = await download({
                client,
                uri: campaign.imageHash, 
              });
              const fileBlob = await response.blob();
              const fileUrl = URL.createObjectURL(fileBlob);
              return { ...campaign, imageHash: fileUrl };
            }
          
            return campaign;
          })
        );

        setCampaigns(Array.from(campaignsWithImages));
        setLoading(false); 
      } catch (error: any) {
        console.error("Error fetching Campaigns", error);
        setLoading(false);
      }
    };

    getAllCampaigns();
  }, [BetterIndia, client]);

  if (loading) {
    return <p className="text-white">Loading Campaigns...</p>;
  }

  if (!campaigns.length) {
    return <p className="text-white">No Campaigns currently available.</p>;
  }

  console.log(campaigns);

  return (
    <div className="mt-20">
      <div className="text-center mb-6 flex flex-col md:flex-row items-center justify-center">
        <NavLink
          to="/createcampaigns"
          className="py-1 w-full px-2 md:w-64 m-1 bg-blue-500 text-white rounded-md font-bold hover:bg-green-600 transition-all"
        >
          Create Campaigns
        </NavLink>

        <NavLink
          to="/mycampaigns"
          className="py-1 px-2 w-full md:w-64 m-1 bg-blue-500 text-white rounded-md font-bold hover:bg-green-600 transition-all"
        >
          My Campaigns
        </NavLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10 m-1">
        {campaigns.filter((campaign) => campaign.creator === address).map((campaign, index) => (
          <Campaign
            campaignId={index}
            title={campaign.title}
            image={campaign.imageHash}
            description={campaign.description}
            ownerAddress={campaign.creator}
            deadline={campaign.deadline}
            amountCollected={campaign.amountCollected}
            donators={campaign.donators.length}
            onDonate={handleDonate}
          />
        ))}
      </div>
    </div>
  );
};

export default MyCampaign;
