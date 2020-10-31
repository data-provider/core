import React, { useMemo } from "react";

import {
  useRefresh,
  useDataProvider,
  useData,
  useLoading,
  useLoaded,
  useError,
} from "./useDataProvider";

import { usePolling } from "./usePolling";

const isFunction = (provider) => {
  return typeof provider === "function";
};

const defaultKeys = ["data", "loading", "error", "loaded"];

const getDisplayName = (WrappedComponent) =>
  WrappedComponent.displayName || WrappedComponent.name || "Component";

const useProvider = (provider, props) => {
  return useMemo(() => {
    if (isFunction(provider)) {
      return provider(props);
    }
    return provider;
  }, [provider, props]);
};

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

const useLoadedCustomProp = (provider, key = defaultKeys[3]) => {
  const loaded = useLoaded(provider);
  const loadedProp = useProp(loaded, key);
  return { loaded, loadedProp };
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
) => {
  const WithDataProviderBranch = (props) => {
    const providerToRead = useProvider(provider, props);
    const { dataProp, loadingProp, errorProp, loading, error } = useDataProviderCustomProps(
      providerToRead,
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
  WithDataProviderBranch.displayName = `WithDataProviderBranch${getDisplayName(Component)}`;
  return WithDataProviderBranch;
};

export const withDataProvider = (provider, keys) => (Component) => {
  const WithDataProvider = (props) => {
    const providerToRead = useProvider(provider, props);
    const { dataProp, loadingProp, errorProp } = useDataProviderCustomProps(providerToRead, keys);
    return <Component {...props} {...dataProp} {...loadingProp} {...errorProp} />;
  };
  WithDataProvider.displayName = `WithDataProvider${getDisplayName(Component)}`;
  return WithDataProvider;
};

export const withData = (provider, key) => (Component) => {
  const WithData = (props) => {
    const providerToRead = useProvider(provider, props);
    const { dataProp } = useDataCustomProp(providerToRead, key);
    return <Component {...props} {...dataProp} />;
  };
  WithData.displayName = `WithData${getDisplayName(Component)}`;
  return WithData;
};

export const withLoading = (provider, key) => (Component) => {
  const WithLoading = (props) => {
    const providerToRead = useProvider(provider, props);
    const { loadingProp } = useLoadingCustomProp(providerToRead, key);
    return <Component {...props} {...loadingProp} />;
  };
  WithLoading.displayName = `WithLoading${getDisplayName(Component)}`;
  return WithLoading;
};

export const withLoaded = (provider, key) => (Component) => {
  const WithLoaded = (props) => {
    const providerToRead = useProvider(provider, props);
    const { loadedProp } = useLoadedCustomProp(providerToRead, key);
    return <Component {...props} {...loadedProp} />;
  };
  WithLoaded.displayName = `WithLoaded${getDisplayName(Component)}`;
  return WithLoaded;
};

export const withError = (provider, key) => (Component) => {
  const WithError = (props) => {
    const providerToRead = useProvider(provider, props);
    const { errorProp } = useErrorCustomProp(providerToRead, key);
    return <Component {...props} {...errorProp} />;
  };
  WithError.displayName = `WithError${getDisplayName(Component)}`;
  return WithError;
};

export const withPolling = (provider, interval) => (Component) => {
  const WithPolling = (props) => {
    const providerToRead = useProvider(provider, props);
    usePolling(providerToRead, interval);
    return <Component {...props} />;
  };
  WithPolling.displayName = `WithPolling${getDisplayName(Component)}`;
  return WithPolling;
};

export const withRefresh = (provider) => (Component) => {
  const WithRefresh = (props) => {
    const providerToRead = useProvider(provider, props);
    useRefresh(providerToRead);
    return <Component {...props} />;
  };
  WithRefresh.displayName = `WithRefresh${getDisplayName(Component)}`;
  return WithRefresh;
};
