/* eslint-disable no-undef */
let fileSize = 0;
let count = 1;
let finalSize = 0; // 压缩之后的大小，若两次比对这个值是相同的，则判定压缩失败，抛错
export default async function getUploadImgInfo(e) {
  /**
   * 获取最终图片上传的所需入参：{ blob：图片文件, fileExtension：图片扩展名, fileType：图片类型, imgBase64：图片前端展示的base64 }
   * { blob, fileExtension, fileType, imgBase64}
   */
  const fileInfo = getFileInfo(e);
  if (!fileInfo) return Promise.reject();
  const { fileExtension, fileType, file } = fileInfo;
  let level = 1; // 压缩的文件质量，如果文件大小不合适，质量则会取这个值
  let cutNum = 0.1;
  const maxSize = 500 * 1024; // 字节，最大500k
  let fileRes = null;
  let finalRes = null;
  let maxLength = 1024; // 能接受的最大图片长度，作为压缩图片的入参
  const minLength = 754; // 能接受的最小图片长度
  finalSize = 0; // 重置这个值
  const task = async () => {
    console.log('test||   ', 'level:', level, 'maxLength:', maxLength);
    fileRes = await imgResize({
      file,
      fileType,
      level,
      maxSize,
      maxLength,
    });
    finalRes = await convertBlob({
      imgBase64: fileRes,
      fileType,
      fileExtension,
    });
  };
  await task();
  if (finalRes.blob.size > maxSize) {
    // 设定一个合适的level，避免压缩的时候太多
    level = orginLevel(finalRes.blob.size, maxSize);
    if (level <= 0.4) maxLength = 800;
    console.log('test||   ', 'originLevel', level);
  }
  while (finalRes.blob.size > maxSize) {
    // 如果文件大小不合适，则一直压缩到500k以内
    if (maxLength > minLength) {
      // 控制图片最大边的长度
      maxLength -= 10;
    }
    if (level <= cutNum) {
      // 控制level递减的差值
      cutNum /= 10;
    }
    level = (level * 1000000 - cutNum * 1000000) / 1000000;
    await task();
  }
  return finalRes;
}
function orginLevel(size, maxSize) {
  // 根据文件大小得到一开始的level
  // rate为与最终限定大小的倍数
  const rate = Number((size / maxSize).toFixed());
  const finalLevel = (1 * 100000 - (rate * 100000) / 3) / 100000;
  if (rate <= 1) {
    return 1;
  }
  if (finalLevel > 0) {
    return Number(finalLevel.toFixed(1));
  }
  return 0.1;
}
function getImgResize(originW, originH, maxLength = 1024) {
  // 获得图片调整大小之后的长宽；maxLength为长宽最大的长度
  let resizeH = 0;
  let resizeW = 0;
  if (originW > maxLength || originH > maxLength) {
    const multiple = Math.max(originW / maxLength, originH / maxLength);
    resizeW = originW / multiple;
    resizeH = originH / multiple;
  } else {
    resizeW = originW;
    resizeH = originH;
  }
  return {
    resizeH,
    resizeW,
  };
}
export function getImgBase64(e) {
  // 把文件转成base64--预览目的
  const fileInfo = getFileInfo(e);
  const { fileType, file } = fileInfo;
  return imgResize({
    file,
    maxSize: 500 * 1024,
    fileType,
    level: 0.6,
    maxLength: 500,
  });
}
function getFileInfo(e) {
  if (e.target.value == '') {
    return false;
  }
  const files = e.target.files || e.dataTransfer.files;
  if (!files.length) return;
  const file = files[0];
  return {
    fileExtension: file.name.match(/[\w]*$/) && file.name.match(/[\w]*$/)[0],
    fileType: file.type.split('/')[1],
    file: files[0],
  };
}
// 对图片进行压缩
function imgResize({
  file,
  maxSize = 500 * 1024,
  fileType,
  level = 1.0,
  maxLength = 1024,
}) {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileSize = file.size;
    if (file.size > maxSize) {
      fileReader.onload = function (e) {
        const IMG = new Image();
        IMG.onload = function () {
          const originW = this.naturalWidth;
          const originH = this.naturalHeight;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const { resizeW, resizeH } = getImgResize(
            originW,
            originH,
            maxLength,
          );
          if (window.navigator.userAgent.indexOf('iPhone') > 0) {
            canvas.width = resizeH;
            canvas.height = resizeW;
            ctx.rotate((90 * Math.PI) / 180);
            ctx.drawImage(IMG, 0, -resizeH, resizeW, resizeH);
          } else {
            canvas.width = resizeW;
            canvas.height = resizeH;
            ctx.drawImage(IMG, 0, 0, resizeW, resizeH);
          }
          const base64 = canvas.toDataURL(`image/${fileType}`, level);
          resolve(base64);
        };

        IMG.src = e.target.result;
      };
    } else {
      fileReader.onload = function () {
        resolve(fileReader.result);
      };
    }
    fileReader.readAsDataURL(file);
  });
}
function convertBlob({ imgBase64, fileType, fileExtension }) {
  // 获得blob，用于最终上传的图片入参
  if (!imgBase64) {
    this.$toast('请选择图片');
    return;
  }
  const base64 = window.atob(imgBase64.split(',')[1]);
  const buffer = new ArrayBuffer(base64.length);
  const ubuffer = new Uint8Array(buffer);
  for (let i = 0; i < base64.length; i++) {
    ubuffer[i] = base64.charCodeAt(i);
  }
  let blob;
  try {
    blob = new Blob([buffer], { type: `image/${fileType}` });
  } catch (e) {
    window.BlobBuilder = window.BlobBuilder
      || window.WebKitBlobBuilder
      || window.MozBlobBuilder
      || window.MSBlobBuilder;
    if (e.name === 'TypeError' && window.BlobBuilder) {
      const blobBuilder = new BlobBuilder();
      blobBuilder.append(buffer);
      blob = blobBuilder.getBlob(`image/${fileType}`);
    }
  }
  if (finalSize === blob.size) {
    return Promise.reject(new Error('压缩该文件两次的结果相同，压缩无效！'));
  }
  finalSize = blob.size;

  console.log(
    'test||   ',
    'count:',
    count++,
    '占比：',
    blob.size / fileSize,
    'final:',
    blob.size,
    blob.size / 1024,
    'begin',
    fileSize,
    fileSize / 1024,
  );
  return Promise.resolve({
    blob,
    fileExtension,
    fileType,
    imgBase64,
  });
}
