var Pscroll = function(options) {
    this.container = options.container;
    this.card = options.card;
    this.dack = options.dack;
    // Constants
    _Decay = options.Decay || 1; // decay
    _EF = options.EF || 3; // decay
    // Methods
    this.render = options.render;
    this.update = options.update;
    // 
    var self = this;
    var _isAnimating = false;

    // Init
    this.init = function() {
        // Find center card
        this.dack.center = Math.floor((this.dack.size - this.dack.buffer - this.dack.buffer) / 2);
        // Dack pointer in order
        this.dack.ptr = [];
        var startIndex = this.dack.size - this.dack.buffer;
        for (var i = 0; i < this.dack.size; i++) {
            this.dack.ptr.push(startIndex++);
            if (startIndex >= this.dack.size)
                startIndex = 0;
        }
        // Joints data
        this.dack.joints = [];
        for (var i in this.dack.ptr)
            this.dack.joints.push(this.card.joint);

        var sx = 0 - (this.card.W * this.dack.buffer) - (this.card.joint * this.dack.buffer);
        for (var i in this.dack.ptr) {
            var d = this.dack.ptr[i];
            this.dack[d] = {
                x: sx + (this.card.W * i) + (this.card.joint * i),
                y: 0,
            };
        }
        // this.dack[1].x += 5;
        // this.dack.joints[1] -= 5;
        // this.dack.joints[0] -= 5;
        // 
        return this;
    };
    //
    var id, x;
    this.attachEvent = function(root) {
        this.container = $(this.container)[0];
        console.log('addGesture');
        var mc = new Hammer.Manager(this.container);
        // recognizers
        var tap = new Hammer.Tap();
        var panh = new Hammer.Pan({
            event: 'panh',
            direction: Hammer.DIRECTION_HORIZONTAL
        });
        var panv = new Hammer.Pan({
            event: 'panv',
            direction: Hammer.DIRECTION_VERTICAL
        });
        // add
        mc.add([panv, panh, tap]);
        // Rules
        // panv.requireFailure(panh);
        // Events
        mc.on("tap", function(ev){
            
        });
        mc.on("panh", function(ev) {
            if (!id) {
                id = parseInt(ev.target.id.split('-')[1]) || null;
                // console.log(ev.target.id, ev.deltaX, ev.direction);
                x = self.dack[id].x;
                if (!id)
                    return;
            }
            console.log('--', x);
            self.calculate(id, x + ev.deltaX, -ev.velocityX);
            if (ev.eventType == Hammer.INPUT_END) {
                id = null;
                x = null;
            }
        });
        // mc.on("panv", pullPush);
        return this;
    };
    // 
    this.settle = function() {
        isAnimating = false;
        // console.log('settle');
        var si = this.dack.ptr[0];
        var sx = parseInt(this.dack[si].x);
        for (var i in this.dack.ptr) {
            var d = this.dack.ptr[i];
            if (this.dack[d].rigid)
                continue;
            this.dack[d].x = sx + (this.card.W * i) + (this.card.joint * i);
            this.dack[d].force = 0;
            this.dack[d].acceleration = 0;
            this.dack[d].rigid = false;
        }
        // 
        self.render();
        return this;
    };
    //

    this.calculate = function(target, x, v) {
        // console.log("calculate", time);
        console.log("->", target, x, v);
        time = new Date();
        // this.dack[target].x += v * 15;
        this.dack[target].x = x;
        v = v * 10;
        var ti = this.dack.ptr.indexOf(target);
        // var v = [];
        for (var i = 0; i < this.dack.ptr.length; i++) {
            if (i == ti) continue;
            var n = Math.abs(i - ti);
            var m = v / n;
            console.log('i', i, n, m);
            this.dack[this.dack.ptr[i]].x += m;
        }
        // for (var i = 1; i < this.dack.ptr.length; i++) {
        //     var c = this.dack.ptr[i];
        //     if (i == ti) {
        //         this.dack[c].x += x;
        //         continue;
        //     }
        //     var p = this.dack.ptr[i - 1];
        //     this.dack[c].x = this.dack[p].x + this.card.W + this.dack.joints[i - 1];
        //     // console.log(this.dack[n].x);
        // }
        this.render();
        // 

        console.log("end calculate", new Date() - time);
    };
    // 
    this.shiftCycle = function() {
        // console.log("shiftCycle", this.dack.center);
        this.dack.ptr.push(this.dack.ptr.shift());
        // reset pos and force
        var ln = this.dack.ptr.length - 1;
        this.dack[this.dack.ptr[ln]].x = this.dack[this.dack.ptr[ln - 1]].x + this.card.W + this.card.joint;
        this.dack[this.dack.ptr[ln]].force = 0;

        if (this.dack.ptr[0] == 0)
            this.dack.cycle++;
        this.dack.center++;
        if (this.dack.center >= this.dack.size)
            this.dack.center = 0;
        // console.log(this.dack.center);
    };
    // 
    this.unshiftCycle = function() {
        // console.log("un-shiftCycle", this.dack.center);
        this.dack.ptr.unshift(this.dack.ptr.pop());
        // reset pos and force
        this.dack[this.dack.ptr[0]].x = this.dack[this.dack.ptr[1]].x - this.card.W - this.card.joint;
        this.dack[this.dack.ptr[0]].force = 0;

        if (this.dack.ptr[this.dack.ptr.length - 1] == 0)
            this.dack.cycle--;
        this.dack.center--;
        if (this.dack.center < 0)
            this.dack.center = this.dack.size - 1;
        // console.log(this.dack.center);
    };
    // 
    return this.init();
};


//
