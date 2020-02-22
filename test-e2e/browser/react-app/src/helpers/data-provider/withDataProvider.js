import React, { useMemo } from "react";

import { useRefresh, useDataProvider, useData, useLoading, useError } from "./useDataProvider";

const defaultKeys = ["data", "loading", "error"];

const getProp = (data, key) => {
  return { [key]: data };
};

const useProp = (data, key) => {
  return useMemo(() => {
    return getProp(data, key);
  }, [data, key]);
};

const useDataProviderCustomProps = (provider, keys = defaultKeys) => {
  const [data, loading, error] = useDataProvider(provider);
  const dataProp = useProp(data, keys[0]);
  const loadingProp = useProp(loading, keys[1] || defaultKeys[1]);
  const errorProp = useProp(error, keys[2] || defaultKeys[2]);
  return { data, loading, error, dataProp, loadingProp, errorProp };
};

const useDataCustomProp = (provider, key = defaultKeys[0]) => {
  const data = useData(provider);
  const dataProp = useProp(data, key);
  return { data, dataProp };
};

const useLoadingCustomProp = (provider, key = defaultKeys[1]) => {
  const loading = useLoading(provider);
  const loadingProp = useProp(loading, key);
  return { loading, loadingProp };
};

const useErrorCustomProp = (provider, key = defaultKeys[2]) => {
  const error = useError(provider);
  const errorProp = useProp(error, key);
  return { error, errorProp };
};

export const withDataProviderBranch = (provider, keys) => (
  Component,
  LoadingComponent,
  ErrorComponent
) => props => {
  const { dataProp, loadingProp, errorProp, loading, error } = useDataProviderCustomProps(
    provider,
    keys
  );
  if (loading) {
    if (LoadingComponent) {
      return <LoadingComponent {...props} {...loadingProp} />;
    }
    return null;
  }
  if (error) {
    if (ErrorComponent) {
      return <ErrorComponent {...props} {...errorProp} />;
    }
    return null;
  }
  return <Component {...props} {...dataProp} />;
};

export const withDataProvider = (provider, keys) => Component => props => {
  const { dataProp, loadingProp, errorProp } = useDataProviderCustomProps(provider, keys);
  return <Component {...props} {...dataProp} {...loadingProp} {...errorProp} />;
};

export const withData = (provider, key) => Component => props => {
  const { dataProp } = useDataCustomProp(provider, key);
  return <Component {...props} {...dataProp} />;
};

export const withLoading = (provider, key) => Component => props => {
  const { loadingProp } = useLoadingCustomProp(provider, key);
  return <Component {...props} {...loadingProp} />;
};

export const withError = (provider, key) => Component => props => {
  const { errorProp } = useErrorCustomProp(provider, key);
  return <Component {...props} {...errorProp} />;
};

export const withRefresh = provider => Component => props => {
  useRefresh(provider);
  return <Component {...props} />;
};
