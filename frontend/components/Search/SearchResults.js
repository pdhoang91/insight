// components/Search/SearchResults.js
import React from 'react';
import SearchTabs from './SearchTabs';
import LoadingSpinner from '../Utils/LoadingSpinner';
import ErrorMessage from '../Utils/ErrorMessage';
import { useSearch } from '../../hooks/useSearch';

const SearchResults = ({ query }) => {
  const { data, isLoading, isError } = useSearch(query);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={isError} />;

  return <SearchTabs query={query} data={data} />;
};

export default SearchResults;
