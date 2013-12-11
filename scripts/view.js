(function() {
  var View,
    __hasProp = {}.hasOwnProperty;

  View = (function() {
    View.prototype.events = null;

    View.prototype.elements = null;

    View.prototype.el = null;

    View.prototype.$el = null;

    function View(opts) {
      if (this.events == null) {
        this.events = {};
      }
      if (this.elements == null) {
        this.elements = {};
      }
      this.setConfig(opts);
      this.refreshElement();
      this.refreshElements();
      this.refreshEvents();
    }

    View.prototype.refreshElement = function(el) {
      if (el == null) {
        el = null;
      }
      this.el = el != null ? el : this.el;
      this.$el = $(this.el);
      this.el = this.$el.get(0);
      return this;
    };

    View.prototype.$ = function(selector) {
      var _ref;
      return (_ref = this[selector]) != null ? _ref : $(selector, this.$el);
    };

    View.prototype.setConfig = function(opts) {
      var key, value;
      if (opts == null) {
        opts = {};
      }
      for (key in opts) {
        if (!__hasProp.call(opts, key)) continue;
        value = opts[key];
        this[key] = value;
      }
      return this;
    };

    View.prototype.refreshEvents = function(opts) {
      var eventMethod, eventName, key, selector, split, value, _ref;
      if (opts == null) {
        opts = {};
      }
      opts.bind = true;
      _ref = this.events;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        split = key.indexOf(' ');
        eventName = key.substr(0, split);
        selector = key.substr(split + 1);
        eventMethod = this[value];
        this.$el.off(eventName, selector, eventMethod);
        if (opts.bind === true) {
          this.$el.on(eventName, selector, eventMethod);
        }
      }
      return this;
    };

    View.prototype.refreshElements = function() {
      var elementName, selector, _ref;
      _ref = this.elements;
      for (selector in _ref) {
        if (!__hasProp.call(_ref, selector)) continue;
        elementName = _ref[selector];
        this[elementName] = $(selector, this.$el);
      }
      return this;
    };

    View.prototype.destroy = function() {
      this.refreshEvents({
        bind: false
      });
      this.$el.remove();
      this.el = this.$el = null;
      return this;
    };

    return View;

  })();

  module.exports = {
    View: View
  };

}).call(this);
