<script setup>
import { ref } from 'vue';
import { getSetting, setSetting, init } from '../utils/setting'

const form = ref(getSetting());

const save = () => {
  const {  target, split, output, name } = form.value;
  const downloadPath = window.utools.getPath('downloads');
  setSetting({
    target: {
      checked: target.checked,
      path: target.checked ? target.path : ''
    },
    split: {
      checked: split.checked,
      char: split.checked ? split.char : '-'
    },
    output: {
      checked: output.checked,
      path: output.checked ? (output.path ? output.path : downloadPath) : downloadPath
    },
    name: {
      checked: name.checked,
      char: name.checked ? name.char : 'output'
    },
    show: form.value.show
  });
  ElMessage({
    message: '保存成功',
    type: 'success',
    plain: true
  });
}

const reset = () => {
  ElMessageBox.confirm(
    '确定重置所有数据吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
      init(true);
      form.value = getSetting();
      ElMessage({
        message: '重置成功',
        type: 'success',
        plain: true
      });
    }).catch(() => {})
}
</script>
<template>
  <div class="setting">
    <div class="row">
      <el-text>
        记忆模式
        <el-tooltip effect="dark" content="勾选，点击保存后，下次打开时将自动填充上次的输入" placement="top">
          <span style="cursor: pointer;">🔍</span>
        </el-tooltip>
      </el-text>
      <div class="row-item">
        <el-checkbox v-model="form.target.checked" label="目标目录" size="large" />
        <el-checkbox v-model="form.split.checked" label="分割字符" size="large" />
        <el-checkbox v-model="form.output.checked" label="输出目录" size="large" />
        <el-checkbox v-model="form.name.checked" label="文件名称" size="large" />
      </div>
    </div>
    <div class="row">
      <el-text>
        显示目录
        <el-tooltip effect="dark" content="导出后，自动打开输出目录" placement="top">
          <span style="cursor: pointer;">🔍</span>
        </el-tooltip>
      </el-text>
      <el-switch class="row-item" v-model="form.show" />
    </div>
    <div class="row-bottom">
      <el-button type="danger" @click="reset">重置所有数据</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>
<style scoped>
.row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.row-item {
  margin-left: 20px;
}

.row-bottom {
  justify-content: center;
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 10px;
}
</style>