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
    const {
      bookId,
      userEmail,
      rating,
      comment,
    } = req.body;

    const db = getDB();

    const deliveriesCollection =
      db.collection("deliveries");

    const reviewsCollection =
      db.collection("reviews");

    // Verify delivery
    const delivery =
      await deliveriesCollection.findOne({
        bookId,
        userEmail,
        status: "Delivered",
      });

    if (!delivery) {
      return res.status(403).send({
        success: false,
        message:
          "Only users who received this book can review.",
      });
    }

    // Prevent duplicate review
    const existingReview =
      await reviewsCollection.findOne({
        bookId,
        userEmail,
      });

    if (existingReview) {
      return res.status(400).send({
        success: false,
        message:
          "You have already reviewed this book.",
      });
    }

    await reviewsCollection.insertOne({
      bookId,
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
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message:
        "Failed to submit review",
    });
  }
});

module.exports = router;