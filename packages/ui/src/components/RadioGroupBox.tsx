import {ComponentPropsWithRef} from "react"
import {RadioGroupItem} from "../components/RadioGroup"
import {cn} from "../lib/utils"

interface RadioGroupItemProps extends ComponentPropsWithRef<"label"> {
    title: string
    value: string
    id: string
    compareField?: any
}

const RadioGroupBox = ({title, value, id, compareField, children, ...props}: RadioGroupItemProps) => {

    return (
        <label
            htmlFor={id}
            className={cn(
                "col-span-1 flex flex-col gap-2 p-2 shadow-xs dark:shadow-md rounded-md border border-main/60",
                compareField === value && "border-brand outline outline-brand/60 bg-brand/5 text-primary"
            )}
            {...props}
        >
            <div className={"flex items-center gap-2"}>
                <RadioGroupItem value={value} id={id} />
                {title}
            </div>
            {children}
        </label>
    )
}

export { RadioGroupBox }