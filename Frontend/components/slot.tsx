import * as React from "react"

type SlotProps = {
  children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props

  if (!React.isValidElement(children)) {
    return null
  }

  return React.cloneElement(children, {
    ...mergeProps(slotProps, children.props),
    ref: forwardedRef ? mergeRefs([forwardedRef, (children as any).ref]) : (children as any).ref,
  })
})

Slot.displayName = "Slot"

export { Slot }

// Utility functions for merging props and refs
function mergeProps(slotProps: Record<string, any>, childProps: Record<string, any>) {
  const merged = { ...childProps }

  for (const propName in slotProps) {
    if (propName === "className") {
      const slotClassName = slotProps.className
      const childClassName = childProps.className

      merged.className = [slotClassName, childClassName].filter(Boolean).join(" ")
    } else if (propName === "style") {
      merged.style = { ...slotProps.style, ...childProps.style }
    } else if (propName === "onChange" || propName === "onClick" || propName.startsWith("on")) {
      const slotHandler = slotProps[propName]
      const childHandler = childProps[propName]

      if (slotHandler && childHandler) {
        merged[propName] = (...args: any[]) => {
          childHandler(...args)
          slotHandler(...args)
        }
      } else {
        merged[propName] = slotHandler || childHandler
      }
    } else {
      merged[propName] = slotProps[propName]
    }
  }

  return merged
}

function mergeRefs(refs: React.Ref<any>[]) {
  return (value: any) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<any>).current = value
      }
    })
  }
}

