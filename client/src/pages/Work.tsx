import React, { useEffect, useState } from "react";
import axios from "axios";
import Vanta from "../components/Vanta";

interface ApiResponse {
  chainId: number;
  sources?: string; // Optional, since aggregators may not have this field
  aggregators?: string; // Optional
}

const CombinedDataFetcher: React.FC = () => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [dataType, setDataType] = useState<"sources" | "aggregators">("sources");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error state on new fetch
      try {
        const response = await axios.get<ApiResponse>(
          `https://snowy-lingering-sanctuary.quiknode.pro/585d7141493d2482a751bde90e648a45b48fc7cc/addon/688/${dataType}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Determine the correct field to use based on the dataType
        const dataField =
          dataType === "sources" ? response.data.sources : response.data.aggregators;

        // Check if dataField is a string and convert it into an array
        if (dataField) {
          const dataArray =
            typeof dataField === "string" ? dataField.split(",").slice(1) : dataField;
          setData(dataArray.map((item) => item.trim())); // Trim whitespace
        } else {
          throw new Error(`No valid data available for ${dataType}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleDataType = () => {
    setDataType((prev) => (prev === "sources" ? "aggregators" : "sources"));
    setCurrentPage(1); // Reset page to 1 on type change
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-gray-200">
        Loading...
      </div>
    );

  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 relative mt-20">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Vanta />
      </div>
      <div className="max-w-lg mx-auto p-3 z-10 bg-transparent hover:bg-zinc-950 rounded-lg shadow-lg border-2 border-white relative">
        <h2 className="text-3xl font-semibold text-center text-blue-400 mb-6">
          {dataType === "sources" ? "Ethereum Sources" : "Ethereum Aggregators"}
        </h2>

        {/* Toggle Button */}
        <div className="flex justify-center mb-4 z-10">
          <button
            onClick={toggleDataType}
            className={`px-4 py-2 rounded ${dataType === "sources" ? "bg-blue-600" : "bg-blue-500"} text-gray-200`}
          >
            Toggle to {dataType === "sources" ? "Aggregators" : "Sources"}
          </button>
        </div>

        <ul className="space-y-4">
          {currentItems.map((item, index) => (
            <li
              key={index}
              className="flex items-center bg-zinc-900 p-4 rounded-lg shadow text-gray-100 hover:bg-gray-900 border-2 border-white transition duration-150"
            >
              <span className="font-bold text-blue-400 mr-4">
                {indexOfFirstItem + index + 1}.
              </span>
              <p>{item}</p>
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-900 text-gray-300 rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500"}`}
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 bg-gray-900 text-gray-300 rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500"}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombinedDataFetcher;
