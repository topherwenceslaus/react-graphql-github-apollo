import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import { onError } from 'apollo-link-error';

import './style.css';

const GITHUB_BASE_URL = 'https://api.github.com/graphql';

const httpClient = new HttpLink({
  uri: GITHUB_BASE_URL,
  headers: {
    authorization: `Bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`,
  },
});

const cache = new InMemoryCache();
const errorLink = onError((graphqlErrors, networkErrors) => {});

const link = ApolloLink.from([errorLink, httpClient]);
const client = new ApolloClient({
  link,
  cache,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

registerServiceWorker();


// test 1

// test 2
