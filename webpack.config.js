const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {

    const DEV = argv.mode === 'development';
    const PROD = argv.mode === 'production';

    const config = {
        devtool: DEV ? 'eval-source-map' : 'source-map',

        entry: {
            main: [
                './src/app/main.js',
                './src/app/main.scss',
            ],
        },

        /*
        // TODO: Integrate with ESLint:
        // https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/1321
        resolve: {
            alias: {
                common: path.resolve(__dirname, 'src/common/'),
            },
        },
        */

        output: {
            filename: PROD ? '[name].[contenthash].js' : '[name].[hash].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: './',
        },

        devServer: {
            contentBase: path.resolve(__dirname, 'static'),
            publicPath: '/jobjs/',
            // When sharing the site using ssh -R 80:localhost:8080 ssh.localhost.run
            // disableHostCheck: true,
        },

        module: {
            rules: [{
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'eslint-loader',
                    options: {
                        fix: true,
                    },
                },
            }, {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            }, {
                test: /\.scss/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',{
                      loader: 'resolve-url-loader',
                      options: {
                        attempts: 1,
                        sourceMap: false,
                      },
                    }, {
                        loader: 'sass-loader',
                        options: { sourceMap: true },
                    },
                ],
            }, {
                test: /\.(svg|eot|ttf|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: './[name].[hash].[ext]',
                        outputPath: './static/fonts/',
                        esModule: false,
                    },
                },
            }],
        },

        plugins: [
            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, 'dist/index.html'),
                template: path.resolve(__dirname, 'src/app/templates/index.html'),
                title: 'JobJS / Sharable image summaries for your open positions',
                description: 'Share your jobs as an image on LinkedIn and Instagram to get a visibility boost and more applicants!',
                favicon: path.resolve(__dirname, 'static/favicon.ico'),
                inlineSource: '.(js|css)$', // Inline JS and CSS.
                minify: PROD,
                meta: {
                    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
                },
                // We can use templateParameters if more options are required, but it will override all the above.
            }),

            new MiniCssExtractPlugin({
                filename: PROD ? '[name].[contenthash].css' : '[name].[hash].css',
            }),

            new StyleLintPlugin({
                syntax: 'scss',
                fix: true,
            }),

            new CopyWebpackPlugin([{
                from: 'static/screenshots',
                to: 'static/screenshots',
            }]),

            // Defines variables available globally that Webpack can evaluate in compilation time and remove dead code:
            new webpack.DefinePlugin({}),

            // Same as before, but sets properties inside `process.env` specifically:
            new webpack.EnvironmentPlugin({
              DEV,
              PROD,
            }),
            // new BundleAnalyzerPlugin(),
        ],

        optimization: {
            // Extract all styles in a single file:
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },

            minimizer: PROD ? [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: PROD,
                }),

                // Might not be needed with Webpack 5:
                new OptimizeCSSAssetsPlugin({}),
            ] : [],
        },
    };

    if (PROD) {
        // TODO: Should I replace this with https://stackoverflow.com/questions/61490604/inline-css-with-webpack-without-htmlwebpackinlinesourceplugin?
        config.plugins.push(new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin));
    }

    return config;
};
