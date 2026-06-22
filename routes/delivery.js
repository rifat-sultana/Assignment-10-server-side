const express = require("express");
const router = express.Router();

const { getDB } = require("../config/db");

router.get("/:email", async (req, res) => {
  try {
    const deliveries =
      await getDB()
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

module.exports = router;