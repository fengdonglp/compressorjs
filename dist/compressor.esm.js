/*!
 * Compressor.js v1.0.6
 * https://fengyuanchen.github.io/compressorjs
 *
 * Copyright 2018-present Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2020-07-28T05:54:00.982Z
 */

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var canvasToBlob = createCommonjsModule(function (module) {
    if (typeof window === 'undefined') {
      return;
    }

  (function (window) {

    var CanvasPrototype = window.HTMLCanvasElement && window.HTMLCanvasElement.prototype;

    var hasBlobConstructor = window.Blob && function () {
      try {
        return Boolean(new Blob());
      } catch (e) {
        return false;
      }
    }();

    var hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array && function () {
      try {
        return new Blob([new Uint8Array(100)]).size === 100;
      } catch (e) {
        return false;
      }
    }();

    var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
    var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/;

    var dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && window.atob && window.ArrayBuffer && window.Uint8Array && function (dataURI) {
      var matches, mediaType, isBase64, dataString, byteString, arrayBuffer, intArray, i, bb; // Parse the dataURI components as per RFC 2397

      matches = dataURI.match(dataURIPattern);

      if (!matches) {
        throw new Error('invalid data URI');
      } // Default to text/plain;charset=US-ASCII


      mediaType = matches[2] ? matches[1] : 'text/plain' + (matches[3] || ';charset=US-ASCII');
      isBase64 = !!matches[4];
      dataString = dataURI.slice(matches[0].length);

      if (isBase64) {
        // Convert base64 to raw binary data held in a string:
        byteString = atob(dataString);
      } else {
        // Convert base64/URLEncoded data component to raw binary:
        byteString = decodeURIComponent(dataString);
      } // Write the bytes of the string to an ArrayBuffer:


      arrayBuffer = new ArrayBuffer(byteString.length);
      intArray = new Uint8Array(arrayBuffer);

      for (i = 0; i < byteString.length; i += 1) {
        intArray[i] = byteString.charCodeAt(i);
      } // Write the ArrayBuffer (or ArrayBufferView) to a blob:


      if (hasBlobConstructor) {
        return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
          type: mediaType
        });
      }

      bb = new BlobBuilder();
      bb.append(arrayBuffer);
      return bb.getBlob(mediaType);
    };

    if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
      if (CanvasPrototype.mozGetAsFile) {
        CanvasPrototype.toBlob = function (callback, type, quality) {
          var self = this;
          setTimeout(function () {
            if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
              callback(dataURLtoBlob(self.toDataURL(type, quality)));
            } else {
              callback(self.mozGetAsFile('blob', type));
            }
          });
        };
      } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
        CanvasPrototype.toBlob = function (callback, type, quality) {
          var self = this;
          setTimeout(function () {
            callback(dataURLtoBlob(self.toDataURL(type, quality)));
          });
        };
      }
    }

    if ( module.exports) {
      module.exports = dataURLtoBlob;
    } else {
      window.dataURLtoBlob = dataURLtoBlob;
    }
  })(window);
});

var isBlob = function isBlob(input) {
  if (typeof Blob === 'undefined') {
    return false;
  }

  return input instanceof Blob || Object.prototype.toString.call(input) === '[object Blob]';
};

var DEFAULTS = {
  /**
   * Indicates if output the original image instead of the compressed one
   * when the size of the compressed image is greater than the original one's
   * @type {boolean}
   */
  strict: true,

  /**
   * Indicates if read the image's Exif Orientation information,
   * and then rotate or flip the image automatically.
   * @type {boolean}
   */
  checkOrientation: true,

  /**
   * The max width of the output image.
   * @type {number}
   */
  maxWidth: Infinity,

  /**
   * The max height of the output image.
   * @type {number}
   */
  maxHeight: Infinity,

  /**
   * The min width of the output image.
   * @type {number}
   */
  minWidth: 0,

  /**
   * The min height of the output image.
   * @type {number}
   */
  minHeight: 0,

  /**
   * The width of the output image.
   * If not specified, the natural width of the source image will be used.
   * @type {number}
   */
  width: undefined,

  /**
   * The height of the output image.
   * If not specified, the natural height of the source image will be used.
   * @type {number}
   */
  height: undefined,

  /**
   * The quality of the output image.
   * It must be a number between `0` and `1`,
   * and only available for `image/jpeg` and `image/webp` images.
   * Check out {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob canvas.toBlob}.
   * @type {number}
   */
  quality: 0.8,

  /**
   * The mime type of the output image.
   * By default, the original mime type of the source image file will be used.
   * @type {string}
   */
  mimeType: 'auto',

  /**
   * PNG files over this value (5 MB by default) will be converted to JPEGs.
   * To disable this, just set the value to `Infinity`.
   * @type {number}
   */
  convertSize: 5000000,

  /**
   * The hook function to execute before draw the image into the canvas for compression.
   * @type {Function}
   * @param {CanvasRenderingContext2D} context - The 2d rendering context of the canvas.
   * @param {HTMLCanvasElement} canvas - The canvas for compression.
   * @example
   * function (context, canvas) {
   *   context.fillStyle = '#fff';
   * }
   */
  beforeDraw: null,

  /**
   * The hook function to execute after drew the image into the canvas for compression.
   * @type {Function}
   * @param {CanvasRenderingContext2D} context - The 2d rendering context of the canvas.
   * @param {HTMLCanvasElement} canvas - The canvas for compression.
   * @example
   * function (context, canvas) {
   *   context.filter = 'grayscale(100%)';
   * }
   */
  drew: null,

  /**
   * The hook function to execute when success to compress the image.
   * @type {Function}
   * @param {File} file - The compressed image File object.
   * @example
   * function (file) {
   *   console.log(file);
   * }
   */
  success: null,

  /**
   * The hook function to execute when fail to compress the image.
   * @type {Function}
   * @param {Error} err - An Error object.
   * @example
   * function (err) {
   *   console.log(err.message);
   * }
   */
  error: null,

  /**
   * 是否强制压缩图片到指定的压缩大小
   * @type {Boolean}
   */
  force: false,

  /**
   * 是否在控制台输出日志
   * @type {Boolean}
   */
  log: false
};

var IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
var WINDOW = IS_BROWSER ? window : {};

var slice = Array.prototype.slice;
/**
 * Convert array-like or iterable object to an array.
 * @param {*} value - The value to convert.
 * @returns {Array} Returns a new array.
 */

function toArray(value) {
  return Array.from ? Array.from(value) : slice.call(value);
}
var REGEXP_IMAGE_TYPE = /^image\/.+$/;
/**
 * Check if the given value is a mime type of image.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given is a mime type of image, else `false`.
 */

function isImageType(value) {
  return REGEXP_IMAGE_TYPE.test(value);
}
/**
 * Convert image type to extension.
 * @param {string} value - The image type to convert.
 * @returns {boolean} Returns the image extension.
 */

function imageTypeToExtension(value) {
  var extension = isImageType(value) ? value.substr(6) : '';

  if (extension === 'jpeg') {
    extension = 'jpg';
  }

  return ".".concat(extension);
}
var fromCharCode = String.fromCharCode;
/**
 * Get string from char code in data view.
 * @param {DataView} dataView - The data view for read.
 * @param {number} start - The start index.
 * @param {number} length - The read length.
 * @returns {string} The read result.
 */

function getStringFromCharCode(dataView, start, length) {
  var str = '';
  var i;
  length += start;

  for (i = start; i < length; i += 1) {
    str += fromCharCode(dataView.getUint8(i));
  }

  return str;
}
var btoa$1 = WINDOW.btoa;
/**
 * Transform array buffer to Data URL.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
 * @param {string} mimeType - The mime type of the Data URL.
 * @returns {string} The result Data URL.
 */

function arrayBufferToDataURL(arrayBuffer, mimeType) {
  var chunks = [];
  var chunkSize = 8192;
  var uint8 = new Uint8Array(arrayBuffer);

  while (uint8.length > 0) {
    // XXX: Babel's `toConsumableArray` helper will throw error in IE or Safari 9
    // eslint-disable-next-line prefer-spread
    chunks.push(fromCharCode.apply(null, toArray(uint8.subarray(0, chunkSize))));
    uint8 = uint8.subarray(chunkSize);
  }

  return "data:".concat(mimeType, ";base64,").concat(btoa$1(chunks.join('')));
}
/**
 * Get orientation value from given array buffer.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
 * @returns {number} The read orientation value.
 */

function resetAndGetOrientation(arrayBuffer) {
  var dataView = new DataView(arrayBuffer);
  var orientation; // Ignores range error when the image does not have correct Exif information

  try {
    var littleEndian;
    var app1Start;
    var ifdStart; // Only handle JPEG image (start by 0xFFD8)

    if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
      var length = dataView.byteLength;
      var offset = 2;

      while (offset + 1 < length) {
        if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
          app1Start = offset;
          break;
        }

        offset += 1;
      }
    }

    if (app1Start) {
      var exifIDCode = app1Start + 4;
      var tiffOffset = app1Start + 10;

      if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
        var endianness = dataView.getUint16(tiffOffset);
        littleEndian = endianness === 0x4949;

        if (littleEndian || endianness === 0x4D4D
        /* bigEndian */
        ) {
            if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
              var firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

              if (firstIFDOffset >= 0x00000008) {
                ifdStart = tiffOffset + firstIFDOffset;
              }
            }
          }
      }
    }

    if (ifdStart) {
      var _length = dataView.getUint16(ifdStart, littleEndian);

      var _offset;

      var i;

      for (i = 0; i < _length; i += 1) {
        _offset = ifdStart + i * 12 + 2;

        if (dataView.getUint16(_offset, littleEndian) === 0x0112
        /* Orientation */
        ) {
            // 8 is the offset of the current tag's value
            _offset += 8; // Get the original orientation value

            orientation = dataView.getUint16(_offset, littleEndian); // Override the orientation with its default value

            dataView.setUint16(_offset, 1, littleEndian);
            break;
          }
      }
    }
  } catch (e) {
    orientation = 1;
  }

  return orientation;
}
/**
 * Parse Exif Orientation value.
 * @param {number} orientation - The orientation to parse.
 * @returns {Object} The parsed result.
 */

function parseOrientation(orientation) {
  var rotate = 0;
  var scaleX = 1;
  var scaleY = 1;

  switch (orientation) {
    // Flip horizontal
    case 2:
      scaleX = -1;
      break;
    // Rotate left 180°

    case 3:
      rotate = -180;
      break;
    // Flip vertical

    case 4:
      scaleY = -1;
      break;
    // Flip vertical and rotate right 90°

    case 5:
      rotate = 90;
      scaleY = -1;
      break;
    // Rotate right 90°

    case 6:
      rotate = 90;
      break;
    // Flip horizontal and rotate right 90°

    case 7:
      rotate = 90;
      scaleX = -1;
      break;
    // Rotate left 90°

    case 8:
      rotate = -90;
      break;
  }

  return {
    rotate: rotate,
    scaleX: scaleX,
    scaleY: scaleY
  };
}
var REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/;
/**
 * Normalize decimal number.
 * Check out {@link https://0.30000000000000004.com/}
 * @param {number} value - The value to normalize.
 * @param {number} [times=100000000000] - The times for normalizing.
 * @returns {number} Returns the normalized number.
 */

function normalizeDecimalNumber(value) {
  var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100000000000;
  return REGEXP_DECIMALS.test(value) ? Math.round(value * times) / times : value;
}

var ArrayBuffer$1 = WINDOW.ArrayBuffer,
    FileReader = WINDOW.FileReader;
var URL = WINDOW.URL || WINDOW.webkitURL;
var REGEXP_EXTENSION = /\.\w+$/;
var AnotherCompressor = WINDOW.Compressor;
var MAX_DRAW_SIZE = 4500; // canvas画布最大宽度/最大长度，保证移动端性能，移动端如果超出一定尺寸会挂掉

/**
 * Creates a new image compressor.
 * @class
 */

var Compressor =
/*#__PURE__*/
function () {
  /**
   * The constructor of Compressor.
   * @param {File|Blob|String} file - The target image file for compressing. 值可以为base64
   * @param {Object} [options] - The options for compressing.
   */
  function Compressor(file, options) {
    _classCallCheck(this, Compressor);

    this.file = file instanceof File || file instanceof Blob ? file : canvasToBlob(file);
    this.image = new Image();
    this.options = _objectSpread2({}, DEFAULTS, {}, options);
    this.aborted = false;
    this.result = null;
    this.convertRangeSize = null;
    this.binaryCompressDimension = null;
    this.binaryCompressQuality = null;
    this.init();
  }

  _createClass(Compressor, [{
    key: "init",
    value: function init() {
      var _this = this;

      var file = this.file,
          options = this.options;

      if (!isBlob(file)) {
        this.fail(new Error('The first argument must be a File or Blob object.'));
        return;
      }

      var mimeType = file.type;

      if (!isImageType(mimeType)) {
        this.fail(new Error('The first argument must be an image File or Blob object.'));
        return;
      }

      if (!URL || !FileReader) {
        this.fail(new Error('The current browser does not support image compression.'));
        return;
      }

      if (!ArrayBuffer$1) {
        options.checkOrientation = false;
      }

      if (URL && !options.checkOrientation) {
        this.load({
          url: URL.createObjectURL(file)
        });
      } else {
        var reader = new FileReader();
        var checkOrientation = options.checkOrientation && mimeType === 'image/jpeg';
        this.reader = reader;

        reader.onload = function (_ref) {
          var target = _ref.target;
          var result = target.result;
          var data = {};

          if (checkOrientation) {
            // Reset the orientation value to its default value 1
            // as some iOS browsers will render image with its orientation
            var orientation = resetAndGetOrientation(result);

            if (orientation > 1 || !URL) {
              // Generate a new URL which has the default orientation value
              data.url = arrayBufferToDataURL(result, mimeType);

              if (orientation > 1) {
                _extends(data, parseOrientation(orientation));
              }
            } else {
              data.url = URL.createObjectURL(file);
            }
          } else {
            data.url = result;
          }

          _this.load(data);
        };

        reader.onabort = function () {
          _this.fail(new Error('Aborted to read the image with FileReader.'));
        };

        reader.onerror = function () {
          _this.fail(new Error('Failed to read the image with FileReader.'));
        };

        reader.onloadend = function () {
          _this.reader = null;
        };

        if (checkOrientation) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsDataURL(file);
        }
      }
    }
  }, {
    key: "load",
    value: function load(data) {
      var _this2 = this;

      var file = this.file,
          image = this.image;

      image.onload = function () {
        _this2.draw(_objectSpread2({}, data, {
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight
        }));
      };

      image.onabort = function () {
        _this2.fail(new Error('Aborted to load the image.'));
      };

      image.onerror = function () {
        _this2.fail(new Error('Failed to load the image.'));
      }; // Match all browsers that use WebKit as the layout engine in iOS devices,
      // such as Safari for iOS, Chrome for iOS, and in-app browsers.


      if (WINDOW.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(WINDOW.navigator.userAgent)) {
        // Fix the `The operation is insecure` error (#57)
        image.crossOrigin = 'anonymous';
      }

      image.alt = file.name;
      image.src = data.url;
    }
  }, {
    key: "draw",
    value: function draw(_ref2) {
      var _this3 = this;

      var naturalWidth = _ref2.naturalWidth,
          naturalHeight = _ref2.naturalHeight,
          _ref2$rotate = _ref2.rotate,
          rotate = _ref2$rotate === void 0 ? 0 : _ref2$rotate,
          _ref2$scaleX = _ref2.scaleX,
          scaleX = _ref2$scaleX === void 0 ? 1 : _ref2$scaleX,
          _ref2$scaleY = _ref2.scaleY,
          scaleY = _ref2$scaleY === void 0 ? 1 : _ref2$scaleY;
      this.minMaxSize();
      var file = this.file,
          image = this.image,
          options = this.options;
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var aspectRatio = naturalWidth / naturalHeight;
      var is90DegreesRotated = Math.abs(rotate) % 180 === 90;
      var maxWidth = Math.max(options.maxWidth, 0) || MAX_DRAW_SIZE;
      var maxHeight = Math.max(options.maxHeight, 0) || MAX_DRAW_SIZE; // 如果设定的最小宽高小于原始宽高，则使用原始宽高

      var minWidth = Math.min(naturalWidth, Math.max(options.minWidth, 0)) || 0;
      var minHeight = Math.min(naturalHeight, Math.max(options.minHeight, 0)) || 0;
      var width = Math.max(options.width, 0) || naturalWidth;
      var height = Math.max(options.height, 0) || naturalHeight;

      if (is90DegreesRotated) {
        var _ref3 = [maxHeight, maxWidth];
        maxWidth = _ref3[0];
        maxHeight = _ref3[1];
        var _ref4 = [minHeight, minWidth];
        minWidth = _ref4[0];
        minHeight = _ref4[1];
        var _ref5 = [height, width];
        width = _ref5[0];
        height = _ref5[1];
      }

      if (maxWidth < Infinity && maxHeight < Infinity) {
        if (maxHeight * aspectRatio > maxWidth) {
          maxHeight = maxWidth / aspectRatio;
        } else {
          maxWidth = maxHeight * aspectRatio;
        }
      } else if (maxWidth < Infinity) {
        maxHeight = maxWidth / aspectRatio;
      } else if (maxHeight < Infinity) {
        maxWidth = maxHeight * aspectRatio;
      }

      if (minWidth > 0 && minHeight > 0) {
        if (minHeight * aspectRatio > minWidth) {
          minHeight = minWidth / aspectRatio;
        } else {
          minWidth = minHeight * aspectRatio;
        }
      } else if (minWidth > 0) {
        minHeight = minWidth / aspectRatio;
      } else if (minHeight > 0) {
        minWidth = minHeight * aspectRatio;
      }

      if (height * aspectRatio > width) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }

      this.minWidth = minWidth;
      width = Math.floor(normalizeDecimalNumber(Math.min(Math.max(width, minWidth), maxWidth)));
      height = Math.floor(normalizeDecimalNumber(Math.min(Math.max(height, minHeight), maxHeight)));
      var destX = -width / 2;
      var destY = -height / 2;
      var destWidth = width;
      var destHeight = height;
      var compressResult = null;

      if (is90DegreesRotated) {
        var _ref6 = [height, width];
        width = _ref6[0];
        height = _ref6[1];
      }

      canvas.width = width;
      canvas.height = height;

      if (!isImageType(options.mimeType)) {
        options.mimeType = file.type;
      }

      var fillStyle = 'transparent'; // Converts PNG files over the `convertSize` to JPEGs.

      if (file.size > this.convertRangeSize[1] && options.mimeType === 'image/png') {
        fillStyle = '#fff';
        options.mimeType = 'image/jpeg';
      } // Override the default fill color (#000, black)


      context.fillStyle = fillStyle;
      context.fillRect(0, 0, width, height);

      if (options.beforeDraw) {
        options.beforeDraw.call(this, context, canvas);
      }

      if (this.aborted) {
        return;
      }

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(rotate * Math.PI / 180);
      context.scale(scaleX, scaleY);
      context.drawImage(image, destX, destY, destWidth, destHeight);
      context.restore(); // 统计压缩次数

      this.binaryCount = 0;

      try {
        if (options.force) {
          compressResult = this.toSpecifiedSize({
            canvas: canvas,
            context: context,
            mimeType: options.mimeType
          });
        }
      } catch (error) {
        console.log(error);
      }

      if (options.drew) {
        options.drew.call(this, context, canvas);
      }

      if (this.aborted) {
        return;
      }

      var done = function done(result, otherResult) {
        if (!_this3.aborted) {
          _this3.done({
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
            result: result,
            otherResult: otherResult
          });
        }
      };

      this.log('compressResult: ', compressResult);

      if (canvas.toBlob && !options.force) {
        canvas.toBlob(function (blob) {
          var base64 = canvas.toDataURL(options.mimeType, options.quality);
          done({
            base64: base64,
            result: _this3.compareResult(blob.size)
          }, blob);
        }, options.mimeType, options.quality);
      } else {
        done(compressResult, canvasToBlob(compressResult.base64));
      }
    }
  }, {
    key: "toSpecifiedSize",
    value: function toSpecifiedSize(_ref7) {
      var canvas = _ref7.canvas,
          context = _ref7.context,
          mimeType = _ref7.mimeType;
      // 压缩策略
      // 1. 比较当前压缩结果是否符合要求，0和1则直接返回，如果是2则进入递归压缩
      // 2. 首先根据默认/用户指定最小尺寸进行大小压缩
      var minWidth = this.minWidth,
          options = this.options,
          image = this.image;
      var width = canvas.width,
          height = canvas.height;
      var aspectRatio = width / height;
      var quality = options.quality;
      var img = canvas.toDataURL(mimeType, quality);
      var imgSize = canvasToBlob(img).size;
      var result = this.compareResult(imgSize);
      this.log('转换后的压缩大小区间：', this.convertRangeSize);
      var varWidth = width;
      var varHeight = height; // 初次压缩结果符合要求或者小于压缩最小要求

      if (result === 0 || result === 1) {
        return {
          base64: img,
          compressedSize: imgSize,
          result: result
        };
      }

      var params = {
        canvas: canvas,
        context: context,
        image: image,
        mimeType: mimeType,
        width: width,
        height: height,
        quality: quality
      }; // TODO 测试程序，待删除
      // Compressor.testSizeOrQuality(params);

      this.binaryCompressQuality = {
        left: 0,
        right: quality
      };

      if (minWidth < width) {
        this.binaryCompressDimension = {
          left: minWidth,
          right: width
        };
        varWidth = minWidth;
        varHeight = varWidth / aspectRatio;

        var _this$transformToBase = this.transformToBase64(_extends(params, {
          width: varWidth,
          height: varHeight
        })),
            _this$transformToBase2 = _slicedToArray(_this$transformToBase, 2),
            base64 = _this$transformToBase2[0],
            compressedSize = _this$transformToBase2[1];

        var compressResult = this.compareResult(compressedSize);

        if (compressResult === 1) {
          return {
            base64: base64,
            compressedSize: compressedSize,
            result: compressResult
          };
        }

        if (compressResult === 2) {
          return this.compressByQuality(params);
        }

        return this.compressBySize(_extends(params, {
          width: varWidth,
          height: varHeight
        }));
      }

      return this.compressByQuality(params);
    } // eslint-disable-next-line class-methods-use-this

  }, {
    key: "transformToBase64",
    value: function transformToBase64(_ref8) {
      var canvas = _ref8.canvas,
          context = _ref8.context,
          image = _ref8.image,
          mimeType = _ref8.mimeType,
          width = _ref8.width,
          height = _ref8.height,
          quality = _ref8.quality;
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      return this.transformCanvasToSize({
        canvas: canvas,
        mimeType: mimeType,
        quality: quality
      });
    } // eslint-disable-next-line class-methods-use-this

  }, {
    key: "transformCanvasToSize",
    value: function transformCanvasToSize(_ref9) {
      var canvas = _ref9.canvas,
          mimeType = _ref9.mimeType,
          quality = _ref9.quality;
      var base64 = canvas.toDataURL(mimeType, quality);
      var compressedSize = canvasToBlob(base64).size;
      return [base64, compressedSize];
    } // 根据 convertSize 生成图片压缩的大小区间范围

  }, {
    key: "minMaxSize",
    value: function minMaxSize() {
      var convertSize = this.options.convertSize;
      var maxSize = Number.MAX_VALUE;
      var minSize = 0;

      if (Array.isArray(convertSize)) {
        if (convertSize.length === 2) {
          var _convertSize = _slicedToArray(convertSize, 2);

          minSize = _convertSize[0];
          maxSize = _convertSize[1];

          // TODO 是否提示用户给出的区间差距如果过分小，压缩会很慢
          if (minSize >= maxSize) {
            maxSize = minSize;
            minSize = 0;
          }
        } else if (convertSize.length === 1) {
          var _convertSize2 = _slicedToArray(convertSize, 1);

          maxSize = _convertSize2[0];
        }
      } else if (Number(convertSize) > 0) {
        maxSize = convertSize;
      }

      this.convertRangeSize = [minSize, maxSize];
      return this.convertRangeSize;
    }
    /**
     * @description
     * @param {Number} size 压缩大小
     * @param {Number} maxSize 最大压缩大小
     * @param {Number} minSize 最小压缩大小
     * @returns {Number} 压缩后尺寸比对结果
     * @memberof Compressor
     */
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: "compareResult",
    value: function compareResult(size) {
      // 压缩结果
      // 0：压缩后结果小于等于最小要求
      // 1: 压缩结果符合要求
      // 2: 压缩结果大于等于最大要求
      var _this$convertRangeSiz = _slicedToArray(this.convertRangeSize, 2),
          minSize = _this$convertRangeSiz[0],
          maxSize = _this$convertRangeSiz[1];

      if (size <= minSize) {
        return 0;
      }

      if (size > minSize && size < maxSize) {
        return 1;
      }

      return 2;
    }
  }, {
    key: "compressByQuality",
    value: function compressByQuality(params) {
      this.binaryCount += 1; // eslint-disable-next-line prefer-const

      var quality = params.quality,
          beforeCompressedSize = params.beforeCompressedSize;

      var _this$transformCanvas = this.transformCanvasToSize(params),
          _this$transformCanvas2 = _slicedToArray(_this$transformCanvas, 2),
          base64 = _this$transformCanvas2[0],
          compressedSize = _this$transformCanvas2[1];

      var compressResult = this.compareResult(compressedSize);
      this.log('compressByQuality: ', quality, this.binaryCompressQuality.left, this.binaryCompressQuality.right, compressedSize); // 三种情况：
      // 1.压缩结果符合要求；
      // 2.压缩质量小叔叔微超过五位，无法压缩；
      // 3.上次压缩和本地压缩结果一致，表明已经压缩到极限，无法继续压缩下去

      if (compressResult === 1 || quality <= 0.00001 || beforeCompressedSize === compressedSize) {
        return {
          base64: base64,
          compressedSize: compressedSize,
          result: compressResult
        };
      }

      if (compressResult === 2) {
        this.binaryCompressQuality.right = quality;
      }

      if (compressResult === 0) {
        this.binaryCompressQuality.left = quality;
      }

      var _this$binaryCompressQ = this.binaryCompressQuality,
          left = _this$binaryCompressQ.left,
          right = _this$binaryCompressQ.right;
      quality = (left + right) / 2;
      return this.compressByQuality(_extends(params, {
        quality: quality,
        beforeCompressedSize: compressedSize
      }));
    } // TODO 异常处理：如果用户给出的convertSize最小和最大差距很小，那么会不会出现死循环

  }, {
    key: "compressBySize",
    value: function compressBySize(params) {
      this.binaryCount += 1;
      var canvas = params.canvas,
          width = params.width;
      var minWidth = this.minWidth;
      var aspectRatio = canvas.width / canvas.height;
      var varWidth = width;
      var varHeight = varWidth / aspectRatio;

      var _this$transformToBase3 = this.transformToBase64(_extends(params, {
        width: varWidth,
        height: varHeight
      })),
          _this$transformToBase4 = _slicedToArray(_this$transformToBase3, 2),
          base64 = _this$transformToBase4[0],
          compressedSize = _this$transformToBase4[1];

      var compressResult = this.compareResult(compressedSize);
      this.log('compressBySize: ', varWidth, this.binaryCompressDimension.left, this.binaryCompressDimension.right, compressedSize);

      if (compressResult === 1 || width <= 50) {
        return {
          base64: base64,
          compressedSize: compressedSize,
          result: compressResult
        };
      }

      if (compressResult === 2 && minWidth === width) {
        return this.compressByQuality(canvas, compressedSize);
      }

      if (compressResult === 2) {
        this.binaryCompressDimension.right = width;
      }

      if (compressResult === 0) {
        this.binaryCompressDimension.left = width;
      }

      var _this$binaryCompressD = this.binaryCompressDimension,
          left = _this$binaryCompressD.left,
          right = _this$binaryCompressD.right;
      varWidth = (left + right) / 2;
      varHeight = varWidth / aspectRatio;
      return this.compressBySize(_extends(params, {
        width: varWidth,
        height: varHeight
      }));
    }
  }, {
    key: "done",
    value: function done(_ref10) {
      var naturalWidth = _ref10.naturalWidth,
          naturalHeight = _ref10.naturalHeight,
          result = _ref10.result,
          otherResult = _ref10.otherResult;
      var file = this.file,
          image = this.image,
          options = this.options;

      if (URL && !options.checkOrientation) {
        URL.revokeObjectURL(image.src);
      }

      if (result) {
        // Returns original file if the result is greater than it and without size related options
        if (options.strict && result.size > file.size && options.mimeType === file.type && !(options.width > naturalWidth || options.height > naturalHeight || options.minWidth > naturalWidth || options.minHeight > naturalHeight)) {
          result = file;
        } else {
          var date = new Date();
          result.lastModified = date.getTime();
          result.lastModifiedDate = date;
          result.name = file.name; // Convert the extension to match its type

          if (result.name && result.type !== file.type) {
            result.name = result.name.replace(REGEXP_EXTENSION, imageTypeToExtension(result.type));
          }
        }
      } else {
        // Returns original file if the result is null in some cases.
        result = file;
      }

      this.result = result;

      if (options.success) {
        options.success.call(this, result, otherResult);
      }
    }
  }, {
    key: "fail",
    value: function fail(err) {
      var options = this.options;

      if (options.error) {
        options.error.call(this, err);
      } else {
        throw err;
      }
    }
  }, {
    key: "abort",
    value: function abort() {
      if (!this.aborted) {
        this.aborted = true;

        if (this.reader) {
          this.reader.abort();
        } else if (!this.image.complete) {
          this.image.onload = null;
          this.image.onabort();
        } else {
          this.fail(new Error('The compression process has been aborted.'));
        }
      }
    }
  }, {
    key: "log",
    value: function log() {
      if (this.options.log) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    }
    /**
     * Get the no conflict compressor class.
     * @returns {Compressor} The compressor class.
     */

  }], [{
    key: "noConflict",
    value: function noConflict() {
      window.Compressor = AnotherCompressor;
      return Compressor;
    }
    /**
     * Change the default options.
     * @param {Object} options - The new default options.
     */

  }, {
    key: "setDefaults",
    value: function setDefaults(options) {
      _extends(DEFAULTS, options);
    } // 测试图片尺寸和质量对体积的影响

  }, {
    key: "testSizeOrQuality",
    value: function testSizeOrQuality(_ref11) {
      var canvas = _ref11.canvas,
          context = _ref11.context,
          image = _ref11.image,
          mimeType = _ref11.mimeType,
          width = _ref11.width,
          height = _ref11.height,
          quality = _ref11.quality;
      var ratio = width / height;
      var size = Number.MAX_VALUE;
      var testQuality = quality;
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      console.log('start quality');

      while (testQuality >= 0.01) {
        var ba = canvas.toDataURL(mimeType, testQuality);
        size = btoa(ba).length;
        console.log(testQuality, btoa(ba).length / 1024);
        testQuality -= 0.01;
      }

      console.log('start size');

      while (width > 100 && size > 10 * 1024) {
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        var _ba = canvas.toDataURL(mimeType, quality);

        size = btoa(_ba).length;
        console.log("".concat(width, "*").concat(height), btoa(_ba).length / 1024);
        width -= 100;
        height = width / ratio;
      }
    }
  }]);

  return Compressor;
}();

export default Compressor;
//# sourceMappingURL=compressor.esm.js.map
