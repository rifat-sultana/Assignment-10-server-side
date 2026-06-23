const express = require("express");
const router = express.Router();

const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

console.log("DELIVERY FILE VERSION 999");

// ======================================
// Get All Deliveries
// ======================================
router.get("/", async (req, res) => {
  try {
    const deliveries = await getDB()
      .collection("deliveries")
      .find()
      .toArray();

    res.send(deliveries);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to load deliveries",
    });
  }
});

// ======================================
// Get User Delivery History
// ======================================
router.get("/:email", async (req, res) => {
  try {
    const deliveries = await getDB()
      .collection("deliveries")
      .find({
        userEmail: req.params.email,
      })
      .toArray();

    res.send(deliveries);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
    });
  }
});

// ======================================
// Mark Delivery as Delivered
// ======================================
router.patch("/status/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection("deliveries")
      .updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: {
            status: "Delivered",
          },
        }
      );

    res.send({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
    });
  }
});

module.exports = router;