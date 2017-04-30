setTimeout(function() {
    Device.init();
    CSS.init();

    Category.init()
        .render()
        .attachEvent();
    // 
    // MotionFrame.start();
    Cardpane.init()
        .create()
        .render()
        // .attachEvent();

    // For Testing
    refreshOnTap();

}, 1300);

// For testing
function refreshOnTap() {
    var mcb = new Hammer.Manager($('body')[0]);
    mcb.add([new Hammer.Tap({
        event: 'bodytripletap',
        taps: 2
    })]);
    mcb.on('bodytripletap', function() {
        location.reload();
    });
}


// REF

// TWEEN.Easing.Back.Out;
// TWEEN.Easing.Circular.Out;
// TWEEN.Easing.Quartic.Out;
// TWEEN.Easing.Quintic.Out;
// TWEEN.Easing.Exponential.Out;






//
