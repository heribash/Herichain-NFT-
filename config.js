import { polygonAmoy } from 'thirdweb/chains';

export const appConfig = {
  thirdwebClientId: "750721ab50b6e03e15bd9c947aff9c47",
  nftContractAddress: "0x6f04573b213311a5acc5D5236040705FF7399A6E",
  marketplaceContractAddress: "0xYOUR_NEW_MARKETPLACE_CONTRACT_ADDRESS_HERE", // TODO: Replace with your actual Marketplace V3 contract address
  chain: polygonAmoy,
  rpcUrl: "https://80002.rpc.thirdweb.com",
  // This is a public key for a sample backend wallet for sponsoring transactions.
  // In a real app, you would have a secure backend server that holds the private key.
  gaslessSponsorAddress: "0x8Ab0755163D439665F22f42735747A9A32159511" 
};