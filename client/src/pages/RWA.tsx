import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import BuyRWA from "./RWA/BuyRWA";
import MyRWA from "./RWA/MyRWA";
import CreateRWA from "./RWA/CreateRWA";
import SideMenu from "./RWA/SideMenu";
import landing from "../landing.webp"; 
import Rings from "../components/Rings";
import Vanta from "../components/Vanta";

const RWA: React.FC = () => {
  const location = useLocation(); 

  
  const isRWARoute = location.pathname === "/rwa";

  return (
    <div className="flex h-screen relative">
      {isRWARoute && (
        <div className="absolute top-0 left-0 w-full h-full z-0 flex items-center justify-center">
          <Vanta />
        </div>
      )}

      <div className="flex-grow flex items-center justify-center relative z-40">
        <SideMenu />
        <Routes>
          <Route path="buy-rwa" element={<BuyRWA />} />
          <Route path="my-rwa" element={<MyRWA />} />
          <Route path="create-rwa" element={<CreateRWA />} />
        </Routes>

        {isRWARoute && (
          <div className="w-full flex justify-center items-center flex-col z-0">
            <h2 className="text-3xl sm:text-5xl font-bold text-primary text-white">
              Tokenize your Assets on Base!!!
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default RWA;