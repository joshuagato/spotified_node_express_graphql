const Sequelize = require('sequelize');
const sequelize = require('../util/sequelizedb');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  firstname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  reset_token: {
    type: Sequelize.STRING,
    allowNull: true
  },
  reset_token_expiration: {
    type: Sequelize.STRING,
    allowNull: true
  },
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE
}, {
  updatedAt: 'created_at',
  createdAt: 'updated_at'
});

module.exports = User;
