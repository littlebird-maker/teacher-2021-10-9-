var express = require("express");
var router=express.Router();
var model =require("../modules/model")
var ws=require("ws")
var router = express.Router();
var ws1=require("nodejs-websocket")
var Eventproxy=require("eventproxy");



var eventProxy=new Eventproxy();

router.get("/allowstudenttoshow",function (req,res,next) {          //对学生的查看文章的权限进行相应的限制
    var type=req.query.type;
    var data=JSON.parse(req.query.data);
    model.connect(function (db,client) {
        if(type[1]==='n'){
            if(type[0]==='1'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement1:0}})
            }else if(type[0]==='2'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement2:0}})
            }else if(type[0]==='3'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,texetno:data.textno},{$set:{statement3:0}})
            }else if(type[0]==='4'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement4:0}});
            }else if(type[0]==='5'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement5:0}});
            }else if(type[0]==='6'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement6:0}});
            }

        }else{
            if(type[0]==='1'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement1:1}})
            }else if(type[0]==='2'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement2:1}})
            }else if(type[0]==='3'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,texetno:data.textno},{$set:{statement3:1}})
            }else if(type[0]==='4'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement4:1}});
            }else if(type[0]==='5'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement5:1}});
            }else if(type[0]==='6'){
                db.collection("graphstatement").updateOne({groupid:data.groupno,textno:data.textno},{$set:{statement6:1}});
            }
        }
    })
    res.render("checkarticle",{data:data});
})


function savetheoriginal(data2,res,textno,groupno,teacherno,texttitle,description){
    var successflag=0;                      //用于检验数据是否插入成功
    var authors=[];                         //用于记录小组中的成员
    var contributions=[];                   //记录修改次数的数组
    var logintimes=[];                      //记录登陆次数的数组
    var talks=[];                           //记录谈话次数的数组
    if(textno&&groupno) {
        var data={
            textno:"",
            teacherno:"",
            groupno:"",
            description:"",
            texttitle:""
        }
        data.textno = textno;
        data.groupno = groupno;
        data.description=description;
        data.texttitle=texttitle;
        data.teacherno=teacherno;
    }else{
        var data=data2;
    }
    model.connect(function (db) {   //模型连接数据库
        /*这部分代码主要是为了把小组的信息保存进dataarrays完成dataarrays的初始化*/
        db.collection("article").find({textno:data.textno}).toArray(function(err,ret) {
            if(err){
                console.log("查找文章号出现了一些系统故障!")
            }else{
                if(ret.length!=0){
                    res.redirect("/teacherpage?teacherno="+data.teacherno);
                }
                else{
                    db.collection("buptgroup").find({groupid: parseInt(data.groupno)}).toArray(function (err, ret) {
                        if (err) {
                            console.log("查找小组成员出错了", err)
                            console.log("查找小组成员出错了", err)
                        } else {
                            ret.map(function (item, index) {
                                authors.push(item.studentno)
                                contributions.push(0)
                                logintimes.push(0)
                                talks.push(0);
                            })
                            //插入文章的函数
                            db.collection("dataarrays").insertOne({
                                textno: data.textno,
                                authors: authors,
                                contributions: contributions,
                                talks: talks,
                                logintimes: logintimes,
                            }, function (err) {
                                if (err) {
                                    console.log("文章插入失败!", err)
                                } else {
                                    /*保存mapping的函数*/
                                    db.collection("mapping").insertOne({
                                        textno: data.textno,
                                        groupno: data.groupno,
                                        teacherno: data.teacherno
                                    }, function (err, ret) {
                                        if (err) {
                                            console.log("插入失败！", err)
                                        } else {
                                            console.log("插入成功！")
                                            successflag = 1;
                                            /*保存文章的函数*/
                                            db.collection("article").insertOne({
                                                textno: data.textno,
                                                description: data.description,
                                                title:data.texttitle,
                                                content: " ",
                                                teacherno: data.teacherno,
                                                groupno: data.groupno
                                            }, function (err, ret) {
                                                if (err) {
                                                    console.log("文章插入失败！", err)
                                                } else {
                                                    db.collection("graphstatement").insertOne({groupid:data.groupno,textno:data.textno,statement1:0,statement2:0,statement3:0,statement4:0,statement5:0,statement6:0},function (err,ret) {
                                                        if(err){
                                                            console.log("插入到graphstatement的时候出错了!");
                                                        }else{
                                                            db.collection("reflection").insertOne({textno:data.textno,content:" "},function (err,ret) {
                                                                var logintimes=[];
                                                                var talktimes=[];
                                                                for(var i=0;i<authors.length;i++){
                                                                    logintimes.push(0);
                                                                    talktimes.push(0);
                                                                }
                                                                db.collection("articlethreepartern").insertOne({
                                                                    textno: data.textno,
                                                                    description: data.description,
                                                                    content: " ",
                                                                    partern: "1"
                                                                })
                                                                db.collection("articlethreepartern").insertOne({
                                                                    textno: data.textno,
                                                                    description: data.description,
                                                                    content: " ",
                                                                    partern: "2"
                                                                })
                                                                db.collection("articlethreepartern").insertOne({
                                                                    textno: data.textno,
                                                                    description: data.description,
                                                                    content: " ",
                                                                    partern: "3"
                                                                })
                                                                db.collection("timelinecao").insertOne({
                                                                    textno:data.textno,
                                                                    timestamp:new Date(Date.now()+8*60*60*1000),
                                                                    authors:authors,
                                                                    contributions:contributions
                                                                })
                                                                db.collection("timelinetalks").insertOne({
                                                                    textno:data.textno,
                                                                    talks:talktimes,
                                                                    authors:authors,
                                                                    timestamp:new Date(Date.now()+8*60*60*1000)
                                                                })
                                                                db.collection("timelinelogintimes").insertOne({
                                                                    textno:data.textno,
                                                                    logintimes:logintimes,
                                                                    authors:authors,
                                                                    timestamp:new Date(Date.now()+8*60*60*1000)
                                                                })
                                                                eventProxy.emit("ihavebeenready!");
                                                            });
                                                        }
                                                    });

                                                }
                                            })
                                        }
                                    })

                                }
                            })


                        }
                    })
                }
            }
        })
    })
}


router.post("/submitdata",function (req,res,next) {             //教师添加写作和学生的相关信息的函数
    // var teacherno=document.getElementById("teacherno").value
    console.log(req.body)
    var data={
        textno:req.body.textno,
        teacherno:req.body.teacherno,
        groupno:req.body.groupno,
        description:req.body.description,
        texttitle:req.body.texttitle
    }

    if(data.groupno==="all"){                                                   //如果当前发布的任务面向的对象是全部的小组成员
        model.connect(function (db,client) {
            db.collection("buptgroup").find().toArray(function (err,ret) {
                if(err){
                    console.log("查找buptgroup出现了一些小小错误！")
                }else{
                    var groupidgroup=[];
                    ret.map(function (item,index) {                                     //统计所有小组的小组号
                        var flags=0;
                        for(var i=0;i<groupidgroup.length;i++){
                            if(parseInt(groupidgroup[i])===item.groupid) {
                                flags=1;
                                break;
                            }
                        }
                        if(!flags){
                            groupidgroup.push(item.groupid);
                        }
                    })
                    var stringttocreate= "/createarticle/createarticle?type='many'&teacherno="+data.teacherno+"&title=";
                    for(var i=0;i<groupidgroup.length;i++){                                     //先把跳转路由的参数给加载好
                        var now=""+(parseInt(data.textno)+i);
                        stringttocreate=stringttocreate+now+" ";
                    }
                    var nums=data.textno+"";
                    eventProxy.after("ihavebeenready!",groupidgroup.length,function (err,ret) {
                        res.redirect(stringttocreate);
                    })
                    for(var i=0;i<groupidgroup.length;i++){
                        var data2=data;
                        savetheoriginal(data2,res,nums,groupidgroup[i]+"",data.teacherno,data.texttitle,data.description);
                        nums=""+(parseInt(nums)+1);
                    }
                }
            })
        })
    }else{
        savetheoriginal(data,res);
        res.redirect("/createarticle/createarticle?type='one'&title=" + data.textno + "&teacherno=" + data.teacherno);
    }
    /*跳转到相应的页面*/
})


module.exports=router;
// export default router;


