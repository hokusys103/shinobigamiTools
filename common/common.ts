const mysql = require("mysql2/promise");　//複数のSQLの結果を終わるまで待ちますのでPromiseを使います（非同期処理を同期させる）

//DB接続用関数
exports.connectDatabase = function connectDatabase() {
  //DB接続
  const con = mysql.createPool({
    host    : "localhost",
    user    : "root",
    password: "rootpass",
    port    : 3306,
    database: "hokushin_util",
  });
  return con;
};

//QueryのPromise作成関数
// readySqlsはSQL文を要素に持つ配列で、複数のSQL文を入れることで複数のSQLを実行する
// ？は使わないタイプのSQLに使う
// （SQLは複数でなくても使える）
exports.promiseQuery = function promiseQuery(readySqls: string[]) {
  return (connect: { query: (arg0: string) => any; }
  ) => {
    const sqls = readySqls;
    // Promise.allは、配列中のSQLが全て実行が終わった時点でreturnされる
    return Promise.all(sqls.map((sql) => connect.query(sql)));
  };
};

//Insert,Edit,DeleteのPromise作成関数　
//上同様だが、?を使うタイプ   ?の内容をadditionalDataに入れる
exports.promiseCUD = function promiseCUD(
  readySqls     : string[],
  additionalData: string
) {
  return (con: { query: (arg0: string, arg1: string) => any; }) => {
    console.log("additionalData:" + additionalData);
    const sqls = readySqls;
    return Promise.all(sqls.map((sql) => con.query(sql, additionalData)));
  };
};

//ページングデータ作成関数
exports.getPagingParam = function getPagingParam(
  allCount     : number,//表示するデータの数
  countParPage : number,//1ページで表示するページの数
  specifiedPage: number //現在のページ位置
) {
  let displayCount    = countParPage;
  let pageNationArray = new Array();
  let pagePrevArray   = new Array();
  let pageNextArray   = new Array();
  console.log("全件数：" + allCount);
  const pageNumber = Math.ceil(allCount / countParPage);
  console.log("ページ数:" + pageNumber);
  const startIdNumber = (specifiedPage - 1) * countParPage;
  const pageCriteria = "limit " + startIdNumber + "," + countParPage;
  if (specifiedPage == pageNumber) {
    displayCount = allCount - countParPage * (pageNumber - 1);
  }
  console.log("表示件数:" + displayCount);
  //ページネーション用データ
  for (let i = 1; i <= pageNumber; i++) {
    let pageObject: { active: boolean; page: number; };
    if (i == specifiedPage) {
      pageObject = {
        active: true,
        page  : i,
      };
    } else {
      pageObject = {
        active: false,
        page  : i,
      };
    }
    pageNationArray.push(pageObject);
  }
  //Prev用データ
  let prevObject: { prev: boolean; page: number; };
  if (specifiedPage == 1) {
    prevObject = {
      prev: false,
      page: 1,
    };
  } else {
    prevObject = {
      prev: true,
      page: specifiedPage - 1,
    };
  }
  pagePrevArray.push(prevObject);
  //Next用データ
  let nextObject: { next: boolean; page: number; };
  if (specifiedPage == pageNumber) {
    nextObject = {
      next: false,
      page: pageNumber,
    };
  } else {
    nextObject = {
      next: true,
      page: 1 + Number(specifiedPage),
    };
  }
  pageNextArray.push(nextObject);
  const pageNationObject = {
    pageNumber     : pageNumber,//(allCount/parPage)
    specifiedPage  : specifiedPage,//現在のページ位置
    pageCriteria   : pageCriteria,//limit 0,10みたいな文字列を返す
    displayCount   : displayCount,//countParPage
    pageNationArray: pageNationArray,//active:bool,page: int,
    pagePrevArray  : pagePrevArray,//prev:bool,page:1,
    pageNextArray  : pageNextArray, //next:bool,page:number,
  };
  return pageNationObject;
};
