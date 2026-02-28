interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    isMetaMask?: boolean
  }
  okxwallet?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  }
}
