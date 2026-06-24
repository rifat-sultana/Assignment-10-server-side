const express = require("express");
const router = express.Router();

const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const users = await getDB()
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false });
  }
});

router.patch("/role/:id", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["admin", "librarian"].includes(role)) {
      return res.status(400).send({ success: false, message: "Invalid role" });
    }

    const result = await getDB()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { role } }
      );

    res.send({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection("users")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    res.send({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false });
  }
});

module.exports = router;
