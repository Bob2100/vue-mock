class MVue {

  $data;
  $options;
  $compile;

  constructor(options) {
    this.$data = options.data;
    this.$options = options;
    this.observe(this.$data);

    this.$compile = new Compile(options.el, this);
  }

  observe($data) {
    if (!$data || typeof $data != 'object') {
      return;
    }
    Object.keys($data).forEach(key => {
      this.defineReactive($data, key, $data[key]);
      this.proxyData(key);
    });
  }

  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newValue) {
        this.$data[key] = newValue;
      }
    });
  }

  defineReactive($data, key, value) {
    this.observe(value);

    const dep = new Dep();

    Object.defineProperty($data, key, {
      enumerable: true,
      configurable: true,
      get() {
        Dep.target && dep.addWatcher(Dep.target);

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
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;

    Dep.target = this;
    this.vm[key];
    Dep.target = null;
  }

  update() {
    this.callback.call(this.vm, this.vm[this.key]);
  }
}