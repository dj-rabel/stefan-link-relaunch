if (window.NodeList && !NodeList.prototype.forEach && Array.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
  HTMLCollection.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
if (!Math.trunc) {
  Math.trunc = function (n) {
    return n < 0 ? Math.ceil(n) : Math.floor(n);
  };
}
