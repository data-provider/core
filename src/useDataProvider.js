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

const getData = (dataProvider) => () => dataProvider && dataProvider.state.data;
const getLoading = (dataProvider) => () => dataProvider && dataProvider.state.loading;
const getLoaded = (dataProvider) => () => dataProvider && dataProvider.state.loaded;
const getError = (dataProvider) => () => dataProvider && dataProvider.state.error;

export const useData = (dataProvider, comparator) => {
  useRefresh(dataProvider);
  return useSelector(getData(dataProvider), comparator);
};

export const useLoading = (dataProvider) => {
  useRefresh(dataProvider);
  return useSelector(getLoading(dataProvider));
};

export const useLoaded = (dataProvider) => {
  useRefresh(dataProvider);
  return useSelector(getLoaded(dataProvider));
};

export const useError = (dataProvider) => {
  useRefresh(dataProvider);
  return useSelector(getError(dataProvider));
};

export const useDataProvider = (dataProvider, comparator) => {
  useRefresh(dataProvider);
  return [
    useSelector(getData(dataProvider), comparator),
    useSelector(getLoading(dataProvider)),
    useSelector(getError(dataProvider)),
  ];
};
