import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaShoppingCart, FaUserCircle, FaPlusCircle } from "react-icons/fa";
import { MdMenu } from "react-icons/md";

const SideMenu: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={
        open
          ? `z-40 fixed inset-0 bg-gray-800 bg-opacity-25 flex items-center justify-end`
          : `fixed inset-0 z-10 flex items-center justify-end`
      }
    >
      {/* Menu Toggle Button */}
      <div
        className={`z-50 flex flex-col items-center justify-center gap-2 cursor-pointer ${
          open ? "text-green-500" : "text-white"
        } hover:text-teal-400 bg-black`}
        onClick={() => setOpen(!open)}
      >
        <MdMenu className="text-xl" />
        <span className="text-sm">{open ? "Close" : "Open"}</span>
      </div>

      {/* Sidebar (conditionally hidden when closed) */}
      {open && (
        <div
          className={`fixed right-0 top-1/2 transform -translate-y-1/2 border-white border-2 rounded-lg bg-zinc-950 flex flex-col items-center py-8 px-4 shadow-lg w-36 z-${open ? "40" : "0"}`}
        >
          <NavLink
            to="/rwa/buy-rwa"
            className={({ isActive }) =>
              `sidebar-item mb-6 flex-col flex items-center justify-center ${
                isActive ? "text-green-500" : "text-white"
              } hover:text-teal-400`
            }
          >
            <FaShoppingCart size={24} />
            <span className="sidebar-text">Buy</span>
          </NavLink>

          <NavLink
            to="/rwa/my-rwa"
            className={({ isActive }) =>
              `sidebar-item mb-6 flex-col flex items-center justify-center ${
                isActive ? "text-green-500" : "text-white"
              } hover:text-teal-400`
            }
          >
            <FaUserCircle size={24} />
            <span className="sidebar-text">My RWA</span>
          </NavLink>

          <NavLink
            to="/rwa/create-rwa"
            className={({ isActive }) =>
              `sidebar-item mb-6 flex-col flex items-center justify-center ${
                isActive ? "text-green-500" : "text-white"
              } hover:text-teal-400`
            }
          >
            <FaPlusCircle size={24} />
            <span className="sidebar-text">Create</span>
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
