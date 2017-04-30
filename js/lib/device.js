var Device = new function() {
    this.PHONE = 1;
    this.TABLET = 2;
    this.device = this.PHONE;
    this.width = 0;
    this.height = 0;
    // 
    this.init = function() {
        this.width = $(document).width();
        this.height = $(document).height();
        return this;
    };

    // Getter Function
    this.getDevice = function() {
        return this.device;
    };
    // 
    return this.init();
};
