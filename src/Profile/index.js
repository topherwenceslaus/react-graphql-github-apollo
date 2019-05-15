import React from 'react';
import { Query, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Loading from '../Loading';
import RepositoryLists, { REPOSITORY_FRAGMENT } from '../Repository/';
import Error from '../Error';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  query($cursor: String) {
    viewer {
      name
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
        after: $cursor
      ) {
        edges {
          node {
            ...repository
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }

  ${REPOSITORY_FRAGMENT}
`;

const Profile = () => {
  return (
    <Query
      query={GET_REPOSITORIES_OF_CURRENT_USER}
      notifyOnNetworkStatusChange={true}>
      {({ loading, error, data, fetchMore }) => {
        const { viewer } = data;
        if (loading && !viewer) return <Loading />;
        if (error) return <Error error={error} />;

        return (
          <div>
            <RepositoryLists
              repositories={viewer.repositories}
              fetchMore={fetchMore}
              loading={loading}
              entry={'viewer'}
            />
          </div>
        );
      }}
    </Query>
  );
};

export default Profile;
