import React, { useState } from "react"
import { prepareContractCall, sendTransaction } from "thirdweb"
import { createWallet } from "thirdweb/wallets"
import { useKBRTokenContext } from "../context/context"
import { ethers } from "ethers"
interface InsuranceSchemeProps {
  pid: number
  name: string
  description: string
  coverage: string
  min_deposit_amount:number
  deposit_amount_monthwise:number
  duration: number
  totalamount:number
  no_of_investors: number
  insurance_type: string
  safe_fees:number
}

const InsuranceCard: React.FC<InsuranceSchemeProps> = ({
  pid,
  name,
  description,
  coverage,
  min_deposit_amount,
  deposit_amount_monthwise,
  duration,
  totalamount,
  no_of_investors,
  insurance_type,
  safe_fees,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const { client, InsuranceContract } = useKBRTokenContext()
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(Number(e.target.value))
  }

  const handleBuyInsurance = async () => {
    const wallet = createWallet("io.metamask")
    const account = await wallet.connect({ client })
    const transaction = await prepareContractCall({
      contract: InsuranceContract,
      method: "function depositInitialAmount(uint256 _pid) payable",
      params: [BigInt(pid)],
      value: ethers.parseEther(String(Number(min_deposit_amount)/1e18)),
    })
    const { transactionHash } = await sendTransaction({
      transaction,
      account,
    })
  }

  return (
    <div className="bg-gradient-to-r from-black via-gray-900 to-black border-2 border-gray-600 rounded-xl shadow-lg transition-shadow duration-500 p-6 mb-6 max-w-md mx-auto ">
      <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
        {name}
      </h2>
      <p className="text-gray-400 mb-6">{description}</p>

      <div className="mb-4 space-y-2">
        <p className="text-lg">
          <span className="font-semibold">Coverage:</span> {coverage}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Insurance Type:</span>{" "}
          {insurance_type}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Safe Fees:</span> {Number(safe_fees)/1e18} ETH
        </p>
        <p className="text-lg">
          <span className="font-semibold">Monthly Deposit:</span>{" "}
          {Number(deposit_amount_monthwise)/1e18} ETH
        </p>
        <p className="text-lg">
          <span className="font-semibold">Min Deposit Amount:</span> {Number(min_deposit_amount)/1e18} ETH
        </p>
        <p className="text-lg">
          <span className="font-semibold">Duration:</span> {Number(duration)} months
        </p>
        <p className="text-lg">
          <span className="font-semibold">Total Amount:</span> {Number(totalamount)/1e18} ETH
        </p>
        <p className="text-lg">
          <span className="font-semibold">Number of Investors:</span>{" "}
          {Number(no_of_investors)}
        </p>
      </div>
      <button
        onClick={handleBuyInsurance}
        className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-2xl hover:from-purple-700 hover:to-blue-600 transition-all duration-300 ease-in-out"
      >
        Buy Insurance
      </button>
    </div>
  )
}

export default InsuranceCard