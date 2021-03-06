import { useEffect } from "react";
import { useSelector } from "react-redux";

export const useRefresh = (dataProvider) => {
  useEffect(() => {
    if (dataProvider) {
      const catchError = (err) => {
        console.error(
          `@data-provider/react: Error "${err.message}" in provider "${dataProvider.id}"`
        );
      };
      dataProvider.read().catch(catchError);
      return dataProvider.on("cleanCache", () => {
        dataProvider.read().catch(catchError);
      });
    }
  }, [dataProvider]);
};

export const useData = (dataProvider, comparator) => {
  useRefresh(dataProvider);
  return useSelector(() => dataProvider && dataProvider.state.data, comparator);
};

export const useLoading = (dataProvider) => {
  useRefresh(dataProvider);
  return useSelector(() => dataProvider && dataProvider.state.loading);
};

export const useLoaded = (dataProvider) => {
  useRefresh(dataProvider);
  return useSelector(() => dataProvider && dataProvider.state.loaded);
};

export const useError = (dataProvider) => {
  useRefresh(dataProvider);
  return useSelector(() => dataProvider && dataProvider.state.error);
};

export const useDataProvider = (dataProvider, comparator) => {
  useRefresh(dataProvider);
  return [useData(dataProvider, comparator), useLoading(dataProvider), useError(dataProvider)];
};
