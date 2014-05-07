eXide.namespace("eXide.app.FlexboxSplitter");

eXide.app.FlexboxSplitter = (function () {
    
    Constr = function(layout, resizable, region, min, preferred) {
        var self = this;
        self.resizable = $(resizable);
        self.isHorizontal = region == "west" || region == "east";
        var splitter = self.resizable.find(".resize-handle");
        var toggle = splitter.find("span");
        var container = self.resizable.parents(".layout");
        
        self.prevSize = preferred;
        var hasMoved = false;
        
        splitter.on("mousedown", function(e) {
            e.preventDefault();
            var pos = (self.isHorizontal ? e.pageX : e.pageY);
            hasMoved = false;
            container.on("mousemove", function(e) {
                
                var current = (self.isHorizontal ? e.pageX : e.pageY);
                var diff = (pos - current);
                hasMoved = diff !== 0;
                pos = current;
                if (hasMoved) {
                    if (self.isHorizontal) {
                        var w = self.resizable.width();
                        var d = region == "west" ? -diff : diff;
                        if (w + d >= min) {
                            self.resizable.width(w + d);
                        }
                    } else {
                        var h = self.resizable.height();
                        if (h - (1 - diff) >= min) {
                            self.resizable.height(h - (1 - diff));
                        }
                    }
                    layout.resize();
                }
            });
            $(document).on("mouseup", function() {
                container.off("mousemove");
                $(document).off("mouseup");
            });
        });
        toggle.click(function(e) {
            // toggle panel
            var size = region == "west" || region == "east" ? self.resizable.width() : self.resizable.height();
            if (size == 10) {
                if (region == "west" || region == "east") {
                    self.resizable.width(self.prevSize);
                } else {
                    self.resizable.height(self.prevSize);
                }
                splitter.removeClass("minimized");
                splitter.addClass("resize-handle");
                self.resizable.find(">*:not(.minimized)").show();
            } else {
                self.prevSize = size;
                if (region == "west" || region == "east") {
                    self.resizable.width(10);
                } else {
                    self.resizable.height(10);
                }
                splitter.addClass("minimized");
                splitter.removeClass("resize-handle");
                self.resizable.find(">*:not(.minimized)").hide();
            }
            layout.resize();
        });
    };
    
    Constr.prototype.getSize = function() {
        if (this.resizable.is(":hidden")) {
            return 0;
        }
        if (this.isHorizontal) {
            return this.resizable.width();
        } else {
            return this.resizable.height();
        }
    };
    
    Constr.prototype.setSize = function(size) {
        if (size === 0) {
            this.hide();
            return;
        }
        if (this.isHorizontal) {
            this.resizable.width(size);
        } else {
            this.resizable.height(size);
        }
        
        if (size === 10) {
            var splitter = this.resizable.find(".resize-handle");
            splitter.addClass("minimized");
            this.resizable.find(">*:not(.minimized)").hide();
            splitter.removeClass("resize-handle");
        } else {
            this.prevSize = size;
            this.resizable.find(">*:not(.minimized)").show();
        }
    };
    
    Constr.prototype.hide = function() {
        this.resizable.hide();
    };
    
    Constr.prototype.show = function() {
        if (this.resizable.is(":hidden")) {
            this.resizable.show();
        }
        this.setSize(this.prevSize);
    };
    
    return Constr;
}());

eXide.namespace("eXide.app.Layout");

eXide.app.Layout = (function () {
    
    var PANEL_DEFAULTS = {
        "west": 200,
        "south": 0,
        "east": 0
    };
    
    var Constr = function(editor) {
        this.editor = editor;
        this.regions = {
            "west": new eXide.app.FlexboxSplitter(this, ".panel-west", "west", 100, 200),
            "south": new eXide.app.FlexboxSplitter(this, ".panel-south", "south", 100, 200),
            "east": new eXide.app.FlexboxSplitter(this, ".panel-east", "east", 360, 380)
        };
    };
    
    Constr.prototype.resize = function() {
        eXide.app.resize(true);
    };
    
    Constr.prototype.hide = function(region) {
        this.regions[region].hide();
    };
    
    Constr.prototype.show = function(region) {
        this.regions[region].show();
    };
    
    Constr.prototype.saveState = function() {
        localStorage["eXide.layout.south"] = this.regions.south.getSize();
        localStorage["eXide.layout.west"] = this.regions.west.getSize();
        localStorage["eXide.layout.east"] = this.regions.east.getSize();
    };
    
    Constr.prototype.restoreState = function() {
        for (var region in this.regions) {
            var size = localStorage["eXide.layout." + region];
            if (!size) {
                size = PANEL_DEFAULTS[region];
            }
            this.regions[region].setSize(parseInt(size));
        }
    };
    
    return Constr;
}());