import React, { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { createWallet } from "thirdweb/wallets"
import { prepareContractCall, sendTransaction } from "thirdweb"
import { upload } from "thirdweb/storage"
import Vanta from "../components/Vanta"
import { useKBRTokenContext } from "../context/context"
import { ethers } from "ethers"

const CreateInsurance = () => {
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    coverage: "",
    mindepositamount: "",
    depositamountmonthwise: "",
    duration: "",
    insurancetype: "",
    safefees: "",
  })
  const [createInsuranceSuccess, setCreateInsuranceSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { InsuranceContract, client } = useKBRTokenContext()
  const address = useActiveAccount()?.address

  const handleInsuranceCreation = async () => {
    try {
      if (
        formState.name &&
        formState.description &&
        formState.coverage &&
        formState.mindepositamount &&
        formState.depositamountmonthwise &&
        formState.duration &&
        formState.insurancetype &&
        formState.safefees
      ) {
        const wallet = createWallet("io.metamask")
        const connectedAccount = await wallet.connect({ client })

        const transaction = await prepareContractCall({
          contract: InsuranceContract,
          method:
            "function createInsurance(string _name, string _description, string _coverage, uint256 _min_deposit_amount, uint256 _deposit_amount_monthwise, uint256 _duration, string _insurance_type, uint256 _safe_fees) payable",
          params: [
            formState.name,
            formState.description,
            formState.coverage,
            ethers.parseEther(formState.mindepositamount),
            ethers.parseEther(formState.depositamountmonthwise),
            BigInt(formState.duration),
            formState.insurancetype,
            ethers.parseEther(formState.safefees),
          ],
          value: ethers.parseEther(formState.safefees),
        })

        const { transactionHash } = await sendTransaction({
          transaction,
          account: connectedAccount,
        })

        if (transactionHash) {
          setCreateInsuranceSuccess(true)
          alert("Insurance created successfully")
          setTimeout(() => setCreateInsuranceSuccess(false), 3000)
          setFormState({
            name: "",
            description: "",
            coverage: "",
            mindepositamount: "",
            depositamountmonthwise: "",
            duration: "",
            insurancetype: "",
            safefees: "",
          })
        }
      } else {
        setError("Please fill all fields correctly.")
      }
    } catch (err) {
      console.error("Error creating insurance:", err)
      setError("Failed to create insurance.")
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleInsuranceCreation()
  }

  return (
    <div className="h-screen flex items-center justify-center bg-transparent text-white">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Vanta />
      </div>
      <div className="bg-black z-10 hover:bg-zinc-900 bg-opacity-50 border-white border-2 p-4 md:p-8 rounded-lg shadow-lg max-w-sm md:max-w-2xl lg:max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Your Insurance!
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid layout for two fields on the same line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-medium">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter name for your insurance"
                value={formState.name}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="description" className="text-sm font-medium">
                Description:
              </label>
              <input
                type="text"
                id="description"
                name="description"
                placeholder="Enter a description for viewers"
                value={formState.description}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="coverage" className="text-sm font-medium">
                Coverage:
              </label>
              <input
                type="text"
                id="coverage"
                name="coverage"
                placeholder="Say how insurance covers individual"
                value={formState.coverage}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="mindepositamount" className="text-sm font-medium">
                Min Deposit Amount:
              </label>
              <input
                type="text"
                id="mindepositamount"
                name="mindepositamount"
                placeholder="Min Deposit Amount"
                value={formState.mindepositamount}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="depositamountmonthwise"
                className="text-sm font-medium"
              >
                Deposit Amount Monthwise:
              </label>
              <input
                type="text"
                id="depositamountmonthwise"
                name="depositamountmonthwise"
                placeholder="Deposit Amount Monthwise"
                value={formState.depositamountmonthwise}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration:
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                placeholder="Enter duration"
                value={formState.duration}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="insurancetype" className="text-sm font-medium">
                Insurance Type:
              </label>
              <input
                type="text"
                id="insurancetype"
                name="insurancetype"
                placeholder="Insurance Type"
                value={formState.insurancetype}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="safefees" className="text-sm font-medium">
                Safe Fees:
              </label>
              <input
                type="text"
                id="safefees"
                name="safefees"
                placeholder="Enter safe fees"
                value={formState.safefees}
                onChange={handleChange}
                className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-8 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
          >
            Create Insurance
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateInsurance
