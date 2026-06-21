const express = require("express");

const router = express.Router();

const { getDB } = require("../config/db");

router.get("/:email", async (req, res) => {
  const reviews =
    await getDB()
      .collection("reviews")
      .find({
        userEmail:
          req.params.email,
      })
      .toArray();

  res.send(reviews);
});

module.exports = router;