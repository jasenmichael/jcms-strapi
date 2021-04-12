import React, { useState } from "react";
import PropTypes from "prop-types";
import matchSorter from "match-sorter";
import { sortBy } from "lodash";
import { FormattedMessage } from "react-intl";

import LeftMenuLink from "../LeftMenuLink";
import LeftMenuLinkHeader from "../LeftMenuLinkHeader";
import LeftMenuListLink from "./LeftMenuListLink";
import EmptyLinksList from "./EmptyLinksList";
import EmptyLinksListWrapper from "./EmptyLinksListWrapper";

const LeftMenuLinksSection = ({
  section,
  searchable,
  location,
  links,
  emptyLinksListMessage,
  shrink,
}) => {
  const [search, setSearch] = useState("");

  // HIDE OPTIONS
  const hideSectionsAdministrator = ["plugins", "general"];
  const hideLinksAdministrator = ["Market Place", "Plugins"];
  const hideSectionsAuthenticated = ["plugins", "general"];
  const hideLinksAuthenticated = [
    "Media Library",
    "Users",
    "Marketplace",
    "Plugins",
  ];
  // HIDE OPTIONS

  // const jwtToken = JSON.parse(window.sessionStorage.getItem("jwtToken"));
  const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));
  // console.log({ jwtToken });
  // const userInfo = JSON.parse(userInfo);
  const theUserRoles = userInfo.roles.map((role) => {
    return role.id;
  });
  // console.log("HAS parent?", window.parent);
  // console.log(JSON.parse(JSON.stringify(theUserRoles)));
  // const adminRoles = [
  //   {
  //     id: 1,
  //     name: "Super Admin",
  //   },
  //   {
  //     id: 2,
  //     name: "Administrator",
  //   },
  // ];
  const isSuperAdmin = theUserRoles.includes(1);
  const isAdministrator = theUserRoles.includes(2);
  // console.log({ isSuperAdmin });

  const hideSections = isSuperAdmin
    ? []
    : isAdministrator
    ? hideSectionsAdministrator
    : hideSectionsAuthenticated;
  const hideLinks = isSuperAdmin
    ? []
    : isAdministrator
    ? hideLinksAdministrator
    : hideLinksAuthenticated;

  const filteredList = sortBy(
    matchSorter(
      links.filter((item) => {
        // console.log("SECTION:", section);
        // console.log("LABEL", item.label , item.label.defaultMessage, item);
        return (
          !hideLinks.includes(item.label.defaultMessage) &&
          !hideLinks.includes(item.label) &&
          !hideLinks.includes(
            item.destination
              .replace("/list-plugins", "Plugins")
              .replace("/marketplace", "Marketplace")
              .replace("/settings", "Settings")
          )
        );
        // return item.label.defaultMessage !== "Media Library";
      }),
      search,
      {
        keys: ["label"],
      }
    ),
    "label"
  );
  if (hideSections.includes(section)) {
    return <EmptyLinksListWrapper></EmptyLinksListWrapper>;
  }
  return (
    <>
      <LeftMenuLinkHeader
        section={section}
        searchable={searchable}
        setSearch={setSearch}
        search={search}
      />
      <LeftMenuListLink shrink={shrink}>
        {filteredList.length > 0 ? (
          filteredList.map((link, index) => {
            return (
              <LeftMenuLink
                location={location}
                // There is no id or unique value in the link object for the moment.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                iconName={link.icon}
                label={link.label}
                // destination={'http://localhost:3000' + link.destination}
                destination={link.destination}
                notificationsCount={link.notificationsCount || 0}
              />
            );
          })
        ) : (
          <EmptyLinksListWrapper>
            <FormattedMessage
              id={emptyLinksListMessage}
              defaultMessage="No plugins installed yet"
            >
              {(msg) => <EmptyLinksList>{msg}</EmptyLinksList>}
            </FormattedMessage>
          </EmptyLinksListWrapper>
        )}
      </LeftMenuListLink>
    </>
  );
};

LeftMenuLinksSection.defaultProps = {
  shrink: false,
};

LeftMenuLinksSection.propTypes = {
  section: PropTypes.string.isRequired,
  searchable: PropTypes.bool.isRequired,
  shrink: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  links: PropTypes.arrayOf(PropTypes.object).isRequired,
  emptyLinksListMessage: PropTypes.string,
};

LeftMenuLinksSection.defaultProps = {
  emptyLinksListMessage: "components.ListRow.empty",
};

export default LeftMenuLinksSection;
