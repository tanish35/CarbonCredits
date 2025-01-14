import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi";
import App from "./App";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import "./index.css";
import { Toaster } from "./components/ui/toaster";

import axios from "axios";

//@ts-ignore
globalThis.Buffer = Buffer;

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_URL;

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={defaultSystem}>
          <App />
          <Toaster />
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
