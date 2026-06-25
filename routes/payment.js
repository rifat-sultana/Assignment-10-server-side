const express = require("express");
const Stripe = require("stripe");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message,
    });
  }
});


// Payment Success
router.patch("/payment-success", async (req, res) => {
  try {
    const { bookId, userEmail } = req.body;

    const db = getDB();

    const booksCollection = db.collection("books");

    const result = await booksCollection.updateOne(
      {
        _id: new ObjectId(bookId),
      },
      {
        $set: {
          paymentStatus: "Paid",
          deliveryStatus: "Pending Delivery",
          borrowerEmail: userEmail,
          paymentDate: new Date(),
        },
      }
    );

    res.send({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;