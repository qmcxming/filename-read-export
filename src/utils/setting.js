const initData = {
  target: {
    checked: false,
    path: ''
  },
  split: {
    checked: false,
    char: '-'
  },
  output: {
    checked: true,
    path: utools.getPath('downloads')
  },
  name: {
    checked: false,
    char: 'output'
  },
  show: false
}

export const init = (force = false) => {
  if (!getSetting() || force) {
    setSetting(initData);
  }
}

export const setItem = (key, value) => {
  utools.dbStorage.setItem(key, JSON.stringify(value));
}

export const getItem = (key) => {
  return JSON.parse(utools.dbStorage.getItem(key));
}

export const removeItem = (key) => {
  utools.dbStorage.removeItem(key);
}

export const setSetting = (value) => {
  setItem('setting', value);
}

export const getSetting = () => {
  return getItem('setting');
}