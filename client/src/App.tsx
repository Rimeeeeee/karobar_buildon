import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import CryptoSwap from "./components/CryptoSwap";
import SideBar from "./components/SideBar";
import Home from "./pages/Home";
import TopBar from "./components/Topbar";
import Swap from "./pages/Swap";
import RWA from "./pages/RWA";
import Charity from "./pages/Charity";
import MyCampaign from "./pages/MyCampaign";
import Login from "./pages/Login";
import DailyLogin from "./pages/DailyLogin";
import People from "./pages/People";
import ViewProfile from "./pages/ViewPage";
import FollowingPage from "./pages/Following";
import { useKBRTokenContext } from "./context/context";
import FollowersPage from "./pages/Follower";
import CreateCampaign from "./pages/CreateCampaign";
import CreateInsurance from "./pages/CreateInsurance";
import InsurancePage from "./pages/InsurancePage";
import MyInsurance from "./pages/MyInsurance";
import Merch from "./pages/Merch";
import CombinedDataFetcher from "./pages/Work";
import NftPlatforms from "./pages/Work1";

export function App() {
  const { PeopleContract } = useKBRTokenContext();
  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Sidebar placed on the left */}
        <SideBar />

        <div className="flex-1 flex flex-col">
          {/* Topbar placed at the top */}
          <TopBar />

          {/* Main content */}
          <main className="flex-1 container mx-auto">
            {/* Uncomment the ConnectButton if needed for wallet connection */}
            {/* <ConnectButton /> */}

            <Routes>
              {/* Add a Home component or placeholder */}
              <Route path="/" element={<Home />} />
              <Route path="/swap" element={<Swap />} /> {/* Swap route */}
              <Route path="/merch" element={<Merch />} />
              <Route path="/rwa/*" element={<RWA />} />
              <Route path="/donate" element={<Charity />} />
              <Route path="/mycampaigns" element={<MyCampaign />} />
              <Route path="/createcampaigns" element={<CreateCampaign />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dailylogin" element={<DailyLogin />} />
              <Route path="/people" element={<People />} />
              <Route path="/profile/:userId" element={<ViewProfile />} />
              <Route path="/insurance/create" element={<CreateInsurance />} />
              <Route path="/insurance/myinsurance" element={<MyInsurance />} />
              <Route path="/insurance" element={<InsurancePage />} />
              <Route path="/src-arg" element={<CombinedDataFetcher/>} />
              <Route path="/marketstat" element={<NftPlatforms/>} />
              <Route
                path="/following/:creatorAddress"
                element={<FollowingPage contract={PeopleContract} />}
              />
              <Route
                path="/followers/:creatorAddress"
                element={<FollowersPage contract={PeopleContract} />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
