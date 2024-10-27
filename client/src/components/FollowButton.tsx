import React, { useState, useEffect } from "react";
import { prepareContractCall, readContract, sendTransaction } from "thirdweb";
import { useKBRTokenContext } from "../context/context";
import { useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

interface FollowButtonProps {
  userId: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId }) => {
  const {PeopleContract,client } = useKBRTokenContext();
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const { address } = useActiveAccount() || {}; 

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (PeopleContract && address) {
        try {
          
          const followersReadonly: readonly string[] = await readContract({
            contract: PeopleContract,
            method: "function getFollowers(address _creator) view returns (address[])",
            params: [userId],
          });

          
          const followers: string[] = [...followersReadonly];

          
          const isUserFollowing = followers.includes(address);
          setIsFollowing(isUserFollowing);
        } catch (error) {
          console.error("Failed to check follow status", error);
        }
      }
    };

    checkFollowStatus();
  }, [PeopleContract, userId, address]);

  const handleFollowClick = async () => {
    if (!PeopleContract || !address) return;
   
    try {
      const method = isFollowing ? "unfollow" : "follow";
      const wallet = createWallet("io.metamask")
      const account = await wallet.connect({ client })

      const transaction = await prepareContractCall({
        contract: PeopleContract,
        method: `function ${method}(address _user)`,
        params: [userId],
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account, 
      });

      console.log(`${method.charAt(0).toUpperCase() + method.slice(1)} successful`, transactionHash);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(`Failed to ${isFollowing ? "unfollow" : "follow"}`, error);
    }
  };

  return (
    <button
      onClick={handleFollowClick}
      className={`px-4 py-2 rounded ${isFollowing ? "bg-white-800 text-blue" : "bg-blue-500 text-white"}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;