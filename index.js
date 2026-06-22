console.log("Wishlist Route Loaded");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const wishlistRoutes = require("./routes/wishlist");

const { connectDB } = require("./config/db");

const booksRoutes = require("./routes/books");

const paymentRoutes = require("./routes/payment");

const dashboardRoutes = require("./routes/dashboard");

const reviewRoutes =require("./routes/reviews");

const readingListRoutes =require("./routes/readingList");

const deliveryRoutes =require("./routes/delivery");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/books", booksRoutes);
app.use("/payment", paymentRoutes);

app.use("/dashboard", dashboardRoutes);

app.use("/reviews", reviewRoutes);

app.use("/deliveries", deliveryRoutes);

app.use("/readingList", readingListRoutes);

app.use("/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });