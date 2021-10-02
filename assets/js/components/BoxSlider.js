(function (win) {
  const slideDirections = ['left', 'right', 'up', 'down'];
  const BoxSlider = function (/** HTMLElement */ slider) {
    this.slider = slider;
    this.slideLazyResolveFunc(slider.children[1], function () {
      // Start sliding, as soon as we have a second slide ready =)
      this.timeout = new PausableTimeout(this.proxy(function () {
        this.slideFunc(slider.children[1]);
      }), this.slideDelay());
    });
  };
  BoxSlider.prototype.slideLazyResolveFunc = function (slide, callback) {
    slide.onload = this.proxy(function () {
      const span = document.createElement('span');
      span.style.backgroundImage = "url('" + slide.src + "')";
      slide.parentElement.replaceChild(span, slide);

      if (span.nextElementSibling instanceof HTMLImageElement) {
        // Resolvechain
        this.slideLazyResolveFunc(span.nextElementSibling);
      }

      if (typeof callback === 'function') {
        callback.call(this, span);
      }
    });
    slide.src = slide.dataset.src;
  };
  BoxSlider.prototype.slideDelay = function () {
    // Generate random delay between 6 and 10 seconds
    return Math.trunc(Math.random() * 6000 + 4000);
  };
  BoxSlider.prototype.slideFunc = function (slide) {
    do {
      var direction = slideDirections[Math.floor(Math.random() * 4)];
    } while (direction === this.slider.dataset['lastDir']);

    this.slider.dataset['lastDir'] = direction;
    slide.classList.add('slideIn-' + direction);

    this.timeout = new PausableTimeout(this.proxy(function () {
      var nextSlide = slide;
      do {
        nextSlide = nextSlide.nextElementSibling;
      } while (nextSlide && !(nextSlide instanceof HTMLSpanElement))

      if (!nextSlide) {
        slide.parentElement.children.forEach(function (slide) {
          slide.removeAttribute('class');
        })
        nextSlide = slide.parentElement.children[1];
      }
      win.requestAnimationFrame(this.proxy(function () {
        this.slideFunc(nextSlide);
      }));
    }), this.slideDelay());
  };
  BoxSlider.prototype.proxy = function (func) {
    const self = this;
    return function () {
      return func.apply(self, arguments);
    };
  };
  BoxSlider.prototype.pause = function () {
    if (this.timeout) this.timeout.pause();
  };
  BoxSlider.prototype.resume = function () {
    if (this.timeout) this.timeout.resume();
  };

  win.BoxSlider = BoxSlider;
})(window);
