
var express=require("express")
var router=express.Router()
var model=require("../modules/model")
var eventProxy=require("eventproxy");
var ep5=new eventProxy();


router.post('/',function (req,res,next) {
    var textno=req.query.textno;
    console.log(textno)
    var answerdata=[];
    model.connect(function (db,client) {
        db.collection('dataarrays').find({textno:textno}).toArray(function (err,ret) {
            if(err){
                console.log("dataarrays查询组成echarts失败!")
            }else{
                console.log("dataarrays的返回结果是:",ret)
                if(ret!==null){
                    for(var i=0;i<ret[0].authors.length;i++){
                        answerdata.push({value:ret[0].contributions[i],name:ret[0].authors[i]})
                    }
                }
                console.log("第一个图表可视化的内容",answerdata)
                res.json(answerdata)
            }
        })
    })
})

router.post('/echarts2',function (req,res,next) {
    var textno=req.query.textno;
    var groupid=req.query.groupno;
    var data=[];
    console.log(groupid)

    model.connect(function (db) {
        var authors=[];
        var logintimes=[];
        db.collection("buptgroup").find({groupid:parseInt(groupid)}).toArray(function (err,ret) {
            if(err){
                console.log("有一定的问题耶！",err)
            }else{
                ret.map(function (item,index) {
                    authors.push(item.studentname);
                    logintimes.push(item.logins);
                })
                var answer=[];
                for(var t=0;t<authors.length;t++){
                    answer.push({value:logintimes[t],name:authors[t]});
                }
                console.log("answer的数据是",answer)
                res.json(answer);
            }

        })
        })
        })

router.post('/echarts3',function (req,res,next) {
    var textno=req.query.textno;
    var groupno=req.query.groupno;
    var data=[];
    model.connect(function (db) {
        db.collection("chatmessage").find({groupid:parseInt(groupno)}).toArray(function (err,ret) {
            if(err){
                console.log("查找数据出现了错误")
            }else{
                var authordatas=[];
                var talks = [];
                if(ret.length!==0) {
                    var finalret = ret;
                    db.collection("buptgroup").find({groupid: parseInt(groupno)}).toArray(function (err, ret) {
                        if (err) {
                            console.log("出现了些许错误!")
                        } else {
                            ret.map(function (item, index) {
                                authordatas.push(item.studentname);
                                talks.push(0);
                            })
                            finalret.map(function (item, index) {
                                for (var j = 0; j < authordatas.length; j++) {
                                    // console.log(item.sender)
                                    if (item.sender === authordatas[j]) {
                                        talks[j]++;
                                    }
                                }
                            })
                            var arrays = [];
                            console.log("datas and names:",talks,authordatas);
                            arrays.push({datas:talks, name: authordatas});
                            res.json(arrays);
                        }
                    })
                }else{
                    db.collection("buptgroup").find({groupid: parseInt(groupno)}).toArray(function (err, ret) {
                        if (err) {
                            console.log("出现了些许错误!");
                        } else {
                            ret.map(function (item, index) {
                                authordatas.push(item.studentname);
                                talks.push(0);
                            })
                            var arrays = [];
                            arrays.push({datas: talks, name: authordatas});
                            res.json(arrays);
                        }
                    })
                }
            }
        })
    })
})

router.post('/echarts4',function (req,res,next) {
    var groupno=req.query.groupno;
    var textno=req.query.textno;
    var nodes=[];
    var categories=[];
    var links=[];
    for(var i=0;i<20;i++){
        categories.push(i);
    }
    var positionx=[-83,-20,48,42,50,0,6,-30,-64,-150,-200,-17,-67,0,-100,10,10,-50];
    var positiony=[120,49,47,235,-75,81,100,95,200,90,46,-1,-36,35,40,48,150,160];
    model.connect(function (db) {
        db.collection("chatmessage").find({groupid:parseInt(groupno)}).toArray(function (err,ret) {
            if(err){
                console.log("查询socials数据出现了错误！")
            }else{
                let mapping=[];
                if(ret){
                    let retfather=ret;
                    //对数据进行初步的处理，把各种数组全部都统计完毕
                    let authors=[];             //记录对应的作者
                    let connections=[];         //记录对应的连接方式
                    let authorsandvalues=[];    //记录作者的谈话次数
                    let connectionsandvalues=[];//关联和数值
                    let totalconnectionvalues=0; //统计总的connections的数量
                    let totaltalkvalues=0;       //统计总的talk的数量
                    db.collection("buptgroup").find({groupid:parseInt(groupno)}).toArray(function (err,ret) {
                        if(err){
                            console.log("查找数据出现了问题！")
                        }else{
                            ret.map(function (item,index) {
                                mapping.push({studentno:item.studentno,studenname:item.studentname});
                            })
                            db.collection("dataarrays").find({textno:textno}).toArray(function (err,ret) {  //处理authors和authorsandvalues
                                if(err){
                                    console.log("查询出现了错误！")
                                }else{
                                    authors=ret[0].authors;
                                    for(var i=0;i<authors.length;i++){
                                        authorsandvalues.push(1);
                                    }
                                    for(var i=0;i<authors.length;i++){                                      //把学号一一映射成username
                                       for(var j=0;j<mapping.length;j++){
                                           if(mapping[j].studentno===authors[i]){
                                               authors[i]=mapping[j].studenname;
                                           }
                                       }
                                    }
                                    // console.log(authorsandvalues)
                                    // console.log(authors)
                                    // console.log(retfather)
                                    for(var i=0;i<retfather.length;i++){          //遍历每一条数据，然后对values进行初始累加
                                        totaltalkvalues++;
                                        for(var j=0;j<authors.length;j++){  //如果不是@就正常统计就OK了
                                            if(retfather[i].sender===authors[j]){
                                                authorsandvalues[j]++;
                                                break;
                                            }
                                        }
                                        var str=retfather[i].atwhos.split("\"");
                                        if(retfather[i].isat==true){            //如果是@需要对connections进行相应的操作
                                            totalconnectionvalues++;
                                            let flags=1;
                                            for(var j=0;j<connections.length;j++){
                                                var str=retfather[i].atwhos.split("\"");
                                                console.log(str[1]);
                                                if((connections[j].sender===retfather[i].sender)&&(connections[j].target===str[1])){
                                                    connectionsandvalues[j]++;
                                                    flags=0;
                                                    break;
                                                }
                                            }
                                            if(flags==1){
                                                var str=retfather[i].atwhos.split("\"");
                                                connections.push({sender:retfather[i].sender,target:str[1]});
                                                connectionsandvalues.push(1);
                                            }
                                        }
                                    }
                                    // console.log(authors);
                                    // console.log(authorsandvalues);
                                    // console.log(connections);
                                    // console.log(connectionsandvalues);
                                    //对所有的values进行集中化处理，避免出现线条过于粗大以及标记点过于膨胀的现象
                                    for(var b=0;b<connectionsandvalues.length;b++){
                                        connectionsandvalues[b]=parseInt((8*(authors.length)*connectionsandvalues[b])/totalconnectionvalues);
                                    }
                                    for(var c=0;c<authorsandvalues.length;c++){
                                        authorsandvalues[c]=parseInt((25*(authors.length)*authorsandvalues[c])/totaltalkvalues);
                                    }
                                    //将所有的数据转换成合适的格式
                                    for(var i=0;i<authors.length;i++){
                                        nodes.push({id:authors[i],name:authors[i],symbolSize:authorsandvalues[i],x:positionx[i],y:positiony[i],value:authorsandvalues[i],category:categories[i]});
                                    }
                                    for(var i=0;i<connections.length;i++){
                                        links.push({source:connections[i].sender,target:connections[i].target,lineStyle:{width:connectionsandvalues[i]},value:connectionsandvalues[i]});
                                    }
                                    // console.log(nodes);
                                    // console.log(links);
                                    var categoriestosubmit=[];
                                    for(var t1=0;t1<authors.length;t1++){
                                        categoriestosubmit.push({name:authors[t1]});
                                    }
                                    console.log(categoriestosubmit)
                                    res.json({nodes:nodes,links:links,categories:categoriestosubmit});
                                }
                            })
                        }
                    })
                }else{
                    db.collection("buptgroup").find({groupno:parseInt(groupno)}).toArray(function (err,ret) {
                        if(err){
                            console.log("出现了一些错误!")
                        }
                        else{
                            var nodes=[];
                            for(var t=0;t<ret.length;t++){
                                mapping.push({studentno:ret[t].studentno,studentname:ret[t].studentname});
                            }
                            for(var i=0;i<ret.length;i++){
                                nodes.push({id:mapping[i].studentname,name:mapping[i].studentname,symbolSize:5,x:positionx[i],y:positiony[i],value:5,category:categories[i]});
                                links.push({})
                            }
                            var categories2=[];
                            for(var o=0;o<ret.length;o++){
                                categories.push({name:categories2[o]});
                            }
                            res.json({nodes:nodes,links:links,categories:categories2});
                }})
                }
            }
        })
    })
})
router.post('/echarts5',function (req,res,next) {
    var articletitle=req.query.textno;
    var authors=[];             //记录所有参与写作的作者的信息!
    var contributions=[];
    var analysisdata=[];
    var timestamp=[];
    var yline=[];
    var Date=[];

    model.connect(function (db,client) {
            db.collection("timelinecao").find({textno:articletitle}).toArray(function (err,ret) {
                console.log("echarts5的："+ret)
                if(err){
                    console.log("出现了一些小小的错误!")
                }else{
                    authors=ret[0].authors;
                    yline.push("时间轴")
                    ret.map(function (item,index) {
                        contributions.push(item.contributions);
                        timestamp.push(item.timestamp);
                        yline.push(item.timestamp);
                    })
                }
                //打包中
                Date.push(yline);
                for (var i=0;i<authors.length;i++){
                    var temp=[];
                    temp.push(String(authors[i]));
                    for (var j=0;j<contributions.length;j++){
                        temp.push(contributions[j][i]);
                    }
                    Date.push(temp);
                }
                console.log("包裹",Date);
                console.log("这是时间戳",timestamp);
                console.log("这是贡献度",contributions);
                console.log("这是作者",authors);
                res.json(Date);
            })
    })

})

router.post('/echarts6',function (req,res,next) {
    console.log("req的结果是：",req);
    var articletitle=req.query.textno;
    var vocubulary=[];
    var fluent=[];
    var variety=[];
    var complete=[];
    console.log("articletitle是",articletitle);
    model.connect(function (db,client) {
        db.collection("comment").find({textno:articletitle}).toArray(function (err,ret) {
            if(err){
                console.log("出现了一些小小的错误!")
            }else{
                console.log("ret的结果是",ret);
                for(var i=0;i<ret.length;i++){
                    vocubulary.push(ret[i].vocabulary);
                    fluent.push(ret[i].fluent);
                    variety.push(ret[i].variety);
                    complete.push(ret[i].complete);
                }
                console.log("vocubulary",vocubulary);
                console.log("fluent",fluent);
                console.log("variety",variety);
                console.log("complete",complete);
                var vocubularytotal=0;
                var fluenttotal=0;
                var varietytotal=0;
                var compeletetotal=0;
                for(var i=0;i<vocubulary.length;i++){
                    vocubularytotal=vocubularytotal+vocubulary[i];
                    varietytotal=variety[i]+varietytotal;
                    fluenttotal=fluent[i]+fluenttotal;
                    compeletetotal=complete[i]+compeletetotal;
                }
                console.log(vocubularytotal);
                console.log(vocubulary.length);
                var ansvocubulary=vocubularytotal/(vocubulary.length);
                var ansfluenttotal=fluenttotal/(vocubulary.length);
                var ansvariety=varietytotal/(variety.length);
                var anscomplete=compeletetotal/(complete.length);
                console.log("曹操曹操曹操",ansvocubulary,ansfluenttotal,anscomplete,ansvariety);
                if(ansvocubulary==NaN||ansfluenttotal==NaN||anscomplete==NaN||ansvariety==NaN){
                    res.json({data:[0,0,0,0]});
                }
                res.json({data:[ansvocubulary,ansfluenttotal,ansvariety,anscomplete]});
            }
        })
    })
})


router.post('/echartsoftalkstimeline',function (req,res,next) {
    var textno=req.query.textno;
    model.connect(function (db) {
        db.collection("timelinetalks").find({textno:textno}).toArray(function (err,ret) {
            if(err){
                console.log("出现了一些错误!")
            }else{
                var authors=ret[0].authors;
                var timeline=[];
                var talkstimes=[];
                for(var i=0;i<ret.length;i++){
                    timeline.push(ret[i].timestamp);
                    talkstimes.push(ret[i].talks)
                }
                console.log("timeline的结果是:",timeline);
                console.log("talktimes的结果是:",logintimes);
            }
        })
    })
})
router.post('/echartsoflogintimestimeline',function (req,res,next) {
    var textno=req.query.textno;
    model.connect(function (db) {
        db.collection("timelinelogintimes").find({textno:textno}).toArray(function (err,ret) {
            if(err){
                console.log("出现了一些错误!")
            }else{
                var authors=ret[0].authors;
                var timeline=[];
                var logintimes=[];
                for(var i=0;i<ret.length;i++){
                    timeline.push(ret[i].timestamp);
                    logintimes.push(ret[i].logintimes)
                }
                console.log("timeline的结果是:",timeline);
                console.log("logintimes的结果是:",logintimes);
            }
        })
    })
})
module.exports = router;