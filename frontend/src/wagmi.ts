import { http, createConfig } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// const avalancheFujiRpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [injected({ target: "metaMask" })],
  transports: {
    [avalancheFuji.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
