import mongoose from "mongoose";

const productTransactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean,
});

export const ProductTransaction = mongoose.model(
  "ProductTransaction",
  productTransactionSchema
);
