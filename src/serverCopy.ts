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
  "mailto:sengnghai@gmail.com",
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
  res.status(201).json({ message: "Subscription successful" });
});

app.post("/sendMessage", (req, res) => {
  const { title, message } = req.body;
  const payload = JSON.stringify({
    title: title || "New Message",
    message: message || "You have received a new message!",
  });

  const sendNotifications = subscriptions.map((subscription) => {
    return webPush
      .sendNotification(subscription, payload)
      .then(() => {
        return subscription;
      })
      .catch((error) => {
        if (error.statusCode === 410) {
          console.error(
            "Subscription has unsubscribed or expired:",
            subscription,
          );
          return null; // 标记为无效订阅
        } else {
          console.error("Error sending notification:", error);
          return subscription; // 标记为有效订阅
        }
      });
  });

  Promise.all(sendNotifications)
    .then((results) => {
      const validSubscriptions = results.filter(
        (result): result is webPush.PushSubscription => result !== null,
      );

      // 更新订阅列表，移除无效订阅
      subscriptions.length = 0;
      subscriptions.push(...validSubscriptions);

      res
        .status(200)
        .json({ message: "Message sent and notification triggered" });
    })
    .catch((error) => {
      console.error("Error processing notifications:", error);
      res.status(500).json({ message: "Failed to send notifications" });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
