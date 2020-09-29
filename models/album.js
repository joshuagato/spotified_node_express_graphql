const Sequelize = require('sequelize');
const sequelize = require('../util/sequelizedb');

const Album = sequelize.define('album', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  artist: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  genre: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  artwork_path: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, { timestamps: false });

module.exports = Album;
