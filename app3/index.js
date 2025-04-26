const express = require("express");
const kafka = require("kafka-node");
const sequalize = require("sequelize");

const app = express();
app.use(express.json());

const runningDb = () => {
  const db = new sequalize(process.env.POSTGRES_URL);
  const User = db.define("user", {
    name: sequalize.STRING,
    email: sequalize.STRING,
    password: sequalize.STRING,
  });
  db.sync({ force: true });

  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
  });
  const consumer = new kafka.Consumer(
    client,
    [{ topic: process.env.KAFKA_TOPIC }],
    { autoCommit: false }
  );

  consumer.on("message", async (message) => {
    console.log("Received message for postgres: ");
    const user = JSON.parse(message.value);
    await User.create(user);
  });
  consumer.on("error", (err) => {
    res.status(500).send("Error to save user in postgres");
    console.error(err);
  });
};

setTimeout(runningDb, 10000);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});
