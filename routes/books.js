const express = require("express");
const router = express.Router();

const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get All Books
// Get All Books (Search + Filter)
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      status,
    } = req.query;

    const query = {};

    // Search by Title
    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by Category
    if (category && category !== "All") {
      query.category = category;
    }

    // Filter by Status
    if (status && status !== "All") {
      query.status = status;
    }

    const books = await getDB()
      .collection("books")
      .find(query)
      .toArray();

    res.send(books);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch books",
    });
  }
});

// Add Book
router.post("/", async (req, res) => {
  try {
    const book = {
      ...req.body,
      status: "Pending Approval",
      createdAt: new Date(),
    };

    const result = await getDB()
      .collection("books")
      .insertOne(book);

    res.send({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
    });
  }
});

// Get Single Book By ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(
      req.params.id
    );

    const booksCollection =
      getDB().collection("books");

    const book =
      await booksCollection.findOne({
        id,
      });

    if (!book) {
      return res.status(404).send({
        success: false,
        message:
          "Book not found",
      });
    }

    res.status(200).send(book);
  } catch (error) {
    console.error(
      "Error fetching book:",
      error
    );

    res.status(500).send({
      success: false,
      message:
        "Failed to fetch book",
    });
  }
});

// Request Delivery
router.patch(
  "/delivery/:id",
  async (req, res) => {
    try {
      const id = parseInt(
        req.params.id
      );

      const { userEmail } =
        req.body;

      const booksCollection =
        getDB().collection(
          "books"
        );

      const deliveriesCollection =
        getDB().collection(
          "deliveries"
        );

      const book =
        await booksCollection.findOne(
          { id }
        );

      if (!book) {
        return res
          .status(404)
          .send({
            success: false,
            message:
              "Book not found",
          });
      }

      const existingDelivery =
        await deliveriesCollection.findOne(
          {
            bookId:
              book.id,
            userEmail,
          }
        );

      if (
        existingDelivery
      ) {
        return res
          .status(400)
          .send({
            success: false,
            message:
              "Delivery already requested",
          });
      }

      await deliveriesCollection.insertOne(
        {
          bookId:
            book.id,
          title:
            book.title,
          fee:
            book.price,
          userEmail,
          status:
            "Pending Delivery",
          requestDate:
            new Date(),
          transactionId:
            "TXN" +
            Date.now(),
        }
      );

      await booksCollection.updateOne(
        { id },
        {
          $set: {
            deliveryStatus:
              "Pending Delivery",
          },
        }
      );

      res.send({
        success: true,
        message:
          "Delivery request successful",
      });
    } catch (error) {
      console.error(
        "Delivery Error:",
        error
      );

      res.status(500).send({
        success: false,
        message:
          "Failed to request delivery",
      });
    }
  }
);


// Publish / Unpublish Book
router.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const result = await getDB()
      .collection("books")
      .updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: {
            status,
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


// Update Book
router.patch("/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection("books")
      .updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: req.body,
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



// Delete Book
router.delete("/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection("books")
      .deleteOne({
        _id: new ObjectId(
          req.params.id
        ),
      });

    res.send({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message:
        "Failed to delete book",
    });
  }
});

module.exports = router;