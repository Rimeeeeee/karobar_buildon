import React, { useEffect, useState } from "react"
import { AiOutlineUser, AiOutlineTeam } from "react-icons/ai"
import { useParams, Link } from "react-router-dom"

import { readContract } from "thirdweb"
import { useKBRTokenContext } from "../context/context"
import { download } from "thirdweb/storage"

import { useActiveAccount } from "thirdweb/react"
import Balance from "../components/Balance"
import FollowButton from "../components/FollowButton"


const ViewProfile: React.FC = () => {
  const { userId } = useParams()
  const { PeopleContract, client } = useKBRTokenContext()

  const [user, setUser] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const acc = useActiveAccount()?.address?.toLowerCase()

  useEffect(() => {
    const getUser = async () => {
      if (userId && PeopleContract) {
        try {
          const data = await readContract({
            contract: PeopleContract,
            method:
              "function getUserById(address _user) view returns ((uint256 uid, address userid, string name, string bio, string image_hash, string caption, uint256 dailycheckin, uint256[] dailycheckins, address[] followers, address[] following, uint256 token, bool blacklisted, uint256 userRating, bool verifiedUser))",
            params: [userId.toLowerCase()],
          })
          setUser({
            name: data.name,
            userid: data.userid,
            bio: data.bio,
            imageHash: data.image_hash,
            followers: data.followers.length,
            following: data.following.length,
            userrating: Number(data.userRating),
          })

          try {
            const response = await download({
              client,
              uri: `${data.image_hash}`,
            })

            const fileBlob = await response.blob()
            const fileUrl = URL.createObjectURL(fileBlob)
            setImageUrl(fileUrl)
          } catch (error) {
            console.error("Failed to fetch user image", error)
            setImageUrl("path_to_dummy_image.jpg")
          }
        } catch (error) {
          console.error("Failed to fetch user data", error)
        }
      }
    }

    getUser()
  }, [userId, PeopleContract, client])

  return (
    <div className="p-6 w-full h-full max-w-screen-lg mx-auto">
      {user && (
        <div className="lg:mt-6 p-6 bg-black rounded-lg shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-4 mt-6">
            <img
              src={imageUrl}
              alt="Profile"
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white"
            />
            <div className="flex flex-col space-y-3 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                {user.name}
              </h1>
              <p className="text-gray-400 text-sm sm:text-lg hidden lg:block">
                @{user.userid}
              </p>
              <p className="text-gray-400 text-sm sm:text-lg block lg:hidden">
                @{user.userid?.slice(0, 4) + "..." + user.userid?.slice(-4)}
              </p>
              <p className="text-gray-300 text-base sm:text-lg">{user.bio}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 border-t-2 border-b-2 border-gray-500 py-4">
            <span className="text-lg text-gray-300">User Rating:</span>
            <span className="text-2xl text-red-500 font-semibold">
              {user.userrating}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4 border-b-2 border-gray-500 py-4">
            <span className="text-lg text-gray-300">Uniquely identify at:</span>
            {user.userid}
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-6 mt-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-3">
                <AiOutlineUser className="text-3xl text-gray-400" />
                <Link
                  to={`/followers/${user.userid}`}
                  className="flex flex-col items-center"
                >
                  <span className="text-xl font-bold text-white">
                    {user.followers}
                  </span>
                  <span className="text-gray-500 text-sm">Followers</span>
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center ">
              <div className="flex items-center space-x-3">
                <AiOutlineTeam className="text-3xl text-gray-400" />
                <Link
                  to={`/following/${user.userid}`}
                  className="flex flex-col items-center"
                >
                  <span className="text-xl font-bold text-white">
                    {user.following}
                  </span>
                  <span className="text-gray-500 text-sm">Following</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center">
              {acc === userId?.toLowerCase() ? (
                <Balance />
              ) : (
                <FollowButton userId={user.userid} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewProfile