<script lang="js" setup>
import { ref, computed, watch, onMounted } from 'vue';
import Setting from '../Setting/index.vue';
import { getSetting, setSetting } from '../utils/setting';

const props = defineProps({
  enterAction: {
    type: Object,
    default: () => ({})
  }
})

onMounted(() => {
  if(props.enterAction.type === 'files') {
    form.value.folder = props.enterAction.payload[0].path;
  }
})

let setting = getSetting();

const formRef = ref();
const form = ref({
  folder: setting.target.path,
  str: setting.split.char,
  outputFolder: setting.output.path,
  fileName: setting.name.char,
});

// 打开文件夹函数
const openFolder = (ft) => {
  const folders = window.utools.showOpenDialog({
    title: '选择文件夹',
    canSelectFolders: true,
    properties: ['openDirectory'],
    defaultPath: form.value[ft === 'from' ? 'folder' : 'outputFolder'] || ''
  });
  if (folders) {
    if (ft === 'from') form.value.folder = folders[0];
    if (ft === 'to') form.value.outputFolder = folders[0];
  }
};

const showMessage = (message, type) => {
  ElMessage({
    message: message,
    type: type,
    plain: true
  });
}

// 导出 Excel 函数
const submitForm = (formEl) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      const { folder, str, outputFolder, fileName } = form.value;
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在导出，请稍等...',
      });
      try {
        // 合并tableData，将[[], []] 转为 ['1', '2', ...]
        const sourceData = tableData.value.map(row => row.join(str));
        const flag = window.services.exportExcecl(
          folder,
          str,
          outputFolder,
          fileName,
          sourceData
        );
        if (flag) showMessage('导出成功', 'success');
        if(setting.show) openLocalFolder(window.services.joinPath(outputFolder, fileName + '.xlsx'));
      } catch (error) {
        console.log(error.message);
        let msg = '导出失败';
        if (error.message.includes('EBUSY: resource busy or locked,')) {
          msg = `文件被占用，请关闭【${fileName}.xlsx】文件后重试`;
        }
        showMessage(msg, 'error');
        console.log(error);
      } finally {
        loadingInstance.close();
      }
    } else {
      console.log('error submit!');
    }
  });
};

const handleConfig = () => {
  if(setting.target.checked) {
    setting.target.path = form.value.folder;
  }
  if(setting.split.checked) {
    setting.split.char = form.value.str;
  }
  if(setting.output.checked) {
    setting.output.path = form.value.outputFolder;
  }
  if(setting.name.checked) {
    setting.name.char = form.value.fileName;
  }
  setSetting(setting);
  setting = getSetting();
}

const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
  tableData.value = [];
};

const tableData = ref([]);

const preview = () => {
  const { folder, str } = form.value;
  if (!folder) {
    showMessage('请选择文件夹', 'error');
    return;
  }
  const f = window.services.readDir(form.value.folder);
  console.log(f);
  
  // 根据分割字符串分割文件名
  if (f) {
    const files = f.map((item) => item.split(str));
    console.log(files);
    tableData.value = files;
  }
};

// 计算最大列数
const maxColumns = computed(() => {
  if (tableData.value.length === 0) {
    return 3;
  }
  const l = tableData.value.map((row) => {
    if (row) {
      return row.length;
    }
  });
  return Math.max(...l);
});

const openLocalFolder = (path) => {
  if (!path) {
    return showMessage('没有选择文件夹 (￣┰￣*)', 'error');
  }
  if (!window.services.fileExist(path)) {
    return showMessage('文件不存在/没有导出 (⊙_⊙)？', 'error');
  }
  window.utools.shellShowItemInFolder(path);
}

const activeName = ref('first')

const handleSort = ({ prop, order }) => {
  const index = parseInt(prop);
  if (order === 'ascending') {
    tableData.value.sort((a, b) => (a[index] || '').localeCompare(b[index] || ''));
  } else if (order === 'descending') {
    tableData.value.sort((a, b) => (b[index] || '').localeCompare(a[index] || ''));
  } else {
    // 恢复原始顺序
    if (tableData.value.length > 0) {
      preview();
    }
  }
};

const handleClick = (tab, event) => {
  if(tab.props.label === '操作') {
    setting = getSetting();// 更新设置
  }
}

watch(form.value, () => {
  handleConfig();
})
</script>

<template>
  <div class="container">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="操作" name="first">
        <el-form ref="formRef" :model="form" label-width="auto">
          <el-form-item
            label="选择目录"
            prop="folder"
            :rules="[{ required: true, message: '目标文件夹不能为空' }]"
          >
            <el-input
              v-model="form.folder"
              type="text"
              autocomplete="off"
              placeholder="选择目标文件夹"
              @click="openFolder('from')"
            >
              <template #append>
                <div
                  class="ipt-suffix"
                  title="打开文件夹"
                  @click="openLocalFolder(form.folder)"
                >
                  🗂️
                </div>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="分割字符" prop="str">
            <el-input
              v-model="form.str"
              type="text"
              autocomplete="off"
              placeholder="请输入分割字符"
            />
          </el-form-item>
          <el-form-item
            label="输出目录"
            prop="outputFolder"
            :rules="[{ required: true, message: '输出不能为空' }]"
          >
            <el-input
              v-model="form.outputFolder"
              type="text"
              autocomplete="off"
              placeholder="选择输出文件夹"
              @click="openFolder('to')"
            >
              <template #append>
                <div
                  class="ipt-suffix"
                  title="打开文件夹"
                  @click="openLocalFolder(form.outputFolder)"
                >
                  🗂️
                </div>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="文件名称"
            prop="fileName"
            :rules="[{ required: true, message: '导出文件名称不能为空' }]"
          >
            <el-input
              v-model="form.fileName"
              type="text"
              autocomplete="off"
              placeholder="请输入导出的文件名称"
            >
              <template #append>
                <div
                  class="ipt-suffix"
                  title="打开文件"
                  @click="
                    openLocalFolder(
                      form.outputFolder + '\\' + form.fileName + '.xlsx'
                    )
                  "
                >
                  🗂️
                </div>
              </template>
            </el-input>
          </el-form-item>
          <div class="btns">
            <el-button type="primary" @click="submitForm(formRef)">
              导出
            </el-button>
            <el-button
              plain
              @click="preview()"
              :disabled="!form.folder || !form.str"
              >预览</el-button
            >
            <el-button type="danger" @click="resetForm(formRef)">重置</el-button>
          </div>
        </el-form>
        <el-table
          :data="tableData"
          border
          height="240"
          style="width: 100%; margin-top: 10px;"
          @sort-change="handleSort"
        >
          <el-table-column
            v-for="(_, index) in maxColumns"
            :key="index"
            :label="`第 ${index + 1} 列`"
            :prop="`${index}`"
            align="center"
            sortable
          >
            <template #default="scope">
              {{ scope.row[index] }}
            </template>
          </el-table-column>
          <template #empty>
            <div>[?]~(＾▽＾)~*</div>
          </template>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="设置" name="second">
        <Setting />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.container {
  padding: 0 28px 10px;
}

.btns {
  display: flex;
  justify-content: center;
  margin-top: -8px;
}

.ipt-suffix {
  width: 100%;
  height: 100%;
  /* 增大点击面积 */
  padding: 0 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* 使用深度选择器覆盖样式 */
::v-deep(.el-input-group__append) {
  padding: 0px;
}
</style>
