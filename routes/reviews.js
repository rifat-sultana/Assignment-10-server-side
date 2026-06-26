const express = require("express");

const router = express.Router();

const { getDB } = require("../config/db");


// Get Reviews By Book
router.get("/book/:bookId", async (req, res) => {
  try {
    const reviews = await getDB()
      .collection("reviews")
      .find({
        bookId: req.params.bookId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(reviews);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
});
// =======================
// Get Reviews By User
// =======================
router.get("/:email", async (req, res) => {
  try {
    const reviews = await getDB()
      .collection("reviews")
      .find({
        userEmail: req.params.email,
      })
      .toArray();

    res.send(reviews);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
});

// =======================
// Add Review (Verified)
// =======================
router.post("/", async (req, res) => {
  try {
    const { bookId, userEmail, rating, comment } =
      req.body;

    const db = getDB();

    // Verify Delivered
    const delivery =
      await db
        .collection("deliveries")
        .findOne({
          bookId: Number(bookId),
          userEmail,
          status: "Delivered",
        });

    if (!delivery) {
      return res.status(403).send({
        success: false,
        message:
          "Only users with Delivered status can review this book.",
      });
    }

    // Prevent duplicate review
    const existing =
      await db
        .collection("reviews")
        .findOne({
          bookId: Number(bookId),
          userEmail,
        });

    if (existing) {
      return res.send({
        success: false,
        message:
          "You already reviewed this book.",
      });
    }

    await db.collection("reviews").insertOne({
      bookId: Number(bookId),
      userEmail,
      rating,
      comment,
      createdAt: new Date(),
    });

    res.send({
      success: true,
      message:
        "Review submitted successfully.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).send({
      success: false,
      message:
        "Failed to submit review.",
    });
  }
});

module.exports = router;