const express = require("express");
const router = express.Router();

const { getDB } =
  require("../config/db");

router.get(
  "/:email",
  async (req, res) => {
    try {
      const books =
        await getDB()
          .collection(
            "deliveries"
          )
          .find({
            userEmail:
              req.params.email,
            status:
              "Delivered",
          })
          .toArray();

      res.send(books);
    } catch (error) {
      res.status(500).send({
        success: false,
      });
    }
  }
);

module.exports = router;