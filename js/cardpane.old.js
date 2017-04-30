var Cardpane = new function() {
    var RootElem,
        Dack = {
            style: {
                w: 0,
                h: 0,
                gt: 0,
                maxgt: 0,
                btm: 0,
            },
            // 
            buffer: 0,
            visible: 0,
            size: 0,
            first: 0,
            last: 0,
            current: 0,
            prop: [],
            cycle: 0,
        },
        theme;
    var Direction = {
            None: 0,
            TOP: 1,
            RIGHT: 2,
            BOTTOM: 3,
            LEFT: 4
        },
        _ignoreForce = .0001;
    // ------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------
    this.init = function() {
        // TODO: Add more tab type based on screen ratio
        // TODO: adjust size for aesthetics
        // TODO: Device and OS specific
        if (Device.getDevice() == Device.PHONE) {
            Dack.style = {
                w: 152,
                h: 280,
                gt: 13,
                maxgt: 34,
                btm: 5,
            };
            Dack.buffer = 4;
            Dack.visible = Math.floor(Device.width / Dack.style.w);
            Dack.size = Dack.buffer + Dack.visible + Dack.buffer;
            theme = ' default ';
        } else {
            // TODO: adjust size for tablet
        }
        // Position default
        Dack.current = Dack.buffer;
        Dack.last = Dack.size - 1;
        // Create properties for rendering
        for (var i = 0; i < Dack.size; i++) {
            var x = (Dack.style.w * (i - Dack.current)) + (Dack.style.gt * (i - Dack.current));
            if (i < Dack.current)
                x = -((Dack.style.w * (Dack.buffer - i)) + (Dack.style.gt * (Dack.buffer - i)));
            Dack.prop.push({
                y: 0,
                x: x,
                gt: Dack.style.gt,
                v: {
                    d: Direction.None,
                    force: 0,
                    eF: 0,
                    isMoving: false
                }
            });
        }
        // 
        return this;
    };
    this.create = function() {
        // card tray
        var ts = CSS.getStyleStr('height', Dack.style.h);
        ts += CSS.getStyleStr('bottom', Dack.style.btm);
        var template = ['div', {
            id: 'cardpane',
            class: 'cardpane-tray' + theme,
            style: ts
        }];
        // card style
        var cstyle = CSS.getStyleStr('width', Dack.style.w);
        cstyle += CSS.getStyleStr('height', Dack.style.h);
        for (var i = 0; i < Dack.size; i++) {
            var cardhtml = ['div', {
                    class: 'card',
                    style: cstyle,
                    id: 'card-' + i
                },
                ['div', {
                    class: 'image'
                }],
                ['div', {
                    class: 'source'
                }, 'Source ' + i],
                ['div', {
                    class: 'title'
                }, 'Sample title goes here']
            ];
            template.push(cardhtml);
        }
        // render HTML
        // console.log('-', JSON.stringify(template, '', 2));
        var html = JsonML.toHTML(template);
        document.getElementsByTagName('body')[0].appendChild(html);
        // after element
        RootElem = $('#cardpane')[0];
        // 
        return this;
    };
    // 
    this.render = function() {
        console.log('render()');
        for (var i in Dack.prop) {
            document.getElementById('card-' + i)
                .style[CSS.prefix.transform] = CSS.transformStr.translate(
                    Dack.prop[i].x,
                    Dack.prop[i].y,
                    null
                );
        }
        return this;
    };
    // change theme
    this.theme = function() {

        return this;
    };
    // 
    this.paint = function() {

    };
    // update or append data
    this.data = function() {
        // 
        return this;
    };
    // update card data
    this.update = function() {
        // 
        return this;
    };
    // Event handlers
    this.attachEvent = function() {
        console.log('addGesture');
        var mc = new Hammer.Manager(RootElem);
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
        // mc.on("tap", tapOpen);
        mc.on("panh", scroll);
        // mc.on("panv", pullPush);
        return this;
    };

    //testing
    this.move = function(id, dir) {
        var m = 5;
        if (dir == 2) m = -5;
        Dack.prop[id].x = Dack.prop[id].x + m;
        Dack.prop[id].v.isMoving = true;

        switch (dir) {
            case 2:
                scrollDirection = Direction.LEFT;
                break;
            case 4:
                scrollDirection = Direction.RIGHT;
                break;
            default:
                scrollDirection = Direction.None;
        };
        animPos();
    };
    // ------------------------------------------------------------------------
    // Private
    // ------------------------------------------------------------------------
    var self = this;
    var scrollPosX = 0,
        scrollDirection, scrollTarget;
    var scroll = function(ev) {
        // console.log('Event: ', ev.type, ':', ev.srcEvent);
        var id = ev.target.id.split('-')[1];
        console.log(id, ev.target, ev.deltaX, ev.direction);
        if (!id)
            return;
        scrollTarget = id;
        if (scrollPosX == 0)
            scrollPosX = Dack.prop[id].x;
        Dack.prop[id].x = scrollPosX + ev.deltaX;
        Dack.prop[id].v.isMoving = true;

        switch (ev.direction) {
            case 2:
                scrollDirection = Direction.LEFT;
                break;
            case 4:
                scrollDirection = Direction.RIGHT;
                break;
            default:
                scrollDirection = Direction.None;
        };
        // console.log('d', scrollDirection, ev.direction);

        if (ev.eventType == Hammer.INPUT_END) {
            scrollPosX = 0;
        }
        animPos();
    };
    // 
    var animPos = function() {
        console.log('animPos');
        console.log('fl', Dack.first, Dack.last);
        // Shift Right
        if (Dack.current + Dack.visible + Dack.buffer > Dack.size) {
            Dack.first++;
            Dack.last++;
            if (Dack.first >= Dack.size)
                Dack.first = 0;
            if (Dack.last >= Dack.size)
                Dack.last = 0;
        }
        // Shift Left
        if (Dack.current - Dack.buffer < 0) {
            Dack.first--;
            Dack.last--;
            if (Dack.first < 0)
                Dack.first = Dack.size - 1;
            if (Dack.last < 0)
                Dack.last = Dack.size - 1;
        }
        console.log('fl--', Dack.first, Dack.last);
        // TODO: instead of i++ i.e. '->', loop left/right based on scroll direction
        var i = Dack.first;
        var stop = true;
        while (true) {
            console.log('i', i);
            // 
            // TODO: Remove isMoving and use min force instead
            if (Dack.prop[i].v.force > _ignoreForce || Dack.prop[i].v.isMoving)
                stop = false;
            Dack.prop[i].v.isMoving = false;
            // 
            if (scrollDirection == Direction.RIGHT) {
                console.debug('RIGHT:');
                var x = Dack.prop[i].x;
                // prev to ->
                if (i != Dack.first && i != scrollTarget) {
                    var pi = i - 1 < 0 ? Dack.size - 1 : i - 1;
                    Dack.prop[i].x = Dack.prop[pi].x + Dack.style.w + Dack.style.gt;
                    console.log('X', x, Dack.prop[i].x, Dack.prop[pi].x, pi);
                }
            }
            if (scrollDirection == Direction.LEFT) {
                // console.debug('LEFT:');
                var x = Dack.prop[i].x;
                // <- to next
                if (i != Dack.last && i != scrollTarget) {
                    var ni = i + 1 >= Dack.size ? 0 : i + 1;
                    Dack.prop[i].x = Dack.prop[ni].x - Dack.style.gt - Dack.style.w;
                }
                // console.log('X', x, Dack.prop[i].x);
            }
            // Set current
            if (Dack.current == i) {
                if (Dack.prop[i].x < 0)
                    Dack.current++;
                if (Dack.prop[i].x > Dack.style.w)
                    Dack.current--;
            }

            // loop & break
            if (i == Dack.last)
                break;
            i++;
            if (i == Dack.size)
                i = 0;
        } // while

        self.render();
        if (!stop)
            MotionFrame.get(animPos);
    };
    // ------------------------------------------------------------------------
    // Utill
    // ------------------------------------------------------------------------

    // 
    return this;
};
