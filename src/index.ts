import * as express from 'express';


const app = express();
app.get('/', (req, res) => { res.send('Hello World'); });


// ユニットテスト時の呼び出しでなければサーバを起動する
if (!module.parent) {
app.listen(process.env.PORT || 8080, () => {
  console.log('Listening');
});
}


// ユニットテストのために app をエクスポートする
export default app;
