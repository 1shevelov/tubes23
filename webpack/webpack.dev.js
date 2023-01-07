const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = merge(common, {
    mode: "development",
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        port: 8080,
        open: false,
        hot: true,
    },
    // stats: "errors-only",
    devtool: "inline-source-map",
    watchOptions: {
        poll: true,
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            eslint: { enabled: true, files: "./src/**/*.{ts,js}" },
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
            },
        }),
    ],
});
