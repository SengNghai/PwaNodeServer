import express from "express";
import cors from "cors";
import webPush from "web-push";
import bodyParser from "body-parser";

const vapidKeys = webPush.generateVAPIDKeys();

console.log(vapidKeys);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

webPush.setVapidDetails(
  "mailto:example@yourdomain.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);
const subscriptions: webPush.PushSubscription[] = [];

// 提供 VAPID 公钥的接口
app.get("/vapidPublicKey", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post("/subscribe", (req, res) => {
  const subscription: webPush.PushSubscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

app.post("/sendMessage", (req, res) => {
  console.log("sendMessage--req", req.body);
  const { title, message } = req.body;
  const payload = JSON.stringify({
    title: title || "New Message",
    message: message || "You have received a new message!",
  });

  subscriptions.forEach((subscription) => {
    webPush.sendNotification(subscription, payload).catch((error) => {
      console.error("Error sending notification:", error);
    });
  });

  res.status(200).json({ message: "Message sent and notification triggered" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
