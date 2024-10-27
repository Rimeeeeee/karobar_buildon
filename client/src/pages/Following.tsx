import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { readContract } from "thirdweb";
import { download } from "thirdweb/storage";

interface Following {
  address: string;
  name: string;
  image_url: string;
}

const FollowingPage: React.FC<{ contract: any }> = ({ contract }) => {
  const { creatorAddress } = useParams<{ creatorAddress: string }>();
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!creatorAddress) return;

      try {
        // Fetch following addresses
        const response = await readContract({
          contract,
          method:
            "function getFollowing(address _creator) view returns (address[])",
          params: [creatorAddress],
        });

       
        const followingData = await Promise.all(
          response.map(async (followingAddress: string) => {
            const userInfo = await readContract({
              contract,
              method:
                "function getUserById(address _user) view returns ((uint256 uid, address userid, string name, string bio, string image_hash, string caption, uint256 dailycheckin, uint256[] dailycheckins, address[] followers, address[] following, uint256 token, bool blacklisted, uint256 userRating, bool verifiedUser))",

              params: [followingAddress],
            });

            
            const response = await download({
              client: contract.client,
              uri: `ipfs://${userInfo.image_hash}`, 
            });
            const fileBlob = await response.blob();
            const imageUrl = URL.createObjectURL(fileBlob);

            return {
              address: userInfo.userid,
              name: userInfo.name,
              image_url: imageUrl,
            };
          }),
        );

        setFollowing(followingData);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [contract, creatorAddress]);

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Followers of {creatorAddress}</h1>

      {/* Loading state */}
      {loading && <p className="text-gray-500">Loading followings...</p>}

      {/* Error state */}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Display followings */}
      {!loading && !error && (
        <ul>
          {following.length === 0 ? (
            <p className="text-gray-500">No following found.</p>
          ) : (
            following.map((followe, index) => (
              <li key={index} className="flex items-center space-x-4 mb-4">
                <img
                  src={followe.image_url}
                  alt={followe.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <Link to={`/profile/${followe.address}`}>
                    <p className="text-cream-500 font-bold hover:none">
                      {followe.name}
                    </p>
                  </Link>
                  <p className="text-gray-500 text-sm">{followe.address}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};


export default FollowingPage;

