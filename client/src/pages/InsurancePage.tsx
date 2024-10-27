import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useKBRTokenContext } from "../context/context";
import { readContract } from "thirdweb";
import { download } from "thirdweb/storage";
import InsuranceCard from "./InsuranceCard";

const InsurancePage = () => {
  const [insurances, setInsurances] = useState<any[]>([]);
  const {client,InsuranceContract}= useKBRTokenContext();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getAllInsurances = async () => {
      try {
        const insuranceData = await readContract({
          contract: InsuranceContract,
          method:"function getAllInsurances() view returns ((uint256 pid, address creator, string name, string description, string coverage, uint256 min_deposition_amount, uint256 deposit_amount_monthwise, uint256 duration, uint256 totalamount, uint256 no_of_investors, string insurance_type, uint256 safe_fees, address[] inverstorPid)[])",
          params: [],
        });

        console.log("Insurance Data:", insuranceData);

       
        setInsurances(Array.from(insuranceData));
        setLoading(false); 
      } catch (error: any) {
        console.error("Error fetching Insurances", error);
        setLoading(false);
      }
    };

    getAllInsurances();
  }, [InsuranceContract, client]);

  if (loading) {
    return <p className="text-white">Loading Insurances...</p>;
  }

  if (!insurances.length) {
    return <p className="text-white">No Insurances currently available.</p>;
  }

  console.log(insurances);

  return (
    <div className="mt-20">
      <div className="text-center mb-6 flex flex-col md:flex-row items-center justify-center">
        <NavLink
          to="/insurance/create"
          className="py-1 w-full px-2 md:w-64 m-1 bg-blue-500 text-white rounded-md font-bold hover:bg-green-600 transition-all"
        >
          Create Insurances
        </NavLink>
        <NavLink
          to="/insurance/myinsurance"
          className="py-1 px-2 w-full md:w-64 m-1 bg-blue-500 text-white rounded-md font-bold hover:bg-green-600 transition-all"
        >
          My Insurances
        </NavLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10 m-1">
        {insurances.map((insurance, index) => (
          <InsuranceCard
            pid={insurance.pid}
            name={insurance.name}
            description={insurance.description}
            coverage={insurance.coverage}
            min_deposit_amount={insurance.min_deposition_amount}
            deposit_amount_monthwise={insurance.deposit_amount_monthwise}
            duration={insurance.duration}
            totalamount={insurance.totalamount}
            no_of_investors={insurance.no_of_investors}
            insurance_type={insurance.insurance_type}
            safe_fees={insurance.safe_fees}
          />
        ))}
      </div>
    </div>
  );
};

export default InsurancePage;
