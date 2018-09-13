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
    //ģ�����ƣ���Ҫ��֤Ψһ
    "name": "block3",
    //ģ��ű��ļ���CSSʹ��!css/��ͷ�������ű�ʹ��!abs/��ͷ
    "files": [],
    //ģ������
    "dependencies": [],
    //�����¼���ͬaddEventListener����ѡ
    "events": {
        hello: function(source, msg){
            console.info(source + " say " + msg + " to " + this.name)
        }
    },
    //��ȾĿ��dom����ѡ
    dom: "three",
    //�����ص��¼���ͬregisterʱע��Ч��һ������ѡ
    launch: function(depends, block){
        console.info("launch");
    }
});

