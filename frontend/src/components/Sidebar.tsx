import { ChevronDown } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-black border-r border-gray-800 p-6">
      <div className="space-y-6">
        <div>
          <button className="flex items-center justify-between w-full text-left">
            <h3 className="text-lg font-semibold text-white">Price</h3>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          <div className="mt-4">
            <Slider defaultValue={[0, 100]} max={100} step={1} className="text-blue-600" />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-400">0 ETH</span>
              <span className="text-sm text-gray-400">1 ETH</span>
            </div>
          </div>
        </div>

        <div>
          <button className="flex items-center justify-between w-full text-left">
            <h3 className="text-lg font-semibold text-white">Project Type</h3>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <Checkbox id="reforestation" className="border-gray-600" />
              <label htmlFor="reforestation" className="ml-2 text-sm text-gray-300">
                Reforestation (2)
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox id="solar" className="border-gray-600" />
              <label htmlFor="solar" className="ml-2 text-sm text-gray-300">
                Solar Energy (2)
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox id="wind" className="border-gray-600" />
              <label htmlFor="wind" className="ml-2 text-sm text-gray-300">
                Wind Power (2)
              </label>
            </div>
          </div>
        </div>

        <div>
          <button className="flex items-center justify-between w-full text-left">
            <h3 className="text-lg font-semibold text-white">Verification Status</h3>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <Checkbox id="verified" className="border-gray-600" />
              <label htmlFor="verified" className="ml-2 text-sm text-gray-300">
                Verified (2)
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox id="pending" className="border-gray-600" />
              <label htmlFor="pending" className="ml-2 text-sm text-gray-300">
                Pending (2)
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

