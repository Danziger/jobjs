const path = require('path');

const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
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
            static: {
                directory: path.resolve(__dirname, 'static'),
            },
            devMiddleware: {
                publicPath: '/jobjs/',
                // When sharing the site using ssh -R 80:localhost:8080 ssh.localhost.run
                // disableHostCheck: true,
            },
            client: {
                overlay: {
                    warnings: false,
                    errors: false,
                },
            },
        },

        module: {
            rules: [{
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
            new ESLintPlugin({ fix: true }),

            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, 'dist/index.html'),
                template: path.resolve(__dirname, 'src/app/templates/index.html'),
                title: 'JobJS \\ Sharable image summaries for your open positions',
                description: 'Share your jobs as an image on LinkedIn and Instagram to get a visibility boost and more applicants!',
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
                filename: PROD ? '[name].[contenthash].css' : '[name].[hash].css',
            }),

            new StyleLintPlugin({
                syntax: 'scss',
                fix: true,
            }),

            new CopyWebpackPlugin([{
                patterns: [{
                    from: 'static/screenshots',
                    to: 'static/screenshots',
                }],
            }]),

            // Defines variables available globally that Webpack can evaluate in compilation time and remove dead code:
            // new webpack.DefinePlugin({
            //     'process.env': {},
            // }),

            // Same as before, but sets properties inside `process.env` specifically:
            // new webpack.EnvironmentPlugin({
            //     DEV,
            //     PROD,
            // }),

            // new BundleAnalyzerPlugin(),
        ],

        optimization: {
            minimize: true,

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
                '...',
                new CssMinimizerPlugin(),
            ] : [],
        },
    };

    if (PROD) {
        // TODO: Should I replace this with https://stackoverflow.com/questions/61490604/inline-css-with-webpack-without-htmlwebpackinlinesourceplugin?
        config.plugins.push(new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin));
    }

    return config;
};
