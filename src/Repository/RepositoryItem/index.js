import React from 'react';
import Link from '../../Link';
import '../style.css';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { REPOSITORY_FRAGMENT } from '../index';

import Button from '../../Button';
const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const UNSTAR_REPOSITORY = gql`
  mutation($id: ID!) {
    removeStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

export const WATCH_REPOSITORY = gql`
  mutation($id: ID!, $viewerSubscription: SubscriptionState!) {
    updateSubscription(
      input: { state: $viewerSubscription, subscribableId: $id }
    ) {
      subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = viewSub => viewSub === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const updateSubscriptionData = (
  client,
  {
    data: {
      updateSubscription: {
        subscribable: { id, viewerSubscription },
      },
    },
  }
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });
  const totalCount =
    viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED
      ? repository.watchers.totalCount + 1
      : repository.watchers.totalCount - 1;
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount,
      },
    },
  });
};

const removeAddStar = (
  client,
  {
    data: {
      removeStar: {
        starrable: { id },
      },
    },
  }
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });
  const totalCount = repository.stargazers.totalCount - 1;
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount,
      },
    },
  });
};

const updateAddStar = (
  client,
  {
    data: {
      addStar: {
        starrable: { id },
      },
    },
  }
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });
  const totalCount = repository.stargazers.totalCount + 1;
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount,
      },
    },
  });
};
const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred,
}) => (
  <div>
    <div className="RepositoryItem-title">
      <h2>
        <Link href={url}>{name}</Link>
      </h2>
      <div>
        <Mutation
          mutation={WATCH_REPOSITORY}
          variables={{
            id,
            viewerSubscription: isWatch(viewerSubscription)
              ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
              : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
          }}
          optimisticResponse={{
            updateSubscription: {
              __typename: 'Mutation',
              subscribable: {
                __typename: 'Repository',
                id,
                viewerSubscription: isWatch(viewerSubscription)
                  ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
                  : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
              },
            },
          }}
          update={updateSubscriptionData}>
          {(updateSubscription, { data, loading, error }) => (
            <Button
              className="RepositoryItem-title-action"
              data-test-id="updateSubscription"
              onClick={updateSubscription}>
              {watchers.totalCount}{' '}
              {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
            </Button>
          )}
        </Mutation>

        {!viewerHasStarred ? (
          <Mutation
            mutation={STAR_REPOSITORY}
            variables={{ id }}
            update={updateAddStar}
            optimisticResponse={{
              addStar: {
                __typename: 'Mutation',
                starrable: {
                  __typename: 'Repository',
                  id,
                  viewerHasStarred: !viewerHasStarred,
                },
              },
            }}>
            {(addStar, { data, loading, error }) => (
              <Button
                className={'RepositoryItem-title-action'}
                onClick={addStar}>
                {stargazers.totalCount} Star
              </Button>
            )}
          </Mutation>
        ) : (
          <Mutation
            mutation={UNSTAR_REPOSITORY}
            variables={{ id }}
            update={removeAddStar}
            optimisticResponse={{
              removeStar: {
                __typename: 'Mutation',
                starrable: {
                  __typename: 'Repository',
                  id,
                  viewerHasStarred: !viewerHasStarred,
                },
              },
            }}>
            {(removeStar, { data, loading, error }) => (
              <Button
                className={'RepositoryItem-title-action'}
                onClick={removeStar}
                color="red">
                {stargazers.totalCount} Unstar
              </Button>
            )}
          </Mutation>
        )}
      </div>
      <div className="RepositoryItem-title-action">
        {stargazers.totalCount} Stars
      </div>
    </div>
    <div className="RepositoryItem-description">
      <div
        className="RepositoryItem-description-info"
        dangerouslySetInnerHTML={{ __html: descriptionHTML }}
      />
      <div className="RepositoryItem-description-details">
        <div>
          {primaryLanguage && <span>Language: {primaryLanguage.name}</span>}
        </div>
        <div>
          {owner && (
            <span>
              Owner: <a href={owner.url}>{owner.login}</a>
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default RepositoryItem;
