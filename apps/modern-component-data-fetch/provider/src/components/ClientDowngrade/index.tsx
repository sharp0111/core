import React from 'react';
import Basic from '../BasicComponent';
import type { Data } from './index.data';

const Content = (props: { mfData?: Data }): JSX.Element => {
  return (
    <Basic
      {...props}
      providerName="client-downgrade"
      backgroundColor="#0effdb"
    />
  );
};

export default Content;
