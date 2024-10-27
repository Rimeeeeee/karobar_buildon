import React, { useEffect, useState } from "react"
import { prepareContractCall, readContract, sendTransaction } from "thirdweb"
import { createWallet } from "thirdweb/wallets"
import { ethers } from "ethers"
import { useKBRTokenContext } from "../context/context"
import { useActiveAccount } from "thirdweb/react"

interface CampaignProps {
  campaignId: number 
  title: string
  image?: string 
  description: string
  ownerAddress: string
  deadline: string
  amountCollected: string
  donators: number
  onDonate: (amount: number) => void
}

const Campaign: React.FC<CampaignProps> = ({
  campaignId,
  title,
  image,
  description,
  ownerAddress,
  deadline,
  amountCollected,
  donators,
  onDonate,
}) => {
  const [donationAmount, setDonationAmount] = useState(0)
  const { BetterIndia, client } = useKBRTokenContext()
  const [amount, setAmount] = useState(0)
  const address=useActiveAccount()?.address;
  const handleDonate = async () => {
    if (donationAmount > 0) {
      try {
        const wallet = createWallet("io.metamask")
        const account = await wallet.connect({ client })

        const transaction = await prepareContractCall({
          contract: BetterIndia,
          method: "function donateToBetterIndia(uint256 _id) payable",
          params: [BigInt(campaignId + 1)], 
          value: ethers.parseEther(String(donationAmount)),
        })

        const { transactionHash } = await sendTransaction({
          transaction,
          account,
        })

        console.log(`Transaction successful: ${transactionHash}`)
        onDonate(donationAmount) 
      } catch (error) {
        console.error("Donation failed", error)
      }
    } else {
      alert("Please enter a valid donation amount.")
    }
  }
  useEffect(() => {
    const getAmount = async () => {
      const data = await readContract({
        contract: BetterIndia,
        method:
          "function getGiftById(uint256 _id) view returns ((string title, string description, string imageHash, address creator, uint256 deadline, uint256 amountCollected, address[] donators))",
        params: [BigInt(campaignId + 1)],
      })
      console.log("donatedddddd" + data.amountCollected)
      setAmount(Number(data.amountCollected) / 10e18)
    }
    getAmount()
    return () => {}
  }, [])

  return (
    <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg w-full max-w-md mx-auto">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-300 mb-4">{description}</p>

      <div className="mb-4">
        <p className="font-semibold">Owner: {ownerAddress.slice(0, 6) + "..." + ownerAddress.slice(-4)}</p>
        {/* <p className="text-gray-400">No of donators: {donators}</p> */}
        <p className="font-semibold">Amount Collected: {amount} Eth</p>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Deadline: {Number(deadline)} months</p>
      </div>
      {ownerAddress !== address && (
      <div className="mb-4 flex flex-col md:flex-row">
        <label className="block text-gray-400">
          Enter Donation Amount (ETH):
        </label>
        <input
          type="number"
          value={donationAmount}
          onChange={(e) => setDonationAmount(Number(e.target.value))}
          className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
        />
      </div>
      )}
      {ownerAddress !== address && (
      <button
        onClick={handleDonate}
        className="w-full py-2 rounded-md text-white font-bold bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 transition-all"
      >
        Donate Now
      </button>
      )}
    </div>
  )
}

export default Campaign