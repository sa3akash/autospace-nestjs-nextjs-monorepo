import React from 'react';
import { ManageValets } from '@autospace/ui/src/components/templates/ManageValets';
import { IsLoggedIn } from '@autospace/ui/src/components/organisms/IsLoggedIn';
const Valets = () => {
  return (
    <IsLoggedIn>
      <ManageValets />
    </IsLoggedIn>
  );
};

export default Valets;
