(function() {
  var Pointer, extendr,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  extendr = require('extendr');

  Pointer = (function() {
    Pointer.prototype.config = null;

    Pointer.prototype.bound = false;

    Pointer.prototype.bindTimeout = null;

    function Pointer(item) {
      this.getController = __bind(this.getController, this);
      this.getElement = __bind(this.getElement, this);
      this.getModelController = __bind(this.getModelController, this);
      this.getModelElement = __bind(this.getModelElement, this);
      this.defaultCollectionHandler = __bind(this.defaultCollectionHandler, this);
      this.destroyControllerViaElement = __bind(this.destroyControllerViaElement, this);
      this.createControllerViaModel = __bind(this.createControllerViaModel, this);
      this.defaultModelHandler = __bind(this.defaultModelHandler, this);
      this.callUserHandler = __bind(this.callUserHandler, this);
      this.changeAttributeHandler = __bind(this.changeAttributeHandler, this);
      this.resetHandler = __bind(this.resetHandler, this);
      this.removeHandler = __bind(this.removeHandler, this);
      this.addHandler = __bind(this.addHandler, this);
      this.updateHandler = __bind(this.updateHandler, this);
      this.destroy = __bind(this.destroy, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      var type;
      if (this.config == null) {
        this.config = {};
      }
      type = item.length != null ? 'collection' : 'model';
      this.setConfig({
        type: type,
        item: item
      });
      this.bindTimeout = setTimeout(this.bind, 0);
      this;
    }

    Pointer.prototype.bind = function() {
      var attribute, _base, _base1, _i, _len, _ref, _ref1;
      if (this.bindTimeout) {
        clearTimeout(this.bindTimeout);
        this.bindTimeout = null;
      }
      if (this.bound === true) {
        return this;
      }
      this.bound = true;
      if ((_ref = this.config.element.data('pointer')) != null) {
        _ref.destroy();
      }
      this.config.element.data('pointer', this);
      this.unbind();
      if (this.config.type === 'model') {
        if (this.config.attributes) {
          if ((_base = this.config).handler == null) {
            _base.handler = this.defaultModelHandler;
          }
          _ref1 = this.config.attributes;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            attribute = _ref1[_i];
            this.config.item.on('change:' + attribute, this.changeAttributeHandler);
          }
          this.changeAttributeHandler(this.config.model, null, {});
          if (this.config.update === true) {
            this.config.element.on('change', this.updateHandler);
          }
        }
        if (this.config.Controller) {
          this.createControllerViaModel(this.config.item);
        }
      } else {
        if (this.config.Controller) {
          if ((_base1 = this.config).handler == null) {
            _base1.handler = this.defaultCollectionHandler;
          }
          this.config.element.off('change', this.updateHandler);
          this.config.item.on('add', this.addHandler).on('remove', this.removeHandler).on('reset', this.resetHandler);
          this.resetHandler(this.config.item.models, this.config.item, {});
        }
      }
      return this;
    };

    Pointer.prototype.unbind = function() {
      var attribute, _i, _len, _ref;
      if (this.bindTimeout) {
        clearTimeout(this.bindTimeout);
        this.bindTimeout = null;
      }
      if (this.bound === false) {
        return this;
      }
      this.bound = false;
      if (this.config.attributes) {
        _ref = this.config.attributes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attribute = _ref[_i];
          this.config.item.off('change:' + attribute, this.changeAttributeHandler);
        }
      }
      this.config.item.off('add', this.addHandler).off('remove', this.removeHandler).off('reset', this.resetHandler);
      return this;
    };

    Pointer.prototype.destroy = function(opts) {
      this.unbind();
      this.config.element.children().each(function() {
        var $el, _ref;
        $el = $(this);
        return (_ref = $el.data('controller')) != null ? _ref.destroy() : void 0;
      });
      return this;
    };

    Pointer.prototype.setConfig = function(config) {
      var key, value;
      if (config == null) {
        config = {};
      }
      for (key in config) {
        if (!__hasProp.call(config, key)) continue;
        value = config[key];
        this.config[key] = value;
      }
      return this;
    };

    Pointer.prototype.updateHandler = function(e) {
      var attrs;
      attrs = {};
      attrs[this.config.attributes[0]] = this.config.element.val();
      this.config.item.set(attrs);
      return this;
    };

    Pointer.prototype.addHandler = function(model, collection, opts) {
      return this.callUserHandler(extendr.extend(opts, {
        event: 'add',
        model: model,
        collection: collection
      }));
    };

    Pointer.prototype.removeHandler = function(model, collection, opts) {
      return this.callUserHandler(extendr.extend(opts, {
        event: 'remove',
        model: model,
        collection: collection
      }));
    };

    Pointer.prototype.resetHandler = function(collection, opts) {
      return this.callUserHandler(extendr.extend(opts, {
        event: 'reset',
        collection: collection
      }));
    };

    Pointer.prototype.changeAttributeHandler = function(model, value, opts) {
      if (value == null) {
        value = this.fallbackValue();
      }
      return this.callUserHandler(extendr.extend(opts, {
        event: 'change',
        model: model,
        value: value
      }));
    };

    Pointer.prototype.callUserHandler = function(opts) {
      opts.$el = this.config.element;
      opts[this.config.type] = this.config.item;
      opts.item = this.config.item;
      this.config.handler(opts);
      return true;
    };

    Pointer.prototype.defaultModelHandler = function(_arg) {
      var $el, value;
      $el = _arg.$el, value = _arg.value;
      if (value == null) {
        value = this.fallbackValue();
      }
      if ($el.is(':input')) {
        $el.val(value);
      } else {
        $el.text(value);
      }
      return true;
    };

    Pointer.prototype.createControllerViaModel = function(model) {
      var controller;
      if (model == null) {
        model = this.config.item;
      }
      controller = new this.config.Controller({
        item: model
      });
      controller.$el.data('controller', controller).data('model', model).addClass("model-" + model.cid);
      controller.render().$el.appendTo(this.config.element);
      return controller;
    };

    Pointer.prototype.destroyControllerViaElement = function(element) {
      var $el, _ref;
      $el = element;
      if ((_ref = $el.data('controller')) != null) {
        _ref.destroy();
      }
      return this;
    };

    Pointer.prototype.defaultCollectionHandler = function(opts) {
      var $el, collection, event, model, _i, _len, _ref,
        _this = this;
      model = opts.model, event = opts.event, collection = opts.collection;
      switch (event) {
        case 'add':
          this.createControllerViaModel(model);
          break;
        case 'remove':
          $el = this.getModelElement(model);
          this.destroyControllerViaElement($el);
          break;
        case 'reset':
          this.config.element.children().each(function() {
            return _this.destroyControllerViaElement($(_this));
          });
          _ref = collection.models;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            this.createControllerViaModel(model);
          }
      }
      return true;
    };

    Pointer.prototype.fallbackValue = function() {
      var attribute, value, _i, _len, _ref;
      value = null;
      _ref = this.config.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        if ((value = this.config.item.get(attribute))) {
          break;
        }
      }
      return value;
    };

    Pointer.prototype.getModelElement = function(model) {
      var _ref;
      return (_ref = this.config.element.find(".model-" + model.cid + ":first")) != null ? _ref : null;
    };

    Pointer.prototype.getModelController = function(model) {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.getModelElement(model)) != null ? _ref1.data('controller') : void 0) != null ? _ref : null;
    };

    Pointer.prototype.getElement = function() {
      return this.getModelElement(this.config.item);
    };

    Pointer.prototype.getController = function() {
      return this.getElement().data('controller');
    };

    Pointer.prototype.update = function() {
      var update;
      update = true;
      this.setConfig({
        update: update
      });
      return this;
    };

    Pointer.prototype.attributes = function() {
      var attributes;
      attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.setConfig({
        attributes: attributes
      });
      return this;
    };

    Pointer.prototype.controller = function(Controller) {
      this.setConfig({
        Controller: Controller
      });
      return this;
    };

    Pointer.prototype.using = function(handler) {
      this.setConfig({
        handler: handler
      });
      return this;
    };

    Pointer.prototype.to = function(element) {
      this.setConfig({
        element: element
      });
      return this;
    };

    return Pointer;

  })();

  module.exports = {
    Pointer: Pointer
  };

}).call(this);
