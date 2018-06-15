const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const nunjucks = require('nunjucks');
const path = require('path');
const favicon = require('serve-favicon');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const testRoute = require('./routes/test');
const indexRoute = require('./routes/index');
const webpackConfig = require('../webpack.config');

const isDev = process.env.NODE_ENV !== 'production';

function dirPath(dest) {
  return path.join(__dirname, dest);
}

function addWebpackMiddlewaresToExpressApp(expressApp) {
  const compiler = webpack(webpackConfig);

  webpackConfig.entry.index.unshift('react-hot-loader/patch');
  // webpack/hot/dev-server will reload the entire page if the HMR update fails
  // webpack/hot/only-dev-server reload the page manually
  // ...unshift(`webpack-dev-server/client?http://${host}:${port}`);
  webpackConfig.entry.index.unshift('webpack-hot-middleware/client');
  // enable webpack middleware for hot-reloads in development
  const devMiddlewareOptions = {
    publicPath: webpackConfig.output.publicPath,
    noInfo: false,
    quiet: false,
    lazy: false,
    watchOptions: {
      poll: true,
    },
    hot: true,
    stats: {
      colors: true,
      chunks: false,
      'errors-only': true,
    },
  };
  expressApp.use(webpackDevMiddleware(compiler, devMiddlewareOptions));
  const hotMiddlewareOptions = {
    log: console.log,
  };
  expressApp.use(webpackHotMiddleware(compiler, hotMiddlewareOptions));

  return expressApp;
}

function configTemplates(expressApp) {
  const templatesPath = path.join(__dirname, 'templates');
  const nunjucksEnv = nunjucks.configure(templatesPath, {
    noCache: isDev,
    autoescape: true,
    express: expressApp,
  });

  nunjucksEnv.addGlobal('isDev', isDev);

  // view engine setup
  expressApp.set('views', templatesPath);
  expressApp.set('view engine', 'html');
  return expressApp;
}

let app = express();
app.use(logger(isDev ? 'dev' : 'common'));
app.use(favicon(path.join(__dirname, '/../public/', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

if (isDev) {
  app = addWebpackMiddlewaresToExpressApp(app);
}
app = configTemplates(app);

app.use('/assets', express.static(dirPath('/../public/assets/')));
app.use(testRoute);
app.use(indexRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handling middleware must have 4 arguments
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = isDev ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error', err);
});

module.exports = app;
