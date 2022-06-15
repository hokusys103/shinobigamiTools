import express from "express";
const router = express.Router();
const app = express();
const cors = require("cors");
const routes = require("../routes/routes");
const port = process.env.PORT || 4000;
const hbs = require("hbs");

// app.get('/', (req, res) => { res.send('Hello World'); });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

// ユニットテスト時の呼び出しでなければサーバを起動する
if (!module.parent) {
app.listen(process.env.PORT || 8080, () => {
  console.log('Listening');
});
}

app.listen(port, () => {
  console.log(`ポート番号${port}で立ち上がりました`);
});

// ユニットテストのために app をエクスポートする
export default app;
