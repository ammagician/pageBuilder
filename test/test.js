/**
 * Created by andy on 2018/8/20.
 */


PageBuilder.enableDebug(true);

PageBuilder.define({
    "name": "block1",
    "files": ["blockContent.js", "!css/blockContent.css", "!abs/https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/js/lib/jquery-1.10.2_d88366fd.js"],
    "dependencies": [],
    "events": {
        hello: function(source, msg){
            console.info(source + " say " + msg + " to " + this.name)
        }
    }
});


PageBuilder.load("block1", function(deps, block){
    console.info(block.name + " loaded");
    block.renderTo(document.getElementById("one"));
});

PageBuilder.define({
    "name": "block2",
    "files": ["blockContent2.js"],
    "dependencies": ["block1"],
    "events": {
        hello: function(source, msg){
            console.info(source + " say " + msg + " to " + this.name)
        }
    }
});


PageBuilder.load("block2", function(deps, block){
    console.info(block.name + " loaded");
    block.renderTo(document.getElementById("two"));
});

PageBuilder.define({
    //模块名称，需要保证唯一
    "name": "block3",
    //模块脚本文件，CSS使用!css/开头，外网脚本使用!abs/开头
    "files": [],
    //模块依赖
    "dependencies": [],
    //监听事件，同addEventListener。可选
    "events": {
        hello: function(source, msg){
            console.info(source + " say " + msg + " to " + this.name)
        }
    },
    //渲染目标dom。可选
    dom: "three",
    //启动回调事件，同register时注册效果一样。可选
    launch: function(depends, block){
        console.info("launch");
    }
});

