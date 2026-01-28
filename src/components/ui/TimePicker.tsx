import { Clock8Icon } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface TimePickerProps {
    value?: string
    onValueChange?: (value: string) => void
}

const TimePicker = ({value, onValueChange}: TimePickerProps) => {
    return (
        <div className='relative'>
            <div className='text-secondary pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                <Clock8Icon className='size-4' />
            </div>
            <Input
                type='time'
                id='time-picker'
                step='60'
                className='peer bg-primary appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                value={value ?? "08:00:00"}
                onChange={(e) => onValueChange?.(e.target.value)}
            />
        </div>
    )
}

export { TimePicker }
