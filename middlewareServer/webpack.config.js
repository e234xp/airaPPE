const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: ['babel-polyfill', path.resolve(__dirname, 'src', 'main.js')],
  output: {
    path: path.resolve(__dirname, 'dist'), // 指定輸出路徑為绝对路径
    filename: 'mainService.js',
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.json', '.html'], // 可解析的副檔名
    modules: [
      path.resolve(__dirname, '.'),
      'node_modules',
    ],
  },
  externals: {
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf-8-validate',
  },
  stats: {
    warningsFilter: (w) => w !== 'CriticalDependenciesWarning',
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.html$/i,
        use: ['html-loader'],
      },
    ],
  },
  plugins: [
    // 將 .env 檔案的內容載入到環境變數中
    new Dotenv(),
  ],
};
