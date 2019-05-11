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

const pkg = require('./package.json');

module.exports = (env, argv) => {

    const DEV = argv.mode === 'development';
    const PROD = argv.mode === 'production';

    const config = {
        devtool: DEV ? 'eval-source-map' : false,

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
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: './',
        },

        devServer: {
            contentBase: path.resolve(__dirname, 'static'),
            publicPath: '/jobjs/',
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
                    'postcss-loader',
                    'sass-loader',
                ],
            }],
        },

        plugins: [
            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, 'dist/index.html'),
                template: path.resolve(__dirname, 'src/app/templates/index.html'),
                title: 'JobJS / Easily generate brief and eye-catching job description images full of Emojis!',
                description: pkg.description,
                favicon: path.resolve(__dirname, 'static/favicon.ico'),
                inlineSource: '.(js|css)$', // Inline JS and CSS.
                minify: PROD,
                meta: {
                    author: pkg.author.name,
                    description: pkg.description,
                    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
                },
                // We can use templateParameters if more options are required, but it will override all the above.
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            new StyleLintPlugin({
                syntax: 'scss',
                fix: true,
            }),
            new CopyWebpackPlugin([{
                from: 'static',
            }]),
            new webpack.DefinePlugin({
                'process.env': {
                    DEVELOPMENT: true,
                },
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
                    sourceMap: false,
                }),
                // Might not be needed with Webpack 5:
                new OptimizeCSSAssetsPlugin({}),
            ] : [],
        },
    };

    if (PROD) {
        config.plugins.push(new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin));
    }

    return config;
};
