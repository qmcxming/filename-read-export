const fs = require('node:fs')
const path = require('node:path')
const xlsx = require('xlsx');

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 路径拼接
  joinPath(...paths) {
    return path.join(...paths)
  },
  // 读文件
  readFile(file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile(text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt')
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile(base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1])
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  },
  fileExist(file) {
    return fs.existsSync(file);
  },
  // 读取文件夹
  readDir(dir) {
    // 读取目录下的所有文件,返回文件名列表
    return fs.readdirSync(dir).map(fileName => path.parse(fileName).name)
  },
  exportExcecl(dir, splitStr, outputPath, fileName, files) {
    // 每一行元素最大个数
    let lineMaxCount = 0;
    let maxWidths = [];

    // 过滤文件并处理 [[],[],[]...]
    const data = files.map((fileName) => {
      const baseName = path.parse(fileName).name;

      // 支持多种分隔符，默认空格
      let parts = baseName.split(splitStr ? splitStr : ' ');
      if (parts.length > lineMaxCount) {
        // 找到该行中，元素最多的个数
        lineMaxCount = parts.length;
      }

      return parts; // 返回拆分后的数组
    });
    maxWidths = new Array(lineMaxCount).fill(0);
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        const cellValue = data[i][j];
        const cellValueWidth = this.getCellWidth(cellValue);
        if (cellValue && cellValueWidth > maxWidths[j]) {
          maxWidths[j] = cellValueWidth;
        }
      }
    }
    maxWidths = maxWidths.map(width => { return { width: Math.floor(width + 1.5) } });

    // 创建 Excel 数据
    const workbook = xlsx.utils.book_new(); // 创建一个新的工作簿
    const worksheet = xlsx.utils.aoa_to_sheet(data); // 将数据转换为工作表
    worksheet['!cols'] = maxWidths; // 动态设置列宽
    xlsx.utils.book_append_sheet(workbook, worksheet, '名单'); // 将工作表添加到工作簿

    // 写入 Excel 文件
    xlsx.writeFile(workbook, path.join(outputPath, `${fileName}.xlsx`));
    return true;
  },
  getCellWidth(value) {
    // 判断是否为null或undefined
    if (value == null) {
      return 10;
    } else if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
      // 中文的长度
      const chineseLength = value.match(/[\u4e00-\u9fa5]/g).length;
      // 其他不是中文的长度
      const otherLength = value.length - chineseLength;
      return chineseLength * 2.1 + otherLength * 1.1;
    } else {
      return value.toString().length * 1.1;
    }
  }
}
