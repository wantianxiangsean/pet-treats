/* ==========================================================================
   岚禾小食 · 单页静态网站脚本
   数据、渲染、筛选、弹窗、购物车全部集中在这个文件里。
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     商品数据
     字段：id / 名称 / 分类 / 价格 / 规格 / 卖点 / 成分 / 适用宠物 / 图片 / 月销量
     ------------------------------------------------------------------------ */
  var CATEGORIES = ['全部', '鸡肉', '冻干', '洁齿', '训练奖励'];

  var PRODUCTS = [
    {
      id: 'cheese-heart-biscuits',
      name: '羊奶酪酥心饼',
      category: '训练奖励',
      price: 32,
      spec: '90g/盒',
      point: '奶香轻盈，酥而不硬，适合做居家互动的小奖励。',
      ingredients: '羊奶酪、米粉、鸡蛋',
      suitable: '全犬种',
      sales: 1424,
      image: 'assets/images/product-cheese-heart-biscuits.jpg'
    },
    {
      id: 'chicken-jerky-strips',
      name: '原切鸡胸肉条',
      category: '鸡肉',
      price: 39,
      spec: '80g/袋',
      point: '低温慢烘保留肉香，适合撕成小条做训练奖励。',
      ingredients: '鸡胸肉',
      suitable: '全犬种，3 个月以上',
      sales: 1286,
      image: 'assets/images/product-chicken-jerky-strips.jpg'
    },
    {
      id: 'salmon-training-bites',
      name: '三文鱼训练小粒',
      category: '冻干',
      price: 42,
      spec: '70g/袋',
      point: '小颗粒不粘手，外出训练、召回奖励和嗅闻游戏都顺手。',
      ingredients: '三文鱼',
      suitable: '全犬种，猫可作日常奖励',
      sales: 1180,
      image: 'assets/images/product-salmon-training-bites.jpg'
    },
    {
      id: 'herbal-dental-chews',
      name: '草本洁齿咀嚼棒',
      category: '洁齿',
      price: 35,
      spec: '5 支/盒',
      point: '纤维结构摩擦牙面，日常咬一咬减少牙垢。',
      ingredients: '马铃薯淀粉、鸡肉、薄荷',
      suitable: '6 个月以上犬',
      sales: 1043,
      image: 'assets/images/product-herbal-dental-chews.jpg'
    },
    {
      id: 'freeze-dried-chicken-cubes',
      name: '冻干鸡肉粒',
      category: '冻干',
      price: 45,
      spec: '60g/罐',
      point: '单一原料，掰碎拌粮可提升食欲。',
      ingredients: '鸡胸肉',
      suitable: '全犬种、挑食猫',
      sales: 968,
      image: 'assets/images/product-freeze-dried-chicken-cubes.jpg'
    },
    {
      id: 'air-dried-duck-slices',
      name: '风干鸭胸薄片',
      category: '鸡肉',
      price: 36,
      spec: '70g/袋',
      point: '鸭肉性凉，适合容易上火的毛孩。',
      ingredients: '鸭胸肉',
      suitable: '全犬种',
      sales: 742,
      image: 'assets/images/product-air-dried-duck-slices.jpg'
    },
    {
      id: 'veggie-cookies',
      name: '混合蔬果小饼干',
      category: '训练奖励',
      price: 29,
      spec: '100g/盒',
      point: '南瓜与胡萝卜配色，脆口不油手。',
      ingredients: '南瓜、胡萝卜、燕麦',
      suitable: '全犬种',
      sales: 651,
      image: 'assets/images/product-veggie-cookies.jpg'
    },
    {
      id: 'dental-soft-strips',
      name: '牙洁冻干软条',
      category: '洁齿',
      price: 33,
      spec: '90g/袋',
      point: '柔软好咬，适合牙口一般的老年犬。',
      ingredients: '鸡胸肉、木糖醇、海藻',
      suitable: '老年犬',
      sales: 507,
      image: 'assets/images/product-dental-soft-strips.jpg'
    }
  ];

  /* ------------------------------------------------------------------------
     状态与元素引用
     ------------------------------------------------------------------------ */
  var activeCategory = '全部';
  var cart = [];          // [{ id, qty }]
  var openLayer = null;    // 'cart' | 'detail' | 'success'
  var lastFocused = null;

  var el = {
    filters: document.getElementById('filters'),
    grid: document.getElementById('productGrid'),
    gridEmpty: document.getElementById('gridEmpty'),
    badge: document.getElementById('cartBadge'),
    cartButton: document.getElementById('cartButton'),
    heroCartButton: document.getElementById('heroCartButton'),
    overlay: document.getElementById('overlay'),
    drawer: document.getElementById('cartDrawer'),
    cartItems: document.getElementById('cartItems'),
    cartFoot: document.getElementById('cartFoot'),
    cartCountLabel: document.getElementById('cartCountLabel'),
    cartTotal: document.getElementById('cartTotal'),
    checkoutButton: document.getElementById('checkoutButton'),
    detailDialog: document.getElementById('detailDialog'),
    detailImage: document.getElementById('detailImage'),
    detailCategory: document.getElementById('detailCategory'),
    detailName: document.getElementById('detailName'),
    detailPrice: document.getElementById('detailPrice'),
    detailDesc: document.getElementById('detailDesc'),
    detailSpec: document.getElementById('detailSpec'),
    detailIngredients: document.getElementById('detailIngredients'),
    detailSuitable: document.getElementById('detailSuitable'),
    detailSales: document.getElementById('detailSales'),
    detailAdd: document.getElementById('detailAdd'),
    successDialog: document.getElementById('successDialog'),
    orderNumber: document.getElementById('orderNumber'),
    successClose: document.getElementById('successClose'),
    toast: document.getElementById('toast')
  };

  var detailProductId = null;

  /* ------------------------------------------------------------------------
     工具函数
     ------------------------------------------------------------------------ */
  function formatPrice(value) {
    return '¥' + value;
  }

  function formatSales(value) {
    return value.toLocaleString('zh-CN');
  }

  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  function cartCount() {
    return cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  function cartTotal() {
    return cart.reduce(function (sum, line) {
      var product = findProduct(line.id);
      return product ? sum + product.price * line.qty : sum;
    }, 0);
  }

  var toastTimer = null;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('is-shown');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.toast.classList.remove('is-shown');
    }, 2200);
  }

  function makeOrderNumber() {
    var now = new Date();
    var stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');
    var tail = String(Math.floor(Math.random() * 9000) + 1000);
    return 'LH-' + stamp + '-' + tail;
  }

  /* ------------------------------------------------------------------------
     渲染：筛选条
     ------------------------------------------------------------------------ */
  function renderFilters() {
    el.filters.innerHTML = '';
    CATEGORIES.forEach(function (category) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter';
      button.textContent = category;
      button.setAttribute('aria-pressed', String(category === activeCategory));
      button.addEventListener('click', function () {
        if (activeCategory === category) return;
        activeCategory = category;
        renderFilters();
        renderGrid();
      });
      el.filters.appendChild(button);
    });
  }

  /* ------------------------------------------------------------------------
     渲染：商品网格
     ------------------------------------------------------------------------ */
  function visibleProducts() {
    if (activeCategory === '全部') return PRODUCTS;
    return PRODUCTS.filter(function (product) {
      return product.category === activeCategory;
    });
  }

  function buildCard(product) {
    var card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = product.id;

    var media = document.createElement('button');
    media.type = 'button';
    media.className = 'card__media';
    media.dataset.action = 'detail';
    media.setAttribute('aria-label', '查看' + product.name + '详情');

    var img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name + '：' + product.point;
    img.width = 800;
    img.height = 600;
    img.loading = 'lazy';
    media.appendChild(img);

    var body = document.createElement('div');
    body.className = 'card__body';

    var title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = product.name;

    var point = document.createElement('p');
    point.className = 'card__point';
    point.textContent = product.point;

    var tags = document.createElement('div');
    tags.className = 'card__tags';
    var specTag = document.createElement('span');
    specTag.className = 'tag';
    specTag.textContent = product.spec;
    var salesTag = document.createElement('span');
    salesTag.className = 'tag tag--sales';
    salesTag.textContent = '月销 ' + formatSales(product.sales);
    tags.appendChild(specTag);
    tags.appendChild(salesTag);

    var foot = document.createElement('div');
    foot.className = 'card__foot';

    var price = document.createElement('p');
    price.className = 'card__price';
    price.textContent = formatPrice(product.price);

    var actions = document.createElement('div');
    actions.className = 'card__actions';

    var detailButton = document.createElement('button');
    detailButton.type = 'button';
    detailButton.className = 'card__detail';
    detailButton.dataset.action = 'detail';
    detailButton.textContent = '查看详情';

    var addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'card__add';
    addButton.dataset.action = 'add';
    addButton.setAttribute('aria-label', '把' + product.name + '加入购物车');
    addButton.innerHTML =
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';

    actions.appendChild(detailButton);
    actions.appendChild(addButton);
    foot.appendChild(price);
    foot.appendChild(actions);

    body.appendChild(title);
    body.appendChild(point);
    body.appendChild(tags);
    body.appendChild(foot);

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  function renderGrid() {
    var list = visibleProducts();
    el.grid.innerHTML = '';

    if (!list.length) {
      el.grid.hidden = true;
      el.gridEmpty.hidden = false;
      return;
    }

    el.grid.hidden = false;
    el.gridEmpty.hidden = true;

    var fragment = document.createDocumentFragment();
    list.forEach(function (product) {
      fragment.appendChild(buildCard(product));
    });
    el.grid.appendChild(fragment);
  }

  /* ------------------------------------------------------------------------
     渲染：购物车
     ------------------------------------------------------------------------ */
  function renderBadge() {
    var count = cartCount();
    var previous = Number(el.badge.textContent) || 0;
    el.badge.textContent = String(count);
    el.badge.dataset.empty = count === 0 ? 'true' : 'false';
    el.badge.setAttribute('aria-label', count === 0 ? '购物车为空' : '购物车' + count + '件');
    if (count > previous) {
      el.badge.classList.remove('is-bump');
      void el.badge.offsetWidth;
      el.badge.classList.add('is-bump');
    }
  }

  function buildCartLine(line) {
    var product = findProduct(line.id);
    var row = document.createElement('article');
    row.className = 'cart-line';
    row.dataset.id = product.id;

    var media = document.createElement('div');
    media.className = 'cart-line__media';
    var img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.width = 136;
    img.height = 136;
    img.loading = 'lazy';
    media.appendChild(img);

    var info = document.createElement('div');
    info.className = 'cart-line__info';

    var name = document.createElement('p');
    name.className = 'cart-line__name';
    name.textContent = product.name;

    var spec = document.createElement('p');
    spec.className = 'cart-line__spec';
    spec.textContent = product.spec + ' · 单价 ' + formatPrice(product.price);

    var controls = document.createElement('div');
    controls.className = 'cart-line__controls';

    var stepper = document.createElement('div');
    stepper.className = 'stepper';
    stepper.innerHTML =
      '<button type="button" data-action="dec" aria-label="减少' + product.name + '数量">−</button>' +
      '<span class="stepper__value">' + line.qty + '</span>' +
      '<button type="button" data-action="inc" aria-label="增加' + product.name + '数量">+</button>';

    var subtotal = document.createElement('p');
    subtotal.className = 'cart-line__price';
    subtotal.textContent = formatPrice(product.price * line.qty);

    controls.appendChild(stepper);
    controls.appendChild(subtotal);

    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'cart-line__remove';
    remove.dataset.action = 'remove';
    remove.innerHTML =
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span>删除</span>';

    info.appendChild(name);
    info.appendChild(spec);
    info.appendChild(controls);
    info.appendChild(remove);

    row.appendChild(media);
    row.appendChild(info);
    return row;
  }

  function renderCart() {
    var count = cartCount();
    el.cartItems.innerHTML = '';

    if (!cart.length) {
      var empty = document.createElement('div');
      empty.className = 'cart-empty';

      var text = document.createElement('p');
      text.textContent = '购物车还是空的，先去挑几包零食吧。';

      var go = document.createElement('button');
      go.type = 'button';
      go.className = 'btn btn--primary';
      go.dataset.action = 'browse';
      go.textContent = '去挑选零食';

      empty.appendChild(text);
      empty.appendChild(go);
      el.cartItems.appendChild(empty);
      el.cartFoot.hidden = true;
    } else {
      var fragment = document.createDocumentFragment();
      cart.forEach(function (line) {
        fragment.appendChild(buildCartLine(line));
      });
      el.cartItems.appendChild(fragment);
      el.cartFoot.hidden = false;
    }

    el.cartCountLabel.textContent = '共 ' + count + ' 件';
    el.cartTotal.textContent = formatPrice(cartTotal());
    renderBadge();
  }

  /* ------------------------------------------------------------------------
     购物车操作
     ------------------------------------------------------------------------ */
  function addToCart(id) {
    var product = findProduct(id);
    if (!product) return;

    var line = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { line = cart[i]; break; }
    }

    if (line) {
      line.qty += 1;
    } else {
      cart.push({ id: id, qty: 1 });
    }

    renderCart();
    showToast('已加入购物车 · ' + product.name);
  }

  function changeQty(id, delta) {
    var product = findProduct(id);
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id !== id) continue;

      var next = cart[i].qty + delta;
      if (next <= 0) {
        cart.splice(i, 1);
        if (product) showToast('已移除 · ' + product.name);
      } else {
        cart[i].qty = next;
      }
      break;
    }
    renderCart();
  }

  function removeLine(id) {
    var product = findProduct(id);
    cart = cart.filter(function (line) { return line.id !== id; });
    renderCart();
    if (product) showToast('已移除 · ' + product.name);
  }

  /* ------------------------------------------------------------------------
     浮层控制
     ------------------------------------------------------------------------ */
  function lockScroll(locked) {
    document.body.classList.toggle('is-locked', locked);
  }

  function showLayer(node, name) {
    if (openLayer) return;
    lastFocused = document.activeElement;
    openLayer = name;
    el.overlay.hidden = false;
    node.hidden = false;
    lockScroll(true);

    window.requestAnimationFrame(function () {
      el.overlay.classList.add('is-shown');
      node.classList.add('is-open');
    });

    if (name === 'cart') {
      el.cartButton.setAttribute('aria-expanded', 'true');
      el.drawer.querySelector('[data-close]').focus();
    } else {
      node.querySelector('[data-close], .btn').focus();
    }
  }

  function closeLayers() {
    if (!openLayer) return;

    var node = null;
    if (openLayer === 'cart') node = el.drawer;
    if (openLayer === 'detail') node = el.detailDialog;
    if (openLayer === 'success') node = el.successDialog;
    if (node) node.classList.remove('is-open');

    el.overlay.classList.remove('is-shown');
    el.cartButton.setAttribute('aria-expanded', 'false');

    var layerName = openLayer;
    openLayer = null;
    lockScroll(false);

    window.setTimeout(function () {
      el.overlay.hidden = true;
      if (node) node.hidden = true;
      if (layerName === 'detail') detailProductId = null;
    }, 320);

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function openCart() {
    renderCart();
    showLayer(el.drawer, 'cart');
  }

  function openDetail(id) {
    var product = findProduct(id);
    if (!product) return;

    detailProductId = id;
    el.detailImage.src = product.image;
    el.detailImage.alt = product.name + '：' + product.point;
    el.detailCategory.textContent = product.category;
    el.detailName.textContent = product.name;
    el.detailPrice.textContent = formatPrice(product.price);
    el.detailDesc.textContent = product.point;
    el.detailSpec.textContent = product.spec;
    el.detailIngredients.textContent = product.ingredients;
    el.detailSuitable.textContent = product.suitable;
    el.detailSales.textContent = '月销 ' + formatSales(product.sales);

    showLayer(el.detailDialog, 'detail');
  }

  function checkout() {
    if (!cart.length) return;

    el.orderNumber.textContent = makeOrderNumber();
    cart = [];
    renderCart();

    var wasOpen = openLayer;
    openLayer = null;
    if (wasOpen === 'cart') {
      el.drawer.classList.remove('is-open');
      el.cartButton.setAttribute('aria-expanded', 'false');
    }

    showLayer(el.successDialog, 'success');
  }

  /* ------------------------------------------------------------------------
     事件绑定
     ------------------------------------------------------------------------ */
  el.grid.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    var card = trigger.closest('.card');
    if (!card) return;

    if (trigger.dataset.action === 'add') {
      addToCart(card.dataset.id);
      trigger.classList.add('is-added');
      window.setTimeout(function () { trigger.classList.remove('is-added'); }, 600);
      return;
    }

    openDetail(card.dataset.id);
  });

  el.cartItems.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    if (trigger.dataset.action === 'browse') {
      closeLayers();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    var row = trigger.closest('.cart-line');
    if (!row) return;

    if (trigger.dataset.action === 'inc') changeQty(row.dataset.id, 1);
    if (trigger.dataset.action === 'dec') changeQty(row.dataset.id, -1);
    if (trigger.dataset.action === 'remove') removeLine(row.dataset.id);
  });

  el.detailAdd.addEventListener('click', function () {
    if (!detailProductId) return;
    addToCart(detailProductId);
  });

  el.checkoutButton.addEventListener('click', checkout);
  el.successClose.addEventListener('click', closeLayers);

  el.cartButton.addEventListener('click', openCart);
  el.heroCartButton.addEventListener('click', openCart);

  el.overlay.addEventListener('click', closeLayers);

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-close]')) closeLayers();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeLayers();
  });

  /* ------------------------------------------------------------------------
     初始化
     ------------------------------------------------------------------------ */
  renderFilters();
  renderGrid();
  renderCart();
})();
