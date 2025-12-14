import { http, createConfig } from 'wagmi'
import { base, mainnet, arbitrum, optimism } from 'wagmi/chains'

export const config = createConfig({
  chains: [base, mainnet, arbitrum, optimism],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
