const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/api',
          to: 'api',
          noErrorOnMissing: true
        },
        {
          from: 'public/images',
          to: 'images',
          noErrorOnMissing: true
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@modules': path.resolve(__dirname, 'src/js/modules'),
      '@core': path.resolve(__dirname, 'src/js/core'),
      '@css': path.resolve(__dirname, 'src/css'),
      '@images': path.resolve(__dirname, 'public/images')
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    historyApiFallback: true,
    port: 8080,
    hot: true,
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    compress: true
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all'
    }
  }
};