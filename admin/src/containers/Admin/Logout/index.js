/**
 *
 * Logout
 *
 */

/* eslint-disable */
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { withRouter } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { get } from "lodash";
import { auth } from "strapi-helper-plugin";
import Wrapper from "./components";

const Logout = ({ history: { push } }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoToMe = () => {
    push({
      pathname: `/me`,
    });
  };

  const frontendUrl = JSON.parse(sessionStorage.getItem("url")) || null; //"http://localhost:3000";
  // const strapiUrl = "http://localhost:1337";
  console.log(
    "----redirect----",
    frontendUrl
      ? frontendUrl.replace("/admin", "/logout")
      : window.strapi.remoteURL
  );
  const handleLogout = () => {
    sessionStorage.removeItem("url")
    auth.clearAppStorage();
    // push('/auth/login');
    if (typeof window !== "undefined") {
      window.location.href = frontendUrl
        ? frontendUrl.replace("/admin", "/logout")
        : window.strapi.remoteURL;
      // window.location.href = window.strapi.remoteURL + "/admin";
    }
  };

  const toggle = () => setIsOpen((prev) => !prev);

  const userInfo = auth.getUserInfo();
  const displayName =
    userInfo && userInfo.firstname && userInfo.lastname
      ? `${userInfo.firstname} ${userInfo.lastname}`
      : get(userInfo, "username", "");

  return (
    <Wrapper>
      <ButtonDropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle>
          {displayName}
          <FontAwesomeIcon icon="caret-down" />
        </DropdownToggle>
        <DropdownMenu className="dropDownContent">
          <DropdownItem onClick={handleGoToMe} className="item">
            <FormattedMessage id="app.components.Logout.profile" />
          </DropdownItem>
          <DropdownItem onClick={handleLogout}>
            <FormattedMessage id="app.components.Logout.logout" />
            <FontAwesomeIcon icon="sign-out-alt" />
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    </Wrapper>
  );
};

export default withRouter(Logout);
