import { useState } from "react";
import { useConnect, useDisconnect, useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const { connect, connectors: availableConnectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected: accountConnected, address } = useAccount();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `Wallet address ${text} copied to clipboard`,
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-primary">My Dapp</span>
          </a>
          <nav className="hidden md:flex space-x-6">
            <a href="/about" className="text-gray-500 hover:text-gray-700">
              About
            </a>
            <a href="/contact" className="text-gray-500 hover:text-gray-700">
              Contact
            </a>
          </nav>
          <div className="flex-row items-center hidden md:flex gap-4">
            {!accountConnected ? (
              availableConnectors.slice(2, 3).map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  variant="outline"
                  className="relative overflow-hidden group"
                >
                  <span className="relative z-10">Connect Wallet</span>
                  <span className="absolute inset-0 transform translate-y-full group-hover:translate-y-0 bg-secondary transition-transform duration-200" />
                </Button>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <span>{truncateAddress(address!)}</span>
                <Button
                  onClick={() => handleCopy(address!)}
                  className="h-8 w-8 p-0"
                  variant="ghost"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
                <Button onClick={() => disconnect()} variant="outline">
                  Disconnect
                </Button>
              </div>
            )}
            <ModeToggle />
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          ></button>
        </div>
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}></div>
      </div>
    </header>
  );
};

export default Header;
