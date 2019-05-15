import React from 'react';
import * as routes from '../../constants/routes';
import './style.css';
import OrganizationSearch from '../../Organization/OrganizationSearch';
import { Link, withRouter } from 'react-router-dom';

const Navigation = ({
  organizationName,
  onOrganizationSearch,
  location: { pathname },
}) => {
  return (
    <header className="Navigation">
      <div className="Navigation-link">
        <Link to={routes.PROFILE}>Profile</Link>
      </div>
      <div className="Navigation-link">
        <Link to={routes.ORGANIZATION}>Organization</Link>
      </div>

      {pathname === routes.ORGANIZATION && (
        <OrganizationSearch
          organizationName={organizationName}
          onOrganizationSearch={onOrganizationSearch}
        />
      )}
    </header>
  );
};

export default withRouter(Navigation);
