// webpack.config.js
var webpack = require('webpack');
var path = require('path');
// var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    // entry point of our application
    entry: './src/main.js',
    // where to place the compiled bundle
    output: {
        path:path.join(__dirname,'./dist'),
        filename: '[name].js',
        publicPath:'/dist/'
    },
    module: {
        // `loaders` is an array of loaders to use.
        loaders: [
            {
                test: /\.vue$/, // a regex for matching all files that end in `.vue`
                loader: 'vue'   // loader to use for matched files
            },
            { test: /\.less$/,loader:'style!css!less'},
            { test: /\.js$/, loader: 'babel?presets=es2015', exclude: /node_modules/},
            // { test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")}
        ]
    },
    resolve: {
        //查找module的话从这里开始查找
        root: 'C:/User/Leegent/Documents/leegent.github.io/ife2016/task50', //绝对路径
        // require时省略的扩展名，如：require('module') 不需要module.js
        extensions: ['', '.js', '.vue']
    },
    plugins:[
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
        // new ExtractTextPlugin("style.css")
    ]
}
