/* eslint-disable no-console */
import toBlob from 'blueimp-canvas-to-blob';
import isBlob from 'is-blob';
import DEFAULTS from './defaults';
import {
  WINDOW,
} from './constants';
import {
  arrayBufferToDataURL,
  imageTypeToExtension,
  isImageType,
  normalizeDecimalNumber,
  parseOrientation,
  resetAndGetOrientation,
} from './utilities';

const { ArrayBuffer, FileReader } = WINDOW;
const URL = WINDOW.URL || WINDOW.webkitURL;
const REGEXP_EXTENSION = /\.\w+$/;
const AnotherCompressor = WINDOW.Compressor;
const MAX_DRAW_SIZE = 4500; // canvas画布最大宽度/最大长度，保证移动端性能，移动端如果超出一定尺寸会挂掉

/**
 * Creates a new image compressor.
 * @class
 */
export default class Compressor {
  /**
   * The constructor of Compressor.
   * @param {File|Blob|String} file - The target image file for compressing. 值可以为base64
   * @param {Object} [options] - The options for compressing.
   */
  constructor(file, options) {
    this.file = file instanceof File || file instanceof Blob ? file : toBlob(file);
    this.image = new Image();
    this.options = {
      ...DEFAULTS,
      ...options,
    };
    this.aborted = false;
    this.result = null;
    this.convertRangeSize = null;
    this.binaryCompressDimension = null;
    this.binaryCompressQuality = null;
    this.init();
  }

  init() {
    const { file, options } = this;

    if (!isBlob(file)) {
      this.fail(new Error('The first argument must be a File or Blob object.'));
      return;
    }

    const mimeType = file.type;

    if (!isImageType(mimeType)) {
      this.fail(new Error('The first argument must be an image File or Blob object.'));
      return;
    }

    if (!URL || !FileReader) {
      this.fail(new Error('The current browser does not support image compression.'));
      return;
    }

    if (!ArrayBuffer) {
      options.checkOrientation = false;
    }

    if (URL && !options.checkOrientation) {
      this.load({
        url: URL.createObjectURL(file),
      });
    } else {
      const reader = new FileReader();
      const checkOrientation = options.checkOrientation && mimeType === 'image/jpeg';

      this.reader = reader;
      reader.onload = ({ target }) => {
        const { result } = target;
        const data = {};

        if (checkOrientation) {
          // Reset the orientation value to its default value 1
          // as some iOS browsers will render image with its orientation
          const orientation = resetAndGetOrientation(result);

          if (orientation > 1 || !URL) {
            // Generate a new URL which has the default orientation value
            data.url = arrayBufferToDataURL(result, mimeType);

            if (orientation > 1) {
              Object.assign(data, parseOrientation(orientation));
            }
          } else {
            data.url = URL.createObjectURL(file);
          }
        } else {
          data.url = result;
        }

        this.load(data);
      };
      reader.onabort = () => {
        this.fail(new Error('Aborted to read the image with FileReader.'));
      };
      reader.onerror = () => {
        this.fail(new Error('Failed to read the image with FileReader.'));
      };
      reader.onloadend = () => {
        this.reader = null;
      };

      if (checkOrientation) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  }

  load(data) {
    const { file, image } = this;

    image.onload = () => {
      this.draw({
        ...data,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
    };
    image.onabort = () => {
      this.fail(new Error('Aborted to load the image.'));
    };
    image.onerror = () => {
      this.fail(new Error('Failed to load the image.'));
    };

    // Match all browsers that use WebKit as the layout engine in iOS devices,
    // such as Safari for iOS, Chrome for iOS, and in-app browsers.
    if (WINDOW.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(WINDOW.navigator.userAgent)) {
      // Fix the `The operation is insecure` error (#57)
      image.crossOrigin = 'anonymous';
    }

    image.alt = file.name;
    image.src = data.url;
  }

  draw({
    naturalWidth,
    naturalHeight,
    rotate = 0,
    scaleX = 1,
    scaleY = 1,
  }) {
    this.minMaxSize();
    const { file, image, options } = this;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const aspectRatio = naturalWidth / naturalHeight;
    const is90DegreesRotated = Math.abs(rotate) % 180 === 90;
    let maxWidth = Math.max(options.maxWidth, 0) || MAX_DRAW_SIZE;
    let maxHeight = Math.max(options.maxHeight, 0) || MAX_DRAW_SIZE;
    // 如果设定的最小宽高小于原始宽高，则使用原始宽高
    let minWidth = Math.min(naturalWidth, Math.max(options.minWidth, 0)) || 0;
    let minHeight = Math.min(naturalHeight, Math.max(options.minHeight, 0)) || 0;
    let width = Math.max(options.width, 0) || naturalWidth;
    let height = Math.max(options.height, 0) || naturalHeight;

    if (is90DegreesRotated) {
      [maxWidth, maxHeight] = [maxHeight, maxWidth];
      [minWidth, minHeight] = [minHeight, minWidth];
      [width, height] = [height, width];
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

    const destX = -width / 2;
    const destY = -height / 2;
    const destWidth = width;
    const destHeight = height;
    let compressResult = null;

    if (is90DegreesRotated) {
      [width, height] = [height, width];
    }

    canvas.width = width;
    canvas.height = height;

    if (!isImageType(options.mimeType)) {
      options.mimeType = file.type;
    }

    let fillStyle = 'transparent';

    // Converts PNG files over the `convertSize` to JPEGs.
    if (file.size > this.convertRangeSize[1] && options.mimeType === 'image/png') {
      fillStyle = '#fff';
      options.mimeType = 'image/jpeg';
    }

    // Override the default fill color (#000, black)
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
    context.rotate((rotate * Math.PI) / 180);
    context.scale(scaleX, scaleY);
    context.drawImage(image, destX, destY, destWidth, destHeight);
    context.restore();

    // 统计压缩次数
    this.binaryCount = 0;
    try {
      if (options.force) {
        compressResult = this.toSpecifiedSize({
          canvas,
          context,
          mimeType: options.mimeType,
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

    const done = (result, otherResult) => {
      if (!this.aborted) {
        this.done({
          naturalWidth,
          naturalHeight,
          result,
          otherResult,
        });
      }
    };

    this.log('compressResult: ', compressResult);

    if (canvas.toBlob && !options.force) {
      canvas.toBlob((blob) => {
        const base64 = canvas.toDataURL(options.mimeType, options.quality);
        done({
          base64,
          result: this.compareResult(blob.size),
        }, blob);
      }, options.mimeType, options.quality);
    } else {
      done(compressResult, toBlob(compressResult.base64));
    }
  }

  toSpecifiedSize({
    canvas,
    context,
    mimeType,
  }) {
    // 压缩策略
    // 1. 比较当前压缩结果是否符合要求，0和1则直接返回，如果是2则进入递归压缩
    // 2. 首先根据默认/用户指定最小尺寸进行大小压缩

    const {
      minWidth,
      options,
      image,
    } = this;
    const { width, height } = canvas;
    const aspectRatio = width / height;
    const { quality } = options;
    const img = canvas.toDataURL(mimeType, quality);
    const imgSize = toBlob(img).size;
    const result = this.compareResult(imgSize);

    this.log('转换后的压缩大小区间：', this.convertRangeSize);

    let varWidth = width;
    let varHeight = height;

    // 初次压缩结果符合要求或者小于压缩最小要求
    if (result === 0 || result === 1) {
      return {
        base64: img,
        compressedSize: imgSize,
        result,
      };
    }

    const params = {
      canvas, context, image, mimeType, width, height, quality,
    };

    // TODO 测试程序，待删除
    // Compressor.testSizeOrQuality(params);

    this.binaryCompressQuality = {
      left: 0,
      right: quality,
    };

    if (minWidth < width) {
      this.binaryCompressDimension = {
        left: minWidth,
        right: width,
      };
      varWidth = minWidth;
      varHeight = varWidth / aspectRatio;
      const [
        base64,
        compressedSize,
      ] = this.transformToBase64(Object.assign(params, {
        width: varWidth,
        height: varHeight,
      }));

      const compressResult = this.compareResult(compressedSize);

      if (compressResult === 1) {
        return {
          base64,
          compressedSize,
          result: compressResult,
        };
      }

      if (compressResult === 2) {
        return this.compressByQuality(params);
      }

      return this.compressBySize(Object.assign(params, {
        width: varWidth,
        height: varHeight,
      }));
    }

    return this.compressByQuality(params);
  }

  // eslint-disable-next-line class-methods-use-this
  transformToBase64({
    canvas, context, image, mimeType, width, height, quality,
  }) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    return this.transformCanvasToSize({
      canvas,
      mimeType,
      quality,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  transformCanvasToSize({
    canvas,
    mimeType,
    quality,
  }) {
    const base64 = canvas.toDataURL(mimeType, quality);
    const compressedSize = toBlob(base64).size;

    return [base64, compressedSize];
  }

  // 根据 convertSize 生成图片压缩的大小区间范围
  minMaxSize() {
    const { convertSize } = this.options;
    let maxSize = Number.MAX_VALUE;
    let minSize = 0;

    if (Array.isArray(convertSize)) {
      if (convertSize.length === 2) {
        [minSize, maxSize] = convertSize;
        // TODO 是否提示用户给出的区间差距如果过分小，压缩会很慢
        if (minSize >= maxSize) {
          maxSize = minSize;
          minSize = 0;
        }
      } else if (convertSize.length === 1) {
        [maxSize] = convertSize;
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
  compareResult(size) {
    // 压缩结果
    // 0：压缩后结果小于等于最小要求
    // 1: 压缩结果符合要求
    // 2: 压缩结果大于等于最大要求
    const [minSize, maxSize] = this.convertRangeSize;

    if (size <= minSize) {
      return 0;
    }

    if (size > minSize && size < maxSize) {
      return 1;
    }

    return 2;
  }

  compressByQuality(params) {
    this.binaryCount += 1;
    // eslint-disable-next-line prefer-const
    let { quality, beforeCompressedSize } = params;

    const [
      base64,
      compressedSize,
    ] = this.transformCanvasToSize(params);

    const compressResult = this.compareResult(compressedSize);

    this.log('compressByQuality: ', quality, this.binaryCompressQuality.left, this.binaryCompressQuality.right, compressedSize);

    // 三种情况：
    // 1.压缩结果符合要求；
    // 2.压缩质量小叔叔微超过五位，无法压缩；
    // 3.上次压缩和本地压缩结果一致，表明已经压缩到极限，无法继续压缩下去
    if (compressResult === 1 || quality <= 0.00001 || beforeCompressedSize === compressedSize) {
      return {
        base64,
        compressedSize,
        result: compressResult,
      };
    }

    if (compressResult === 2) {
      this.binaryCompressQuality.right = quality;
    }

    if (compressResult === 0) {
      this.binaryCompressQuality.left = quality;
    }

    const { left, right } = this.binaryCompressQuality;
    quality = (left + right) / 2;

    return this.compressByQuality(Object.assign(params, {
      quality,
      beforeCompressedSize: compressedSize,
    }));
  }

  // TODO 异常处理：如果用户给出的convertSize最小和最大差距很小，那么会不会出现死循环
  compressBySize(params) {
    this.binaryCount += 1;
    const {
      canvas, width,
    } = params;
    const {
      minWidth,
    } = this;
    const aspectRatio = canvas.width / canvas.height;
    let varWidth = width;
    let varHeight = varWidth / aspectRatio;
    const [
      base64,
      compressedSize,
    ] = this.transformToBase64(Object.assign(params, {
      width: varWidth,
      height: varHeight,
    }));

    const compressResult = this.compareResult(compressedSize);

    this.log('compressBySize: ', varWidth, this.binaryCompressDimension.left, this.binaryCompressDimension.right, compressedSize);

    if (compressResult === 1 || width <= 50) {
      return {
        base64,
        compressedSize,
        result: compressResult,
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

    const { left, right } = this.binaryCompressDimension;
    varWidth = (left + right) / 2;
    varHeight = varWidth / aspectRatio;

    return this.compressBySize(Object.assign(params, {
      width: varWidth,
      height: varHeight,
    }));
  }

  done({
    naturalWidth,
    naturalHeight,
    result,
    otherResult,
  }) {
    const { file, image, options } = this;

    if (URL && !options.checkOrientation) {
      URL.revokeObjectURL(image.src);
    }

    if (result) {
      // Returns original file if the result is greater than it and without size related options
      if (options.strict && result.size > file.size && options.mimeType === file.type && !(
        options.width > naturalWidth
        || options.height > naturalHeight
        || options.minWidth > naturalWidth
        || options.minHeight > naturalHeight
      )) {
        result = file;
      } else {
        const date = new Date();

        result.lastModified = date.getTime();
        result.lastModifiedDate = date;
        result.name = file.name;

        // Convert the extension to match its type
        if (result.name && result.type !== file.type) {
          result.name = result.name.replace(
            REGEXP_EXTENSION,
            imageTypeToExtension(result.type),
          );
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

  fail(err) {
    const { options } = this;

    if (options.error) {
      options.error.call(this, err);
    } else {
      throw err;
    }
  }

  abort() {
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

  log(...args) {
    if (this.options.log) {
      console.log(...args);
    }
  }

  /**
   * Get the no conflict compressor class.
   * @returns {Compressor} The compressor class.
   */
  static noConflict() {
    window.Compressor = AnotherCompressor;
    return Compressor;
  }

  /**
   * Change the default options.
   * @param {Object} options - The new default options.
   */
  static setDefaults(options) {
    Object.assign(DEFAULTS, options);
  }

  // 测试图片尺寸和质量对体积的影响
  static testSizeOrQuality({
    canvas, context, image, mimeType, width, height, quality,
  }) {
    const ratio = width / height;
    let size = Number.MAX_VALUE;
    let testQuality = quality;

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    context.drawImage(image, 0, 0, width, height);

    console.log('start quality');
    while (testQuality >= 0.01) {
      const ba = canvas.toDataURL(mimeType, testQuality);
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

      const ba = canvas.toDataURL(mimeType, quality);
      size = btoa(ba).length;
      console.log(`${width}*${height}`, btoa(ba).length / 1024);
      width -= 100;
      height = width / ratio;
    }
  }
}
