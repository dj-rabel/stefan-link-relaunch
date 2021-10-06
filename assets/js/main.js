(function (/** Window */win, /** Document */doc) {
  "use strict";

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
  // win.addEventListener('load', function () {
  //   win.setTimeout(function () {
  //     doc.body.classList.remove('is-preload');
  //   }, 100);
  // })
  win.setTimeout(function () {
    win.requestAnimationFrame(function () {
      const backdrop = doc.getElementById('backdrop');
      if(backdrop) {
        backdrop.classList.remove('is-preload');
      }
    });
  }, 1000);

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

  //
  // Collect useful elements
  //
  const nav = doc.getElementById('nav'),
    navA = doc.getElementById('nav-anchor'),
    main = doc.getElementById('main');

  //
  // Fixed Nav
  //
  if (nav && navA) {
    (function () {
      var lastKnownScrollY = win.pageYOffset, _sticked = false, _absolute = false, _ticking = false;
      win.addEventListener('scroll', function () {
        if (!_ticking) {
          win.requestAnimationFrame(function () {
            const navAnchorTop = main.offsetTop + (navA ? navA.offsetTop : 0);
            if (lastKnownScrollY !== win.pageYOffset) {
              lastKnownScrollY = win.pageYOffset;
              if (!_sticked && win.pageYOffset > navAnchorTop) {
                nav.classList.add('sticky');
                _sticked = true;
              } else if (_sticked && win.pageYOffset <= navAnchorTop) {
                nav.classList.remove('sticky');
                _sticked = false;
              }

              // IE stuff ...
              if ('documentMode' in win.document) {
                const navStyleTop = parseFloat(win.getComputedStyle(nav).top),
                  bottomAnchor = cumulativeOffsetTop(main) + main.clientHeight - nav.clientHeight - (isNaN(navStyleTop) ? 0 : navStyleTop);
                if (!_absolute && win.pageYOffset > bottomAnchor) {
                  nav.classList.add('absolute');
                  _absolute = true;
                } else if (_absolute && win.pageYOffset <= bottomAnchor) {
                  nav.classList.remove('absolute');
                  _absolute = false;
                }
              }
            }
            _ticking = false;
          });
          _ticking = true;
        }
      });
      if (typeof win.Event !== 'function') {
        // Trigger scroll event for IE11 and below
        win.requestAnimationFrame(function () {
          const mod = win.pageYOffset ? -1 : 1;
          win.scrollTo(win.pageXOffset, win.pageYOffset + mod);
          win.scrollTo(win.pageXOffset, win.pageYOffset - mod);
        });
      } else {
        win.dispatchEvent(new win.Event('scroll'));
      }
    })();
  }

  //
  // Section Nav
  //
  const navOnclickCallback = function (ev) {
    const hash = (/** @type {HTMLAnchorElement} */ev.target).hash.substr(1),
      targetSection = doc.getElementById(hash);

    if (targetSection) {
      ev.preventDefault();
      history.pushState(null, doc.title, '#' + targetSection.id);
      targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});

      return false;
    }
  };
  var sectionIDList = [];
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
    sectionIDList.push(a.hash);
    a.addEventListener('click', navOnclickCallback);
  });
  if (sectionIDList.length) {
    (function () {
      // Finds all sections in their DOM ORDER and REVERSES the order!
      const sectionList = Array.prototype.slice.call(doc.querySelectorAll(sectionIDList.join(','))).reverse();
      var activeSection = sectionList[sectionList.length - 1], _ticking = false; // Initial
      win.addEventListener('scroll', function () {
        if (!_ticking) {
          win.requestAnimationFrame(function () {
            for (var i = 0, s = sectionList[i]; i < sectionList.length; i++, s = sectionList[i]) {
              // Tolerance for "scrollIntoView" not being pixel accurate!
              if (cumulativeOffsetTop(s) <= (win.pageYOffset + 5)) {
                if (activeSection !== s) {
                  const o = activeSection;
                  win.requestAnimationFrame(function () {
                    doc.querySelector('[href="#' + o.id + '"]').classList.remove('active');
                    doc.querySelector('[href="#' + s.id + '"]').classList.add('active');
                  });
                  activeSection = s;
                }

                break;
              }
            }
            _ticking = false;
          });
        }
        _ticking = true;
      });
    })();
  }

  //
  // Box Slider
  //
  const sliderMap = new Map();
  // @see http://www.menucool.com/javascript-image-slider
  doc.querySelectorAll('.slider-box .slider').forEach(function (slider) {
    // Verify at least 2 slides exist
    if (slider.children[1]) {
      sliderMap.set(slider, new BoxSlider(slider));
    }
  });

  var lastdocHiddenState = doc.hidden;
  doc.addEventListener("visibilitychange", function () {
    if (doc.hidden !== lastdocHiddenState) {
      sliderMap.forEach(function (slider) {
        lastdocHiddenState ? slider.resume() : slider.pause();
      });
      lastdocHiddenState = doc.hidden;
    }
  });
})(window, document);
