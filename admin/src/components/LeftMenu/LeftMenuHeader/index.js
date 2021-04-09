import React from 'react';
import { Link } from 'react-router-dom';

import Wrapper from './Wrapper';

const LeftMenuHeader = () => (
  <Wrapper>
    <Link to="/" className="leftMenuHeaderLink">
      {/* <span style={{color: 'white', 'margin': '100px' }}>{process.env.NODE_ENV}</span> */}
      <span className="projectName" />
    </Link>
  </Wrapper>
);

export default LeftMenuHeader;
