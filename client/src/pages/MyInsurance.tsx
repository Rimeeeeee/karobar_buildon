import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useKBRTokenContext } from "../context/context";
import { readContract } from "thirdweb";
import { download } from "thirdweb/storage";
import InsuranceCard from "./InsuranceCard";
import { useActiveAccount } from "thirdweb/react";
import InsuranceCardB from "./InsuranceCardb";
import InsuranceCardb from "./InsuranceCardb";

const MyInsurance = () => {
  const [insurances, setInsurances] = useState<any[]>([]);
  const {client,InsuranceContract}= useKBRTokenContext();
  const [loading, setLoading] = useState<boolean>(true);
  const address = useActiveAccount()?.address;
  useEffect(() => {
    const getMyInsurances = async () => {
      try {
        const insuranceData = await readContract({
          contract: InsuranceContract,
          method:"function getInvestmentsBought(address _address) view returns ((uint256 pid, address creator, string name, string description, string coverage, uint256 min_deposition_amount, uint256 deposit_amount_monthwise, uint256 duration, uint256 totalamount, uint256 no_of_investors, string insurance_type, uint256 safe_fees, address[] inverstorPid)[])",
          params: [String(address)],
        });

        console.log("Insurance Data:", insuranceData);

       
        setInsurances(Array.from(insuranceData));
        setLoading(false); 
      } catch (error: any) {
        console.error("Error fetching Insurances", error);
        setLoading(false);
      }
    };

    getMyInsurances();
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
      <h2 className="text-2xl font-bold mb-6 text-center">
          My Insurances
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10 m-1">
        {insurances.map((insurance, index) => (
          <InsuranceCardb
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

export default MyInsurance;
