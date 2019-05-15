import React from 'react';
import RepositoryItem from '../RepositoryItem';
import '../style.css';
import Button from '../../Button';
import Loading from '../../Loading';
import FetchMore from '../../FetchMore';

import Issues from '../../Issue';
const updateQuery = entry => (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }
  return {
    ...previousResult,
    [entry]: {
      ...previousResult[entry],
      repositories: {
        ...previousResult[entry].repositories,

        ...fetchMoreResult[entry].repositories,
        edges: [
          ...previousResult[entry].repositories.edges,
          ...fetchMoreResult[entry].repositories.edges,
        ],
      },
    },
  };
};
const RepositoryList = ({ loading, repositories, fetchMore, entry }) => (
  <div>
    {repositories.edges.map(({ node }) => (
      <div key={node.id}>
        <div className="RepositoryItem">
          <RepositoryItem {...node} />
          <Issues
            repositoryName={node.name}
            repositoryOwner={node.owner.login}
          />
        </div>
      </div>
    ))}

    {loading ? (
      <Loading />
    ) : (
      <FetchMore
        loading={loading}
        hasNextPage={repositories.pageInfo.hasNextPage}
        variables={{
          cursor: repositories.pageInfo.endCursor,
        }}
        updateQuery={updateQuery(entry)}
        fetchMore={fetchMore}>
        Repositories
      </FetchMore>
    )}
  </div>
);
export default RepositoryList;
