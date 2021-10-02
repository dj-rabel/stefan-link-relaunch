(function (win) {
  const PausableTimeout = function (handler, timout) {
    this.handler = handler;
    this.remaining = timout;
    this.resume();
  };
  PausableTimeout.prototype.pause = function () {
    win.clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
  };
  PausableTimeout.prototype.resume = function () {
    this.start = Date.now();
    win.clearTimeout(this.timerId);
    this.timerId = win.setTimeout(this.handler, this.remaining);
  };

  win.PausableTimeout = PausableTimeout;
})(window);
