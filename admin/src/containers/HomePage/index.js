/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { get, upperFirst } from "lodash";
import { auth, LoadingIndicatorPage } from "strapi-helper-plugin";
import PageTitle from "../../components/PageTitle";
import { useModels } from "../../hooks";

import useFetch from "./hooks";
import {
  ALink,
  Block,
  Container,
  LinkWrapper,
  P,
  Wave,
  Separator,
} from "./components";
import BlogPost from "./BlogPost";
import SocialLink from "./SocialLink";

const FIRST_BLOCK_LINKS = [
  {
    link:
      "plugins/content-manager/singleType/application::site-settings.site-settings",
    contentId: "app.components.BlockLink.documentation.content",
    titleId: "app.components.BlockLink.documentation",
    title: "Edit Users",
    description: "Add Remove Edit users and set their role",
  },
  {
    link:
      "plugins/content-manager/collectionType/plugins::users-permissions.user",
    contentId: "app.components.BlockLink.code.content",
    titleId: "app.components.BlockLink.code",
    title: "Site Settings",
    description: "Edit title description and contact information. ",
  },
];

// const SOCIAL_LINKS = [
//   {
//     name: "YO",
//     link: "https://github.com/strapi/strapi/",
//   },
//   {
//     name: "Slack",
//     link: "https://slack.strapi.io/",
//   },
//   {
//     name: "Medium",
//     link: "https://medium.com/@strapi",
//   },
//   {
//     name: "Twitter",
//     link: "https://twitter.com/strapijs",
//   },
//   {
//     name: "Reddit",
//     link: "https://www.reddit.com/r/Strapi/",
//   },
//   {
//     name: "Forum",
//     link: "https://forum.strapi.io",
//   },
//   {
//     name: "Academy",
//     link: "https://academy.strapi.io",
//   },
// ];

const SOCIAL_LINKS = [];
const HomePage = ({ history: { push } }) => {
  const { error, isLoading, posts } = useFetch();
  // Temporary until we develop the menu API
  const {
    collectionTypes,
    singleTypes,
    isLoading: isLoadingForModels,
  } = useModels();

  const handleClick = (e) => {
    e.preventDefault();

    push(
      "/plugins/content-type-builder/content-types/plugins::users-permissions.user?modalType=contentType&kind=collectionType&actionType=create&settingType=base&forTarget=contentType&headerId=content-type-builder.modalForm.contentType.header-create&header_icon_isCustom_1=false&header_icon_name_1=contentType&header_label_1=null"
    );
  };

  const handleClickInternalLink = (e) => {
    e.preventDefault();
    console.log(e.target.href);
    const path = e.target.href.split("admin/")[1];
    push(path);
  };

  const hasAlreadyCreatedContentTypes = useMemo(() => {
    const filterContentTypes = (contentTypes) =>
      contentTypes.filter((c) => c.isDisplayed);

    return (
      filterContentTypes(collectionTypes).length > 1 ||
      filterContentTypes(singleTypes).length > 0
    );
  }, [collectionTypes, singleTypes]);

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  const headerId = hasAlreadyCreatedContentTypes
    ? "HomePage.greetings"
    : "app.components.HomePage.welcome";
  const username = get(auth.getUserInfo(), "firstname", "");
  const linkProps = hasAlreadyCreatedContentTypes
    ? {
        id: "app.components.HomePage.button.blog",
        href: "https://strapi.io/blog/",
        onClick: () => {},
        type: "blog",
        target: "_blank",
      }
    : {
        id: "app.components.HomePage.create",
        href: "",
        onClick: handleClick,
        type: "documentation",
      };

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {(title) => <PageTitle title={/*title*/ "Admin"} />}
      </FormattedMessage>

      {/* wrapper */}
      <Container className="container-fluid">
        <div className="row">
          {/* left container */}
          <div className="col-lg-8 col-md-12">
            <Block>
              <Wave />
              {/* heading */}
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {() => <h2 id="mainHeader">Welcome..</h2>}
                {(msg) => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage>

              {/* heading paragraph */}
              <FormattedMessage id="app.components.HomePage.welcomeBlock.content.again">
                {() => <P>yo</P>}
              </FormattedMessage>

              {/* {hasAlreadyCreatedContentTypes ? (
              ) : (
                <FormattedMessage id="HomePage.welcome.congrats">
                  {(congrats) => {
                    return (
                      <FormattedMessage id="HomePage.welcome.congrats.content">
                        {(content) => {
                          return (
                            <FormattedMessage id="HomePage.welcome.congrats.content.bold">
                              {(boldContent) => {
                                return (
                                  <P>
                                    <b>{congrats}</b>&nbsp;
                                    {content}&nbsp;
                                    <b>{boldContent}</b>
                                  </P>
                                );
                              }}
                            </FormattedMessage>
                          );
                        }}
                      </FormattedMessage>
                    );
                  }}
                </FormattedMessage>
              )} */}
              {/* {hasAlreadyCreatedContentTypes && (
                <div style={{ marginTop: isLoading ? 60 : 50 }}>
                  {posts.map((post, index) => (
                    <BlogPost
                      {...post}
                      key={post.link}
                      isFirst={index === 0}
                      isLoading={isLoading}
                      error={error}
                    />
                  ))}
                </div>
              )} */}

              {/* button */}
              <FormattedMessage id="yo">
                {(msg) => (
                  <ALink
                    rel="noopener noreferrer"
                    {...linkProps}
                    style={{ verticalAlign: " bottom", marginBottom: 5 }}
                  >
                    {msg} yoyo
                  </ALink>
                )}
              </FormattedMessage>

              <Separator style={{ marginTop: 37, marginBottom: 36 }} />

              {/* right/bottom - bottom cards */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {FIRST_BLOCK_LINKS.map((data, index) => {
                  const type = index === 0 ? "doc" : "code";
                  return (
                    <LinkWrapper
                      href={data.link}
                      /* target="_blank" */
                      key={data.link}
                      type={type}
                      onClick={handleClickInternalLink}
                    >
                      <FormattedMessage id={data.titleId}>
                        {() => <p className="bold">{data.title}</p>}
                        {/* {(title) => <p className="bold">{title}</p>} */}
                      </FormattedMessage>
                      <FormattedMessage id={data.contentId}>
                        {() => <p>{data.description}</p>}
                        {/* {(content) => <p>{content}</p>} */}
                      </FormattedMessage>
                    </LinkWrapper>
                  );
                })}
              </div>
              {/* right/bottom - bottom cards */}
            </Block>
          </div>

          {/* right/bottom */}
          <div className="col-md-12 col-lg-4">
            <Block style={{ paddingRight: 30, paddingBottom: 0 }}>
              {/* title */}
              <FormattedMessage id="HomePage.community">
                {/* {(msg) => <h2>{msg}</h2>} */}
                {() => <h2>yo yo more</h2>}
              </FormattedMessage>
              <FormattedMessage id="app.components.HomePage.community.content">
                {(content) => (
                  <P style={{ marginTop: 7, marginBottom: 0 }}>{content}</P>
                )}
              </FormattedMessage>
              {/* paragraph */}
              <FormattedMessage id="HomePage.roadmap">
                {(msg) => (
                  <ALink
                    rel="noopener noreferrer"
                    href="roadmap"
                    // target="_blank"
                    onClick={handleClickInternalLink}
                  >
                    {msg}
                  </ALink>
                )}
              </FormattedMessage>

              <Separator style={{ marginTop: 18 }} />

              {/* social wrapper */}
              <div
                className="row social-wrapper"
                style={{
                  display: "flex",
                  margin: 0,
                  marginTop: 36,
                  marginLeft: -15,
                }}
              >
                {/* social links */}
                {SOCIAL_LINKS.map((value, key) => (
                  <SocialLink key={key} {...value} />
                ))}
              </div>
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
