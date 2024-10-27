import React, { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { prepareContractCall, sendTransaction } from "thirdweb";
import Vanta from "../components/Vanta";
import { useKBRTokenContext } from "../context/context";
import TestnetInfo from "./Info";

const CryptoSwap = () => {
  const [formState, setFormState] = useState({
    destinationAccount: "",
    tokenValue: "",
    destinationChain:""
  });
  const [createTransactionSuccess, setCreateTransactionSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { TokenTransferor, client } = useKBRTokenContext();
  const address = useActiveAccount()?.address;

  const handleTransactionCreation = async () => {
    try {
      if (formState.destinationAccount && formState.tokenValue) {
        const wallet = createWallet("io.metamask");
        const connectedAccount = await wallet.connect({ client });

        const transaction = await prepareContractCall({
          contract: TokenTransferor,
          method:
            "function transferTokensPayLINK(uint64 _destinationChainSelector, address _receiver, address _token, uint256 _amount) returns (bytes32 messageId)",
          params: [
            BigInt("14767482510784806043"),
            formState.destinationAccount,
            "0x88A2d74F47a237a62e7A51cdDa67270CE381555e",
            BigInt(formState.tokenValue),
          ],
        });
       
         console.log(BigInt("14767482510784806043"));
        const { transactionHash } = await sendTransaction({
          transaction,
          account: connectedAccount,
        });

        if (transactionHash) {
          setCreateTransactionSuccess(true);
          alert("Transaction created successfully. View on CCIP block explorer!");
          setTimeout(() => setCreateTransactionSuccess(false), 3000);
          setFormState({
            destinationAccount: "",
            tokenValue: "",
            destinationChain:""
          });
        }
      } else {
        setError("Please fill all fields correctly.");
      }
    } catch (err) {
      console.error("Error creating transaction:", err);
      setError("Failed to create transaction.");
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTransactionCreation();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-transparent text-white">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Vanta />
      </div>
      <div className="bg-black z-10 hover:bg-zinc-900 bg-opacity-50 border-white border-2 p-4 md:p-8 rounded-lg shadow-lg max-w-sm md:max-w-2xl lg:max-w-3xl">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Create Your Transaction!
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination Chain */}
          <div className="flex flex-col text-lg">
            <label htmlFor="chain" className="font-medium">
              Destination Chain: 14767482510784806043
            </label>
          </div>

          {/* Destination Address */}
          <div className="flex flex-col text-lg">
            <label htmlFor="destination" className="font-medium">
              Destination Address:
            </label>
            <input
              type="text"
              id="destination"
              name="destinationAccount"
              placeholder="Enter destination address"
              value={formState.destinationAccount}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Token Address */}
          <div className="flex flex-col text-lg">
            <label htmlFor="token" className="font-medium">
              Token address of ccip-bnm: 0x88A2d74F47a237a62e7A51cdDa67270CE381555e
            </label>
          </div>

          {/* Token Amount */}
          <div className="flex flex-col text-lg">
            <label htmlFor="amount" className="font-medium">
              Enter amount:
            </label>
            <input
              type="text"
              id="amount"
              name="tokenValue"
              placeholder="Enter amount to send"
              value={formState.tokenValue}
              onChange={handleChange}
              className="mt-1 p-3 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-8 py-3 px-5 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 w-full"
          >
            Create Transaction
          </button>
        </form>
      </div>

      {/* TestnetInfo Component */}
      <div className="z-10 mt-8">
        <TestnetInfo />
      </div>
    </div>
  );
};

export default CryptoSwap;
