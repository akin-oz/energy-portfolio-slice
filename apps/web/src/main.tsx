import React from "react";
import {createRoot} from "react-dom/client";
import {ApolloProvider} from "@apollo/client";
import {client, uri} from "./lib/apolloClient";
import {App} from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("Root element #root not found");

createRoot(el).render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App/>
        </ApolloProvider>
    </React.StrictMode>
);

const apiEl = document.getElementById("api-url");
if (apiEl) apiEl.textContent = uri;
