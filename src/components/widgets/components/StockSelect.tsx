"use client"

import { Button } from "@/components/ui/Button"
import {Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/Command"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover"
import { cn } from "@/lib/utils"
import {getPopularAssets} from "@/lib/assetList"
import { useState } from "react"
import {ChartCandlestick, CheckIcon} from "lucide-react"
import {ScrollArea} from "@/components/ui/ScrollArea"

interface StockSelectProps {
    value: string[]
    onValueChange: (selectedStocks: string[]) => void
}

const StockSelect = ({value, onValueChange}: StockSelectProps) => {
    const [open, setOpen] = useState(false)

    const handleValueChange = (stock: string) => {
        if (value.includes(stock)) {
            onValueChange(value.filter((item) => item !== stock))
        } else {
            onValueChange([...value, stock])
        }
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    data-state={open ? "open" : "closed"}
                    className={cn("font-normal bg-tertiary border-main/60 text-sm items-center gap-2 data-[state=open]:text-primary data-[state=open]:bg-inverted/10 px-2")}
                >
                    <ChartCandlestick size={18}/>
                    Stocks
                </Button>
            </PopoverTrigger>
            <PopoverContent className={"border-0 p-0 w-[160px]"} align={"start"}>
                <Command className={"border-main/60"}>
                    <CommandList className={"scrollbar-hide"}>
                        <CommandGroup>
                            <ScrollArea className={"h-56"}>
                                {getPopularAssets().map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.label}
                                        onSelect={() => handleValueChange(item.value)}
                                        className="flex items-center justify-between"
                                    >
                                        <span>{item.label}</span>
                                        {value.includes(item.value) && <CheckIcon size={16} className="mr-2" />}
                                    </CommandItem>
                                ))}
                            </ScrollArea>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export { StockSelect }