var Category = new function() {
    var rootElement,
        degAngle = 10,
        gonSide, cr,
        cardW, cardH, cardP,
        openH, closeH,
        rotation,
        isOpen,
        _categoryCount,
        _friction = 1.9;
    // 
    var posMark = {
        maxpull: 0,
        maxpush: 0,
        y: 0,
        minRotate: 0,
        maxRotate: 0,
        r: 0
    };
    // -----------------------------------------------------------------------
    // Public
    // -----------------------------------------------------------------------
    this.init = function() {
        // TODO: Add more tab type based on screen ratio
        // TODO: adjust size for aesthetics
        // TODO: Device and OS specific
        if (Device.getDevice() == Device.PHONE) {
            cardH = 210;
            cardW = 146;
            cardP = 8;
            openH = 180;
            closeH = 50;
        } else {
            // TODO: adjust size for tablet
            cardH = 210;
            cardW = 146;
            cardP = 8;
            openH = 180;
            closeH = 50;
        }
        // 
        gonSide = cardW + (cardP * 2);
        rotation = 0;
        isOpen = false;
        cr = getCircleRadius(deg2rad(degAngle), gonSide);
        // 
        posMark.maxpush = (-cr * 2) + closeH;
        posMark.maxpull = (-cr * 2) + openH;
        posMark.y = posMark.maxpush;
        // 
        return this;
    };
    // calculate and draw
    this.render = function() {
        // category json
        // Keeping it local for GC after method
        // TODO: take images from API, enabling image change after some period
        var _categories = {
                'news': {},
                'politics': {},
                'technology': {},
                'business': {},
                'entertainment': {},
                'interesting': {},
                'science': {},
                'health': {},
                'home': {},
            },
            _categoryCount = 0;
        // tray style
        var style = CSS.getStyleStr('width', cr * 2);
        style += CSS.getStyleStr('height', cr * 2);
        style += CSS.getStyleStr(
            'transform',
            CSS.transform.translate('', -cr + (Device.width / 2), posMark.maxpush, 0)
        );

        var template = ['div', {
            id: 'categoryTray',
            class: 'category-tray',
            style: style
        }];
        // 
        for (var i in _categories) {
            _categoryCount++;
            var d = _categories[i],
                ang = degAngle * (_categoryCount - 1);
            // card style
            var cStyle = CSS.getStyleStr("height", cardH);
            cStyle += CSS.getStyleStr("width", cardW);
            cStyle += CSS.getStyleStr('background-image', 'images/' + i + '.png');
            // axes style
            var aStyle = CSS.getStyleStr("height", cr);
            aStyle += CSS.getStyleStr(
                'transform',
                CSS.transform.translate(
                    CSS.transform.rotate('', ang), 0, 0, 0
                )
            );
            template.push(['div', {
                    class: 'category-axes',
                    style: aStyle
                },
                ['div', {
                        class: 'category-card',
                        id: 'categoryCard-' + _categoryCount,
                        style: cStyle
                    },
                    ['span', {
                        class: 'category-card-lbl'
                    }, d.label || i]
                ]
            ]);
        } // end for
        // render HTML
        // console.log('-', JSON.stringify(template));
        var html = JsonML.toHTML(template);
        document.getElementsByTagName('body')[0].appendChild(html);
        // after element
        rootElement = $('#categoryTray')[0];
        posMark.minRotate = -(_categoryCount - 1) * degAngle;
        // 
        return this;
    };

    this.attachEvent = function() {
        console.log('addGesture');
        var mc = new Hammer.Manager(rootElement);
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
        panv.requireFailure(panh);
        // Events
        mc.on("tap", tapOpen);
        mc.on("panh", rotate);
        mc.on("panv", pullPush);
        return this;
    };

    // -----------------------------------------------------------------------
    // Private function
    // -----------------------------------------------------------------------
    var rotateTween;
    var swingTween;
    // tap
    var tapOpen = function(ev) {
        // console.log('Event: ', ev.type, ':', ev.srcEvent);
        if (isOpen) {
            // console.log('-: ', ev.target.id, posMark.r);
            // Formate change
            var id = ev.target.id || '';
            if (id) {
                var tapR = -parseInt(id.split('-')[1]) * 10 + 10;
                if (tapR != posMark.r) {
                    rotateTo(tapR);
                    return 0;
                }
            }
        }
        swing(isOpen);
        isOpen = !isOpen;
    };
    // pan h
    var rotate = function(ev) {
        if (!isOpen) return;
        // console.log('Event: ', ev.type, ':', ev.srcEvent, ev.isFirst);
        var r = posMark.r + (-ev.deltaX / 10);
        // console.log('-', posMark.r, ev.deltaX, r);
        if (ev.eventType == Hammer.INPUT_END) {
            var v = degAngle * parseInt(ev.velocityX * _friction);
            // console.log('PAN END', ev.velocityX, v, r, r + v);
            if (v)
                rotateTo(r + v);
            else
                rotateTo();
        } else {
            if (rotateTween && rotateTween.stop)
                rotateTween.stop();
            rootElement.style[CSS.prefix.transform] = CSS.transform.rotate(rootElement, r.toFixed(2));
        }
    };
    // tap or swipe h
    var rotateTo = function(to) {
        if (rotateTween && rotateTween.stop)
            rotateTween.stop();
        // 
        var trans = CSS.transform.getValues(rootElement),
            from = trans.rotate,
            to = typeof to != 'undefined' ? Math.round(to / 10) * 10 : Math.round(from / 10) * 10,
            easingFn = TWEEN.Easing.Exponential.Out;
        // 
        if (to < posMark.minRotate)
            to = posMark.minRotate;
        if (to > posMark.maxRotate)
            to = posMark.maxRotate;
        // 
        posMark.r = to;
        // animate
        rotateTween = new TWEEN.Tween({
                r: from
            })
            .to({
                r: to
            }, 500)
            .easing(easingFn)
            .onUpdate(function() {
                // console.log('Tween: ', to, from, this.r);
                if (this.r == to) {
                    rotateTween.stop();
                    rotateTween = null;
                } else {
                    MotionFrame.get(TWEEN.update);
                }
                rootElement.style[CSS.prefix.transform] = CSS.transform.rotate(rootElement, this.r);
            })
            .start();
        MotionFrame.get(TWEEN.update);
    };
    // swipe h
    var swing = function(isOpen) {
        if (swingTween && swingTween.stop)
            swingTween.stop();

        var trans = CSS.transform.getValues(rootElement),
            x = trans.translate3d.x,
            from = trans.translate3d.y,
            to = posMark.maxpull,
            easingFn = TWEEN.Easing.Elastic.Out,
            tweenTime = 800;
        // 
        if (isOpen) {
            to = posMark.maxpush;
            easingFn = TWEEN.Easing.Back.Out;
            tweenTime = 500;
        }
        posMark.y = to;
        // animate
        swingTween = new TWEEN.Tween({
                y: from
            })
            .to({
                y: to
            }, tweenTime)
            .easing(easingFn)
            .onUpdate(function() {
                // console.log('-', to, from, this.y);
                if (this.y == to) {
                    swingTween.stop();
                    swingTween = null;
                } else {
                    MotionFrame.get(TWEEN.update);
                }
                rootElement.style[CSS.prefix.transform] = CSS.transform.translate(rootElement, x, this.y);
            })
            .start();
        MotionFrame.get(TWEEN.update);
    };
    // pan v
    // TODO: 1. pull or push based on last direction
    // TODO: 2. pull or push based current-pos >= or <= median-pos
    var pullPush = function(ev) {
        // console.log('pullPush()', ev.type, ':', ev.srcEvent);
        var move = posMark.y + ev.deltaY;
        // console.log('m', posMark.y, ev.deltaY, move);
        if (ev.eventType == Hammer.INPUT_END) {
            // console.log('PAN END');
            swing(isOpen);
            isOpen = !isOpen;
        } else {
            if (swingTween && swingTween.stop)
                swingTween.stop();
            if (move > posMark.maxpull || move < posMark.maxpush)
                return 0;
            rootElement.style[CSS.prefix.transform] = CSS.transform.translate(
                rootElement,
                null,
                move.toFixed(2)
            );
        }
    };
    // -----------------------------------------------------------------------
    // Utill function
    // -----------------------------------------------------------------------
    var deg2rad = function(deg) {
        return deg * (Math.PI / 180);
    };
    var getCircleRadius = function(angle, side) {
        var r = side / (Math.sin(angle));
        return r.toFixed(2);
    };
    return this;
};

/*
    TODO:
    add this.theme
    add api call for card images
    load card image base64 string from db
*/


//
