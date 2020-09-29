require('dotenv').config();
const fs = require('fs');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const expressStatic = require("express-static-search");

const sequelize = require('./util/sequelizedb');
const graphqlHttp  = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');

// Initializing express
const app = express();

// Function for writing our access log to the file system
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// Initializing the helmet middleware for securing our Request/Response headers
app.use(helmet());

// Initializing the compression middleware for ensuring lean file sizes
app.use(compression());

// Initializing the morgan middleware for Request data logging
app.use(morgan('combine', { stream: accessLogStream }));

// Allowing Cross Origin Resource Sharing
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  // res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Making the music and artwork folder accessible
app.use('/music', express.static(path.join(__dirname, 'assets', 'music')));
app.use('/artwork', express.static(path.join(__dirname, 'assets', 'artwork')));

// Initializing the auth Middleware
app.use(auth);

// Middleware for setting up the graphql endpoint
app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(err) {
    if (!err.originalError) return err;
    
    const data = err.originalError.data;
    const message = err.message || 'An error occurred.';
    const code = err.originalError.code || 500;
    return {message: message, status: code, data: data};
  }
}));

// Middleware for handling errors
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Connecting the mysql database using sequelize
sequelize.sync().then(result => {
  app.listen(process.env.PORT || 4004);
}).catch(err => console.log(err));
