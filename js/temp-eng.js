function Template(elem, template) {
    if (!elem)
        throw "No target element provided";
    if (!template)
        throw "Template is empty";
    
    var a;

    this.init = function() {
        return this;
    };
    // 
    this.render = function() {
        return this;
    };
    // 
    return this;
}
