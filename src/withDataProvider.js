import React, { useMemo } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

import { deprecatedMethod } from "./helpers";

import {
  useRefresh,
  useDataLoadingError,
  useDataLoadedError,
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

const useDataLoadingErrorCustomProps = (provider, keys = []) => {
  const [data, loading, error] = useDataLoadingError(provider);
  const dataProp = useProp(data, keys[0] || defaultKeys[0]);
  const loadingProp = useProp(loading, keys[1] || defaultKeys[1]);
  const errorProp = useProp(error, keys[2] || defaultKeys[2]);
  return { data, loading, error, dataProp, loadingProp, errorProp };
};

const useDataLoadedErrorCustomProps = (provider, keys = []) => {
  const [data, loaded, error] = useDataLoadedError(provider);
  const dataProp = useProp(data, keys[0] || defaultKeys[0]);
  const loadedProp = useProp(loaded, keys[1] || defaultKeys[3]);
  const errorProp = useProp(error, keys[2] || defaultKeys[2]);
  return { data, loaded, error, dataProp, loadedProp, errorProp };
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

export const withDataLoadedErrorComponents =
  (provider, keys) => (Component, LoadingComponent, ErrorComponent) => {
    const WithDataLoadedErrorComponents = (props) => {
      const providerToRead = useProvider(provider, props);
      const { dataProp, loadedProp, errorProp, loaded, error } = useDataLoadedErrorCustomProps(
        providerToRead,
        keys
      );
      if (error) {
        if (ErrorComponent) {
          return <ErrorComponent {...props} {...errorProp} />;
        }
        return null;
      }
      if (!loaded) {
        if (LoadingComponent) {
          return <LoadingComponent {...props} {...loadedProp} />;
        }
        return null;
      }
      return <Component {...props} {...dataProp} />;
    };
    hoistNonReactStatics(WithDataLoadedErrorComponents, Component);
    WithDataLoadedErrorComponents.displayName = `WithDataLoadedErrorComponents${getDisplayName(
      Component
    )}`;
    return WithDataLoadedErrorComponents;
  };

export const withDataLoadingErrorComponents =
  (provider, keys) => (Component, LoadingComponent, ErrorComponent) => {
    const WithDataLoadingErrorComponents = (props) => {
      const providerToRead = useProvider(provider, props);
      const { dataProp, loadingProp, errorProp, loading, error } = useDataLoadingErrorCustomProps(
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
    hoistNonReactStatics(WithDataLoadingErrorComponents, Component);
    WithDataLoadingErrorComponents.displayName = `WithDataLoadingErrorComponents${getDisplayName(
      Component
    )}`;
    return WithDataLoadingErrorComponents;
  };

export const withDataProviderBranch =
  (provider, keys) => (Component, LoadingComponent, ErrorComponent) => {
    deprecatedMethod("withDataProviderBranch", "withDataLoadingErrorComponents");
    return withDataLoadingErrorComponents(provider, keys)(
      Component,
      LoadingComponent,
      ErrorComponent
    );
  };

export const withDataLoadedError = (provider, keys) => (Component) => {
  const WithDataLoadedError = (props) => {
    const providerToRead = useProvider(provider, props);
    const { dataProp, loadedProp, errorProp } = useDataLoadedErrorCustomProps(
      providerToRead,
      keys
    );
    return <Component {...props} {...dataProp} {...loadedProp} {...errorProp} />;
  };
  hoistNonReactStatics(WithDataLoadedError, Component);
  WithDataLoadedError.displayName = `WithDataLoadedError${getDisplayName(Component)}`;
  return WithDataLoadedError;
};

export const withDataLoadingError = (provider, keys) => (Component) => {
  const WithDataLoadingError = (props) => {
    const providerToRead = useProvider(provider, props);
    const { dataProp, loadingProp, errorProp } = useDataLoadingErrorCustomProps(
      providerToRead,
      keys
    );
    return <Component {...props} {...dataProp} {...loadingProp} {...errorProp} />;
  };
  hoistNonReactStatics(WithDataLoadingError, Component);
  WithDataLoadingError.displayName = `WithDataLoadingError${getDisplayName(Component)}`;
  return WithDataLoadingError;
};

export const withDataProvider = (provider, keys) => (Component) => {
  deprecatedMethod("withDataProvider", "withDataLoadingError");
  return withDataLoadingError(provider, keys)(Component);
};

export const withData = (provider, key) => (Component) => {
  const WithData = (props) => {
    const providerToRead = useProvider(provider, props);
    const { dataProp } = useDataCustomProp(providerToRead, key);
    return <Component {...props} {...dataProp} />;
  };
  hoistNonReactStatics(WithData, Component);
  WithData.displayName = `WithData${getDisplayName(Component)}`;
  return WithData;
};

export const withLoading = (provider, key) => (Component) => {
  const WithLoading = (props) => {
    const providerToRead = useProvider(provider, props);
    const { loadingProp } = useLoadingCustomProp(providerToRead, key);
    return <Component {...props} {...loadingProp} />;
  };
  hoistNonReactStatics(WithLoading, Component);
  WithLoading.displayName = `WithLoading${getDisplayName(Component)}`;
  return WithLoading;
};

export const withLoaded = (provider, key) => (Component) => {
  const WithLoaded = (props) => {
    const providerToRead = useProvider(provider, props);
    const { loadedProp } = useLoadedCustomProp(providerToRead, key);
    return <Component {...props} {...loadedProp} />;
  };
  hoistNonReactStatics(WithLoaded, Component);
  WithLoaded.displayName = `WithLoaded${getDisplayName(Component)}`;
  return WithLoaded;
};

export const withError = (provider, key) => (Component) => {
  const WithError = (props) => {
    const providerToRead = useProvider(provider, props);
    const { errorProp } = useErrorCustomProp(providerToRead, key);
    return <Component {...props} {...errorProp} />;
  };
  hoistNonReactStatics(WithError, Component);
  WithError.displayName = `WithError${getDisplayName(Component)}`;
  return WithError;
};

export const withPolling = (provider, interval, options) => (Component) => {
  const WithPolling = (props) => {
    const providerToRead = useProvider(provider, props);
    usePolling(providerToRead, interval, options);
    return <Component {...props} />;
  };
  hoistNonReactStatics(WithPolling, Component);
  WithPolling.displayName = `WithPolling${getDisplayName(Component)}`;
  return WithPolling;
};

export const withRefresh = (provider) => (Component) => {
  const WithRefresh = (props) => {
    const providerToRead = useProvider(provider, props);
    useRefresh(providerToRead);
    return <Component {...props} />;
  };
  hoistNonReactStatics(WithRefresh, Component);
  WithRefresh.displayName = `WithRefresh${getDisplayName(Component)}`;
  return WithRefresh;
};
