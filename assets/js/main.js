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

(function ($) {

  // Breakpoints.
  breakpoints({
    xlarge: ['1281px', '1680px'],
    large: ['981px', '1280px'],
    medium: ['737px', '980px'],
    small: ['481px', '736px'],
    xsmall: ['361px', '480px'],
    xxsmall: [null, '360px']
  });

  // Play initial animations on page load.
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      document.body.classList.remove('is-preload');
    }, 100);
  })

  //
  // Helper functions and stuff
  //
  var cumulativeOffsetTop = function (element) {
    var top = 0;
    do {
      top += element.offsetTop || 0;
      element = element.offsetParent;
    } while (element);

    return top;
  };

  const PauseableTimeout = function (handler, timout) {
    this.handler = handler;
    this.remaining = timout;
    this.resume();
  };
  PauseableTimeout.prototype.pause = function () {
    window.clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
    console.log(this.remaining);
  };
  PauseableTimeout.prototype.resume = function () {
    this.start = Date.now();
    window.clearTimeout(this.timerId);
    this.timerId = window.setTimeout(this.handler, this.remaining);
  };

  //
  // Collect useful elements
  //
  const nav = document.getElementById('nav'),
    navA = document.getElementById('nav-anchor'),
    main = document.getElementById('main');

  //
  // Fixed Nav
  //
  if (nav && navA) {
    var lastKnownScrollY = window.scrollY, sticked = false;
    window.addEventListener('scroll', function () {
      const navAnchorTop = main.offsetTop + (navA ? navA.offsetTop : 0);
      if (lastKnownScrollY !== window.scrollY) {
        lastKnownScrollY = window.scrollY;
        if (!sticked && window.scrollY > navAnchorTop) {
          nav.classList.add('sticky');
          sticked = true;
        } else if (sticked && window.scrollY <= navAnchorTop) {
          nav.classList.remove('sticky');
          sticked = false;
        }
      }
    });
    window.dispatchEvent(new window.Event('scroll'));
  }

  //
  // Section Nav
  //
  const navOnclickCallback = function (ev) {
    const hash = (/** @type {HTMLAnchorElement} */ev.target).hash.substr(1),
      targetSection = document.getElementById(hash);

    if (targetSection) {
      ev.preventDefault();
      window.location.replace('#' + targetSection.id);
      targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };
  var sectionIDList = [];
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
    sectionIDList.push(a.hash);
    a.addEventListener('click', navOnclickCallback);
  });
  if (sectionIDList.length) {
    // Finds all sections in their DOM ORDER and REVERSES the order!
    const sectionList = Array.prototype.slice.call(document.querySelectorAll(sectionIDList.join(','))).reverse();
    var activeSection = sectionList[sectionList.length - 1]; // Initial
    window.addEventListener('scroll', function () {
      for (var i = 0, s = sectionList[i]; i < sectionList.length; i++, s = sectionList[i]) {
        // Tolerance for "scrollIntoView" not being pixel accurate!
        if (cumulativeOffsetTop(s) <= (window.scrollY + 5)) {
          if (activeSection !== s) {
            const o = activeSection;
            window.requestAnimationFrame(function () {
              document.querySelector('[href="#' + o.id + '"]').classList.remove('active');
              document.querySelector('[href="#' + s.id + '"]').classList.add('active');
            });
            activeSection = s;
          }

          break;
        }
      }
    });
  }

  //
  // Box Slider
  //
  const slideDirections = ['left', 'right', 'up', 'down'];
  const BoxSlider = function (/** HTMLElement */ slider) {
    this.slider = slider;
    this.slideLazyResolveFunc(slider.children[1], function () {
      // Start sliding, as soon as we have a second slide ready =)
      this.timeout = new PauseableTimeout(this.proxy(function () {
        this.slideFunc(slider.children[1]);
      }), this.slideDelay());
    })
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
    delete slide.dataset.src;
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

    this.timeout = new PauseableTimeout(this.proxy(function () {
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
      window.requestAnimationFrame(this.proxy(function () {
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
    console.log('pause');
  };
  BoxSlider.prototype.resume = function () {
    if (this.timeout) this.timeout.resume();
    console.log('resume');
  };

  const sliderMap = new Map();
  // @see http://www.menucool.com/javascript-image-slider
  document.querySelectorAll('.slider-box .slider').forEach(function (slider) {
    // Verify at least 2 slides exist
    if (slider.children[1]) {
      sliderMap.set(slider, new BoxSlider(slider));
    }
  });

  var lastDocumentHiddenState = document.hidden;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden !== lastDocumentHiddenState) {
      sliderMap.forEach(function (slider) {
        lastDocumentHiddenState ? slider.resume() : slider.pause();
      });
      lastDocumentHiddenState = document.hidden;
    }
  });
})();
