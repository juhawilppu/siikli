import { HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function InfoTooltip({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0} open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div
            className="inline-flex items-center cursor-pointer hover:opacity-80"
            onClick={() => setIsOpen(!isOpen)}
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
