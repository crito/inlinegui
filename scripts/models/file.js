(function() {
  var Collection, File, Files, Model, extractData, extractSyncOpts, safe, slugify, _, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  _ = window._;

  _ref = require('./base'), Model = _ref.Model, Collection = _ref.Collection;

  _ref1 = require('../util'), safe = _ref1.safe, slugify = _ref1.slugify, extractData = _ref1.extractData, extractSyncOpts = _ref1.extractSyncOpts;

  File = (function(_super) {
    __extends(File, _super);

    File.prototype["default"] = {
      slug: null,
      filename: null,
      relativePath: null,
      url: null,
      urls: null,
      contentType: null,
      encoding: null,
      content: null,
      contentRendered: null,
      source: null,
      title: null,
      layout: null,
      author: null,
      site: null
    };

    function File() {
      if (this.metaAttributes == null) {
        this.metaAttributes = ['title', 'content', 'date', 'author', 'layout'];
      }
      File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.get = function(key) {
      switch (key) {
        case 'slug':
          return slugify(this.get('relativePath'));
        default:
          return File.__super__.get.apply(this, arguments);
      }
    };

    File.prototype.sync = function() {
      var args, file, fileRelativePath, opts, site, siteToken, siteUrl,
        _this = this;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      opts = extractSyncOpts(args);
      file = this;
      fileRelativePath = file.get('relativePath');
      site = file.get('site');
      siteUrl = site.get('url');
      siteToken = site.get('token');
      if (opts.method !== 'delete') {
        if (opts.data == null) {
          opts.data = _.pick(file.toJSON(), this.metaAttributes);
        }
      }
      if (opts.method == null) {
        opts.method = this.isNew() ? 'put' : 'post';
      }
      if (opts.url == null) {
        opts.url = "" + siteUrl + "/restapi/collection/database/" + fileRelativePath + "?securityToken=" + siteToken;
      }
      app.request(opts, function(err, data) {
        if (err) {
          return safe(opts.next, err);
        }
        _this.set(_this.parse(data));
        return safe(opts.next, null, _this);
      });
      return this;
    };

    File.prototype.reset = function() {
      var data, key, value, _ref2, _ref3;
      data = {};
      _ref2 = this.attributes;
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        data[key] = null;
      }
      _ref3 = this.lastSync;
      for (key in _ref3) {
        if (!__hasProp.call(_ref3, key)) continue;
        value = _ref3[key];
        data[key] = value;
      }
      this.set(data);
      return this;
    };

    File.prototype.toJSON = function() {
      return _.omit(File.__super__.toJSON.call(this), ['site']);
    };

    File.prototype.parse = function(response, opts) {
      var data, key, value, _ref2;
      data = extractData(response);
      _ref2 = data.meta;
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        data[key] = value;
      }
      delete data.meta;
      if (data.date) {
        data.date = new Date(data.date);
      }
      this.lastSync = data;
      return data;
    };

    File.prototype.initialize = function() {
      File.__super__.initialize.apply(this, arguments);
      if (this.id == null) {
        this.id = this.cid;
      }
      return this;
    };

    return File;

  })(Model);

  Files = (function(_super) {
    __extends(Files, _super);

    function Files() {
      _ref2 = Files.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Files.prototype.model = File;

    Files.prototype.collection = Files;

    Files.prototype.get = function(id) {
      var item;
      item = Files.__super__.get.apply(this, arguments) || this.findOne({
        $or: {
          slug: id,
          relativePath: id
        }
      });
      return item;
    };

    return Files;

  })(Collection);

  File.collection = new Files([], {
    name: 'Global File Collection'
  });

  module.exports = {
    File: File,
    Files: Files
  };

}).call(this);
