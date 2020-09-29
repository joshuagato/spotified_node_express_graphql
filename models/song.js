const Sequelize = require('sequelize');
const sequelize = require('../util/sequelizedb');

const Song = sequelize.define('song', {
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
  album: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  genre: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  duration: {
    type: Sequelize.STRING,
    allowNull: false
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false
  },
  album_order: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  plays: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, { timestamps: false });

module.exports = Song;
