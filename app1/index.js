const express = require("express");
const kafka = require("kafka-node");

const app = express();
app.use(express.json());

const runningDb = () => {
  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
  });

  const producer = new kafka.Producer(client);

  producer.on("ready", async () => {
    app.post("/create-user", async (req, res) => {
      console.log(req.body, "eq-----------");
      const message = JSON.stringify(req.body);
      const payload = [{ topic: process.env.KAFKA_TOPIC, messages: message }];
      producer.send(payload, async (err, data) => {
        if (err) {
          console.error(err);
          if (!res.headersSent) {
            // only send if not already sent
            res.status(500).send("Error sending message to Kafka");
          }
        } else {
          res.send({ status: "Message queued successfully" });

          if (!res.headersSent) {
            res.send({ status: "Message queued successfully" });
          }
          // SIMULATE APP1 CRASH after sending the message
          setTimeout(() => {
            console.error("Simulating crash: App1 is shutting down!");
            // process.exit(1); // Force crash
          }, 1000); // Crash 1 second after sending
        }
      });
    });
  });
};

setTimeout(runningDb, 10000);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});
