import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, FileText, User } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-app-blue font-bold text-xl"
        >
          <FileText className="h-6 w-6" />
          <span>Invoice Auto</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-app-gray-dark">
                <User className="h-4 w-4" />
                <span className="text-sm truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-app-gray-dark hover:bg-gray-100"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-app-blue hover:bg-app-blue-light" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
