import { cn } from "@/lib/utils"

type ClassValue = string | null | undefined | ClassValue[]
type ClassProp = ClassValue | Record<string, boolean>
type VariantProps<T extends (...args: any) => any> = Parameters<T>[0]

// Simple implementation of the cva function
export function cva(
  base?: string,
  config?: {
    variants?: Record<string, Record<string, string>>
    defaultVariants?: Record<string, string>
  },
) {
  return (props?: Record<string, string> & { className?: string }) => {
    const { className, ...variants } = props || {}

    // Start with the base classes
    const classes: string[] = base ? [base] : []

    // Add variant classes
    if (config?.variants) {
      Object.entries(config.variants).forEach(([variantName, variantOptions]) => {
        const variantValue = variants[variantName] || config.defaultVariants?.[variantName]

        if (variantValue && variantOptions[variantValue]) {
          classes.push(variantOptions[variantValue])
        }
      })
    }

    // Add the custom className
    if (className) {
      classes.push(className)
    }

    return cn(...classes)
  }
}

export type { VariantProps }

