import React, { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { upload } from "thirdweb/storage";
import Vanta from "../components/Vanta";
import { useKBRTokenContext } from "../context/context";

const CreateCampaign = () => {
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    deadline: "",
    imageHash: "",
  });
  const [createCampaignSuccess, setCreateCampaignSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { BetterIndia, client } = useKBRTokenContext();
  const address = useActiveAccount()?.address;

  const handleCampaignCreation = async () => {
    try {
      if (
        formState.title &&
        formState.description &&
        formState.deadline &&
        formState.imageHash
      ) {
        const wallet = createWallet("io.metamask");
        const connectedAccount = await wallet.connect({ client });

        const transaction = await prepareContractCall({
          contract: BetterIndia,
          method:
            "function createGift(string _title, string _description, uint256 _deadline, string _imageHash)",
          params: [
            formState.title,
            formState.description,
            BigInt(formState.deadline),
            formState.imageHash,
          ],
        });
       console.log( BigInt(new Date(formState.deadline).getTime()));
        const { transactionHash } = await sendTransaction({
          transaction,
          account: connectedAccount,
        });

        if (transactionHash) {
          setCreateCampaignSuccess(true);
          alert("Campaign created successfully");
          setTimeout(() => setCreateCampaignSuccess(false), 3000);
          setFormState({
            title: "",
            description: "",
            deadline: "",
            imageHash: "",
          });
        }
      } else {
        setError("Please fill all fields correctly.");
      }
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError("Failed to create campaign.");
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uris = await upload({
          client,
          files: [file],
        });
        setFormState((prevState) => ({
          ...prevState,
          imageHash: uris,
        }));
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCampaignCreation();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-transparent text-white">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Vanta />
      </div>
      <div className="bg-black z-10 hover:bg-zinc-900 bg-opacity-50 border-white border-2 p-4 md:p-8 rounded-lg shadow-lg max-w-sm md:max-w-2xl lg:max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Your Gift!</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="title" className="text-sm font-medium">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter title for your campaign"
              value={formState.title}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="text-sm font-medium">Description:</label>
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
            <label htmlFor="deadline" className="text-sm font-medium">Deadline:</label>
            <input
              type="text"
              id="deadline"
              name="deadline"
              placeholder="Deadline should be in future(in months)"
              value={formState.deadline}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="imageHash" className="text-sm font-medium">Campaign Picture:</label>
            <input
              type="file"
              id="imageHash"
              name="imageHash"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 border border-gray-800 bg-zinc-950 text-white rounded-lg file:py-2 file:px-4 file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-700"
            />
          </div>

          <button
            type="submit"
            className="mt-8 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
          >
            Create Campaign
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
