const express = require("express");
const router = express.Router();

const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get All Books (Search + Filter)
// Get All Books (Search + Filter + Pagination)
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      librarianEmail,
      page = 1,
      limit = 6,
    } = req.query;

    const query = {};

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (librarianEmail) {
      query.librarianEmail = librarianEmail;
    }

    const currentPage = Number(page);
    const pageSize = Number(limit);

    const booksCollection = getDB().collection("books");

    const totalBooks =
      await booksCollection.countDocuments(query);

    const books = await booksCollection
      .find(query)
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    res.send({
      books,
      totalBooks,
      currentPage,
      totalPages: Math.ceil(
        totalBooks / pageSize
      ),
    });
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
    const { id } = req.params;
    const booksCollection = getDB().collection("books");

    let book = null;

    try {
      book = await booksCollection.findOne({ _id: new ObjectId(id) });
    } catch {
      book = await booksCollection.findOne({ id: parseInt(id) });
    }

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

// Request Delivery
router.patch(
  "/delivery/:id",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userEmail } = req.body;

      const booksCollection = getDB().collection("books");
      const deliveriesCollection = getDB().collection("deliveries");

      let book = null;
      try {
        book = await booksCollection.findOne({ _id: new ObjectId(id) });
      } catch {
        book = await booksCollection.findOne({ id: parseInt(id) });
      }

      if (!book) {
        return res.status(404).send({
          success: false,
          message: "Book not found",
        });
      }

      const existingDelivery = await deliveriesCollection.findOne({
        bookId: book._id.toString(),
        userEmail,
      });

      if (existingDelivery) {
        return res.status(400).send({
          success: false,
          message: "Delivery already requested",
        });
      }

      await deliveriesCollection.insertOne({
        bookId: book._id.toString(),
        title: book.title,
        fee: book.price,
        userEmail,
        librarianEmail: book.librarianEmail || "",
        status: "Pending Delivery",
        requestDate: new Date(),
        transactionId: "TXN" + Date.now(),
      });

      await booksCollection.updateOne(
        { _id: book._id },
        { $set: { deliveryStatus: "Pending Delivery" } }
      );

      res.send({
        success: true,
        message: "Delivery request successful",
      });
    } catch (error) {
      console.error("Delivery Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to request delivery",
      });
    }
  }
);


// Publish / Unpublish Book
router.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const book = await getDB()
      .collection("books")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!book) {
      return res.status(404).send({ success: false, message: "Book not found" });
    }

    const result = await getDB()
      .collection("books")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status } }
      );

    res.send({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false });
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
