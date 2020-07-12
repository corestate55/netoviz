'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class alert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  alert.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    receive_at: DataTypes.DATE,
    date: DataTypes.DATE,
    host: DataTypes.STRING,
    message: DataTypes.STRING,
    severity: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'alert',
    underscored: true,
  });
  return alert;
};
