/**
 *
 * LeftMenuLink
 *
 */

import React from "react";
import { startsWith } from "lodash";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { Link, withRouter } from "react-router-dom";
import en from "../../../translations/en.json";
import LeftMenuIcon from "./LeftMenuIcon";
import A from "./A";
import NotificationCount from "./NotificationCount";

const LinkLabel = styled.span`
  display: inline-block;
  width: 100%;
  padding-right: 1rem;
  padding-left: 2.5rem;
`;

// TODO: refacto this file
const LeftMenuLinkContent = ({
  destination,
  iconName,
  label,
  location,
  notificationsCount,
}) => {
  const isLinkActive = startsWith(
    location.pathname.replace("/admin", "").concat("/"),
    destination.concat("/")
  );

  // Check if messageId exists in en locale to prevent warning messages
  const labelId = label.id || label;
  const content =
    en[labelId] || label.defaultMessage ? (
      <FormattedMessage
        id={labelId}
        defaultMessage={label.defaultMessage || "{label}"}
        values={{
          label: `${label.id || label}`,
        }}
      >
        {(message) => <LinkLabel>{message}</LinkLabel>}
      </FormattedMessage>
    ) : (
      <LinkLabel>{labelId}</LinkLabel>
    );

  const frontendUrl = JSON.parse(sessionStorage.getItem("url"))
    // .includes("")
    .replace(
    "/admin",
    ""
  );
  const isIframe = parent.window.location !== window.location;
  const handleClick = (e) => {
    console.log("The link was clicked.", destination);
    console.log("isIframe", isIframe);
    console.log(frontendUrl);
    if (isIframe) {
      e.preventDefault();
      // send message to parent
      window.parent.postMessage({ path: destination }, frontendUrl);
    }
  };
  // Create external or internal link.
  return destination.includes("http") ? (
    <A
      className={isLinkActive ? "linkActive" : ""}
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
    >
      <LeftMenuIcon icon={iconName} />
      {content}
    </A>
  ) : isIframe ? (
    // if in iframe
    <A
      // as={Link}
      // onclick={}
      // href="#"
      href={`${frontendUrl}/admin?q=` + destination.substring(1)} //
      onClick={handleClick} // sends message to parent
      className={isLinkActive ? "linkActive" : ""}
      // to={{
      //   pathname: destination,
      // }}
    >
      <LeftMenuIcon icon={iconName} />
      {content}
      {notificationsCount > 0 && (
        <NotificationCount count={notificationsCount} />
      )}
    </A>
  ) : (
    // if not in iframe
    <A
      as={Link}
      onClick={handleClick}
      className={isLinkActive ? "linkActive" : ""}
      to={{
        pathname: destination,
      }}
    >
      <LeftMenuIcon icon={iconName} />
      {content}
      {notificationsCount > 0 && (
        <NotificationCount count={notificationsCount} />
      )}
    </A>
  );
};

LeftMenuLinkContent.propTypes = {
  destination: PropTypes.string.isRequired,
  iconName: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  notificationsCount: PropTypes.number.isRequired,
};

export default withRouter(LeftMenuLinkContent);
