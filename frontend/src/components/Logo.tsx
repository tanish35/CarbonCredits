import { Leaf } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
        <Leaf className="h-6 w-6 text-white" />
      </div>
      <span className="text-2xl font-bold text-primary">
        Eco<span className="text-emerald-500">X</span>
      </span>
    </div>
  );
}
