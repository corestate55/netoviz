'use strict';
module.exports = (sequelize, DataTypes) => {
  const alert = sequelize.define('alert', {
    date: DataTypes.STRING,
    host: DataTypes.STRING,
    message: DataTypes.TEXT,
    severity: DataTypes.STRING
  }, {
    underscored: true,
  });
  alert.associate = function(models) {
    // associations can be defined here
  };
  return alert;
};