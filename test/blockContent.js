/**
 * Created by andy on 2018/8/20.
 */

PageBuilder.register("block1", function(deps, block){
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

    block.broadcast("block2", "hello", "你好");

});
