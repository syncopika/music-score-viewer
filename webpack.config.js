module.exports = {
	entry: './index.js',
	module: {
	  rules: [
		{
		  test: /\.(js)$/,
		  exclude: /node_modules/,
		  use: ['babel-loader']
		}
	  ],
    },
	resolve: {
		extensions: [".webpack.js", ".web.js", ".js"]
	},
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
	
};