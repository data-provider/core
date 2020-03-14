import { useEffect } from "react";
import { useSelector } from "react-redux";

export const useRefresh = dataProvider => {
  useEffect(() => {
    dataProvider.read();
    return dataProvider.on("cleanCache", () => {
      dataProvider.read();
    });
  }, [dataProvider]);
};

export const useData = (dataProvider, comparator) => {
  return useSelector(() => dataProvider.state.data, comparator);
};

export const useLoading = (dataProvider, comparator) => {
  return useSelector(() => dataProvider.state.loading, comparator);
};

export const useError = (dataProvider, comparator) => {
  return useSelector(() => dataProvider.state.error, comparator);
};

export const useDataProvider = (dataProvider, comparator) => {
  useRefresh(dataProvider);
  return [
    useData(dataProvider, comparator),
    useLoading(dataProvider, comparator),
    useError(dataProvider, comparator)
  ];
};

/*
Using connect:

const mapStateToProps = () => ({
  loading: authorsProvider.state.loading,
  authors: authorsProvider.state.data
});

export default connect(mapStateToProps)(Authors);
*/
