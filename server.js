const express = require("express");
const app = express();
var cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
app.use(express.urlencoded({ extended: true })); //slu : nodejs 에서 html body를 제대로 읽어오려면 이 옵션을 넣어줘야함
app.use(express.json());
app.use(cors());

var db;
//table_name = "post2"
table_name = "sample"

MongoClient.connect(
  "mongodb+srv://jokbo:1111@cluster0.kawqw2r.mongodb.net/?retryWrites=true&w=majority",//보안허술
  function (e, client) {
    if (e) return console.log(e);


    app.listen(process.env.PORT || 8080, "0.0.0.0", function () {
    console.log("✅ listening on 0.0.0.0:" + (process.env.PORT || 8080));//있으면 시스템 포트 없으면 8080
    db = client.db("jokbonode");
     });
  }
);

app.set("view engine", "ejs");

app.get("", function (r, a) {
  a.send("server on duty");
});


app.get("/admin", function (r, a) {
  a.sendFile(__dirname + "/admin.html");
});

app.post("/create", function (r, a) {

  if (r.body.password == "1234") {//보안허술
    db.collection(table_name).insertOne(
      {
        _id: parseInt(r.body._id),
        ancUID: parseInt(r.body.ancUID),
        mySae: parseInt(r.body.mySae),
        myName: r.body.myName,
        myNamechi: r.body.myNamechi,
        ect: r.body.ect,
        moddate: r.body.moddate,
      },
      function (e, r) {
      }
    );
    a.send("create 실행됨");
  }
  else {
    a.send("비밀번호 오류")
  }

});

app.patch("/update/:_id", async function (req, res) { //id는 파라미터 쿼리스트링으로 주고 ect를 바디로줘야함
  let { _id } = req.params;
  var query = { _id: parseInt(_id) };
  var update = {
    $set: {
      ect: req.body.ect,
    },
  };
  var options = { upsert: true };

  try {
    const result = await db.collection(table_name).updateOne(query, update, options);
    res.send("Update completed successfully.");
  } catch (error) {
    console.error("Error updating document:", error);
    res.send("Error updating document.");
  }
});

app.get("/list", function (r, a) {
  db.collection(table_name)
    .find(r.query)
    .toArray(async (e, dbItems) => {
      var updarray = [];

      var akak = 0;

      for (let dbItem of dbItems) {
        akak++;
        var ufo;
        var ugo;

        const r = await db
          .collection(table_name)
          .find({ _id: dbItem.ancUID })
          .toArray();
        ufo = r[0];

        if (ufo == null) {
          var uf = {
            _id: "-",
            myName: "-",
            myNamechi: "-",
          };
        } else {
          const r2 = await db
            .collection(table_name)
            .find({ _id: ufo.ancUID })
            .toArray();
          ugo = r2[0];

          var uf = {
            _id: ufo._id,
            myName: ufo.myName,
            myNamechi: ufo.myNamechi,
          };
        }

        if (ugo == null) {
          var ug = {
            _id: "-",
            myName: "-",
            myNamechi: "-",
          };
        } else {
          var ug = {
            _id: ugo._id,
            myName: ugo.myName,
            myNamechi: ugo.myNamechi,
          };
        }
        var u = {
          _id: dbItem._id,
          mySae: dbItem.mySae,
          myName: dbItem.myName,
          myNamechi: dbItem.myNamechi,
          father: uf,
          grandPa: ug,
          ect: dbItem.ect,
        };
        updarray.push(u);
      }
      a.send(updarray);
    });
});

app.get("/listlimited", function (r, a) {
  const pageSize = 100;
  var pageNumber = 1; //r 로부터 받아와야하는 값임
  var skipAmount = (pageNumber - 1) * pageSize;
  db.collection(table_name)
    .find().skip(skipAmount).limit(pageSize)
    .toArray(async (e, dbItems) => {
      var updarray = [];

      var akak = 0;

      for (let dbItem of dbItems) {
        akak++;
        var ufo;
        var ugo;

        const r = await db
          .collection(table_name)
          .find({ _id: dbItem.ancUID })
          .toArray();
        ufo = r[0];

        if (ufo == null) {
          var uf = {
            _id: "-",
            myName: "-",
            myNamechi: "-",
          };
        } else {
          const r2 = await db
            .collection(table_name)
            .find({ _id: ufo.ancUID })
            .toArray();
          ugo = r2[0];

          var uf = {
            _id: ufo._id,
            myName: ufo.myName,
            myNamechi: ufo.myNamechi,
          };
        }

        if (ugo == null) {
          var ug = {
            _id: "-",
            myName: "-",
            myNamechi: "-",
          };
        } else {
          var ug = {
            _id: ugo._id,
            myName: ugo.myName,
            myNamechi: ugo.myNamechi,
          };
        }
        var u = {
          _id: dbItem._id,
          mySae: dbItem.mySae,
          myName: dbItem.myName,
          myNamechi: dbItem.myNamechi,
          father: uf,
          grandPa: ug,
          ect: dbItem.ect,
        };
        updarray.push(u);
      }
      a.send(updarray);
    });
});

app.get("/all", function (req, ans) {
  db.collection(table_name)
    .find()
    .toArray(function (e, r) {
      var oriArray = r;
      var upgArray = [];
      var maxSae = 0;
      var minSae = 9999;
      for (var a of oriArray) {
        var b = {
          _id: oriArray[a]._id,
          ancUID: oriArray[a].ancUID,
          mySae: oriArray[a].mySae,
          myName: oriArray[a].myName,
          myNamechi: oriArray[a].myNamechi,
          children: [],
        };
        upgArray.push(b); //업글배열 만들기
        if (maxSae < oriArray[a].mySae) {
          //최대세와 최소세 구하기
          maxSae = oriArray[a].mySae;
        }
        if (minSae > oriArray[a].mySae) {
          minSae = oriArray[a].mySae;
        }
      }

      var len = upgArray.length;
      //--------
      for (var tmp = maxSae; tmp >= minSae; tmp--) {
        //기능 : upgArray의 해당 세의 얘들을 찾아서 자기네들 조상의 child 배열에 push 한 후 , 해당 애들을 제거한다.
        //마지막세부터 직속 조상에 넣어줌 2023-01-01 slu Park
        for (i = 0; i < len; i++) {
          if (upgArray[i].mySae == tmp) {
            for (j in upgArray) {
              if (upgArray[j]._id == upgArray[i].ancUID) {
                upgArray[j].children.push(upgArray[i]);
                upgArray.splice(i, 1);
                len -= 1;
                i -= 1;
                break;
              }
            }
          }
        }
      }
      //--------c
      ans.send(upgArray);
    });
});

app.get("/search", async function (r, a) {
  var number = 0;
  if (r.query.myName != undefined &&
    r.query.mySae == undefined &&
    r.query.fatherName == undefined &&
    r.query.grandPaName == undefined) {
    number = 1;
  }
  else if (r.query.myName == undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName == undefined &&
    r.query.grandPaName == undefined) {
    number = 2;
  }
  else if (r.query.myName == undefined &&
    r.query.mySae == undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName == undefined) {
    number = 3;
  }
  else if (r.query.myName == undefined &&
    r.query.mySae == undefined &&
    r.query.fatherName == undefined &&
    r.query.grandPaName != undefined) {
    number = 4;
  }
  else if (r.query.myName != undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName == undefined &&
    r.query.grandPaName == undefined) {
    number = 5;
  }
  else if (r.query.myName != undefined &&
    r.query.mySae == undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName == undefined) {
    number = 6;
  }
  else if (r.query.myName != undefined &&
    r.query.mySae == undefined &&
    r.query.fatherName == undefined &&
    r.query.grandPaName != undefined) {
    number = 7;
  }
  else if (r.query.myName == undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName == undefined) {
    number = 8;
  }
  else if (r.query.myName == undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName == undefined &&
    r.query.grandPaName != undefined) {
    number = 9;
  }
  else if (r.query.myName == undefined &&
    r.query.mySae == undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName != undefined) {
    number = 10;
  }
  else if (r.query.myName != undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName == undefined) {
    number = 11;
  }
  else if (r.query.myName != undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName == undefined &&
    r.query.grandPaName != undefined) {
    number = 12;
  }
  else if (r.query.myName != undefined &&
    r.query.mySae == undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName != undefined) {
    number = 13;
  }
  else if (r.query.myName == undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName != undefined) {
    number = 14;
  }
  else if (r.query.myName != undefined &&
    r.query.mySae != undefined &&
    r.query.fatherName != undefined &&
    r.query.grandPaName != undefined) {
    number = 15;
  }

  var oriArray = [];

  switch (number) {
    case 1:
      oriArray = await db.collection(table_name).find({ myName: r.query.myName }).toArray()
      break;
    case 2:
      oriArray = await db.collection(table_name).find({ mySae: parseInt(r.query.mySae) }).toArray()
      break;
    case 3:
      //아빠이름만 있는경우
      fatherObjectArray = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()
      for (father of fatherObjectArray) {
        var tmpArray = await db.collection(table_name).find({ ancUID: parseInt(father._id) }).toArray()
        for (tmpobject of tmpArray) {
          oriArray.push(tmpobject)
        }
      }
      break;
    case 4:
      //할아버지 이름만 있는 경우
      grandpaObjectArray = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray()
      for (grandfather of grandpaObjectArray) {
        var fatherObjectArray = await db.collection(table_name).find({ ancUID: parseInt(grandfather._id) }).toArray()
        for (father of fatherObjectArray) {
          var tmpArray = await db.collection(table_name).find({ ancUID: parseInt(father._id) }).toArray()
          for (tmpobject of tmpArray) {
            oriArray.push(tmpobject)
          }
        }
      }
      break;
    case 5:
      //세와 이름 만 있는 경우 이름으로 쿼리 후 세로 거름
      var arrayByNameAndSae = await db.collection(table_name).find({ myName: r.query.myName, mySae: parseInt(r.query.mySae) }).toArray()
      for (tmp of arrayByNameAndSae) {
        oriArray.push(tmp)
      }
      break;
    case 6:
      //이름 과 아빠이름 만 있는 경우, 이름으로 쿼리 후 아빠이름으로 거름
      var arrayByName = await db.collection(table_name).find({ myName: r.query.myName }).toArray()
      var fatherARR = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()
      var fatherUIDARR = []; //부 이름과 일치하는 사람들의 UID 배열 생성
      for (father of fatherARR) {
        fatherUIDARR.push(father._id)
      }
      for (n of arrayByName) {
        if (fatherUIDARR.includes(n.ancUID)) {//부 UID 배열에, 이름으로 검색한 사람들 배열의 ANCUID가 일치시 출력
          oriArray.push(n)
        }
      }
      break;
    case 7:
      //이름과 할아버지 이름만 있는 경우, 이름으로 쿼리 후 할아버지이름으로 거름
      //1. 이름으로 쿼리 한 후 해당 이름과 일치하는 객체 배열을 만든다.   2. 할아버지이름으로 검색해 할아버지배열의 아들배열을 구한다. 3.FatherIsSonUIDArray 의 아들배열을 구한다   4.해당배열과 처음쿼리해온 배열의 _id를 비교한다
      var arrayByName = await db.collection(table_name).find({ myName: r.query.myName }).toArray() //1
      var arrayByGName = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray() //2
      var UIDofArrayByGName = []; //2
      var FatherIsSonUIDArray = []; //2
      for (n of arrayByGName) {//2
        UIDofArrayByGName.push(n._id)
      }
      for (guid of UIDofArrayByGName) {//2
        var faissona = await db.collection(table_name).find({ ancUID: guid }).toArray()
        for (f of faissona) {
          FatherIsSonUIDArray.push(f._id)
        }
      }
      var fass = [];//3
      for (fas of FatherIsSonUIDArray) {
        var fasso = await db.collection(table_name).find({ ancUID: fas }).toArray()
        for (fassoo of fasso) {
          fass.push(fassoo)
        }
      }
      var fassUID = [];
      for (fasso of fass) {
        fassUID.push(fasso._id)
      }
      //4
      for (tmp of fassUID) {
        for (tmp2 of arrayByName) {
          if (tmp2._id == tmp) {
            oriArray.push(tmp2);
          }
        }
      }
      break;
    case 8:
      //세와 아빠이름만 있는경우
      fatherObjectArray = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()
      for (father of fatherObjectArray) {
        var tmpArray = await db.collection(table_name).find({ ancUID: parseInt(father._id) }).toArray()
        for (tmpobject of tmpArray) {
          if (tmpobject.mySae == r.query.mySae) {
            oriArray.push(tmpobject)
          }
        }
      }
      break;
    case 9:
      //세와 할아버지 이름만 있는경우
      grandpaObjectArray = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray()
      for (grandfather of grandpaObjectArray) {
        var fatherObjectArray = await db.collection(table_name).find({ ancUID: parseInt(grandfather._id) }).toArray()
        for (father of fatherObjectArray) {
          var tmpArray = await db.collection(table_name).find({ ancUID: parseInt(father._id) }).toArray()
          for (tmpobject of tmpArray) {
            if (tmpobject.mySae == r.query.mySae) {
              oriArray.push(tmpobject)
            }
          }
        }
      }
      break;
    case 10:
      //할아버지와 아빠이름만 있는 경우
      //1. 아빠이름으로 아빠배열을 쿼리한다. 2.할아버지이름으로 할아버지 UID 배열을 쿼리한다  3.아빠객체에 대하여 아빠객체의 ancUID 가 할아버지 UID 배열에 include 될때, 아빠객체의 uid를 아빠객체 UID 배열에 저장한다. 4.해당uid배열의 자식들을 모두 구해 출력한다.
      fatherObjectArray = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()//1
      gfatherObjectArray = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray()//2
      gfUIDA = [];
      faUIDA = [];
      for (tmp of gfatherObjectArray) {
        gfUIDA.push(tmp._id)
      }
      //3
      for (tmp of fatherObjectArray) {
        if (gfUIDA.includes(tmp.ancUID)) {
          faUIDA.push(tmp._id);
        }
      }
      //4
      for (tmp of faUIDA) {
        var u = await db.collection(table_name).find({ ancUID: tmp }).toArray()
        for (ttmp of u) {
          oriArray.push(ttmp);
        }
      }
      break;
    case 11:
      var arrayByName = await db.collection(table_name).find({ myName: r.query.myName }).toArray()
      var fatherARR = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()
      var fatherUIDARR = []; //부 이름과 일치하는 사람들의 UID 배열 생성
      for (father of fatherARR) {
        fatherUIDARR.push(father._id)
      }
      for (n of arrayByName) {
        if (fatherUIDARR.includes(n.ancUID)) {//부 UID 배열에, 이름으로 검색한 사람들 배열의 ANCUID가 일치시 출력
          if (n.mySae == r.query.mySae) {
            oriArray.push(n)
          }
        }
      }
      break;
    case 12:
      var arrayByName = await db.collection(table_name).find({ myName: r.query.myName }).toArray() //1
      var arrayByGName = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray() //2
      var UIDofArrayByGName = []; //2
      var FatherIsSonUIDArray = []; //2
      for (n of arrayByGName) {//2
        UIDofArrayByGName.push(n._id)
      }
      for (guid of UIDofArrayByGName) {//2
        var faissona = await db.collection(table_name).find({ ancUID: guid }).toArray()
        for (f of faissona) {
          FatherIsSonUIDArray.push(f._id)
        }
      }
      var fass = [];//3
      for (fas of FatherIsSonUIDArray) {
        var fasso = await db.collection(table_name).find({ ancUID: fas }).toArray()
        for (fassoo of fasso) {
          fass.push(fassoo)
        }
      }
      var fassUID = [];
      for (fasso of fass) {
        fassUID.push(fasso._id)
      }
      //4
      for (tmp of fassUID) {
        for (tmp2 of arrayByName) {
          if (tmp2._id == tmp) {
            if (tmp2.mySae == r.query.mySae) {
              oriArray.push(tmp2);
            }
          }
        }
      }

      break;
    case 13:
      fatherObjectArray = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()//1
      gfatherObjectArray = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray()//2
      gfUIDA = [];
      faUIDA = [];
      for (tmp of gfatherObjectArray) {
        gfUIDA.push(tmp._id)
      }
      //3
      for (tmp of fatherObjectArray) {
        if (gfUIDA.includes(tmp.ancUID)) {
          faUIDA.push(tmp._id);
        }
      }
      //4
      for (tmp of faUIDA) {
        var u = await db.collection(table_name).find({ ancUID: tmp }).toArray()
        for (ttmp of u) {
          if (ttmp.myName == r.query.myName) {
            oriArray.push(ttmp);
          }
        }
      }
      break;
    case 14:
      fatherObjectArray = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()//1
      gfatherObjectArray = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray()//2
      gfUIDA = [];
      faUIDA = [];
      for (tmp of gfatherObjectArray) {
        gfUIDA.push(tmp._id)
      }
      //3
      for (tmp of fatherObjectArray) {
        if (gfUIDA.includes(tmp.ancUID)) {
          faUIDA.push(tmp._id);
        }
      }
      //4
      for (tmp of faUIDA) {
        var u = await db.collection(table_name).find({ ancUID: tmp }).toArray()
        for (ttmp of u) {
          if (ttmp.mySae == r.query.mySae) {
            oriArray.push(ttmp);
          }
        }
      }
      break;
    case 15:
      fatherObjectArray = await db.collection(table_name).find({ myName: r.query.fatherName }).toArray()//1
      gfatherObjectArray = await db.collection(table_name).find({ myName: r.query.grandPaName }).toArray()//2
      gfUIDA = [];
      faUIDA = [];
      for (tmp of gfatherObjectArray) {
        gfUIDA.push(tmp._id)
      }
      //3
      for (tmp of fatherObjectArray) {
        if (gfUIDA.includes(tmp.ancUID)) {
          faUIDA.push(tmp._id);
        }
      }
      //4
      for (tmp of faUIDA) {
        var u = await db.collection(table_name).find({ ancUID: tmp }).toArray()
        for (ttmp of u) {
          if (ttmp.myName == r.query.myName && ttmp.mySae == r.query.mySae) {
            oriArray.push(ttmp);
          }
        }
      }
      break;
    default:
  }



  var updarray = [];
  for (dbItem of oriArray) {
    var ufo;
    var ugo;
    const r = await db.collection(table_name).find({ _id: dbItem.ancUID }).toArray();
    ufo = r[0];
    if (ufo == null) {
      var uf = {
        _id: "-",
        myName: "-",
        myNamechi: "-",
      };
    } else {
      const r2 = await db.collection(table_name).find({ _id: ufo.ancUID }).toArray();
      ugo = r2[0];
      var uf = {
        _id: ufo._id,
        myName: ufo.myName,
        myNamechi: ufo.myNamechi,
      };
    }

    if (ugo == null) {
      var ug = {
        _id: "-",
        myName: "-",
        myNamechi: "-",
      };
    } else {
      var ug = {
        _id: ugo._id,
        myName: ugo.myName,
        myNamechi: ugo.myNamechi,
      };
    }
    var u = {
      _id: dbItem._id,
      mySae: dbItem.mySae,
      myName: dbItem.myName,
      myNamechi: dbItem.myNamechi,
      father: uf,
      grandPa: ug,
      ect: dbItem.ect,
    };
    updarray.push(u);
  }
  a.send(updarray);
});

//id 로 자명 찾아주는 api
app.get("/findson/:_id", function (r, a) {
  let { _id } = r.params;
  db.collection(table_name)
    .find({ ancUID: _id })
    .toArray(function (e, r) {
      a.send(r);
    });
});

//id 로 객체 모든정보 띄워주는 api - id만주면됨
app.get("/detail/:_id", function (r, a) {
  let { _id } = r.params;
  db.collection(table_name)
    .find({ _id: parseInt(_id) })
    .toArray(function (e, r) {
      a.send(r[0]);
    });
});

//id 받아서 위로 2세, 아래로 1세  해서 직계 프랙탈 띄워주는 api
app.get("/4sae/:_id", async function (r, answer) {

  let { _id } = r.params;

  var z = await db.collection(table_name).find({ _id: parseInt(_id) }).toArray();

  var minSae = z[0].mySae - 2;
  var maxSae = minSae + 4;
  if (minSae < 1) minSae = 0;


  var me = z[0];


  var oriArray = [];
  var upgArray = [];
  //0. 리스트에 본인 더함
  oriArray.push(me);
  //1. 리스트에 본인의 조상 더함 : 있을경우엔 더하고 없을경우엔 맒, 없을경우엔 2 건너뛰도록 함
  var anc = await db.collection(table_name).find({ _id: parseInt(me.ancUID) }).toArray();
  var ancI = anc[0];
  if (ancI != undefined) {
    oriArray.push(ancI)
    //2. 리스트에 조상의 조상 더함, 없을경우엔 맒
    var ancanc = await db.collection(table_name).find({ _id: parseInt(ancI.ancUID) }).toArray();
    var ancancI = ancanc[0];
    if (ancancI != undefined) {
      oriArray.push(ancancI)
    }
  }
  //3. 리스트에 본인이 조상인 애들 더함
  var chil = await db.collection(table_name).find({ ancUID: parseInt(me._id) }).toArray();
  for (var ch of chil) {
    oriArray.push(ch);
  }
  //4. 자손의 자손은 나중에~ 


  for (var a of oriArray) {
    var b = {
      _id: a._id,
      ancUID: a.ancUID,
      mySae: a.mySae,
      myName: a.myName,
      myNamechi: a.myNamechi,
      children: [],
    };
    upgArray.push(b);
  }
  var len = upgArray.length;
  for (var tmp = maxSae; tmp > minSae - 1; tmp--) {
    for (i = 0; i < len; i++) {
      if (upgArray[i].mySae == tmp) {
        for (j of upgArray) {
          if (j._id == upgArray[i].ancUID) {
            j.children.push(upgArray[i]);
            upgArray.splice(i, 1);
            len -= 1;
            i -= 1;
            break;
          }
        }
      }
    }
  }
  answer.send(upgArray);
});
//id 받아서 위아래로 2세씩 해서 전체 프랙탈 띄워주는 api
app.get("/5sae/:_id", async function (r, answer) {

  let { _id } = r.params;
  var z = await db.collection(table_name).find({ _id: parseInt(_id) }).toArray();
  var minSae = z[0].mySae - 2;
  var maxSae = minSae + 4;
  if (minSae < 1) minSae = 0;

  var oriArray = await db.collection(table_name)
    .find({ mySae: { $gt: (minSae - 1), $lt: (maxSae + 1) } })
    .toArray()

  var upgArray = [];

  for (var a of oriArray) {
    var b = {
      _id: a._id,
      ancUID: a.ancUID,
      mySae: a.mySae,
      myName: a.myName,
      myNamechi: a.myNamechi,
      children: [],
    };
    upgArray.push(b);
  }
  var len = upgArray.length;
  for (var tmp = maxSae; tmp > minSae - 1; tmp--) {
    for (i = 0; i < len; i++) {
      if (upgArray[i].mySae == tmp) {
        for (j of upgArray) {
          if (j._id == upgArray[i].ancUID) {
            j.children.push(upgArray[i]);
            upgArray.splice(i, 1);
            len -= 1;
            i -= 1;
            break;
          }
        }
      }
    }
  }
  answer.send(upgArray);
});

//id 받아서 위아래로 4,5세씩 해서 전체 프랙탈 띄워주는 api //이제안씀
app.get("/10sae/:_id", async function (r, answer) {

  let { _id } = r.params;
  var z = await db.collection(table_name).find({ _id: parseInt(_id) }).toArray();
  var minSae = z[0].mySae - 4;
  var maxSae = minSae + 9;
  if (minSae < 1) minSae = 0;

  var oriArray = await db.collection(table_name)
    .find({ mySae: { $gt: (minSae - 1), $lt: (maxSae + 1) } })
    .toArray()

  var upgArray = [];

  for (var a of oriArray) {
    var b = {
      _id: a._id,
      ancUID: a.ancUID,
      mySae: a.mySae,
      myName: a.myName,
      myNamechi: a.myNamechi,
      children: [],
    };
    upgArray.push(b);
  }
  var len = upgArray.length;
  for (var tmp = maxSae; tmp > minSae - 1; tmp--) {
    for (i = 0; i < len; i++) {
      if (upgArray[i].mySae == tmp) {
        for (j of upgArray) {
          if (j._id == upgArray[i].ancUID) {
            j.children.push(upgArray[i]);
            upgArray.splice(i, 1);
            len -= 1;
            i -= 1;
            break;
          }
        }
      }
    }
  }
  answer.send(upgArray);
});

//id 받아서 증조할아버지를 찾고 나의 손자 세대까지(minsae + 5) 보여주는 8촌 계보
app.get("/8chon/:_id", async function (r, answer) {

  let { _id } = r.params;
  var z = await db.collection(table_name).find({ _id: parseInt(_id) }).toArray();


  //3세 이하는 조회 불가능하게 설정 (무조건 고조할아버지까진 있도록 설계)
  if (z[0].mySae < 4) {
    var answerArray = [
      {
        _id: 0,
        ancUID: 0,
        mySae: 0,
        myName: '선조',
        myNamechi: '부정확',
        children: []
      }
    ]
    answer.send(answerArray);
    return;
  }
  //아버지 없는 예외적 객체들 조회 불가능하게 설정
  if (z[0].ancUID == null) {
    var answerArray = [
      {
        _id: 0,
        ancUID: 0,
        mySae: 0,
        myName: '선조',
        myNamechi: '부정확',
        children: []
      }
    ]
    answer.send(answerArray);
    return;
  }

  var minSae = z[0].mySae - 4;
  var maxSae = z[0].mySae + 3;

  if (minSae < 1) minSae = 0;
  var oriArray = [];
  var po = null;
  var gpo = null;
  var ggpo = null;

  var poa = await db.collection(table_name).find({ _id: parseInt(z[0].ancUID) }).toArray();
  var po = poa[0];

  var gpoa = await db.collection(table_name).find({ _id: parseInt(po.ancUID) }).toArray();
  var gpo = gpoa[0];


  var ggpoa = await db.collection(table_name).find({ _id: parseInt(gpo.ancUID) }).toArray();
  var ggpo = ggpoa[0];
  oriArray.push(ggpo);


  var ggposa = await db.collection(table_name).find({ ancUID: parseInt(ggpo._id) }).toArray();
  var ggposua = [];
  for (var ggpos of ggposa) {
    oriArray.push(ggpos);
    ggposua.push(ggpos._id);
  }

  var gposua = [];
  for (var ggposu of ggposua) {
    var tmp = await db.collection(table_name).find({ ancUID: parseInt(ggposu) }).toArray();
    for (var t of tmp) {
      oriArray.push(t);
      gposua.push(t._id);
    }
  }

  var myBroua = [];
  for (var gposu of gposua) {
    var tmp = await db.collection(table_name).find({ ancUID: parseInt(gposu) }).toArray();
    for (var t of tmp) {
      oriArray.push(t);
      myBroua.push(t._id);
    }
  }

  var sonua = [];
  for (var myBrou of myBroua) {
    var tmp = await db.collection(table_name).find({ ancUID: parseInt(myBrou) }).toArray();
    for (var t of tmp) {
      oriArray.push(t);
      sonua.push(t._id);
    }
  }

  var gsonua = [];
  for (var sonu of sonua) {
    var tmp = await db.collection(table_name).find({ ancUID: parseInt(sonu) }).toArray();
    for (var t of tmp) {
      oriArray.push(t);
      gsonua.push(t._id);
    }
  }

  //증손자까지 떠야한다고하면 부활시키면됩니다. 2023-03-02 slu
  // for (var gsonu of gsonua) {
  //   var tmp = await db.collection(table_name).find({ ancUID: parseInt(gsonu) }).toArray();
  //if(tmp==null||tmp==[]){break;}
  //   for (var t of tmp) {
  //     oriArray.push(t);
  //   }
  // }

  var upgArray = [];
  for (var a of oriArray) {

    var jangnam = "";
    if (a.moddate == "0") {
    }
    else if (a.moddate == "1") {
      jangnam = "¹"
    }
    else if (a.moddate == "2") {
      jangnam = "²"
    }
    else if (a.moddate == "3") {
      jangnam = "³"
    }
    else if (a.moddate == "4") {
      jangnam = "⁴"
    }
    else if (a.moddate == "5") {
      jangnam = "⁵"
    }
    else if (a.moddate == "6") {
      jangnam = "⁶"
    }
    else if (a.moddate == "7") {
      jangnam = "⁷"
    }
    else if (a.moddate == "8") {
      jangnam = "⁸"
    }
    else if (a.moddate == "9") {
      jangnam = "⁹"
    }

    if (a.moddate != "0") {
      var b = {
        _id: a._id,
        ancUID: a.ancUID,
        mySae: a.mySae,
        myName: jangnam + a.myName,
        myNamechi: a.myNamechi,
        children: [],
      };

      upgArray.push(b);
    }
  }



  var len = upgArray.length;
  for (var tmp = maxSae; tmp > minSae - 2; tmp--) {
    for (i = 0; i < len; i++) {
      if (upgArray[i].mySae == tmp) {
        for (j of upgArray) {
          if (j._id == upgArray[i].ancUID) {
            j.children.push(upgArray[i]);
            upgArray.splice(i, 1);
            len -= 1;
            i -= 1;
            break;
          }
        }
      }
    }
  }
  answer.send(upgArray);
});

//모든 사람 이름+한자+세 별uid (uid순으로 나타내주는 페이지)
app.get("/uid", async function (r, a) {
  const res = await db.collection(table_name).find().toArray();

  var upgdArr = [];
  for (obj of res) {
    var tmp = {
      "@@": "@@",
      " 이름 ": obj.myName,
      " 내번호 ": obj._id,
      " 선조번호 ": obj.ancUID,
    }
    upgdArr.push(tmp);
  }
  a.send(upgdArr);
});
//1-5세, 5-10세, 10-15세, 15-20세, 20-++ 세 정보 보내주는 API
app.get("/whole/:partition", async function (r, answer) { //partition 에 1넣으면 1-5세, 2넣으면 5-10세 . . .
  console.log("@@@@@@@@@")
  let { partition } = r.params;
  var maxSae = partition * 5 + 1;
  if (maxSae < 1) maxSae = 1;
  var minSae = maxSae - 7;
  var z = await db.collection(table_name).find({ mySae: { $gt: minSae, $lt: maxSae } }).sort({ _id: 1 }).toArray();
  var oriArray = z;
  var upgArray = [];
  var jangnam = "";
  console.log(minSae + 1)

  for (var a of oriArray) {
    jangnam = "";
    if (a.moddate == "0") {
      jangnam = " 女 "
    }
    else if (a.moddate == "21") {
      jangnam = "系"
    }
    else if (a.moddate == "22") {
      jangnam = "出"
    }
    else if (a.moddate == "1") {
      jangnam = "¹"
    }
    else if (a.moddate == "2") {
      jangnam = "²"
    }
    else if (a.moddate == "3") {
      jangnam = "³"
    }
    else if (a.moddate == "4") {
      jangnam = "⁴"
    }
    else if (a.moddate == "5") {
      jangnam = "⁵"
    }
    else if (a.moddate == "6") {
      jangnam = "⁶"
    }
    else if (a.moddate == "7") {
      jangnam = "⁷"
    }
    else if (a.moddate == "8") {
      jangnam = "⁸"
    }
    else if (a.moddate == "9") {
      jangnam = "⁹"
    }

    var ectt = " ";//첫째열 정보 제외 (230527요구사항)
    if (a.mySae != minSae + 1) {
      ectt = a.ect;
    }
    var incparam = 0;//첫째열에 출가자 또는 여자가 있을시 해당객체 제외 (230531요구사항)
    if (a.mySae == minSae + 1) {
      if (a.moddate == "0" || a.moddate == "22") {
        incparam = 1;
        console.log("incparam 재설정됨3 : " + a.myName)
      }
    }
    if (incparam == 0) {
      var b = {
        _id: a._id,
        ancUID: a.ancUID,
        mySae: a.mySae,
        myName: jangnam + " " + a.myName + " (" + a.myNamechi + ")",
        ect: ectt,
        children: [],
      };
      upgArray.push(b);
    }
  }
  var len = upgArray.length;
  if (partition == 1) {//1페이지 보는 경우에는 0세의 인물을 하나 추가////////////////
    var bbb = {
      _id: 0,
      ancUID: -1,
      mySae: 0,
      myName: " ",
      ect: "",
      children: [],
    };
    upgArray.push(bbb)
  }//////////////////////////////////////////////////////////////////////////
  for (var tmp = maxSae; tmp > minSae - 1; tmp--) {
    for (i = 0; i < len; i++) {
      if (upgArray[i].mySae == tmp) {
        for (j of upgArray) {
          if (j._id == upgArray[i].ancUID) {
            j.children.push(upgArray[i]);
            upgArray.splice(i, 1);
            len -= 1;
            i -= 1;
            break;
          }
        }
      }
    }
  }
  answer.send(upgArray);

});
//--------------------------------------------------testFUNCTION
app.get("/test", function (r, a) {
  a.sendFile(__dirname + "/test.html");
});
app.post("/execute", function (r, a) {
  a.send("실행됨");
  //UNIT
  db.collection(table_name).insertOne(
    {
      _id: parseInt(r.body._id),
      ancUID: parseInt(r.body.ancUID),
      mySae: parseInt(r.body.mySae),
      myName: r.body.myName,
      myNamechi: r.body.myNamechi,
      ect: r.body.ect,
      moddate: r.body.moddate,
    },
    function (e, r) {
    }
  );
  //UNIT

});
  //----많은 데이터 넣기용 함수 (@@@@ 주의 필요 @@@@)
app.post("/insertMany", async function (req, res) {
  console.log('>> wiring /insertMany');
  try {
    const result = await db.collection("sample").insertMany(req.body); //콜랙션 명 잘 보고 사용
    res.json({ insertedCount: result.insertedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
