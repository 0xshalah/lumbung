const path = require("path");
const webpack = require("webpack");

// CRA 5 does not polyfill Node core modules. The Stellar SDK expects Buffer and
// process to exist in the browser, so provide them explicitly.
module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser.js"),
      };
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser.js",
        }),
      );
      return webpackConfig;
    },
  },
};
