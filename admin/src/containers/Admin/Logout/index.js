/**
 *
 * Logout
 *
 */

/* eslint-disable */
// import React, { useState } from "react";
import React, { useState, useEffect } from "react";
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
  const [userId, setUserID] = useState(null);
  // let userId = null;

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const adminEmail = auth.getUserInfo().email;
    // get admin's user id by admin email
    const adminUserId = await fetch(
      "/content-manager/collection-types/plugins::users-permissions.user?page=1&pageSize=10&_sort=username:ASC",
      {
        credentials: "include",
        mode: "cors",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE5MTU4MTYyLCJleHAiOjE2MjE3NTAxNjJ9.U1Qt-OM6VZF0L4U08aoEUNr9SnZ6M2nSZvKmy6aC96o",
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then(
        (res) => res.results.filter((user) => user.email === adminEmail)[0].id
      );
    setUserID(adminUserId);
  };

  const handleGoToMe = () => {
    // push({pathname: `/me`})
    push(
      `/plugins/content-manager/collectionType/plugins::users-permissions.user/${userId}`
    );
  };

  const frontendUrl = sessionStorage.getItem("url");

  const handleLogout = () => {
    sessionStorage.removeItem("url");
    auth.clearAppStorage();
    if (typeof window !== "undefined") {
      if (frontendUrl) {
        try {
          top.window.location = JSON.parse(frontendUrl).replace(
            "admin",
            "logout"
          );
        } catch (error) {}
      } else {
        push("/admin");
      }
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
