class Compile {

  $el;
  $vm;
  $fragment;

  constructor(el, vm) {
    this.$el = typeof el === 'string' ? document.querySelector(el) : el;
    this.$vm = vm;

    if (this.$el) {
      this.$fragment = this.nodeToFragment(this.$el);
      this.compile(this.$fragment);
      this.$el.appendChild(this.$fragment);
    }
  }

  nodeToFragment(el) {
    const fragment = document.createDocumentFragment();
    while (el.firstChild) {
      fragment.appendChild(el.firstChild);
    }
    return fragment;
  }

  compile(el) {
    Array.from(el.childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        this.compileElement(node);
      } else if (this.isTextNode(node) && /\{\{(.*)\}\}/.test(node.textContent)) {
        this.compileText(node, RegExp.$1);
      }
      if (node.childNodes && node.childNodes.length) {
        this.compile(node);
      }
    });
  }

  isElementNode(node) {
    return node.nodeType == 1;
  }

  isTextNode(node) {
    return node.nodeType == 3;
  }

  compileElement(node) {
    Array.from(node.attributes).forEach(attr => {
      const attrName = attr.name;
      const attrValue = attr.value;
      if (this.isDirective(attrName)) {
        const directive = attrName.substr(2);
        this[directive] && this[directive](node, this.$vm, attrValue);
      } else if (this.isEvent(attrName)) {
        const event = attrName.substr(1);
        this.eventHandler(node, this.$vm, attrValue, event);
      }
    });
  }

  compileText(node, exp) {
    this.text(node, this.$vm, exp);
  }

  isDirective(dir) {
    return dir.indexOf('m-') == 0;
  }

  isEvent(dir) {
    return dir.indexOf('@') == 0;
  }

  text(node, vm, exp) {
    this.update(node, vm, exp, 'text');
  }

  html(node, vm, exp) {
    this.update(node, vm, exp, 'html');
  }

  model(node, vm, exp) {
    this.update(node, vm, exp, 'model');
    node.addEventListener('input', (e) => {
      vm[exp] = e.target.value;
    });
  }

  update(node, vm, exp, dir) {
    let updateFn = this[`${dir}Updater`];
    updateFn && updateFn(node, vm[exp]);

    new Watcher(vm, exp, function (value) {
      updateFn && updateFn(node, vm[exp]);
    });
  }

  textUpdater(node, value) {
    node.textContent = value;
  }

  htmlUpdater(node, value) {
    node.innerHTML = value;
  }

  modelUpdater(node, value) {
    node.value = value;
  }

  eventHandler(node, vm, exp, dir) {
    let fn = vm.$options.method && vm.$options.method[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }
}