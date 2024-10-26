import React, { useContext, createContext, ReactNode } from "react"
import {
  createThirdwebClient,
  getContract,
  defineChain,
  ThirdwebClient,
} from "thirdweb"
import { createWallet, walletConnect } from "thirdweb/wallets"

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  createWallet("com.trustwallet.app"),
  createWallet("me.rainbow"),
]

interface KBRTokenContextProps {
  KBRContract: any
  PeopleContract: any
  PropertyNFTContract: any
  InsuranceContract:any
  BetterIndia:any
  Marketplace:any
  TokenTransferor:any
  wallets: any
  client: any
  wallet: any
  account: any
}

const KBRTokenContext = createContext<KBRTokenContextProps | undefined>(
  undefined,
)

const client: ThirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_CLIENT_ID as string,
})
const wallet = createWallet("io.metamask")
let account:any
const a=async()=>{
const acc = await wallet.connect({
  client,
})
account=acc
}
a()
interface kbrTokenContextProviderProps {
  children: ReactNode
}

export const KBRTokenContextProvider = ({
  children,
}: kbrTokenContextProviderProps) => {
  const KBRContract = getContract({
    client,
    chain: defineChain(Number(import.meta.env.VITE_CHAIN_ID)),
    address: import.meta.env.VITE_KBR_CONTRACT_ADDRESS as string,
  })

  const PeopleContract = getContract({
    client,
    chain: defineChain(Number(import.meta.env.VITE_CHAIN_ID)),
    address: import.meta.env.VITE_PEOPLE_CONTRACT_ADDRESS as string,
  })

  const PropertyNFTContract = getContract({
    client,
    chain: defineChain(Number(import.meta.env.VITE_CHAIN_ID)),
    address: import.meta.env.VITE_PROPERTYNFT_CONTRACT_ADDRESS as string,
  })
  const  InsuranceContract = getContract({
    client,
    chain: defineChain(Number(import.meta.env.VITE_CHAIN_ID)),
    address: import.meta.env.VITE_INSURANCE_CONTRACT_ADDRESS as string,
  })
  const  BetterIndia = getContract({
    client,
    chain: defineChain(Number(import.meta.env.VITE_CHAIN_ID)),
    address: import.meta.env.VITE_BETTERINDIA_CONTRACT_ADDRESS as string,
  })
  const  Marketplace = getContract({
    client,
    chain: defineChain(Number(import.meta.env.VITE_CHAIN_ID)),
    address: import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS as string,
  })
  const  TokenTransferor = getContract({
    client,
    chain: defineChain(Number(import.meta.env.VITE_CHAIN_ID)),
    address: import.meta.env.VITE_TOKENTRANSFEROR_CONTRACT_ADDRESS as string,
  })
  return (
    <KBRTokenContext.Provider
      value={{
        KBRContract,
        PeopleContract,
        PropertyNFTContract,
        InsuranceContract,
        BetterIndia,
        Marketplace,
        TokenTransferor,
        wallets,
        client,
        wallet,
        account,
      }}
    >
      {children}
    </KBRTokenContext.Provider>
  )
}

export const useKBRTokenContext = () => {
  const context = useContext(KBRTokenContext)
  if (context === undefined) {
    throw new Error(
      "useKBRContext must be used within a KBRTokenContextProvider",
    )
  }
  return context
}