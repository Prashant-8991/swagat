import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { Provider } from 'react-redux'
import { store } from "./redux/store.ts";
import { PrimeReactProvider } from 'primereact/api';

const client = new ApolloClient({
 link: new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_API_URL }),
 cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
 <StrictMode>
 <Provider store={store}>
 <ApolloProvider client={client}>
 <PrimeReactProvider>
 <ThemeProvider>
 <AppWrapper>
 <App />
 </AppWrapper>
 </ThemeProvider>
 </PrimeReactProvider>
 </ApolloProvider>
 </Provider>
 </StrictMode>,
);
