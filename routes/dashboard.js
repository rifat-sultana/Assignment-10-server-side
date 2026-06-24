const express = require("express");

const router = express.Router();

const { getDB } = require("../config/db");

router.get(
  "/librarian-overview",
  async (req, res) => {
    try {
      const books = await getDB()
        .collection("books")
        .find()
        .toArray();

      const deliveries = await getDB()
        .collection("deliveries")
        .find()
        .toArray();

      const totalBooks = books.length;

      const totalEarnings =
        deliveries.reduce(
          (sum, item) =>
            sum + (item.fee || 0),
          0
        );

      const pendingRequests =
        deliveries.filter(
          (d) =>
            d.status ===
            "Pending Delivery"
        ).length;

      // Most Requested Books
      const bookCount = {};

      deliveries.forEach((item) => {
        const title =
          item.title || "Unknown";

        bookCount[title] =
          (bookCount[title] || 0) + 1;
      });

      const mostRequestedBooks =
        Object.entries(bookCount)
          .sort(
            (a, b) => b[1] - a[1]
          )
          .slice(0, 5)
          .map(([title, count]) => ({
            title,
            count,
          }));

      res.send({
        totalBooks,
        totalEarnings,
        pendingRequests,
        mostRequestedBooks,
      });
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
      });
    }
  }
);

router.get(
  "/admin-overview",
  async (req, res) => {
    try {
      const db = getDB();

      const totalUsers = await db
        .collection("users")
        .countDocuments();

      const totalBooks = await db
        .collection("books")
        .countDocuments();

      const totalDeliveries = await db
        .collection("deliveries")
        .countDocuments();

      const revenueResult = await db
        .collection("deliveries")
        .aggregate([
          { $match: { status: "Delivered" } },
          { $group: { _id: null, total: { $sum: "$fee" } } },
        ])
        .toArray();

      const totalRevenue =
        revenueResult.length > 0
          ? revenueResult[0].total
          : 0;

      const booksByCategory = await db
        .collection("books")
        .aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      res.send({
        totalUsers,
        totalBooks,
        totalDeliveries,
        totalRevenue,
        booksByCategory: booksByCategory.map((item) => ({
          category: item._id || "Uncategorized",
          count: item.count,
        })),
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ success: false });
    }
  }
);

module.exports = router;