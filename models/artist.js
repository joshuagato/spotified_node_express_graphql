const Sequelize = require('sequelize');
const sequelize = require('../util/sequelizedb');

const Artist = sequelize.define('artist', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, { timestamps: false });

module.exports = Artist;
