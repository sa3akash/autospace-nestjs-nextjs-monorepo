'use client';

import React from 'react';
import { SearchPage } from '@autospace/ui/src/components/templates/SearchPage';
import { FormProviderSearchGarage } from '@autospace/forms/src/searchGarages';

const Search = () => {
  return (
    <FormProviderSearchGarage>
      <SearchPage />
    </FormProviderSearchGarage>
  );
};

export default Search;
