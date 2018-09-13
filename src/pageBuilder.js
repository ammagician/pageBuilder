/**
 * Created by andy on 2018/8/20.
 */

(function(){
    var loadFile = function(files, callback){
        if(files.length == 0){
            callback && callback();
            return;
        }

        var count = 0;
        var loadedCount = 0;
        var timestamp = "" + new Date().getTime();

        for(var i= 0,len=files.length; i<len; i++){
            var f = files[i];
            var isCss = f.indexOf("!css") === 0;
            if(isCss){
                f = f.substring(4);
            }

            var isAbs = f.indexOf("!abs") === 0;
            var path = isAbs? f.substring(5) : f;
            if(path.indexOf("/") == 0){
                path = path.substring(1);
            }

            path += "?_" + timestamp;

            var head = document.getElementsByTagName("head")[0];

            var ele;
            if(isCss){
                ele = document.createElement("link");
                ele.rel = "stylesheet";
                ele.href = path;
                debugger
            }else{
                ele = document.createElement("script");
                ele.type = "text/javascript";
                ele.src = path;
            }

            count++;
            if(ele.readyState){
                // IE
                ele.onreadystatechange = function(){
                    if(ele.readyState == 'loaded' || ele.readyState == 'complete'){
                        loadedCount++;
                        if(loadedCount > 0 && loadedCount === count){
                            callback && callback();
                        }
                    }
                };
            }else{
                ele.onload = function(e){
                    loadedCount++;
                    if(loadedCount > 0 && loadedCount === count){
                        callback && callback();
                    }
                }
            }

            head.appendChild(ele);
        }
    };

    var Block = function(config, builder){
        config = config || {};
        this.name = config.name;
        this.dependencies = config.dependencies || [];
        this.files = config.files || [];
        this.state = "ready";
        this.builder = builder;
        this.events = config.events || {};
        this.launchFn = config.launch;
        this.inited = false;
        this.loadedFns = [];
        this.renderDom = [];

        if(config.dom){
            if(typeof config.dom === "string"){
                config.dom = document.getElementById(config.dom);
            }
            this.renderDom.push(config.dom);
        }

        if(this.builder.debug){
            console.info("Block[" + this.name + "] created");
        }
    };

    Block.prototype = {
        //发起广播, target为all时通知所有Block
        broadcast: function(target, eventName, data){
            if(this.builder.debug){
                console.info("Block[" + this.name + "] broadcast event[" + eventName + "] to " + target);
            }

            this.builder.broadcast(this.name, target, eventName, data);
        },

        //清除Block
        clear: function(callback){
            if(this.builder.debug){
                console.info("Block[" + this.name + "] clear");
            }
            this.stop && this.stop();

            delete this.builder[this.name];
            this.builder = null;
            this.events = {};
            this.launchFn = null;
            this.loadedFns = [];

            for(var i= 0,len=this.renderDom.length; i<len; i++){
                this.renderDom[i].innerHTML = "";
            }

            this.renderDom = [];
            this.render = null;

            callback && callback(this);
        },

        //调用所注册的start方法,可用于激活定时器等, 直接调用不发送全体广播
        start: function(){
            console.warn("start function is empty!");
        },

        //调用所注册的stop方法,可用于清除定时器、请求等, 直接调用不发送全体广播
        stop: function(){
            console.warn("stop function is empty!");
        },

        //添加监听事件
        addEventListener: function(name, event){
            this.events[name] = event;

            if(this.builder.debug){
                console.info("Block[" + this.name + "] add event " + name);
            }
        },

        //渲染Block到dom
        renderTo: function(dom){
            this.renderDom.push(dom);

            if(this.inited){
                this._renderTo(dom);
            }
        },

        _callEvent: function(source, eventName, data){
            this.events[eventName] && this.events[eventName].call(this, source, data);
        },

        _launch: function(){
            if(this.builder.debug){
                console.info("Block[" + this.name + "] launch");
            }

            if(typeof this.launchFn === "function"){
                var depends = this.builder._getBlocks(this.dependencies);
                this.launchFn(depends, this);
            }

            this.inited = true;

            for(var i= 0,len=this.renderDom.length; i<len; i++){
                var dom = this.renderDom[i];
                this._renderTo(dom);
            }

            this.start && this.start();
        },

        _renderTo: function(dom){
            this.render && this.render(dom);
        },

        render: function(dom){
            console.warn("render function is empty!");
        }
    };

    var PageBuilder = function(){
        this.blocks = {};
        this.debug = false;
    };

    PageBuilder.prototype = {
        //批量定义Block, 远程加载服务端注册的配置，实现微服务模式
        init: function(blocks){
            blocks = blocks || [];
            for(var i= 0,len=blocks.length; i<len; i++){
                var b = blocks[i];
                this.define(b);
            }
        },

        //定义Block
        define: function(config){
            if(!config || typeof config.name !== "string" || config.name === ""){
                console.error("Name of Page Block is wrong!");
                return;
            }

            var name = config.name;
            if(this.blocks[name]){
                console.warn("Page Block is exist! -----  " + name);
                return;
            }

            var block = new Block(config, this);
            this.blocks[name] = block;
        },

        _loadDependencies: function(block, callback){
            var depends = block.dependencies;
            var count = depends.length;
            var loadedCount = 0;
            var that = this;

            for(var i= 0,len=depends.length; i<len; i++){
                var dep = depends[i];
                this.load(dep, function(){
                    loadedCount++;

                    if(loadedCount === count){
                        that._loadFiles(block, callback);
                    }
                });
            }
        },

        _loadFiles: function(block, callback){
            loadFile(block.files, callback);
        },

        _getBlocks: function(names){
            var blocks = [];
            for(var i= 0,len=names.length; i<len; i++){
                var block = this.blocks[names];
                blocks.push(block);
            }

            return blocks;
        },

        //发起广播, target为all是通知所有Block
        broadcast: function(source, target, eventName, data){
            source = source || "PageBuildBlock";
            var blocks = this.blocks;

            if(target !== "all" && this.blocks[target]){
                blocks = [this.blocks[target]];
            }

            for(var b in blocks){
                if(b != source){
                    blocks[b]._callEvent(source, eventName, data);
                }
            }
        },

        //添加监听事件
        addEventListener: function(name, eventName, event){
            var block = this.blocks[name];
            if(block){
                block.addEventListener(eventName, event);
            }
        },

        //加载完毕后执行注册的launch方法
        load: function(name, callback){
            var block = this.blocks[name];
            var that = this;
            var cb = function(){
                block.state = "loaded";
                var depends = that._getBlocks(block.dependencies);
                for(var i= 0,len=block.loadedFns.length; i<len; i++){
                    var loadedFn = block.loadedFns[i];
                    loadedFn && loadedFn(depends, block);
                }

                block._launch();

                that.broadcast(name, "all", "launch", "Block[" + name + "] launched")
            };

            if(block){
                block.loadedFns.push(callback);
                if(block.state == "loaded"){
                    var depends = this._getBlocks(block.dependencies);
                    cb && cb(depends, block);
                }else if(block.state == "ready"){
                    console.info("loading " + block.name);
                    block.state = "loading";
                    if(block.dependencies && block.dependencies.length > 0){
                        this._loadDependencies(block, cb);
                    }else{
                        this._loadFiles(block, cb);
                    }
                }
            }
        },

        //注册Block方法，也就是Block的入口, fn为launch函数
        register: function(name, fn){
            var block = this.blocks[name];
            if(!block){
                console.error("Page Block is not defined! -----  " + name);
                return;
            }

            block.launchFn = fn;
        },

        //启动block, 发送全体广播
        startBlock: function(name){
            var block = this.blocks[name];
            if(block){
                block.start();
                this.broadcast(name, "all", "start", "Block[" + name + "] start");
            }
        },

        //停止block, 发送全体广播
        stopBlock: function(name){
            var block = this.blocks[name];
            if(block){
                block.stop();
                this.broadcast(name, "all", "stop", "Block[" + name + "] stop");
            }
        },

        //清除block
        clearBlock: function(name, callback){
            var block = this.blocks[name];
            if(block){
                block.clear(callback);
            }
        },

        //开始调试模式，打印调用过程
        enableDebug: function(enable){
            this.debug = !!enable;
        }
    };

    window.PageBuilder = new PageBuilder();
})();
