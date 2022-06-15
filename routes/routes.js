// //画面遷移（一覧）はこんな感じだった
// router.get('/', (req, res) => {
// 	const sql = "select * from users";
// 	con.query(sql, function (err, result, fields) {
//     if (err) throw err;
//     //uses
//     res.render('index', { users: result });
//     console.log(result);
// 	});
// });
const express = require("express");
const router = express.Router();
//common/common.jsに接続
const common = require("../common/common");
//promiseQueryはcommon.jsで定義済み
// const ledger = common.promiseQuery();

router.get("/", (req, res) => {
  res.render("top.hbs", {
    pageTitle: "入力フォーム",
  });
});
//一覧表示用JSONを作成
router.get("/test", (req, res) => {
  //DB接続を変数に定義
  const connect = common.connectDatabase();
  //con.queryに当たる部分
  ledger(connect)
    .then((results) => {
      //mainArrayがLedgers:に対応
      let mainArray = new Array();
      //subArrayはdetails:に対応
      let subArray = new Array();

      let thisCategory      = results[0][0][0].category;
      let thisCategoryName  = results[0][0][0].categoryname;
      let thisCategoryColor = results[0][0][0].color;

      results[0][0].map((lowData, i) => {

        //SQL文の結果が、category順に並んでいる前提として
        //categoryが前のループと違ったらelse
        if (thisCategory === lowData["category"]) {
          delete lowData["category"];
          delete lowData["categoryname"];
          delete lowData["color"];
          //サブ配列の書き出し
          subArray.push(lowData);
        } else {
          const forMainArray = {
            category     : thisCategory,
            categoryname : thisCategoryName,
            categoryColor: thisCategoryColor,
            detail       : subArray,
          };
          //メイン配列の書き出し
          mainArray.push(forMainArray);
          //現在のカテゴリを更新
          thisCategory = lowData["category"];
          thisCategoryName = lowData["categoryname"];
          thisCategoryColor = lowData["color"];

          subArray = [];
          delete lowData["category"];
          delete lowData["categoryname"];
          delete lowData["color"];
          subArray.push(lowData);
        }
      });
      //メイン配列用オブジェクト作成(最後の１回)
      const forMainArray = {
        category     : thisCategory,
        categoryname : thisCategoryName,
        categoryColor: thisCategoryColor,
        detail       : subArray,
      };
      mainArray.push(forMainArray);

      res.json({
        pageTitle: "法規制管理記録です",
        ledgers  : mainArray,
      });
      //DBクローズ
      connect.end();
    })
    .catch((err) => {
      //エラー出力
      console.error(err);
      //DBクローズ
      connect.end();
    });
}
);

//Insertーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
router.post(
  "/chat", (req, res) => {
    //バリデーション用設定---------------------------
    const schema = Joi.object({
      id          : Joi.number().integer().min(0),
      categoryname: Joi.string().max(100),
      sortorder   : Joi.number().integer().min(0),
      color       : Joi.string().min(7).max(7),
      currentPage : Joi.number().integer().min(1),
    });
    //----------------------------------------------
    let validationResult = schema.validate(req.body);
    // const currentPage = req.body.currentPage;
    if (validationResult.error) {
      res.json({ messageText: `${validationResult.error.details[0].message}` })
    } else {
      //DB接続
      const con = common.connectDatabase();
      //currentPageはinsertに含めない
      delete req.body.currentPage;
      const insertRecord = common.promiseCUD(readySqlsCategoryInsert, req.body);
      //関数実行
      insertRecord(con)
        .then((results) => {
          //json出力
          res.json({
            messageText: "正常に追加されました"
          });
          //DBクローズ
          con.end();
        })
        .catch((err) => {
          //エラー出力
          console.error(err);
          if (err.errno == 1062) {
            res.json({
              messageText: "追加しようとしたidが重複しています"
            });
          } else {
            res.json({
              messageText: `${String(err.message)}`
            });
          }
          //DBクローズ
          con.end();
        });
    }
  });
//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー


module.exports = router;
