<script lang="ts" setup>
import { ref, computed } from 'vue';

const formRef = ref<FormInstance>();
const form = ref({
  folder: '',
  str: '-',
  outputFolder: '',
  fileName: 'output',
});

// 打开文件夹函数
const openFolder = (ft: string) => {
  const folders = window.utools.showOpenDialog({
    title: '选择文件夹',
    canSelectFolders: true,
    properties: ['openDirectory'],
  });
  if (folders) {
    if (ft === 'from') form.value.folder = folders[0];
    if (ft === 'to') form.value.outputFolder = folders[0];
  }
};

const showMessage = (message: string, type: string) => {
  ElMessage({
    message: message,
    type: type,
    plain: true
  });
}

// 导出 Excel 函数
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      const { folder, str, outputFolder, fileName } = form.value;
      // window.utools.showNotification('导出成功');
      try {
        const flag = window.services.exportExcecl(
          folder,
          str,
          outputFolder,
          fileName
        );
        if (flag) showMessage('导出成功', 'success');
      } catch (error) {
        console.log(error.message);
        let msg = '导出失败';
        if (error.message.includes('EBUSY: resource busy or locked,')) {
          msg = `文件被占用，请关闭【${fileName}.xlsx】文件后重试`;
        } 
        showMessage(msg, 'error');
        console.log(error);
      }
    } else {
      console.log('error submit!');
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
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
  // 根据分割字符串分割文件名
  if (f) {
    const files = f.map((item) => item.split(str));
    tableData.value = files;
  }
};

form.value.outputFolder = window.utools.getPath('downloads');

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
</script>

<template>
  <div class="container">
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
        />
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
        />
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
        />
      </el-form-item>
      <div class="btns">
        <el-button type="primary" @click="submitForm(formRef)"
          >导出Excel</el-button
        >
        <el-button @click="resetForm(formRef)">重置</el-button>
        <el-button @click="preview()" :disabled="!form.folder || !form.str"
          >预览</el-button
        >
      </div>
    </el-form>
    <el-table
      :data="tableData"
      border
      height="280"
      style="width: 100%; margin-top: 10px"
    >
      <el-table-column
        v-for="(item, index) in maxColumns"
        :key="index"
        :label="`第 ${index + 1} 列`"
        :prop="`${index}`"
        align="center"
      >
        <template #default="scope">
          {{ scope.row[index] }}
        </template>
      </el-table-column>
      <template #empty>
        <div>[?]~(＾▽＾)~*</div>
      </template>
    </el-table>
  </div>
</template>

<style scoped>
.container {
  padding: 10px 28px;
}

.btns {
  display: flex;
  justify-content: center;
}
</style>
