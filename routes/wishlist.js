const express = require("express");

console.log("Wishlist Route Loaded");

const router = express.Router();

const { getDB } = require("../config/db");

router.post("/", async (req, res) => {
  try {
    const result = await getDB()
      .collection("wishlist")
      .insertOne(req.body);

    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:email", async (req, res) => {
  try {
    const wishlist = await getDB()
      .collection("wishlist")
      .find({
        userEmail: req.params.email,
      })
      .toArray();

    res.send(wishlist);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;