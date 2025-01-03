'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WalletInfo {
  address: string
  balance: string
  networkName: string
  carbonCredits: number
}

export default function Header() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)

  const connectWallet = () => {
    // Mock wallet connection
    setWalletInfo({
      address: '0x1234...5678',
      balance: '1.234 ETH',
      networkName: 'Ethereum Mainnet',
      carbonCredits: 5
    })
  }

  const copyAddress = () => {
    if (walletInfo) {
      navigator.clipboard.writeText(walletInfo.address)
    }
  }

  const disconnectWallet = () => {
    setWalletInfo(null)
  }

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-green-500 rounded-full" />
          <span className="text-white font-medium">Live</span>
          <span className="text-gray-400 ml-2">420 results</span>
        </div>
        
        {walletInfo ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-900 border-gray-800 text-white">
                <Wallet className="h-4 w-4 mr-2" />
                {walletInfo.address}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-gray-900 border-gray-800 text-white">
              <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <div className="px-2 py-1.5">
                <div className="text-sm text-gray-400">Network</div>
                <div className="font-medium">{walletInfo.networkName}</div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="font-medium">{walletInfo.balance}</div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-sm text-gray-400">Carbon Credits Owned</div>
                <div className="font-medium">{walletInfo.carbonCredits}</div>
              </div>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem onClick={copyAddress}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem onClick={disconnectWallet}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  )
}

