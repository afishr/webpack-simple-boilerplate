const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin');

const DEV = process.env.NODE_ENV === 'development';
const PROD = !DEV;

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	};

	if (PROD) {
		config.minimizer = [
			new OptimizeCssAssetsPlugin(),
			new TerserWebpackPlugin()
		]
	}

	return config;
}

const filename = ext => DEV ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const cssLoaders = extra => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: DEV,
				reloadAll: true
			}
		}, 
		'css-loader'
	]

	if (extra) {
		loaders.push(extra);
	}

	return loaders;
}

const babelOptions = preset => {
	const options = {
		presets: [
			'@babel/preset-env',
		],
		plugins: [
			'@babel/plugin-proposal-class-properties'
		]
	}

	if (preset) {
		options.presets.push(preset);
	}

	return options;
}

const jsLoaders = () => {
	const loaders = [{
		loader: 'babel-loader',
		options: babelOptions()
	}]

	if (DEV) {
		loaders.push('eslint-loader');
	}

	return loaders;
}

const plugins = () => {
	const base = [
		new HtmlWebpackPlugin({
			template: './index.html',
			minify: {
				collapseWhitespace: PROD
			}
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, 'src/favicon.ico'),
				to: path.resolve(__dirname, 'dist')
			}
		]),
		new MiniCssExtractPlugin({
			filename: filename('css')
		})
	]

	/* if (PROD) {
		base.push(new BundleAnalyzerPlugin());
	} */

	return base;
}

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './index.js'],
		analytics: './analytics.ts'
	}, 
	output: {
		filename: filename('js'),
		path: path.resolve(__dirname, 'dist')
	},
	devtool: DEV ? 'source-map' : '',
	resolve: {
		extensions: ['.ts', '.js', '.json'],
		alias: {
			'@models': path.resolve(__dirname, 'src/models'),
			'@': path.resolve(__dirname, 'src'),
		}
	},
	optimization: optimization(),
	devServer: {
		port: 4200,
		hot: DEV
	},
	plugins: plugins(),
	module: {
		rules: [
			{
				test: /\.css$/,
				use: cssLoaders()
			},
			{
				test: /\.less$/,
				use: cssLoaders('less-loader')
			},
			{
				test: /\.(sass|scss)$/,
				use: cssLoaders('sass-loader')
			},
			{
				test: /\.(png|jpg|jpeg|svg|gif)$/,
				loader: 'file-loader'
			},
			{
				test: /\.(ttf|woff|woff2|eot|otf)$/,
				loader: 'file-loader'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: jsLoaders()
			},
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				loader: {
					loader: 'babel-loader',
					options: babelOptions('@babel/preset-typescript')
				}
			}
		]
	}
};