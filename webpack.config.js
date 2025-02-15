// initialize the path
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader/dist/index");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const envMode = process.env.envMode;
require("dotenv").config({ path: `.env` }); //implement the .env extract the variable to the process.env
require("dotenv").config({ path: `.env.${envMode}` });

const prefixRE = /^VUE_APP_/;
let env = {};
for (const key in process.env) {
  if (key == "NODE_ENV" || prefixRE.test(key)) {
    env[key] = JSON.stringify(process.env[key]);
  }
}

module.exports = {
  entry: path.resolve(__dirname, "./src/main.js"),
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./js/[name].[chunkhash].js",
    assetModuleFilename: "assets/images/[contenthash][ext]",
    clean: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@img": path.resolve(__dirname, "src/assets/img"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@api": path.resolve(__dirname, "src/api"),
      "@css": path.resolve(__dirname, "src/assets/css"),
      "@plugins": path.resolve(__dirname, "src/plugins"),
    },
  },
  module: {
    rules: [
      // js file
      {
        test: /\.js$/, //mathc the js file
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [["@babel/plugin-transform-runtime"]],
            cacheDirectory: true,
          },
        },
        exclude: /node_modules/,
      },
      // vue file
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      // scss && css file
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      // png and the other file
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: "asset", //asset can transform the bigger file into base64 format
        generator: {
          filename: "assets/images/[hash][ext][query]",
        },
        parser: {
          dataUrlCondition: {
            maxSize: 60 * 1024, // smaller than 60kb
          },
        },
      },
      //svg file
      {
        test: /\.(eot|svg|ttf|woff|woff2|)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[hash:8].[name][ext]",
        },
      },
    ],
  },
  /**TypeError: item.plugins.unshift is not a function:
   * the reason is the plugins is null,need to fill it or annotate it
   */
  plugins: [
    //plugins's config
    new webpack.DefinePlugin({
      // 定义环境和变量
      "process.env": {
        ...env,
      },
      __VUE_OPTIONS_API__: false, //避免控制台警告信息
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "assets/styles/[contenthash].css",
    }),
  ],
  /** the webpack error:because webapck implement the .env.prod,so the env is production,but when run the defineplugin it has the conflict
   * the solution is setup optimization:{nodeEnv:false}
   */
  optimization: {
    nodeEnv: false,
  },
};
