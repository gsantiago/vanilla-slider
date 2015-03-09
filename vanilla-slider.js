/**
* Vanilla Slider
* A simple slider made with pure Javascript
*
* @version 0.1
* @author Guilherme Santiago - http://guilherme.sexy
* @repo http://github.com/gsantiago/vanilla-slider
*/
(function (window, document) {
  'use strict';


  /**
  * Default options
  */
  var DEFAULTS = {
    visibles: 1,
    direction: 'horizontal',
    controlPrev: '',
    controlNext: '',
    justify: true,
    steps: 1,

    // TO IMPLEMENT:
    dots: '',
    touch: true,
    animation: 'slide',
    autoPlay: 1000,
    infinite: true
  };


  /**
  * Utils
  */
  var utils = {

    // Returns true if 'obj' is a node element
    isDOM: function (o) {
      return (
        typeof HTMLElement === 'object' ? o instanceof HTMLElement :
        o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
      );
    },

    // Merge two objects. Similar to $.extends from jQuery
    merge: function (obj1, obj2) {
      var result = {};
      for (var prop in obj1) {
        if (obj2.hasOwnProperty(prop)) {
          result[prop] = obj2[prop];
        } else {
          result[prop] = obj1[prop];
        }
      }

      return result;
    },

    // A simple iterator for collections
    each: function (group, callback) {
      for (var i = 0, max = group.length; i < max; i += 1) {
        callback.call(group[i], i);
      }
    }
  }


  /**
  * Constructor for the slider
  *
  * @class Slider
  * @constructor
  * @param {String | Node Element} Selector for the slider's container
  * @param {Object} Options
  */
  function Slider(element, options) {
    if (!(this instanceof Slider)) return new Slider(element, options);

    if (utils.isDOM(element)) {
      this.container = element;
    } else {
      this.container = document.querySelector(element);
    }

    this.settings = utils.merge(DEFAULTS, options);

    this.slider = this.container.children[0];
    this.items = this.slider.children;

    this.containerWidth = this.container.offsetWidth;
    this.containerHeight = this.container.offsetHeight;

    this.itemWidth = this.items[0].offsetWidth;
    this.itemHeight = this.items[0].offsetHeight;
    this.itemMargin = 0;

    if (this.settings.direction === 'vertical') {
      this.containerDimension = this.containerHeight;
      this.itemDimension = this.itemHeight;
    } else {
      this.containerDimension = this.containerWidth;
      this.itemDimension = this.itemWidth;
    }

    // Justify the margins acording to the number of items to show (visibles)
    if (this.settings.visibles > 1 && this.settings.justify) {
      this.justifyItems();
    }

    if (this.settings.controlNext || this.settings.controlPrev) {
      this.addControls(this.settings.controlNext, this.settings.controlPrev, this.settings.steps);
    }
  }

  // An alias for prototype
  Slider.fn = Slider.prototype;


  /*
  * Justify the margins between the items acording to the number
  * of items to show (the visibles), and the direction (vertical or horizontal)
  *
  * @method justifyItems
  */
  Slider.fn.justifyItems = function () {

    var visibles = this.settings.visibles,
        items = this.items,
        direction = this.settings.direction,
        margin;

    margin = (this.containerDimension - (this.itemDimension * visibles)) / (visibles - 1);
    margin = Math.ceil(margin);
    this.itemMargin = margin;

    utils.each(items, function () {
      this.style[direction === 'vertical' ? 'marginBottom' : 'marginRight'] = margin + 'px';
    });
  };


  /**
  * Static method to return the max or min position for the Slider
  *
  * @method getLimit
  * @param {Object} The instance of slider
  * @param {String} The position ('max' or 'min')
  */
  Slider.getLimit = function (instance, pos) {

    var settings = instance.settings,
        direction = settings.direction,
        itemDimension = instance.itemDimension,
        itemMargin = instance.itemMargin,
        visibles = settings.visibles,
        items = instance.items;

    if (direction === 'vertical' && pos === 'max') {
      return 0;
    }

    if (direction === 'vertical' && pos === 'min') {
      return (((itemDimension + itemMargin) * (items.length - visibles + 1)) - itemMargin) * -1;
    }

    if (direction === 'horizontal' && pos === 'max') {
      return ((itemDimension + itemMargin) * (items.length - visibles + 1)) - itemMargin;
    }

    if (direction === 'horizontal' && pos === 'min') {
      return 0;
    }

  };


  /**
  * Check if the Slider is at its limit
  *
  * @method isAtLimit
  */
  Slider.fn.isAtLimit = function (nextPos) {
    var max = Slider.getLimit(this, 'max'),
        min = Slider.getLimit(this, 'min');

    if (nextPos < min) {
      return true;
    }

    if (nextPos > max) {
      return true;
    }

    return false;
  };


  /**
  * Return the next position for the slider based in the number of steps
  *
  * @method getNextPos
  */
  Slider.fn.getNextPos = function (steps) {
    var currentPos,
        direction,
        nextPos;

    direction = this.settings.direction;

    currentPos = this.slider.style[direction === 'vertical' ? 'top' : 'right'];

    if (currentPos) {
      currentPos = Math.floor(parseInt(currentPos));
    }

    if (direction === 'vertical') {
      nextPos = currentPos - (((this.itemDimension + this.itemMargin)) * steps);
    } else {
      nextPos = currentPos + (((this.itemDimension + this.itemMargin)) * steps)
    }

    return Math.ceil(nextPos);
  };

  /**
  * Move the slider.
  * Pass a negative number to go in the inverse direction
  *
  * @method move
  * @param {Integer} Number of items to move
  */
  Slider.fn.move = function (steps) {
    steps = steps || 1;

    var nextPos = this.getNextPos(steps),
        direction = this.settings.direction;

    if (this.isAtLimit(nextPos)) {
      return this;
    }

    this.slider.style[direction === 'vertical' ? 'top' : 'right'] = nextPos + 'px';
  };


  /**
  * Add event listeners for the controls passed
  *
  * @method addControls
  * @param {String | Node Element} Next Control
  * @param {String | Node Element} Prev Control
  * @param {Integer} Number of items (steps) to avance/return
  */
  Slider.fn.addControls = function (next, prev, steps) {

    var that = this;

    if (!utils.isDOM(next)) {
      next = document.querySelector(next);
    }

    if (!utils.isDOM(prev)) {
      prev = document.querySelector(prev);
    }

    next.addEventListener('click', function (e) {
      e.preventDefault();
      that.move(steps);
    });

    prev.addEventListener('click', function (e) {
      e.preventDefault();
      that.move(steps * -1);
    });
  };


  window.Slider = Slider;

}(window, document));
