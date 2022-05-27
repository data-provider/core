export const deprecatedMethod = (method, newMethod) => {
  console.warn(
    `@data-provider/react: "${method}" is deprecated. Please use "${newMethod}" instead.`
  );
};
