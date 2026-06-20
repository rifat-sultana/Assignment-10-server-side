const express = require("express");
const router = express.Router();

const { getDB } = require("../config/db");

// Get All Books
router.get("/", async (req, res) => {
  try {
    const booksCollection = getDB().collection("books");

    const books = await booksCollection.find().toArray();

    res.status(200).send(books);
  } catch (error) {
    console.error("Error fetching books:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch books",
    });
  }
});

// Get Single Book By ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const booksCollection = getDB().collection("books");

    const book = await booksCollection.findOne({ id });

    if (!book) {
      return res.status(404).send({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).send(book);
  } catch (error) {
    console.error("Error fetching book:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch book",
    });
  }
});

// Update Delivery Status After Payment
// Update Delivery Status After Payment
router.patch("/delivery/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const booksCollection = getDB().collection("books");

    const result = await booksCollection.updateOne(
      { id },
      {
        $set: {
          deliveryStatus: "Pending Delivery",
          paymentStatus: "Paid",
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Delivery request successful",
      result,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);

    res.status(500).send({
      success: false,
      message: "Failed to update delivery status",
    });
  }
});

module.exports = router;