let richText = require('rich-text');
let ShareDB = require('sharedb');

const db=require("sharedb-mongo")("mongodb://47.94.108.20:27017/BuptCreation");
const backend = new ShareDB({db});        //创建sharedb数据库
ShareDB.types.register(richText.type);
var WebSocket = require('ws');
var express = require("express")
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');
var router = express.Router()
var http = require('http');
var eventproxys=require("eventproxy")
var theeventProxy=new eventproxys();
router.get('/',function (req,res,next) {

})

let wss=null

let app = express();
app.use(express.static('static'));
app.use(express.static('node_modules/quill/dist'));
let server = http.createServer(app);
wss = new WebSocket.Server({server: server});
wss.on('connection', function(ws) {
    let stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
});

server.listen(8085);
console.log('The sharedbserver Listening on http://localhost:8085');


router.get('/createarticle',function(req,res,next){
    let teacherno=req.query.teacherno;
    var articlename = req.query.title;
    var times=req.query.type;
    theeventProxy.after("successfull!",1,function () {
        console.log("进来了素材侧翻full！")
        res.redirect("/teacherpage?teacherno="+teacherno)
    })
    if(times="many"){
        var nums=articlename.split(' ');
        for(var t=0;t<nums.length;t++){
            console.log(nums[t]);
            createDoc(nums[t]);
            createreflectionDoc(""+nums[t]+"reflection")
        }
        theeventProxy.emit("successfull!")
    }else if(times=="one"){
        createDoc(articlename);
        createreflectionDoc(""+articlename+"reflection")
        theeventProxy.emit("successfull!")
    }
    console.log(articlename);
    function createDoc(article) {
        let connection = backend.connect();             //sharedb连接到端口
        var id=""+article;
        let doc = connection.get('examples', id);   //让doc获取sharedb数据库的example连接中的test-doc文档
        doc.fetch(function (err) {           //获取文档中的数据但是不会触发事件啥的
            if (err) throw err;
            if (doc.type === null) {          //如果当前文档是空的，也就是没有数值的话；会创建一个新的文
                doc.create([], 'rich-text')
            }
        });
    }
    function createreflectionDoc(article) {
        let connection = backend.connect();             //sharedb连接到端口
        var id=""+article;
        let doc2=connection.get('reflectionse',id)
        doc2.fetch(function (err) {           //获取文档中的数据但是不会触发事件啥的
            if (err) throw err;
            if (doc2.type === null) {          //如果当前文档是空的，也就是没有数值的话；会创建一个新的文
                doc2.create([], 'rich-text')
            }
        });
    }
})


router.post("/test",function (req,res,next) {
    var connection = backend.connect();
    var doc = connection.get("examples","nihao1");
    console.log(doc.connection.Connection)
})

module.exports=router;