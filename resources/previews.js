// StyleDocco JavaScript for preview iframes
// =========================================

(function () {

'use strict';

// Helper functions
// ================
// Using `Array.prototype` to make them work on `NodeList`s.
var filter = function(arr, it) { return Array.prototype.filter.call(arr, it); };
var forEach = function(arr, it) { return Array.prototype.forEach.call(arr, it); };
var map = function(arr, it) { return Array.prototype.map.call(arr, it); };
var reduce = function(arr, it, memo) { return Array.prototype.reduce.call(arr, it, memo); };
var add = function(a, b) { return a + b; };

// Get bottom-most point in document with an element.
// `offsetHeight`/`scrollHeight` will not work with absolute or fixed elements.
var getContentHeight = function() {
  var body = document.body;
  if (body.childElementCount === 0) return body.offsetHeight;
  var els = body.getElementsByTagName('*');
  var elHeights = [];
  for (var i = 0, l = els.length; i < l; i++) {
    elHeights.push(els[i].offsetTop + els[i].offsetHeight);
  }
  var height = Math.max.apply(Math, elHeights);
  var padding = window.getComputedStyle(body, null)
    .getPropertyValue('padding-bottom');
  return height + parseInt(padding);
};

// Scans your stylesheet for pseudo classes and adds a class with the same name.
// Compile regular expression.
var pseudos = [ 'link', 'visited', 'hover', 'active', 'focus', 'target',
                'enabled', 'disabled', 'checked' ];
var pseudoRe = new RegExp(":((" + pseudos.join(")|(") + "))", "gi");
var processedPseudoClasses = reduce(map(
  filter(document.styleSheets, function(ss) { return !(ss.href != null); }),
  function(ss) {
    return reduce(map(
      filter(ss.cssRules, function(rule) {
        // Keep only rules with pseudo classes.
        return rule.selectorText && rule.selectorText.match(pseudoRe);
      }), function(rule) {
       // Replace : with . and encoded :
       return rule.cssText.replace(pseudoRe, ".\\3A $1");
      }),
      add, ''
    );
  }
), add, '');
if (processedPseudoClasses.length) {
  // Add a new style element with the processed pseudo class styles.
  var styleEl = document.createElement('style');
  styleEl.innerText = processedPseudoClasses;
  document.getElementsByTagName('head')[0].appendChild(styleEl);
}

var callbacks = {
  getHeight: function() {
    window.parent.postMessage({ height: getContentHeight() }, '*');
  }
};

window.addEventListener('message', function (ev) {
  if (ev.data == null) return;
  if (typeof ev.data === 'string') callbacks[ev.data]();
}, false);

}());
