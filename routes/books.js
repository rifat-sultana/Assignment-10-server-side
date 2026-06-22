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

    const booksCollection =
      getDB().collection("books");

    const deliveriesCollection =
      getDB().collection("deliveries");

    // Find Book
    const book =
      await booksCollection.findOne({
        id,
      });

    if (!book) {
      return res.status(404).send({
        success: false,
        message: "Book not found",
      });
    }

    const existingDelivery =
    await deliveriesCollection.findOne({
    bookId: book.id,
    userEmail: "user@gmail.com",
    status: "Pending Delivery",
  });

    if (existingDelivery) {
    return res.status(400).send({
    success: false,
    message: "Delivery already requested",
  });
}

    // Insert into deliveries collection
    await deliveriesCollection.insertOne({
      bookId: book.id,
      title: book.title,
      fee: book.price,
      userEmail: "user@gmail.com",
      status: "Pending Delivery",
      requestDate: new Date(),
    });

    // Update book status
    const result =
      await booksCollection.updateOne(
        { id },
        {
          $set: {
            deliveryStatus:
              "Pending Delivery",
            paymentStatus: "Paid",
          },
        }
      );

    res.status(200).send({
      success: true,
      message:
        "Delivery request successful",
      result,
    });
  } catch (error) {
    console.error(
      "Error updating delivery:",
      error
    );

    res.status(500).send({
      success: false,
      message:
        "Failed to update delivery",
    });
  }
});

module.exports = router;