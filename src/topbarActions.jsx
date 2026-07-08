import { createContext, useContext, useState, useEffect } from 'react'

// Lets a content screen render its small primary actions (add, scan, …) up in
// the shared TopBar instead of crammed into the page body — so the body can
// breathe. Each screen registers its actions on mount and clears them on unmount.
const Ctx = createContext(null)

export function TopBarActionsProvider({ children }) {
  const [actions, setActions] = useState(null)
  return <Ctx.Provider value={{ actions, setActions }}>{children}</Ctx.Provider>
}

// Read the currently-registered actions (used by TopBar).
export function useTopBarActionsValue() {
  return useContext(Ctx)?.actions ?? null
}

// Register a node of action buttons for the current screen. Pass a deps array
// so it re-registers when the buttons' dynamic content changes.
export function useTopBarActions(node, deps = []) {
  const ctx = useContext(Ctx)
  useEffect(() => {
    ctx?.setActions(node)
    return () => ctx?.setActions(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
