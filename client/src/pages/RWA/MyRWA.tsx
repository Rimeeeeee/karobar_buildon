import React, { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { upload } from "thirdweb/storage";
import { useKBRTokenContext } from "../../context/context";
import { ethers } from "ethers";
import Vanta from "../../components/Vanta";

const CreateRWA: React.FC = () => {
  const [formState, setFormState] = useState({
    token_image: "",
    price: "",
    location: "",
    size: "",
    papers: "",
  });
  const [createPropertySuccess, setCreatePropertySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { KBRContract, PropertyNFTContract, client } = useKBRTokenContext();
  const address = useActiveAccount()?.address;

  const createProperty = async () => {
    try {
      if (!PropertyNFTContract?.address || !address) {
        throw new Error("Invalid contract or account address.");
      }

      const wallet = createWallet("io.metamask");
      const account = await wallet.connect({ client });

      const transaction = await prepareContractCall({
        contract: PropertyNFTContract,
        method:
          "function createProperty(string propertyURI, uint256 price, string _location, string _size, string _papers) payable returns (uint256)",
        params: [
          formState.token_image,
          BigInt(ethers.parseEther(formState.price)),
          formState.location,
          formState.size,
          formState.papers,
        ],
        value: ethers.parseEther("0.0001"),
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      console.log(
        "Property creation successful, transaction hash:",
        transactionHash,
      );
      return transactionHash;
    } catch (error) {
      console.error("Error during property creation:", error);
      setError("Failed to create property.");
      throw error;
    }
  };

  const handlePropertyCreation = async () => {
    try {
      if (
        formState.token_image &&
        formState.price &&
        formState.location &&
        formState.size &&
        formState.papers
      ) {
        await createProperty();
        setCreatePropertySuccess(true);
        alert("Property created successfully!");
        setTimeout(() => setCreatePropertySuccess(false), 3000);
        setFormState({
          token_image: "",
          price: "",
          location: "",
          size: "",
          papers: "",
        });
      } else {
        setError("Please fill all fields correctly.");
      }
    } catch (err) {
      console.error("Error creating property:", err);
      setError("Failed to create property.");
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
          token_image: uris,
        }));
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
      }
    }
  };

  const handleFileChange1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uris = await upload({
          client,
          files: [file],
        });
        setFormState((prevState) => ({
          ...prevState,
          papers: uris,
        }));
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePropertyCreation();
  };

  return (
    <div className="flex items-center justify-center h-[85vh] bg-transparent text-white p-4">
      {" "}
      <div className="absolute top-0 left-0 w-full h-full z-0 flex items-center justify-center">
        <Vanta />
      </div>
      <div className="bg-transparent z-10 hover:bg-zinc-900 mr-10 bg-opacity-100 border-white border-2 p-4 md:p-8 rounded-lg shadow-lg max-w-sm md:max-w-2xl lg:max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Your Property Token
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="token_image" className="text-sm font-medium">
              Token Image:
            </label>
            <input
              type="file"
              id="token_image"
              name="token_image"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 border border-gray-800 bg-zinc-950 text-white rounded-lg file:py-2 file:px-4 file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-700"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="price" className="text-sm font-medium">
              Price:
            </label>
            <input
              type="text"
              id="price"
              name="price"
              placeholder="Enter the price"
              value={formState.price}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="location" className="text-sm font-medium">
              Location:
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter the location"
              value={formState.location}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="size" className="text-sm font-medium">
              Size:
            </label>
            <input
              type="text"
              id="size"
              name="size"
              placeholder="Enter the property size"
              value={formState.size}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-800 bg-zinc-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="papers" className="text-sm font-medium">
              Property Papers:
            </label>
            <input
              type="file"
              id="papers"
              name="papers"
              onChange={handleFileChange1}
              className="mt-1 border border-gray-800 bg-zinc-950 text-white rounded-lg file:py-2 file:px-4 file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-700"
            />
          </div>

          <button
            type="submit"
            className="mt-20 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
          >
            Create Property Token
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRWA;
