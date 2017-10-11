var path = require('path');
var webpack = require('webpack');
var ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
     }
    }),
    new ZipPlugin({
      // OPTIONAL: defaults to the Webpack output path (above)
      // can be relative (to Webpack output path) or absolute
      path: 'zip',

      // OPTIONAL: defaults to the Webpack output filename (above) or,
      // if not present, the basename of the path
      filename: 'my_app.zip',

      // OPTIONAL: defaults to 'zip'
      // the file extension to use instead of 'zip'
      extension: 'ext',

      // OPTIONAL: defaults an empty string
      // the prefix for the files included in the zip file
      pathPrefix: 'relative/path',

      // OPTIONAL: defaults to including everything
      // can be a string, a RegExp, or an array of strings and RegExps
      include: [/\.js$/],

      // OPTIONAL: defaults to excluding nothing
      // can be a string, a RegExp, or an array of strings and RegExps
      // if a file matches both include and exclude, exclude takes precedence
      exclude: [/\.png$/, /\.html$/],

      // yazl Options

      // OPTIONAL: see https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
      fileOptions: {
        mtime: new Date(),
        mode: 0o100664,
        compress: true,
        forceZip64Format: false,
      },

      // OPTIONAL: see https://github.com/thejoshwolfe/yazl#endoptions-finalsizecallback
      zipOptions: {
        forceZip64Format: false,
      },
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
};
