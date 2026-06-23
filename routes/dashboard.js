const express = require("express");

const router = express.Router();

const { getDB } = require("../config/db");

router.get(
  "/librarian-overview",
  async (req, res) => {
    console.log(
      "Librarian Route Hit"
    );

    try {
      const books =
        await getDB()
          .collection("books")
          .find()
          .toArray();

      const deliveries =
        await getDB()
          .collection("deliveries")
          .find()
          .toArray();

      const totalBooks =
        books.length;

      const totalEarnings =
        deliveries.reduce(
          (sum, item) =>
            sum +
            (item.fee || 0),
          0
        );

      const pendingRequests =
        deliveries.filter(
          (d) =>
            d.status ===
            "Pending Delivery"
        ).length;

      res.send({
        totalBooks,
        totalEarnings,
        pendingRequests,
      });
    } catch (error) {
      console.log(
        "Librarian Overview Error:",
        error
      );

      res.status(500).send({
        success: false,
      });
    }
  }
);

module.exports = router;