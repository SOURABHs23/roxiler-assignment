import express from "express";
import {
  initDatabase,
  getTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getAllData,
} from "../controller/transactionController.js";

export const router = express.Router();

router.get("/init", initDatabase);
router.get("/transactions", getTransactions);
router.get("/statistics", getStatistics);
router.get("/bar-chart", getBarChart);
// router.get("/pie-chart", getPieChart);
// router.get("/all-data", getAllData);
