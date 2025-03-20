"use client"

import * as React from "react"
import { Check, ChevronDown } from "@/components/icons"

import { cn } from "@/lib/utils"

// Create a custom implementation of the Select components
// since we can't use the Radix UI components

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  dir?: "ltr" | "rtl"
  name?: string
  autoComplete?: string
  disabled?: boolean
  required?: boolean
  children?: React.ReactNode
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(({ children, ...props }, ref) => {
  const [open, setOpen] = React.useState(props.defaultOpen || false)
  const [value, setValue] = React.useState(props.defaultValue || props.value || "")

  React.useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value)
    }
  }, [props.value])

  React.useEffect(() => {
    if (props.open !== undefined) {
      setOpen(props.open)
    }
  }, [props.open])

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    props.onValueChange?.(newValue)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    props.onOpenChange?.(newOpen)
  }

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen: handleOpenChange,
        value,
        setValue: handleValueChange,
        disabled: props.disabled,
      }}
    >
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
})
Select.displayName = "Select"

interface SelectContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  setValue: (value: string) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue>({
  open: false,
  setOpen: () => {},
  value: "",
  setValue: () => {},
})

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select component")
  }
  return context
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className,
        )}
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-expanded={open}
        {...props}
      >
        {children}
        <SelectPrimitiveIcon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitiveIcon>
      </button>
    )
  },
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(
  ({ className, placeholder, ...props }, ref) => {
    const { value } = useSelectContext()

    // Find the selected item's text
    const selectedItem = React.Children.toArray(props.children).find(
      (child) => React.isValidElement(child) && child.props.value === value,
    ) as React.ReactElement | undefined

    return (
      <span ref={ref} className={cn("block truncate", className)} {...props}>
        {value ? selectedItem?.props.children || value : placeholder}
      </span>
    )
  },
)
SelectValue.displayName = "SelectValue"

const Slot = React.forwardRef<React.ReactElement, React.ComponentProps<any>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn(className)} {...props}>
      {children}
    </span>
  ),
)
Slot.displayName = "Slot"

const SelectPrimitiveIcon = ({ asChild, ...props }: { asChild?: boolean; children?: React.ReactNode }) => {
  const Comp = asChild ? Slot : "span"
  return <Comp className="absolute right-3" {...props} />
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { position?: "popper" | "item-aligned" }
>(({ className, children, position = "popper", ...props }, ref) => {
  const { open } = useSelectContext()

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, children, value, ...props }, ref) => {
    const { setValue, value: selectedValue } = useSelectContext()
    const isSelected = selectedValue === value

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "bg-accent",
          className,
        )}
        onClick={() => setValue(value)}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        <span>{children}</span>
      </div>
    )
  },
)
SelectItem.displayName = "SelectItem"

const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-1 px-2 py-1.5", className)} {...props} />,
)
SelectGroup.displayName = "SelectGroup"

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem }

