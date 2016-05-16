// webpack.config.js
module.exports = {
    // entry point of our application
    entry: './main.js',
    // where to place the compiled bundle
    output: {
        path: __dirname,
        filename: 'build.js'
    },
    module: {
        // `loaders` is an array of loaders to use.
        // here we are only configuring vue-loader
        loaders: [
            {
                test: /\.vue$/, // a regex for matching all files that end in `.vue`
                loader: 'vue'   // loader to use for matched files
            },
            { test: /\.less$/,loader:'style!css!less'},
            { test: /\.js$/, loader: 'babel', exclude: /node_modules/,query:{presets:['es2015']} }
        ]
    },
    resolve: {
        // require时省略的扩展名，如：require('module') 不需要module.js
        extensions: ['', '.js', '.vue']
    }
}
