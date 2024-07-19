import { ProductTransaction } from "../model/ProductTransaction.js";
import axios from "axios";

export const initDatabase = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    console.log(data);
    await ProductTransaction.deleteMany({});
    await ProductTransaction.insertMany(data);
    res.status(200).send("Database initialized with seed data.");
  } catch (error) {
    res.status(500).send("Error initializing database.");
  }
};

export const getTransactions = async (req, res) => {
  console.log(req.query);
  const { month, search, page = 1, perPage = 10 } = req.query;
  const regex = new RegExp(search, "i");

  let searchConditions = [];
  if (search) {
    searchConditions = [{ title: regex }, { description: regex }];

    // Check if the search term can be converted to a number
    const searchNumber = Number(search);
    if (!isNaN(searchNumber)) {
      searchConditions.push({ price: searchNumber });
    }
    console.log(searchConditions);
  }

  try {
    const query = {};

    // Add month-based condition to the query
    if (month) {
      const monthInt = new Date(`${month} 01`).getMonth() + 1; // Convert month to integer
      query.$expr = { $eq: [{ $month: "$dateOfSale" }, monthInt] };
    }

    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    console.log("Query:", query); // Log the query object

    const transactions = await ProductTransaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).send("Error fetching transactions.");
  }
};

const monthMap = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export const getStatistics = async (req, res) => {
  const { month } = req.query;
  // const startDate = new Date(`${month}-021`);
  // console.log(startDate);

  if (!month || !monthMap[month]) {
    return res.status(400).json({ error: "Invalid month parameter" });
  }

  const monthInt = monthMap[month]; // Convert month name to an integer
  console.log(monthInt);

  try {
    const totalSaleAmount = await ProductTransaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthInt] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    const totalSoldItems = await ProductTransaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthInt] },
          sold: true,
        },
      },
      {
        $count: "totalSoldItems",
      },
    ]);

    const totalNotSoldItems = await ProductTransaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthInt] },
          sold: false,
        },
      },
      {
        $count: "totalNotSoldItems",
      },
    ]);

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems: totalSoldItems[0]?.totalSoldItems || 0,
      totalNotSoldItems: totalNotSoldItems[0]?.totalNotSoldItems || 0,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error); // Log the error
    res.status(500).send("Error fetching statistics.");
  }
};

export const getBarChart = async (req, res) => {
  const { month } = req.query;
  const monthInt = new Date(`${month} 01`).getMonth() + 1;

  try {
    const priceRanges = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-200", min: 101, max: 200 },
      { range: "201-300", min: 201, max: 300 },
      { range: "301-400", min: 301, max: 400 },
      { range: "401-500", min: 401, max: 500 },
      { range: "501-600", min: 501, max: 600 },
      { range: "601-700", min: 601, max: 700 },
      { range: "701-800", min: 701, max: 800 },
      { range: "801-900", min: 801, max: 900 },
      { range: "901-above", min: 901, max: Infinity },
    ];

    const barChartData = await Promise.all(
      priceRanges.map(async ({ range, min, max }) => {
        const count = await ProductTransaction.countDocuments({
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthInt] },
          price: { $gte: min, $lte: max === Infinity ? 999999 : max },
        });
        return { range, count };
      })
    );

    res.status(200).json(barChartData);
  } catch (error) {
    res.status(500).send("Error fetching bar chart data.");
  }
};

export const getPieChart = async (req, res) => {
  const { month } = req.query;
  const monthInt = new Date(`${month} 01`).getMonth() + 1; // Convert month to integer

  try {
    const pieChartData = await ProductTransaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthInt] },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(pieChartData);
  } catch (error) {
    res.status(500).send("Error fetching pie chart data.");
  }
};

export const getAllData = async (req, res) => {
  try {
    const transactions = await getTransactions(req, res);
    const statistics = await getStatistics(req, res);
    const barChart = await getBarChart(req, res);
    const pieChart = await getPieChart(req, res);

    res.status(200).json({ transactions, statistics, barChart, pieChart });
  } catch (error) {
    res.status(500).send("Error fetching combined data.");
  }
};
