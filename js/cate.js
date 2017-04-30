var STYLE_PREFIX = {
    transform: Hammer.prefixed(document.body.style, 'transform'),
    transitionDuration: Hammer.prefixed(document.body.style, 'transitionDuration')
};

var trayHandle = document.getElementById('categoryTray'),
    axesHeight = 0,
    angle = 10,
    cardWidth = 146,
    cardHeight = 170,
    pullHeight = cardHeight,
    tabHeight = 50,
    tabbed = true,
    trayRotation = 0,
    category = [{
        name: 'technology',
        bg: 'images/technology.png'
    }, {
        name: 'politics',
        bg: 'images/politics.png'
    }, {
        name: 'business',
        bg: 'images/business.png'
    }, {
        name: 'entertainment',
        bg: 'images/entertainment.png'
    }, {
        name: 'science',
        bg: 'images/science.png'
    }, {
        name: 'health',
        bg: 'images/health.png'
    }, {
        name: 'Interesting',
        bg: 'images/Interesting.png'
    }, {
        name: 'news',
        bg: 'images/news.png'
    }, {
        name: 'home',
        bg: 'images/home.png'
    }],
    totalCat = category.length;

function renderTray() {
    // find axes height
    axesHeight = getAxesHeight(angle, cardWidth);
    var dw = $(document).width(),
        transX = -axesHeight + (dw / 2),
        transY = (-axesHeight * 2) + tabHeight,
        transform = 'translate3d(' + transX + 'px,' + transY + 'px,0px) rotate(' + trayRotation + 'deg)',
        catTemplate = ['div', {
            class: 'category-tray',
        }];

    for (var i in category) {
        var d = category[i],
            ang = angle * parseInt(i);
        catTemplate.push(['div', {
                class: 'category-base',
                style: "height:" + axesHeight + "px; -webkit-transform: rotate(" + ang + "deg);"
            },
            ['div', {
                    class: 'category-card',
                    id: 'categoryCard-' + i,
                    style: "background-image:url(" + d.bg + ")"
                },
                ['span', {
                    class: 'category-card-lbl'
                }, d.name]
            ]
        ]);
    }
    // 
    trayHandle.appendChild(JsonML.toHTML(catTemplate));
    // 
    $('#categoryTray')
        .css("width", (axesHeight * 2) + 'px')
        .css("height", (axesHeight * 2) + 'px')
        .css("-webkit-transform", transform);
    // 
    addGesture();
}

function addGesture() {
    console.log('addGesture');
    var mc = new Hammer.Manager(trayHandle);
    var pan = new Hammer.Pan(),
        tap = new Hammer.Tap();
    mc.add([tap, pan])
        // 
    mc.on("tap", function(ev) {
        console.log('TAP');
        var height = tabHeight;
        if (tabbed)
            height = pullHeight;
        tabbed = !tabbed;
        var transY = (-axesHeight * 2) + height,
            t = trayHandle.style[STYLE_PREFIX.transform] + '',
            transform = t.replace(/([^,]+,\s?)(-?\d+[\.\d]*)(.*)/ig, '$1' + transY + '$3');
        // animate pull
        trayHandle.style[STYLE_PREFIX.transitionDuration] = '.5s';
        trayHandle.style[STYLE_PREFIX.transform] = transform;
        console.debug('t', transform);
    });

    mc.on("pan", function(ev) {
        console.log('PAN');
        if (!!tabbed) {
            if (ev.eventType == Hammer.INPUT_END) {
                // fire tap event
                var e = document.createEvent('Event');
                e.initEvent('tap', false, false);
                mc.dispatchEvent(e);
            }
            return 0;
        }
        var i = 0;
        if (ev.eventType == Hammer.INPUT_END) {
            console.log('PAN END');
            console.log("-", ev.velocity*10);
            var t = trayHandle.style[STYLE_PREFIX.transform] + '',
                r = parseFloat(t.replace(/(.*rotate\()(\-?\d+\.?\d?\d?)(.*)/ig, '$2'));
            trayRotation = parseInt(r);
            trayHandle.style[STYLE_PREFIX.transitionDuration] = '.5s';
            trayRotation = Math.round(trayRotation / 10) * 10;
            if (Math.abs(trayRotation) > (totalCat - 1) * 10)
                trayRotation = -(totalCat - 1) * 10
            if (trayRotation > 0)
                trayRotation = 0;
        } else {
            trayHandle.style[STYLE_PREFIX.transitionDuration] = '.0s';
            i = (-ev.deltaX / 10).toFixed(2);
        }
        // Applu
        var t = trayHandle.style[STYLE_PREFIX.transform] + '',
            r = trayRotation + parseFloat(i),
            transform = t.replace(/(.*rotate\()(\-?\d+\.?\d?\d?)(.*)/ig, '$1' + (r.toFixed(2)) + '$3');

        console.log('---', r, ev.deltaX, ev.eventType);
        console.log(transform);
        trayHandle.style[STYLE_PREFIX.transform] = transform;
    });
}

function getAxesHeight(deg, baseWidth) {
    // rad to deg
    var rad = deg * (Math.PI / 180);
    var r = baseWidth / (Math.sin(rad));
    // var r = baseWidth / (Math.sin(Math.PI/36) * 2);
    return r.toFixed(2);
}


// 
setTimeout(function() {
    renderTray();
}, 1000);


//
