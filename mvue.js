class MVue {

  $data;

  constructor(options) {
    this.$data = options.data;
    this.observe(this.$data);
  }

  observe($data) {
    if (!$data || typeof $data != 'object') {
      return;
    }
    Object.keys($data).forEach(key => {
      this.defineReactive($data, key, $data[key]);
    });
  }

  defineReactive($data, key, value) {
    this.observe(value);

    const dep = new Dep();

    Object.defineProperty($data, key, {
      enumerable: true,
      configurable: true,
      get() {
        dep.target && dep.addWatcher(dep.target);

        return value;
      },
      set(newValue) {
        if (newValue === value) {
          return;
        }
        value = newValue;
        dep.notify();
      }
    })
  }
}

// 依赖管理器
class Dep {

  watchers;

  constructor() {
    this.watchers = [];
  }

  addWatcher(watcher) {
    this.watchers.push(watcher);
  }

  notify() {
    this.watchers.forEach(watcher => {
      watcher.update();
    });
  }
}

class Watcher {
  constructor() {
    Dep.target = this;
  }

  update() {
    console.log('更新视图');
  }
}