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
  var DEMO_ACCOUNT = { user: 'demo', pass: 'pet123' };
  var STORE_KEYS = { auth: 'lh.auth', addresses: 'lh.addresses', orders: 'lh.orders' };
  // 这些浮层不响应 Esc、遮罩点击和关闭按钮，只能由代码主动关闭
  var LOCKED_LAYERS = { login: true };

  var activeCategory = '全部';
  var cart = [];           // [{ id, qty }]
  var openLayer = null;    // 'cart' | 'detail' | 'success' | 'login' | 'billing' | 'address' | 'notice'
  var openNode = null;
  var lastFocused = null;
  var pendingAction = null;      // 登录后要接着做的事：'checkout' | 'billing' | null
  var editingAddressId = null;
  var addressFormOrigin = null;  // 'checkout' | 'billing'

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
    successAddress: document.getElementById('successAddress'),
    successClose: document.getElementById('successClose'),
    billingButton: document.getElementById('billingButton'),
    identityButton: document.getElementById('identityButton'),
    identityAvatar: document.getElementById('identityAvatar'),
    identityName: document.getElementById('identityName'),
    identityMenu: document.getElementById('identityMenu'),
    identityMenuLogin: document.getElementById('identityMenuLogin'),
    identityMenuBilling: document.getElementById('identityMenuBilling'),
    identityMenuLogout: document.getElementById('identityMenuLogout'),
    loginDialog: document.getElementById('loginDialog'),
    loginForm: document.getElementById('loginForm'),
    loginUser: document.getElementById('loginUser'),
    loginPass: document.getElementById('loginPass'),
    loginUserError: document.getElementById('loginUserError'),
    loginPassError: document.getElementById('loginPassError'),
    loginError: document.getElementById('loginError'),
    guestButton: document.getElementById('guestButton'),
    billingDialog: document.getElementById('billingDialog'),
    addressList: document.getElementById('addressList'),
    orderList: document.getElementById('orderList'),
    addAddressButton: document.getElementById('addAddressButton'),
    addressDialog: document.getElementById('addressDialog'),
    addressForm: document.getElementById('addressForm'),
    addressTitle: document.getElementById('addressTitle'),
    addressSub: document.getElementById('addressSub'),
    addressSubmit: document.getElementById('addressSubmit'),
    addrName: document.getElementById('addrName'),
    addrPhone: document.getElementById('addrPhone'),
    addrRegion: document.getElementById('addrRegion'),
    addrDetail: document.getElementById('addrDetail'),
    addrDefault: document.getElementById('addrDefault'),
    addrNameError: document.getElementById('addrNameError'),
    addrPhoneError: document.getElementById('addrPhoneError'),
    addrRegionError: document.getElementById('addrRegionError'),
    addrDetailError: document.getElementById('addrDetailError'),
    noticeDialog: document.getElementById('noticeDialog'),
    noticeNote: document.getElementById('noticeNote'),
    noticeLogin: document.getElementById('noticeLogin'),
    noticeCancel: document.getElementById('noticeCancel'),
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
     本地存储：身份、收货地址、订单记录
     ------------------------------------------------------------------------ */
  function readStore(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var value = JSON.parse(raw);
      return value === null || value === undefined ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* 隐私模式或存储被禁用时静默降级，页面功能不受影响 */
    }
  }

  function removeStore(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* 同上 */
    }
  }

  var auth = readStore(STORE_KEYS.auth, null);
  var addresses = readStore(STORE_KEYS.addresses, []);
  var orders = readStore(STORE_KEYS.orders, []);

  function isMember() {
    return !!auth && auth.mode === 'member';
  }

  function maskPhone(phone) {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
  }

  function formatTime(stamp) {
    var date = new Date(stamp);
    function pad(value) { return String(value).padStart(2, '0'); }
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function saveAuth(mode, name) {
    auth = { mode: mode, name: name };
    writeStore(STORE_KEYS.auth, auth);
    renderIdentity();
  }

  function signOut() {
    auth = null;
    removeStore(STORE_KEYS.auth);
    pendingAction = null;
    renderIdentity();
    closeLayers(true);
    showToast('已退出登录');
    openLogin();
  }

  /* ---- 收货地址 ---- */
  function findAddress(id) {
    for (var i = 0; i < addresses.length; i++) {
      if (addresses[i].id === id) return addresses[i];
    }
    return null;
  }

  function defaultAddress() {
    for (var i = 0; i < addresses.length; i++) {
      if (addresses[i].isDefault) return addresses[i];
    }
    return addresses.length ? addresses[0] : null;
  }

  function makeAddressId() {
    return 'addr-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1679616).toString(36);
  }

  function persistAddresses() {
    // 始终保证「有且只有一条默认地址」
    var seenDefault = false;
    for (var i = 0; i < addresses.length; i++) {
      if (!addresses[i].isDefault) continue;
      if (seenDefault) addresses[i].isDefault = false;
      else seenDefault = true;
    }
    if (!seenDefault && addresses.length) addresses[0].isDefault = true;
    writeStore(STORE_KEYS.addresses, addresses);
  }

  function saveAddress(data, id) {
    if (id) {
      var target = findAddress(id);
      if (!target) return;
      target.name = data.name;
      target.phone = data.phone;
      target.region = data.region;
      target.detail = data.detail;
      if (data.isDefault) {
        for (var i = 0; i < addresses.length; i++) addresses[i].isDefault = false;
        target.isDefault = true;
      } else if (addresses.length === 1) {
        // 只有一条地址时不允许取消默认，否则下单会没有可用地址
        target.isDefault = true;
      }
    } else {
      var item = {
        id: makeAddressId(),
        name: data.name,
        phone: data.phone,
        region: data.region,
        detail: data.detail,
        isDefault: data.isDefault || addresses.length === 0
      };
      if (item.isDefault) {
        for (var j = 0; j < addresses.length; j++) addresses[j].isDefault = false;
      }
      addresses.push(item);
    }
    persistAddresses();
  }

  function deleteAddress(id) {
    addresses = addresses.filter(function (item) { return item.id !== id; });
    persistAddresses();
  }

  function makeDefaultAddress(id) {
    for (var i = 0; i < addresses.length; i++) {
      addresses[i].isDefault = addresses[i].id === id;
    }
    writeStore(STORE_KEYS.addresses, addresses);
  }

  /* ---- 订单记录 ---- */
  function recordOrder(number, address) {
    var items = cart.map(function (line) {
      var product = findProduct(line.id);
      return {
        name: product ? product.name : line.id,
        qty: line.qty,
        price: product ? product.price : 0
      };
    });
    orders.unshift({
      number: number,
      createdAt: Date.now(),
      count: cartCount(),
      total: cartTotal(),
      items: items,
      // 存快照：之后改地址不会影响历史订单
      address: address ? {
        name: address.name,
        phone: address.phone,
        region: address.region,
        detail: address.detail
      } : null
    });
    writeStore(STORE_KEYS.orders, orders);
  }

  /* ---- 身份展示 ---- */
  function renderIdentity() {
    var member = isMember();
    el.identityButton.dataset.mode = member ? 'member' : 'guest';
    el.identityAvatar.textContent = member ? (auth.name || '会').charAt(0).toUpperCase() : '游';
    el.identityName.textContent = member ? auth.name : '游客';
    el.identityMenuLogin.hidden = member;
    el.identityMenuBilling.hidden = !member;
    el.identityMenuLogout.hidden = !member;
    closeIdentityMenu();
  }

  function closeIdentityMenu() {
    el.identityMenu.hidden = true;
    el.identityButton.setAttribute('aria-expanded', 'false');
  }

  function toggleIdentityMenu() {
    if (el.identityMenu.hidden) {
      el.identityMenu.hidden = false;
      el.identityButton.setAttribute('aria-expanded', 'true');
    } else {
      closeIdentityMenu();
    }
  }

  /* ------------------------------------------------------------------------
     账单中心
     ------------------------------------------------------------------------ */
  function buildLinkButton(label, action, disabled, danger) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'link-button' + (danger ? ' link-button--danger' : '');
    button.dataset.action = action;
    button.textContent = label;
    if (disabled) button.disabled = true;
    return button;
  }

  function buildAddressCard(address) {
    var card = document.createElement('article');
    card.className = 'address-card' + (address.isDefault ? ' is-default' : '');
    card.dataset.id = address.id;

    var top = document.createElement('div');
    top.className = 'address-card__top';

    var name = document.createElement('span');
    name.className = 'address-card__name';
    name.textContent = address.name;

    var phone = document.createElement('span');
    phone.className = 'address-card__phone';
    phone.textContent = maskPhone(address.phone);

    top.appendChild(name);
    top.appendChild(phone);
    if (address.isDefault) {
      var badge = document.createElement('span');
      badge.className = 'badge badge--default';
      badge.textContent = '默认';
      top.appendChild(badge);
    }

    var text = document.createElement('p');
    text.className = 'address-card__text';
    text.textContent = address.region + ' ' + address.detail;

    var actions = document.createElement('div');
    actions.className = 'address-card__actions';
    actions.appendChild(buildLinkButton('设为默认', 'default', address.isDefault, false));
    actions.appendChild(buildLinkButton('编辑', 'edit', false, false));
    actions.appendChild(buildLinkButton('删除', 'delete', false, true));

    card.appendChild(top);
    card.appendChild(text);
    card.appendChild(actions);
    return card;
  }

  function renderAddressList() {
    el.addressList.innerHTML = '';
    if (!addresses.length) {
      var empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '还没有收货地址，点右上角「新增地址」添加一个。';
      el.addressList.appendChild(empty);
      return;
    }
    var fragment = document.createDocumentFragment();
    addresses.forEach(function (address) {
      fragment.appendChild(buildAddressCard(address));
    });
    el.addressList.appendChild(fragment);
  }

  function buildOrderCard(order) {
    var card = document.createElement('article');
    card.className = 'order-card';

    var top = document.createElement('div');
    top.className = 'order-card__top';
    var number = document.createElement('span');
    number.className = 'order-card__number';
    number.textContent = order.number;
    var time = document.createElement('span');
    time.className = 'order-card__time';
    time.textContent = formatTime(order.createdAt);
    top.appendChild(number);
    top.appendChild(time);

    var meta = document.createElement('p');
    meta.className = 'order-card__meta';
    meta.appendChild(document.createTextNode('共 ' + order.count + ' 件 · 合计 '));
    var total = document.createElement('strong');
    total.className = 'order-card__total';
    total.textContent = formatPrice(order.total);
    meta.appendChild(total);

    var items = document.createElement('p');
    items.className = 'order-card__items';
    items.textContent = '商品：' + order.items.map(function (item) {
      return item.name + ' ×' + item.qty;
    }).join('、');

    card.appendChild(top);
    card.appendChild(meta);
    card.appendChild(items);

    if (order.address) {
      var line = document.createElement('p');
      line.className = 'order-card__items';
      line.textContent = '收货：' + order.address.name + ' ' + maskPhone(order.address.phone) +
        ' · ' + order.address.region + ' ' + order.address.detail;
      card.appendChild(line);
    }
    return card;
  }

  function renderOrderList() {
    el.orderList.innerHTML = '';
    if (!orders.length) {
      var empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '还没有订单记录，下单成功后会自动记在这里。';
      el.orderList.appendChild(empty);
      return;
    }
    var fragment = document.createDocumentFragment();
    orders.forEach(function (order) {
      fragment.appendChild(buildOrderCard(order));
    });
    el.orderList.appendChild(fragment);
  }

  function renderBilling() {
    renderAddressList();
    renderOrderList();
  }

  function openBilling() {
    if (!isMember()) {
      requestLogin('billing');
      return;
    }
    if (!addresses.length) {
      // 已登录但一条地址都没有：进来就直接让 ta 填
      openAddressForm('billing');
      return;
    }
    renderBilling();
    presentLayer(el.billingDialog, 'billing');
  }

  /* ------------------------------------------------------------------------
     地址表单
     ------------------------------------------------------------------------ */
  function setFieldError(input, node, message) {
    if (message) {
      node.textContent = message;
      node.hidden = false;
      input.classList.add('is-invalid');
    } else {
      node.textContent = '';
      node.hidden = true;
      input.classList.remove('is-invalid');
    }
  }

  function clearAddressErrors() {
    setFieldError(el.addrName, el.addrNameError, '');
    setFieldError(el.addrPhone, el.addrPhoneError, '');
    setFieldError(el.addrRegion, el.addrRegionError, '');
    setFieldError(el.addrDetail, el.addrDetailError, '');
  }

  function openAddressForm(origin, id) {
    addressFormOrigin = origin || 'billing';
    editingAddressId = id || null;
    var target = id ? findAddress(id) : null;

    el.addressForm.reset();
    el.addressTitle.textContent = target ? '编辑收货地址' : '填写收货地址';
    el.addressSub.textContent = addressFormOrigin === 'checkout'
      ? '下单前需要一个收货地址，保存后会继续完成这笔订单。'
      : '可以保存多个地址，下单时默认用标记为「默认」的那一个。';
    el.addressSubmit.textContent = target ? '保存修改' : '保存地址';

    el.addrName.value = target ? target.name : '';
    el.addrPhone.value = target ? target.phone : '';
    el.addrRegion.value = target ? target.region : '';
    el.addrDetail.value = target ? target.detail : '';
    el.addrDefault.checked = target ? !!target.isDefault : addresses.length === 0;

    clearAddressErrors();
    presentLayer(el.addressDialog, 'address');
  }

  function handleAddressSubmit(event) {
    event.preventDefault();

    var data = {
      name: el.addrName.value.trim(),
      phone: el.addrPhone.value.trim(),
      region: el.addrRegion.value.trim(),
      detail: el.addrDetail.value.trim(),
      isDefault: el.addrDefault.checked
    };
    var ok = true;

    if (!data.name) {
      setFieldError(el.addrName, el.addrNameError, '请填写收货人');
      ok = false;
    } else {
      setFieldError(el.addrName, el.addrNameError, '');
    }

    if (!data.phone) {
      setFieldError(el.addrPhone, el.addrPhoneError, '请填写手机号');
      ok = false;
    } else if (!/^1\d{10}$/.test(data.phone)) {
      setFieldError(el.addrPhone, el.addrPhoneError, '手机号格式不对，应为 1 开头的 11 位数字');
      ok = false;
    } else {
      setFieldError(el.addrPhone, el.addrPhoneError, '');
    }

    if (!data.region) {
      setFieldError(el.addrRegion, el.addrRegionError, '请填写省市区');
      ok = false;
    } else {
      setFieldError(el.addrRegion, el.addrRegionError, '');
    }

    if (!data.detail) {
      setFieldError(el.addrDetail, el.addrDetailError, '请填写详细地址');
      ok = false;
    } else {
      setFieldError(el.addrDetail, el.addrDetailError, '');
    }

    if (!ok) return;

    saveAddress(data, editingAddressId);
    var origin = addressFormOrigin;
    addressFormOrigin = null;
    editingAddressId = null;
    showToast('地址已保存');

    if (origin === 'checkout') {
      completeOrder();
    } else {
      renderBilling();
      presentLayer(el.billingDialog, 'billing');
    }
  }

  /* ------------------------------------------------------------------------
     登录与游客
     ------------------------------------------------------------------------ */
  function openLogin() {
    el.loginError.hidden = true;
    presentLayer(el.loginDialog, 'login');
  }

  function requestLogin(action) {
    pendingAction = action || null;
    el.noticeNote.textContent = action === 'billing'
      ? '登录后才能使用账单中心，管理收货地址与订单记录。'
      : '登录后才能下单并填写收货地址。';
    presentLayer(el.noticeDialog, 'notice');
  }

  function enterAsGuest() {
    saveAuth('guest', '游客');
    pendingAction = null;
    closeLayers(true);
    showToast('已进入游客模式：可以浏览和加购，下单前需要登录');
  }

  function handleLogin(event) {
    event.preventDefault();

    var user = el.loginUser.value.trim();
    var pass = el.loginPass.value;
    var ok = true;

    el.loginError.hidden = true;

    if (!user) {
      setFieldError(el.loginUser, el.loginUserError, '请输入账号');
      ok = false;
    } else {
      setFieldError(el.loginUser, el.loginUserError, '');
    }

    if (!pass) {
      setFieldError(el.loginPass, el.loginPassError, '请输入密码');
      ok = false;
    } else {
      setFieldError(el.loginPass, el.loginPassError, '');
    }

    if (!ok) return;

    if (user !== DEMO_ACCOUNT.user || pass !== DEMO_ACCOUNT.pass) {
      el.loginError.textContent = '账号或密码不对。本页演示账号为 demo / pet123。';
      el.loginError.hidden = false;
      el.loginPass.select();   // 不清空输入，直接选中方便重填
      return;
    }

    saveAuth('member', DEMO_ACCOUNT.user);
    el.loginPass.value = '';
    resumePending();
  }

  function resumePending() {
    var action = pendingAction;
    pendingAction = null;

    if (action === 'checkout') {
      if (!addresses.length) {
        openAddressForm('checkout');
      } else {
        completeOrder();
      }
      return;
    }
    if (action === 'billing') {
      renderBilling();
      presentLayer(el.billingDialog, 'billing');
      return;
    }
    closeLayers(true);
  }

  /* ------------------------------------------------------------------------
     浮层控制
     ------------------------------------------------------------------------ */
  function lockScroll(locked) {
    document.body.classList.toggle('is-locked', locked);
  }

  function setPageInert(inert) {
    var regions = [
      document.querySelector('.topbar'),
      document.querySelector('main'),
      document.querySelector('.footer')
    ];
    for (var i = 0; i < regions.length; i++) {
      if (!regions[i]) continue;
      if (inert) regions[i].setAttribute('inert', '');
      else regions[i].removeAttribute('inert');
    }
  }

  // 表单类浮层优先聚焦第一个输入框，其余聚焦关闭按钮或主按钮
  function focusLayer(node) {
    var target = node.querySelector('input, textarea') ||
      node.querySelector('[data-close]') ||
      node.querySelector('.btn');
    if (target) target.focus();
  }

  function showLayer(node, name) {
    if (openLayer) return;
    lastFocused = document.activeElement;
    openLayer = name;
    openNode = node;

    el.overlay.classList.toggle('is-blurred', name === 'login');
    el.overlay.hidden = false;
    node.hidden = false;
    lockScroll(true);
    setPageInert(true);

    window.requestAnimationFrame(function () {
      el.overlay.classList.add('is-shown');
      node.classList.add('is-open');
    });

    if (name === 'cart') el.cartButton.setAttribute('aria-expanded', 'true');
    focusLayer(node);
  }

  // 关掉当前浮层并立刻打开下一个，用于「提示 → 登录 → 地址表单」这类衔接
  function switchLayer(node, name) {
    var previous = openNode;
    var previousName = openLayer;
    var first = !openLayer;

    if (first) lastFocused = document.activeElement;
    if (previousName === 'detail' && name !== 'detail') detailProductId = null;

    openLayer = name;
    openNode = node;

    if (previous && previous !== node) {
      previous.classList.remove('is-open');
      window.setTimeout(function () {
        if (previous !== openNode) previous.hidden = true;
      }, 300);
    }

    el.overlay.classList.toggle('is-blurred', name === 'login');
    el.overlay.hidden = false;
    node.hidden = false;
    lockScroll(true);
    setPageInert(true);

    window.requestAnimationFrame(function () {
      el.overlay.classList.add('is-shown');
      node.classList.add('is-open');
    });

    if (name === 'cart') el.cartButton.setAttribute('aria-expanded', 'true');
    focusLayer(node);
  }

  function presentLayer(node, name) {
    if (openLayer === name && openNode === node) {
      focusLayer(node);
      return;
    }
    if (openLayer) switchLayer(node, name);
    else showLayer(node, name);
  }

  function closeLayers(force) {
    if (!openLayer) return;
    // 登录浮窗不接受 Esc、遮罩点击和关闭按钮，只能由代码强制关闭
    if (!force && LOCKED_LAYERS[openLayer]) return;

    var node = openNode;
    var layerName = openLayer;

    if (node) node.classList.remove('is-open');
    el.overlay.classList.remove('is-shown');
    el.overlay.classList.remove('is-blurred');
    el.cartButton.setAttribute('aria-expanded', 'false');

    openLayer = null;
    openNode = null;
    lockScroll(false);
    setPageInert(false);
    if (layerName === 'detail') detailProductId = null;

    window.setTimeout(function () {
      el.overlay.hidden = true;
      if (node) node.hidden = true;
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

  function completeOrder() {
    if (!cart.length) return;

    var address = defaultAddress();
    var number = makeOrderNumber();
    // 先落库再清空购物车，否则订单里没有商品明细
    recordOrder(number, address);

    el.orderNumber.textContent = number;
    el.successAddress.textContent = address
      ? '收货：' + address.name + ' ' + maskPhone(address.phone) + ' · ' +
        address.region + ' ' + address.detail
      : '';

    cart = [];
    renderCart();
    presentLayer(el.successDialog, 'success');
  }

  function checkout() {
    if (!cart.length) return;

    if (!isMember()) {
      requestLogin('checkout');
      return;
    }
    if (!addresses.length) {
      openAddressForm('checkout');
      return;
    }
    completeOrder();
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
  el.successClose.addEventListener('click', function () { closeLayers(); });

  el.cartButton.addEventListener('click', openCart);
  el.heroCartButton.addEventListener('click', openCart);

  el.overlay.addEventListener('click', function () { closeLayers(); });

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-close]')) closeLayers();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeLayers();
  });

  el.billingButton.addEventListener('click', openBilling);

  el.identityButton.addEventListener('click', function (event) {
    event.stopPropagation();
    toggleIdentityMenu();
  });

  el.identityMenuLogin.addEventListener('click', function () {
    closeIdentityMenu();
    openLogin();
  });

  el.identityMenuBilling.addEventListener('click', function () {
    closeIdentityMenu();
    openBilling();
  });

  el.identityMenuLogout.addEventListener('click', function () {
    closeIdentityMenu();
    signOut();
  });

  document.addEventListener('click', function (event) {
    if (el.identityMenu.hidden) return;
    if (event.target.closest('#identityMenu') || event.target.closest('#identityButton')) return;
    closeIdentityMenu();
  });

  el.loginForm.addEventListener('submit', handleLogin);
  el.guestButton.addEventListener('click', enterAsGuest);

  el.noticeLogin.addEventListener('click', openLogin);
  el.noticeCancel.addEventListener('click', function () {
    pendingAction = null;
    closeLayers(true);
  });

  el.addAddressButton.addEventListener('click', function () {
    openAddressForm('billing');
  });

  el.addressForm.addEventListener('submit', handleAddressSubmit);

  el.addressList.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    var card = trigger.closest('.address-card');
    if (!card) return;

    if (trigger.dataset.action === 'default') {
      makeDefaultAddress(card.dataset.id);
      showToast('已设为默认地址');
      renderAddressList();
      return;
    }
    if (trigger.dataset.action === 'edit') {
      openAddressForm('billing', card.dataset.id);
      return;
    }
    if (trigger.dataset.action === 'delete') {
      deleteAddress(card.dataset.id);
      showToast('地址已删除');
      renderAddressList();
    }
  });

  /* ------------------------------------------------------------------------
     初始化
     ------------------------------------------------------------------------ */
  renderFilters();
  renderGrid();
  renderCart();
  renderIdentity();
  // 没有登录态时先过登录浮窗，它不接受 Esc 与遮罩点击
  if (!auth) openLogin();
})();
