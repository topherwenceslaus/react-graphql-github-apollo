import React from 'react';
import './style.css';
import { Query, ApolloConsumer } from 'react-apollo';
import Loading from '../../Loading';
import Error from '../../Error';
import IssueItem from '../IssueItem';
import gql from 'graphql-tag';
import { ButtonUnobtrusive } from '../../Button';
import { withState } from 'recompose';
import FetchMore from '../../FetchMore';

const ISSUE_STATES = {
  NONE: 'NONE',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};
const TRANSITION_LABELS = {
  [ISSUE_STATES.NONE]: 'Show Open Issues',
  [ISSUE_STATES.OPEN]: 'Show Closed Issues',
  [ISSUE_STATES.CLOSED]: 'Hide Issues',
};
const TRANSITION_STATE = {
  [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
  [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
  [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE,
};
const isShow = issueState => issueState !== ISSUE_STATES.NONE;

const GET_ISSUES_OF_REPOSITORY = gql`
  query(
    $repositoryOwner: String!
    $repositoryName: String!
    $issueState: IssueState!
    $cursor: String
  ) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5, states: [$issueState], after: $cursor) {
        edges {
          node {
            id
            number
            state
            title
            url
            bodyHTML
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const IssueList = ({ issues }) => (
  <div className="IssueList">
    {issues.edges.map(({ node }) => (
      <IssueItem key={node.id} issue={node} />
    ))}
  </div>
);

const updateQuery = (previousResult, { fetchMoreResult }) => {
  console.log(previousResult, fetchMoreResult);
  if (!fetchMoreResult) {
    return previousResult;
  }

  return {
    ...previousResult,
    repository: {
      ...previousResult.repository,
      issues: {
        ...previousResult.repository.issues,
        ...fetchMoreResult.repository.issues,
        edges: [
          ...previousResult.repository.issues.edges,
          ...fetchMoreResult.repository.issues.edges,
        ],
      },
    },
  };
};
const Issues = ({
  repositoryOwner,
  repositoryName,
  issueState,
  onChangeIssueState,
}) => {
  console.log(onChangeIssueState);
  return (
    <div className="Issues">
      <IssueFilter
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        issueState={issueState}
        onChangeIssueState={onChangeIssueState}
      />

      {isShow(issueState) && (
        <Query
          query={GET_ISSUES_OF_REPOSITORY}
          variables={{ repositoryOwner, repositoryName, issueState }}
          notifyOnNetworkStatusChange={true}>
          {({ data, loading, error, fetchMore }) => {
            const { repository } = data;
            if (loading && !repository) {
              return <Loading />;
            }

            if (error) {
              return <Error error={error} />;
            }
            if (!repository.issues.edges.length) {
              return <div className="IssueList">No issues ...</div>;
            }

            return (
              <div>
                <IssueList issues={repository.issues} />

                {loading ? (
                  <Loading />
                ) : (
                  <FetchMore
                    fetchMore={fetchMore}
                    variables={{ cursor: repository.issues.pageInfo.endCursor }}
                    updateQuery={updateQuery}>
                    issues
                  </FetchMore>
                )}
              </div>
            );
          }}
        </Query>
      )}
    </div>
  );
};

const prefetchIssues = (
  client,
  repositoryOwner,
  repositoryName,
  issueState
) => {
  const nextIssueState = TRANSITION_STATE[issueState];
  if (isShow(nextIssueState)) {
    client.query({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: {
        repositoryOwner,
        repositoryName,
        issueState: nextIssueState,
      },
    });
  }
};

const IssueFilter = ({
  issueState,
  onChangeIssueState,
  repositoryOwner,
  repositoryName,
}) => (
  <ApolloConsumer>
    {client => {
      return (
        <ButtonUnobtrusive
          onClick={() => onChangeIssueState(TRANSITION_STATE[issueState])}
          onMouseOver={prefetchIssues(
            client,
            repositoryOwner,
            repositoryName,
            issueState
          )}>
          {TRANSITION_LABELS[issueState]}
        </ButtonUnobtrusive>
      );
    }}
  </ApolloConsumer>
);

export default withState('issueState', 'onChangeIssueState', ISSUE_STATES.NONE)(
  Issues
);
