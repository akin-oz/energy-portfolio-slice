import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";

export const uri = import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql";
const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

const httpLink = new HttpLink({uri});

const authLink = setContext((_, {headers}) => {
    if (!apiKey) return {headers};
    return {
        headers: {
            ...(headers),
            "x-api-key": apiKey,
        },
    };
});

export const client = new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
});
