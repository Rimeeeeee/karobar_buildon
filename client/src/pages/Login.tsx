import React, { useState, useEffect } from "react";
import Rings from "../components/Rings";
import RegisterUser from "../components/RegisterUser";
import { Navigate, useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { readContract } from "thirdweb";
import { useKBRTokenContext } from "../context/context";
import TopBar from "../components/Topbar"; 
import SideBar from "../components/SideBar";

const Login: React.FC = () => {
  const [registered, setRegistered] = useState(false);
  const address = useActiveAccount()?.address;
  const { PeopleContract } = useKBRTokenContext();
  const navigate = useNavigate();
  useEffect(() => {
    const checkUserStatus = async () => {
      if (address) {
        try {
          const response = await readContract({
            contract: PeopleContract,
            method: "function isAUser(address) view returns (bool)",
            params: [address],
          });
          console.log(registered);

          setRegistered(response);
        } catch (error) {
          console.error("Failed to check user status", error);
        }
      }
    };

    checkUserStatus();
  }, [address, PeopleContract]);
  useEffect(() => {
    const nav = () => {
      if (registered) {
        navigate("/");
      }
      console.log(registered);
    };
    nav();
    return () => {};
  }, [registered]);

  return (
    <div className="relative w-screen h-screen flex flex-col">
      {/* Include the TopBar at the top */}
      <TopBar />
      {/* <SideBar /> */}
      <div className="relative w-full h-full flex flex-1">
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <Rings />
        </div>
        <div className="absolute top-0 left-0 w-full h-full z-5 bg-black bg-opacity-50"></div>
        <div className="relative w-full h-full flex items-center justify-start z-20 p-4">
          <div className="w-full max-w-md md:ml-40 flex items-center justify-center">
            <RegisterUser />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
