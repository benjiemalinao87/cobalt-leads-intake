import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout, getCurrentMember } from "@/lib/auth";

const Navbar: React.FC = () => {
  const location = useLocation();
  const member = getCurrentMember();
  
  return (
    <div className="w-full bg-white border-b dark:bg-gray-900 dark:border-gray-800">
      <div className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Cobalt Leads
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/" 
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              Intake Form
            </Link>
            <Link 
              to="/admin" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/admin" 
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {member && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logout()}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar; 