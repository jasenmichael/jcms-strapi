/**
 *
 * LeftMenuFooter
 *
 */

import React from "react";
import { PropTypes } from "prop-types";

import Wrapper from "./Wrapper";

function LeftMenuFooter({ version }) {
  // PROJECT_TYPE is an env variable defined in the webpack config
  // eslint-disable-next-line no-undef
  const projectType = PROJECT_TYPE;

  return (
    <Wrapper>
      <div className="poweredBy">
        <a
          key="github"
          href="https://github.com/jasenmichael"
          target="_blank"
          rel="noopener noreferrer"
        >
          JCMS
        </a>
        &nbsp;
        <a
          href="https://github.com/jasenmichael"
          key="website"
          // href={`https://github.com/strapi/strapi/releases/tag/v${version}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          v1.0.5
          {/* v{version} */}
        </a>
        &nbsp;
        <a
          href="https://jasenmichael.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          — @jasenmichael {new Date().getFullYear()};
          {/* — {projectType} Edition */}
        </a>
      </div>
    </Wrapper>
  );
}

LeftMenuFooter.propTypes = {
  version: PropTypes.string.isRequired,
};

export default LeftMenuFooter;
