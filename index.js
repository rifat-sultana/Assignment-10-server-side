require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const wishlistRoutes = require("./routes/wishlist");
const authRoutes = require("./routes/auth");

const { connectDB, getDB } = require("./config/db");

const booksRoutes = require("./routes/books");

const paymentRoutes = require("./routes/payment");

const dashboardRoutes = require("./routes/dashboard");

const reviewRoutes = require("./routes/reviews");

const readingListRoutes = require("./routes/readingList");

const deliveryRoutes = require("./routes/delivery");
const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/books", booksRoutes);

app.use("/payment", paymentRoutes);

app.use("/dashboard", dashboardRoutes);

app.use("/reviews", reviewRoutes);

app.use("/deliveries", deliveryRoutes);

app.use("/readingList", readingListRoutes);

app.use("/wishlist", wishlistRoutes);

app.use("/auth", authRoutes);

app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

// const PORT = process.env.PORT || 5000;

// create the admin account during server initialization
const seedAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME || "admin";
    const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const password = process.env.ADMIN_PASSWORD;
    const role = "admin";

    if (!password) {
      console.log("No ADMIN_PASSWORD in .env, skipping admin seed");
      return;
    }

    const usersCollection = getDB().collection("users");
    const existingAdmin = await usersCollection.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists, skipping seed");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    console.log("Admin user seeded successfully");
  } catch (error) {
    console.error("Admin seed error:", error);
  }
};

connectDB()
  .then(async () => {
    await seedAdmin();
    console.log("Database connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(console.error);
