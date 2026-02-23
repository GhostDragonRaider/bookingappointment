import { createContext, useContext, type ReactNode } from "react"

export type SetTopBarExtra = (node: ReactNode) => void
const TopBarContext = createContext<SetTopBarExtra | null>(null)
export const useTopBarExtra = () => useContext(TopBarContext)
export const TopBarProvider = TopBarContext.Provider
export default TopBarContext
