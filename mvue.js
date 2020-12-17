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
    Object.defineProperty($data, key, {
      enumerable: true,
      configurable: true,
      get() {
        return value;
      },
      set(newValue) {
        if (newValue === value) {
          return;
        }
        value = newValue;
        console.log('数据变化，发出通知');
      }
    })
  }
}