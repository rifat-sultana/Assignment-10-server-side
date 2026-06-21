const express = require("express");

const router = express.Router();

const { getDB } = require("../config/db");

router.get("/stats/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const deliveries =
      await getDB()
        .collection("deliveries")
        .find({ userEmail: email })
        .toArray();

    const booksRead =
      deliveries.filter(
        (d) =>
          d.status === "Delivered"
      ).length;

    const pendingDeliveries =
      deliveries.filter(
        (d) =>
          d.status ===
          "Pending Delivery"
      ).length;

    const totalSpent =
      deliveries.reduce(
        (sum, item) =>
          sum +
          (item.deliveryFee || 0),
        0
      );

    res.send({
      booksRead,
      pendingDeliveries,
      totalSpent,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
    });
  }
});

module.exports = router;