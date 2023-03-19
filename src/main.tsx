import { ChakraProvider } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import { SWRConfig, SWRConfiguration } from "swr/_internal";
import App from "./App";
import "./index.css";

const swrConfig: SWRConfiguration = {
  fetcher(d: string) {
    return axios.get(import.meta.env.VITE_API + d).then((res) => res.data);
  },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <SWRConfig value={swrConfig}>
        <App />
      </SWRConfig>
    </ChakraProvider>
  </React.StrictMode>
);
