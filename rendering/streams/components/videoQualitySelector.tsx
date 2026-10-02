import { useState } from "react";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const qualities = [
  { id: "auto", label: "Auto (Network)" },
  { id: "1080p", label: "1080p (HD)" },
  { id: "720p", label: "720p" },
  { id: "480p", label: "480p" },
  { id: "360p", label: "360p" },
];

export function VideoQualitySelector({
  value,
  onChange,
  className = "absolute top-3 right-3 z-50",
}: {
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
}) {
  const [internalQuality, setInternalQuality] = useState("auto");
  const quality = value !== undefined ? value : internalQuality;
  const setQuality = onChange || setInternalQuality;

  return (
    <div className={className}>
      <Select value={quality} onValueChange={setQuality}>
        <SelectTrigger className="h-8 w-8 !p-0 !min-w-0 !justify-center text-white hover:bg-white/20 bg-black/50 rounded-full backdrop-blur-sm border-0 focus:ring-0 shadow-none [&>svg:last-child]:hidden">
          <Settings className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-800 shadow-xl rounded-md min-w-[120px]" align="end">
          <div className="text-[10px] font-bold px-2 py-1.5 text-[#2d7a4f] border-b border-slate-800/50 mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="h-3 w-3" /> Video Quality
          </div>
          {qualities.map((q) => (
            <SelectItem
              key={q.id}
              value={q.id}
              className="text-xs text-gray-300 focus:bg-[#2d7a4f]/60 cursor-pointer py-1.5 rounded-sm"
            >
              {q.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
