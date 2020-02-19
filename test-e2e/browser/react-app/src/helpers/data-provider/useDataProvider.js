import { useEffect } from "react";
import { useSelector } from "react-redux";

export const useRefresh = (dataProvider, observe) => {
  useEffect(() => {
    dataProvider.read();
    return dataProvider.on("cleanCache", () => {
      dataProvider.read();
    });
  }, [dataProvider, observe]);
};

export const useData = dataProvider => {
  return useSelector(() => dataProvider.state.data);
};

export const useLoading = dataProvider => {
  return useSelector(() => dataProvider.state.loading);
};

export const useError = dataProvider => {
  return useSelector(() => dataProvider.state.error);
};

export const useDataProvider = (dataProvider, observe) => {
  useRefresh(dataProvider, observe);
  return {
    data: useData(dataProvider),
    loading: useLoading(dataProvider),
    error: useError(dataProvider)
  };
};

/*
Using connect:

const mapStateToProps = () => ({
  loading: authorsProvider.state.loading,
  authors: authorsProvider.state.data
});

export default connect(mapStateToProps)(Authors);
*/
