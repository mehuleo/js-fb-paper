var MotionFrame = new function() {
    var fns = {},
        uniquePtr = {},
        ufns = {},
        batch = 0,
        loop = false;
    var self = this;
    // 
    this.register = function(name, fn) {
        if (!arguments || arguments.length < 2)
            throw "register() requires two arguments";
        if (typeof fn != 'function')
            throw "No function to register";
        uniquePtr[name] = fn;
        return this;
    };
    // Simple method for request animation frame
    this.get = function(fn, scope, args) {
        if (typeof fn != 'function')
            throw "Callback function required";
        if (!fns[batch])
            fns[batch] = [];
        fns[batch].push({
            fn: fn,
            scope: scope || {},
            args: args || []
        });
        self.startAnim();
    };
    // One call per frame
    this.getUnique = function(name, scope, args) {
        if (!uniquePtr[name])
            throw "No function named '" + name + "' been registered";
        if (!ufns[batch])
            ufns[batch] = {};
        ufns[batch][name] = {
            fn: uniquePtr[name],
            scope: scope || {},
            args: args || []
        };
        self.startAnim();
    };
    // 
    this.startAnim = function() {
        if (loop)
            return 0;
        loop = true;
        getFrame();
    };
    this.stopAnim = function() {
        loop = false;
    };

    //  
    var getFrame = function(time) {
        /*  ++ here means the batch has been processed and
            calls, here onwards, for get() will be added to new batch. */
        batch++;
        if (!loop)
            return 0;
        // Get animation frame
        animationFrame(getFrame);
        // timeFrame(getFrame);

        // Stop if no batch
        if (!fns[batch - 1] && !ufns[batch - 1])
            self.stopAnim();
        // call all function, asynchronous
        for (var i in fns[batch - 1])
            call(
                fns[batch - 1][i].fn,
                fns[batch - 1][i].scope,
                fns[batch - 1][i].args,
                time
            );
        // call unique functions, asynchronous
        for (var i in ufns[batch - 1])
            call(
                ufns[batch - 1][i].fn,
                ufns[batch - 1][i].scope,
                ufns[batch - 1][i].args,
                time
            );
        // destroy previous batch
        delete fns[batch - 2];
        delete ufns[batch - 2];
        // reset batch id
        if (batch > 300)
            batch = 0;
    };

    // Make asynchronous function call
    var call = function(fn, scope, args, time) {
        args.push(time);
        setTimeout(function() {
            fn.apply(scope, args);
        }, 0);
    };

};

// Fixed fps
window.timeFrame = function(callback) {
    window.setTimeout(callback, 1000 / 80);
};

// shim layer with setTimeout fallback
window.animationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 40);
        };
})();
