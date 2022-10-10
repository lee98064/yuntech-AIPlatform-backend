const express = require("express");
const router = express.Router();
const excelJS = require("exceljs");
const { Op } = require("sequelize");
const { User, Student, Group } = require("../../models");

router.get("/export", async (req, res) => {
  const workbook = new excelJS.Workbook(); // Create a new workbook
  const worksheet = workbook.addWorksheet(); // New Worksheet
  const path = "./exports"; // Path to download excel

  const groups = await Group.findAll({
    include: [
      {
        attributes: {
          exclude: [
            "studentImg",
            "password",
            "GroupId",
            "createdAt",
            "updatedAt",
          ],
        },
        model: Student,
      },
    ],
  });

  groups.forEach((group) => {
    worksheet.addRow([`第 ${group.id} 組 ${group.name}`]);
    worksheet.addRow([
      "學號",
      "姓名",
      "email",
      "電話",
      "lineID",
      "頭銜",
      "是否驗證",
    ]);
    const currentRowIdx = worksheet.rowCount - 1; // Find out how many rows are there currently
    const endColumnIdx = worksheet.columnCount;
    worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, endColumnIdx);
    worksheet.getCell(currentRowIdx, 1).alignment = { horizontal: "center" };
    group.Students?.forEach((student) => {
      worksheet.addRow([
        student.studentID,
        student.name,
        student.email,
        student.phone,
        student.lineID,
        student.isLeader ? "組長" : "組員",
        student.isVerify ? "已驗證" : "尚未驗證",
      ]);
    });
    worksheet.addRow([]);
  });

  const nowTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19)
    .replace(/[^0-9]/g, "");
  try {
    const data = await workbook.xlsx.writeFile(
      `${path}/報名列表-${nowTime}.xlsx`
    );
    res.download(`./${path}/報名列表-${nowTime}.xlsx`);
  } catch (err) {
    res.send({
      status: false,
      message: "Something went wrong!!",
    });
  }
});

module.exports = router;
