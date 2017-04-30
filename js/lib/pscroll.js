var Pscroll = function(options) {
    this.container = options.container;
    this.card = options.card;
    this.dack = options.dack;
    // Constants
    this.ElasticMew = options.ElasticMew || 10; // 
    this.Mew = options.Mew || 1.12; // 
    this.velocityConst = options.velocityConst || 13; // 
    this.AccelerationLife = options.AccelerationLife || 1500; // acceleration decay
    // TODO: this should be based on fps
    var _maxAnimDuration = 800;
    // Methods
    this.render = options.render;
    this.update = options.update;
    // locals
    var calculateRef = 'Pscroll.calculate',
        settleRef = 'Pscroll.settle',
        renderRef = 'Pscroll.render';

    // Init
    this.init = function() {
        // Find center card
        this.dack.centerIndex = Math.floor((this.dack.size - this.dack.buffer - this.dack.buffer) / 2);
        // Dack pointer in order
        this.dack.pointer = [];
        var startIndex = this.dack.size - this.dack.buffer;
        for (var i = 0; i < this.dack.size; i++) {
            this.dack.pointer.push(startIndex++);
            if (startIndex >= this.dack.size)
                startIndex = 0;
        }
        // arrange
        var sx = 0 - (this.card.W * this.dack.buffer) - (this.card.joint * this.dack.buffer);
        for (var i in this.dack.pointer) {
            var d = this.dack.pointer[i];
            this.dack[d] = {
                x: sx + (this.card.W * i) + (this.card.joint * i),
                y: 0,
                force: 0,
            };
        }
        // 
        this.card.totalW = this.card.W + this.card.joint;
        // 
        MotionFrame.register(calculateRef, calculate);
        MotionFrame.register(settleRef, settle);
        MotionFrame.register(renderRef, this.render);
        // testing
        // this.dack[1].x += 50;
        // 
        return this;
    };
    // Attach event handler
    this.attachEvent = function() {
        if (!this.container)
            throw "No cntainer";
        this.container = $(this.container)[0];
        var mc = new Hammer.Manager(this.container);
        // recognizers
        var tap = new Hammer.Tap();
        var panh = new Hammer.Pan({
            event: 'panh',
            direction: Hammer.DIRECTION_HORIZONTAL
        });
        mc.add(tap);
        mc.add(panh);
        // 
        mc.on("tap", handleTap);
        mc.on("panhstart", scrollStart);
        mc.on("panhmove", scrolling);
        mc.on("panhend", scrollEnd);
        // mc.on("panv", pullPush);
        return this;
    };

    // --------------------------------------------------------------
    // Private functions
    // --------------------------------------------------------------
    var self = this,
        anchor, posX, velocity, acceleration,
        animDuration = 0, //in frames
        accelTimer = 0;
    // 
    var handleTap = function(e) {
        anchor = parseInt(e.target.id.split('-')[1]);
        if (isNaN(anchor)) {
            anchor = null
            return;
        }
        velocity = 0;
        animDuration = _maxAnimDuration;
        MotionFrame.getUnique(settleRef);
    };
    var scrollStart = function(e) {
        console.log('sdf');
        anchor = parseInt(e.target.id.split('-')[1]);
        if (isNaN(anchor)) {
            anchor = null
            return;
        }
        reset();
        posX = self.dack[anchor].x;
        animDuration = 0;
        acceleration = 0;
        velocity = 0;
    };
    var scrolling = function(e) {
        if (anchor == null) return;
        self.dack[anchor].x = posX + e.deltaX;
        animDuration = _maxAnimDuration;
        // velocity = e.velocityX * 10;
        MotionFrame.getUnique(settleRef);
    };
    var scrollEnd = function(e) {
        // anchor = null;
        animDuration = _maxAnimDuration;
        // velocity = e.velocityX;
        acceleration = -e.velocityX * self.velocityConst;
        accelTimer = new Date();
        MotionFrame.getUnique(settleRef);
    };
    // 
    var settle = function(time) {
        console.log('settle');
        animDuration--;
        if (animDuration > 0)
            MotionFrame.getUnique(settleRef);
        else
            reset();
        MotionFrame.getUnique(renderRef);
        // calculate acceleration
        // TODO: find other way
        if (acceleration != 0) {
            var sec = self.AccelerationLife - (new Date() - accelTimer);
            if (sec > 0) {
                var accel = sec * acceleration / self.AccelerationLife;
                self.dack[anchor].x += accel;
                velocity = acceleration / 10;
            } else
                acceleration = 0;
        }
        // call
        calculate(
            self.card,
            self.dack,
            anchor,
            accel / 2 || 0,
            self.ElasticMew,
            self.Mew,
            time
        );
    };
    // 
    var calculate = function(card, dack, anchor, acceleration, elasticMew, Mew, time, cb) {
        // console.log("calculate", anchor, Mew, acceleration, time);
        time = new Date();
        var anchorInd = dack.pointer.indexOf(anchor);
        // 
        for (var i = dack.pointer.length - 1; i > 0; i--) {
            var c = dack.pointer[i];
            var p = dack.pointer[i - 1];
            // console.log(i, c, p);
            var ef = (dack[c].x - dack[p].x - card.totalW) || 0.001;
            ef /= elasticMew;
            dack[c].force -= ef;
            dack[p].force += ef;
        }
        for (var i in dack.pointer) {
            var di = dack.pointer[i];
            // change pos
            if (di == anchor) {
                dack[di].force = 0;
                continue;
            }
            // var m = Mew + Math.abs(i - anchorInd) / 100;
            // dack[di].force /= m;
            dack[di].force /= Mew;
            // console.log('f', di, dack[di].force);
            // Move
            dack[di].x += dack[di].force + acceleration;
        }
        // Shift 
        //  | mid | x->
        if (dack[dack.centerIndex].x > dack.centerR)
            unshiftCycle();
        //  <-w | mid |
        if (dack[dack.centerIndex].x + card.W < dack.centerL)
            shiftCycle();

        console.log("end calculate", new Date() - time);
        // if (typeof cb == 'function')
            // cb();
    };
    // 
    var reset = function() {
        for (var i in self.dack.pointer) {
            var di = self.dack.pointer[i];
            self.dack[di].force = 0;
        }
    };
    var shiftCycle = function() {
        // console.log("shiftCycle", self.dack.centerIndex);
        var ln = self.dack.pointer.length - 1;
        var lx = self.dack[self.dack.pointer[ln]].x;
        self.dack.pointer.push(self.dack.pointer.shift());
        // reset pos and force
        self.dack[self.dack.pointer[ln]].x = lx + self.card.totalW;
        // self.dack[self.dack.pointer[ln]].force = 0;

        if (self.dack.pointer[0] == 0)
            self.dack.cycle++;
        self.dack.centerIndex++;
        if (self.dack.centerIndex >= self.dack.size)
            self.dack.centerIndex = 0;
        // console.log(self.dack.centerIndex);
    };
    // 
    var unshiftCycle = function() {
        // console.log("un-shiftCycle", self.dack.centerIndex);
        self.dack.pointer.unshift(self.dack.pointer.pop());
        // reset pos and force
        self.dack[self.dack.pointer[0]].x = self.dack[self.dack.pointer[1]].x - self.card.totalW;
        // self.dack[self.dack.pointer[0]].force = 0;

        if (self.dack.pointer[self.dack.pointer.length - 1] == 0)
            self.dack.cycle--;
        self.dack.centerIndex--;
        if (self.dack.centerIndex < 0)
            self.dack.centerIndex = self.dack.size - 1;
        // console.log(this.dack.centerIndex);
    };
    // 
    return this.init();
};


//
