import { useState } from 'react';
import { Search, Grid, List, Columns, LayoutGrid } from 'lucide-react'
import {Header} from '../components/Header'
import Sidebar from '../components/Sidebar'
import CarbonCreditCard from '../components/CarbonCreditCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const mockCarbonCredits = [
  {
    id: 337,
    name: 'Amazon Rainforest Credit',
    tokenId: '#154',
    price: 0.11,
    lastSale: 0.02,
    image: '/placeholder.svg?height=400&width=400',
    verified: true
  },
  {
    id: 98,
    name: 'Solar Farm Credit',
    tokenId: '#204',
    price: 0.11,
    lastSale: 0.02,
    image: '/placeholder.svg?height=400&width=400',
    verified: true
  },
  {
    id: 195,
    name: 'Wind Energy Credit',
    tokenId: '#261',
    price: 0.115,
    lastSale: 0.02,
    image: '/placeholder.svg?height=400&width=400',
    verified: false
  },
  {
    id: 176,
    name: 'Ocean Conservation Credit',
    tokenId: '#261',
    price: 0.115,
    lastSale: 0.02,
    image: '/placeholder.svg?height=400&width=400',
    verified: true
  }
]

export default function MarketplacePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search by name or trait" 
                  className="pl-10 bg-gray-900 border-gray-800 text-white w-full"
                />
              </div>
              {/* <button className="w-[180px] ml-4 bg-gray-900 border-gray-800 text-white">Search</button> */}
              <Select defaultValue="low-to-high">
                <SelectTrigger className="w-[180px] ml-4 bg-gray-900 border-gray-800 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low-to-high">Price low to high</SelectItem>
                  <SelectItem value="high-to-low">Price high to low</SelectItem>
                  <SelectItem value="recent">Recently listed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button 
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-800' : 'hover:bg-gray-900'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button 
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-800' : 'hover:bg-gray-900'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5" />
              </button>
              {/* <button className="p-2 rounded-lg hover:bg-gray-900" title='test'>
                <Columns className="h-5 w-5" />
              </button> */}
              {/* <button className="p-2 rounded-lg hover:bg-gray-900" title='test'>
                <LayoutGrid className="h-5 w-5" />
              </button> */}
            </div>
          </div>
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {mockCarbonCredits.map((credit) => (
              <CarbonCreditCard key={credit.id} credit={credit} viewMode={viewMode} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

