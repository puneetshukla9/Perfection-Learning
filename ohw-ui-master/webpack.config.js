'use strict';

var glob = require('glob');
var globArray = require('glob-array');
var webpack = require('webpack');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var WebpackDevServer = require("webpack-dev-server");
var ChunkHashReplacePlugin = require('chunkhash-replace-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var bourbon = require('node-bourbon').includePaths; // eslint-disable-line

var isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
	entry: {
		app: ['./app/auth.bootstrap'] // needs to be an array due to later use as dependency
	},
	output: {
		path: __dirname,
		filename: '[name].[hash].bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.less$/,
				exclude: /node_modules/,
				loader: 'style-loader!css-loader!less-loader' //?indentedSyntax=true&outputStyle=expanded&includePaths[]=' + bourbon
			},
			{
				test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
				loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
			},
			{
				test: /\.json/,
				loader: 'json'
			},
			{ test: /\.ts$/, exclude: /node_modules/, loaders: ['ts-loader', 'ng-annotate'] },
			{ test: /\.html$/,
				exclude: [/node_modules/, /index.template.html/],// /app\/modules\/auth/, /index.template.html/],
				loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname, './')) + '/!html' }
		]
	},
	ts: {
		transpileOnly: true
	},
	plugins: (function() {
		var result = [
			new ChunkHashReplacePlugin({
				src: 'index.html',
				dest: 'index.html'
			}),
			new CopyWebpackPlugin([
            {
							from: 'assets/content.csv' ,
							to:   'assets/content.csv'
						}
			]),
			new HtmlWebpackPlugin({
				path: __dirname,
				template: 'index.template.html',
				inject: 'body'
			})
		];
		if (!isDevelopment) {
			var minify = [
				new webpack.optimize.UglifyJsPlugin({
					output: {
						comments: false
					},
					compress: {
						warnings: false
					},
					minimize: true,
					mangle: false
				}),
				new webpack.optimize.DedupePlugin(),
				new webpack.DefinePlugin({
					'process.env': {
							'NODE_ENV': JSON.stringify('production')
					}
				})
			];
			result = result.concat(minify);
		}
		return result;
	})(),
	resolve: {
		extensions: ['', '.ts','.js', '.less', '.html'],
		modulesDirectories: ['node_modules']
	},
	devServer: {
		historyApiFallback: true
	}
};
