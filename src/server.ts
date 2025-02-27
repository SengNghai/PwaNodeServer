import express from "express";
import cors from "cors";
import webPush from "web-push";
import bodyParser from "body-parser";

// const vapidKeys = webPush.generateVAPIDKeys();
const vapidKeys = {
  publicKey:
    "BGcX_gocys7cT-vwBT7dJGd5L_tugespkugwm2cIaz0y0dBvoOU8VZb_JYgiaSpkVZJe46dtDwx37Y1idtCr01c",
  privateKey: "8NP8ZMI4LUWaSYcBtPVFEjjy8zuXIxKvvYUfhWH1iVg",
};

console.log(vapidKeys);

const app = express();
const port = process.env.PORT || 9898;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

webPush.setVapidDetails(
  "mailto:sengnghai@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

// 提供 VAPID 公钥的接口
app.get("/vapidPublicKey", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

const subscriptions: webPush.PushSubscription[] = [];

// 接收并存储订阅对象
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
  console.log("用户已订阅:", subscription);
});

// 发送推送通知
app.post("/sendNotification", (req, res) => {
  const payload = JSON.stringify({
    title: "你好！",
    body: "这是一个推送通知。",
  });

  subscriptions.forEach((sub) => {
    webPush.sendNotification(sub, payload).catch((error) => {
      console.error("发送通知时出错:", error);
    });
  });

  res.status(200).json({});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
