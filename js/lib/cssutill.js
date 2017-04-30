var CSS = {
    init: function() {
        CSS.prefix = {
            'transform': Hammer.prefixed(document.body.style, 'transform'),
            'transition': Hammer.prefixed(document.body.style, 'transition'),
            'transition-duration': Hammer.prefixed(document.body.style, 'transition-duration'),
        };
    },
    getStyleStr: function(attr, value) {
        var attr = Hammer.prefixed(document.body.style, attr) || attr;
        // add unit
        var toPx = ['width', 'height', 'margin', 'top', 'left', 'right', 'bottom'];
        if (toPx.indexOf(attr) >= 0)
            value += 'px';
        // background;
        if (attr.indexOf('background') >= 0 && value.indexOf('url') == -1 && value.indexOf('.') >= 0)
            value = "url(" + value + ")";
        // convert Camel case to hiphenized 
        var attrStr = '';
        if (attr.indexOf('webkit') >= 0 || attr.indexOf('moz') >= 0)
            attrStr = '-';
        for (var i in attr) {
            if (attr[i] >= 'A' && attr[i] <= 'Z')
                attrStr += '-' + attr[i].toLowerCase();
            else
                attrStr += attr[i];
        }
        // 
        return attrStr + ':' + value + '; ';
    },
    transform: {
        rotate: function(elem, deg) {
            // parse arguments
            if (!arguments || !arguments.length)
                throw "No arguments!";
            // 
            var transform = this.getValues(elem);
            transform.rotate = parseFloat(deg) || transform.rotate;
            return this.getString(transform);
            // 
        },
        translate: function(elem, x, y, z) {
            // parse arguments
            if (!arguments || !arguments.length)
                throw "No arguments!";
            // if (typeof arguments[0] != 'object') {
            //     elem = null;
            //     var s = 0;
            //     var x = arguments[s++],
            //         y = arguments[s++],
            //         z = arguments[s++];
            // }
            // 
            var transform = this.getValues(elem);
            transform.translate3d.x = parseFloat(x) || transform.translate3d.x;
            transform.translate3d.y = parseFloat(y) || transform.translate3d.y;
            transform.translate3d.z = parseFloat(z) || transform.translate3d.z;
            return this.getString(transform);
        },
        getValues: function(elem) {
            var _properties = {
                translate3d: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotate: 0
            };
            // 
            if (!elem)
                return _properties;
            if (typeof elem == 'string')
                var t = elem;
            else
                var t = elem.style[CSS.prefix.transform] || '';
            // 
            t = t.replace(/,\s/ig, ',');
            t = t.split(' ');
            for (var i in t) {
                var d = t[i];
                // 
                if (d.indexOf('translate3d') >= 0) {
                    d = d.replace(/3d|[\(\)a-z]/ig, '');
                    d = d.split(',');
                    _properties.translate3d = {
                        x: parseFloat(d[0]) || 0,
                        y: parseFloat(d[1]) || 0,
                        z: parseFloat(d[2]) || 0,
                    }
                }
                if (d.indexOf('rotate') >= 0) {
                    _properties.rotate = parseFloat(d.replace(/[\(\),a-z]/ig, '')) || 0;
                }
            }
            return _properties;
        },
        getString: function(_properties) {
            var str = '';
            for (var i in _properties) {
                var d = _properties[i];
                var s = i + '(';
                // value
                if (i == 'translate3d') {
                    s += d.x + 'px, ';
                    s += d.y + 'px, ';
                    s += d.z + 'px';
                }
                if (i == 'rotate')
                    s += d + 'deg';
                // 
                s += ') ';
                str += s;
            }
            return str.trim();
        }
    }, // transform
    transformStr: {
        translate: function(x, y, z) {
            return "translate3d(" + (x || 0) + "px, " + (y || 0) + "px, " + (z || 0) + ")";
        }
    }, // transformStr
    clear: function() {
        this.temp = {};
    }
};

// translate3d(-456.78px, -1631.56px, 0px) rotate(0deg)




//
