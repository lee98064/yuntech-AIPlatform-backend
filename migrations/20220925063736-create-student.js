"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Students", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      studentID: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
      // account: {
      //   unique: true,
      //   allowNull: false,
      //   type: Sequelize.STRING,
      // },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      lineID: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      studentImg: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      isLeader: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.BOOLEAN,
      },
      isVerify: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Students");
  },
};
