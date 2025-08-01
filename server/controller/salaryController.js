const salaryModel = require("../model/salaryModel");
const convertSalaryJsonToPdf = require("../utility/salarySlipGenerator");
// GET all salary payments
exports.getAllSalaryController = async (req, res) => {
  try {
    const salaries = await salaryModel.getAllSalaries();
    res.status(200).json({ success: true, data: salaries });
  } catch (err) {
    console.error("Error fetching salaries:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// get specific employee salary
exports.getEmployeeSalaryController = async (req, res) => {
    const { employeeId } = req.params;
    try {
      const salary = await salaryModel.getSalary(employeeId);
      res.status(200).json({ success: true, data: salary });
    } catch (err) {
      console.error("Error fetching employee salary:", err);
      res.status(400).json({
        success: false,
        message: "Failed to get employee salary"
      });
    }
  };
  
// ADD new salary record
exports.addSalaryController = async (req, res) => {
  try {
    const {
      employee_id,
      salary_month,
      salary_year,
      amount,
      payment_date,
      payment_method,
      reference_number,
      notes
    } = req.body;

    if (
      !employee_id ||
      !salary_month ||
      !salary_year ||
      !amount ||
      !payment_date ||
      !payment_method
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await salaryModel.addSalary({
      employee_id,
      salary_month,
      salary_year,
      amount,
      payment_date,
      payment_method,
      reference_number,
      notes,
    });

    res.status(201).json({ success: true, message: "Salary record added", id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Salary for this month already exists" });
    } else {
      console.error("Error adding salary:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
};

// UPDATE salary record
exports.updateSalaryController = async (req, res) => {
    try {
      const { paymentId } = req.params;
      const fieldsToUpdate = req.body;
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ success: false, message: "No fields provided for update" });
      }
  
      const result = await salaryModel.updateSalary(paymentId,fieldsToUpdate);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Salary record not found" });
      }
  
      res.status(200).json({ success: true, message: "Salary record updated" });
    } catch (err) {
      console.error("Error updating salary:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  
// DELETE salary record
exports.deleteSalaryrecordController = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await salaryModel.deleteSalary(paymentId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    res.status(200).json({ success: true, message: "Salary record deleted" });
  } catch (err) {
    console.error("Error deleting salary:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// adjust path if needed 

exports.generateReportController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {month,year} = req.body;

    const employeeSalaryData = await salaryModel.getSalary(employeeId,month,year);

    if (!employeeSalaryData || employeeSalaryData.length === 0) {
      return res.status(404).json({ message: "No salary data found" });
    }

    const pdfBuffer = await convertSalaryJsonToPdf(employeeSalaryData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${employeeSalaryData[0].employee_name}-salary-slip-Oradigitals.pdf`
    );

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Error generating salary slip" });
  }
};

    


