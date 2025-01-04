import { Button } from "@/components/ui/button";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { useState } from "react";
import { Navigation } from "./Navigation";
import { ModeToggle } from "./mode-toggle";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2">
              <Logo />
            </NavLink>
            <nav className="hidden md:flex gap-8">
              <Navigation mobile={false} />
            </nav>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`focus:outline-none text-3xl `}
            >
              {!isMenuOpen ? " ☰" : "x"}
            </button>
            <ModeToggle />
          </div>
          <div className="flex-row items-center hidden md:flex gap-4">
            {" "}
            <Button
              className="relative overflow-hidden group hidden md:block"
              variant="outline"
            >
              <span className="relative z-10">Connect Wallet</span>
              <span className="absolute inset-0 transform translate-y-full group-hover:translate-y-0 bg-secondary transition-transform duration-200" />
            </Button>
            <ModeToggle />
          </div>
        </div>
        {isMenuOpen && (
          <nav className="md:hidden mt-4 transition-opacity duration-300 ease-in-out opacity-100">
            <Navigation mobile={true} />
          </nav>
        )}
      </div>
    </header>
  );
};
