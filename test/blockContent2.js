/**
 * Created by andy on 2018/8/20.
 */

PageBuilder.register("block2", function(deps, block){
    block.render = function(dom){
        dom.innerText = block.name;
    };

    block.start = function(){
        console.info(this.name + " start");
    };

    block.stop = function(){
        console.info(this.name + " stop");
    };

    block.addEventListener("say", function(source, msg){
        console.info(source + " say " + msg + " to " + this.name);
    });

    block.broadcast("all", "hello", "大家好");

    PageBuilder.broadcast("block2", "block1", "say", "你好呀")
});
