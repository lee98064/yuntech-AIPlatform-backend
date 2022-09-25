"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Student.init(
    {
      studentID: DataTypes.STRING,
      email: DataTypes.STRING,
      name: DataTypes.STRING,
      account: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      studentImg: DataTypes.STRING,
      isVerify: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Student",
    }
  );
  return Student;
};
