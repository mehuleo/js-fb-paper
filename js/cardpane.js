var Cardpane = new function() {
    var RootElem,
        style = {
            paddingBottom: 0
        },
        pScroll,
        theme;
    // ------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------
    this.init = function() {
        var card = {},
            dack = {};
        // TODO: Add more tab type based on screen ratio
        // TODO: adjust size for aesthetics
        // TODO: Device and OS specific
        if (Device.getDevice() == Device.PHONE) {
            // Style
            theme = ' default ';
            // parent
            style.paddingBottom = 8;
            // Card
            card = {
                W: 150,
                H: 280,
                joint: 10,
                maxStretch: 30,
                minStretch: 0,
            };
            // Dack
            dack.buffer = 4;
            dack.size = Math.floor(Device.width / card.W) + (dack.buffer * 2);
            var cpos = Math.ceil(Device.width / 2);
            dack.centerL = cpos - (card.W + card.joint) / 2;
            dack.centerR = cpos + (card.W + card.joint) / 2;
        } else {
            // TODO: adjust size for tablet
        }
        // scroll object
        pScroll = new Pscroll({
            container: '#cardpane',
            card: card,
            dack: dack,
            render: this.render,
            update: this.update,
        });
        // 
        return this;
    };
    this.create = function() {
        // TODO: template based on Device
        // card tray
        var ts = CSS.getStyleStr('height', pScroll.card.H);
        ts += CSS.getStyleStr('bottom', style.paddingBottom);
        var template = ['div', {
            id: 'cardpane',
            class: 'cardpane-tray' + theme,
            style: ts
        }];
        // card style
        var cstyle = CSS.getStyleStr('width', pScroll.card.W);
        cstyle += CSS.getStyleStr('height', pScroll.card.H);
        for (var i in pScroll.dack.pointer) {
            var d = pScroll.dack.pointer[i];
            var cardhtml = ['div', {
                    class: 'card',
                    style: cstyle,
                    id: 'card-' + d
                },
                ['div', {
                    class: 'image'
                }],
                ['div', {
                    class: 'source'
                }, 'Source ' + d],
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
        pScroll.attachEvent();
        // 
        return this;
    };
    // 
    this.render = function() {
        // console.log('render()');
        for (var i in pScroll.dack.pointer) {
            var d = pScroll.dack.pointer[i];
            // console.log('=>', i, d, dack[d].x);
            document.getElementById('card-' + d)
                .style[CSS.prefix.transform] = CSS.transformStr.translate(
                    pScroll.dack[d].x,
                    pScroll.dack[d].y,
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
        mc.on("tap", tapTest);
        mc.on("panh", move);
        // mc.on("panv", pullPush);
        return this;
    };

    // ------------------------------------------------------------------------
    // Private
    // ------------------------------------------------------------------------
    var self = this;
    var posX = null,
        id = null;
    var move = function(ev) {
        // console.log('Event: ', ev.type, ':', ev.srcEvent);
        if (!posX) {
            for (var i = 0; i < pScroll.dack.size; i++)
                dack[i].rigid = false;
            scroll.settle();
            id = ev.target.id.split('-')[1];
            console.log(ev.target.id, ev.deltaX, ev.direction);
            posX = dack[id].x;
            dack[id].rigid = true;
            if (!id) {
                posX = null;
                return;
            }
        }

        dack[id].x = posX + ev.deltaX;
        dack[id].rigid = true;
        // console.log('id', id, posX + ev.deltaX);
        if (ev.eventType == Hammer.INPUT_END) {
            dack[id].acceleration = -ev.velocityX * 80;
            console.debug('-', dack[id].acceleration, ev.velocityX);
            // alert(ev.velocityX);
            for (var i = 0; i < dack.size; i++)
                if (dack[i].rigid == true)
                    dack[i].rigid = false;
            posX = null;
            id = null;
        }
        scroll.animate();

    };
    var tapTest = function(ev) {
        dack[3].F = 100;
        scroll.animate();
        for (var i in dack.pointer)
            console.log("-->", i, dack.pointer[i], dack[dack.pointer[i]].x);
    };
    // 
    // ------------------------------------------------------------------------
    // Utill
    // ------------------------------------------------------------------------

    // 
    return this;
};
