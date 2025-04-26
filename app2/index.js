const express = require("express");
const kafka = require("kafka-node");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const runningDb = () => {
  mongoose.connect(process.env.MONGO_URL);
  const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
  });

  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
  });
  const consumer = new kafka.Consumer(
    client,
    [{ topic: process.env.KAFKA_TOPIC }],
    { autoCommit: true }
  );
  
  consumer.on("message", async (message) => {
    console.log("Received message for mongodb: ");
    const user = new User(JSON.parse(message.value));
    await user.save();
  });
  consumer.on("error", (err) => {
    res.status(500).send("Error to save user in mongodb");
    console.error(err);
  });
};

setTimeout(runningDb, 10000);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});
