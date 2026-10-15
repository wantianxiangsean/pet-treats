/* ==========================================================================
   岚禾小食 · 管理后台
   数据全部来自 data.js（与前台共用同一批 localStorage 键）。
   ========================================================================== */
(function () {
  'use strict';

  var KEYS = LH.STORE_KEYS;
  var ADMIN_ACCOUNT = LH.ADMIN_ACCOUNT;
  var LOCKED_LAYERS = { adminLogin: true };

  var admin = LH.read(KEYS.admin, null);
  var products = LH.getProducts();
  var openLayer = null;
  var openNode = null;
  var currentPanel = 'overview';
  var editingProductId = null;
  var pendingImage = '';
  var resetArmed = false;
  var resetTimer = null;

  var ASSET_CHOICES = [
    { label: '首屏场景图', value: 'assets/images/hero-natural-pet-treats.jpg' },
    { label: '心形饼干', value: 'assets/images/product-cheese-heart-biscuits.jpg' },
    { label: '鸡胸肉条', value: 'assets/images/product-chicken-jerky-strips.jpg' },
    { label: '三文鱼小粒', value: 'assets/images/product-salmon-training-bites.jpg' },
    { label: '洁齿咬胶', value: 'assets/images/product-herbal-dental-chews.jpg' },
    { label: '冻干鸡肉粒', value: 'assets/images/product-freeze-dried-chicken-cubes.jpg' },
    { label: '鸭胸薄片', value: 'assets/images/product-air-dried-duck-slices.jpg' },
    { label: '蔬果小饼干', value: 'assets/images/product-veggie-cookies.jpg' },
    { label: '冻干软条', value: 'assets/images/product-dental-soft-strips.jpg' }
  ];

  var el = {
    overlay: document.getElementById('overlay'),
    toast: document.getElementById('toast'),
    adminName: document.getElementById('adminName'),
    logoutButton: document.getElementById('logoutButton'),
    tabs: document.querySelectorAll('.admin-tab'),
    panels: {
      overview: document.getElementById('panel-overview'),
      products: document.getElementById('panel-products'),
      orders: document.getElementById('panel-orders')
    },
    statRevenue: document.getElementById('statRevenue'),
    statOrders: document.getElementById('statOrders'),
    statSample: document.getElementById('statSample'),
    statAvg: document.getElementById('statAvg'),
    statOnShelf: document.getElementById('statOnShelf'),
    statQty: document.getElementById('statQty'),
    rankList: document.getElementById('rankList'),
    statTableBody: document.getElementById('statTableBody'),
    productTableBody: document.getElementById('productTableBody'),
    addProductButton: document.getElementById('addProductButton'),
    adminOrderList: document.getElementById('adminOrderList'),
    orderTotal: document.getElementById('orderTotal'),
    orderSample: document.getElementById('orderSample'),
    resetButton: document.getElementById('resetButton'),
    loginDialog: document.getElementById('adminLoginDialog'),
    loginForm: document.getElementById('adminLoginForm'),
    loginUser: document.getElementById('adminUser'),
    loginPass: document.getElementById('adminPass'),
    loginUserError: document.getElementById('adminUserError'),
    loginPassError: document.getElementById('adminPassError'),
    loginError: document.getElementById('adminLoginError'),
    productDialog: document.getElementById('productDialog'),
    productForm: document.getElementById('productForm'),
    productDialogTitle: document.getElementById('productDialogTitle'),
    productDialogSub: document.getElementById('productDialogSub'),
    productSubmit: document.getElementById('productSubmit'),
    pName: document.getElementById('pName'),
    pCategory: document.getElementById('pCategory'),
    pPrice: document.getElementById('pPrice'),
    pSpec: document.getElementById('pSpec'),
    pSales: document.getElementById('pSales'),
    pPoint: document.getElementById('pPoint'),
    pIngredients: document.getElementById('pIngredients'),
    pSuitable: document.getElementById('pSuitable'),
    pStatus: document.getElementById('pStatus'),
    pPreview: document.getElementById('pPreview'),
    pImageFile: document.getElementById('pImageFile'),
    pImagePreset: document.getElementById('pImagePreset'),
    categoryOptions: document.getElementById('categoryOptions')
  };

  function setError(input, node, message) {
    if (message) {
      node.textContent = message;
      node.hidden = false;
      if (input) input.classList.add('is-invalid');
    } else {
      node.textContent = '';
      node.hidden = true;
      if (input) input.classList.remove('is-invalid');
    }
  }

  function formatPrice(value) {
    return '¥' + value;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('zh-CN');
  }

  function formatTime(stamp) {
    var date = new Date(stamp);
    function pad(value) { return String(value).padStart(2, '0'); }
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function maskPhone(phone) {
    return String(phone || '').replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
  }

  var toastTimer = null;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('is-shown');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.toast.classList.remove('is-shown');
    }, 2400);
  }

  /* ------------------------------------------------------------------------
     浮层
     ------------------------------------------------------------------------ */
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

  function showLayer(node, name) {
    if (openLayer) return;
    openLayer = name;
    openNode = node;
    el.overlay.hidden = false;
    node.hidden = false;
    document.body.classList.add('is-locked');
    setPageInert(true);

    window.requestAnimationFrame(function () {
      el.overlay.classList.add('is-shown');
      node.classList.add('is-open');
    });

    var focusTarget = node.querySelector('input, textarea') ||
      node.querySelector('[data-close]') || node.querySelector('.btn');
    if (focusTarget) focusTarget.focus();
  }

  function closeLayer(force) {
    if (!openLayer) return;
    if (!force && LOCKED_LAYERS[openLayer]) return;

    var node = openNode;
    openLayer = null;
    openNode = null;

    if (node) node.classList.remove('is-open');
    el.overlay.classList.remove('is-shown');
    document.body.classList.remove('is-locked');
    setPageInert(false);

    window.setTimeout(function () {
      el.overlay.hidden = true;
      if (node) node.hidden = true;
    }, 320);
  }

  /* ------------------------------------------------------------------------
     登录门禁
     ------------------------------------------------------------------------ */
  function openLoginGate() {
    showLayer(el.loginDialog, 'adminLogin');
  }

  function handleLogin(event) {
    event.preventDefault();

    var user = el.loginUser.value.trim();
    var pass = el.loginPass.value;
    var ok = true;

    el.loginError.hidden = true;

    if (!user) { setError(el.loginUser, el.loginUserError, '请输入管理员账号'); ok = false; }
    else setError(el.loginUser, el.loginUserError, '');

    if (!pass) { setError(el.loginPass, el.loginPassError, '请输入密码'); ok = false; }
    else setError(el.loginPass, el.loginPassError, '');

    if (!ok) return;

    if (user !== ADMIN_ACCOUNT.user || pass !== ADMIN_ACCOUNT.pass) {
      el.loginError.textContent = '管理员账号或密码不对。演示账号为 admin / pet888。';
      el.loginError.hidden = false;
      el.loginPass.select();
      return;
    }

    admin = { mode: 'admin', name: ADMIN_ACCOUNT.user };
    LH.write(KEYS.admin, admin);
    el.loginPass.value = '';
    el.adminName.textContent = admin.name;
    closeLayer(true);
    startConsole();
  }

  function logout() {
    admin = null;
    LH.remove(KEYS.admin);
    el.loginPass.value = '';
    closeLayer(true);
    showToast('已退出登录');
    openLoginGate();
  }

  /* ------------------------------------------------------------------------
     统计
     ------------------------------------------------------------------------ */
  function computeStats(list) {
    var revenue = 0;
    var sampleCount = 0;
    var byKey = {};

    list.forEach(function (order) {
      revenue += order.total || 0;
      if (order.sample) sampleCount += 1;
      (order.items || []).forEach(function (item) {
        var key = item.id || item.name;
        if (!byKey[key]) byKey[key] = { name: item.name, qty: 0, revenue: 0 };
        byKey[key].qty += item.qty;
        byKey[key].revenue += item.qty * item.price;
      });
    });

    var rows = Object.keys(byKey).map(function (key) { return byKey[key]; });
    rows.sort(function (a, b) {
      return b.qty - a.qty || b.revenue - a.revenue;
    });

    var totalQty = rows.reduce(function (sum, row) { return sum + row.qty; }, 0);
    rows.forEach(function (row) {
      row.share = totalQty ? row.qty / totalQty : 0;
    });

    return {
      revenue: revenue,
      orders: list.length,
      sampleCount: sampleCount,
      average: list.length ? Math.round(revenue / list.length) : 0,
      totalQty: totalQty,
      rows: rows
    };
  }

  function renderStats() {
    var list = LH.getAllOrders();
    var stats = computeStats(list);
    var onShelf = products.filter(function (item) { return item.status !== 'off'; }).length;

    el.statRevenue.textContent = formatPrice(formatNumber(stats.revenue));
    el.statOrders.textContent = formatNumber(stats.orders);
    el.statSample.textContent = formatNumber(stats.sampleCount);
    el.statAvg.textContent = formatPrice(formatNumber(stats.average));
    el.statOnShelf.textContent = onShelf;
    el.statQty.textContent = formatNumber(stats.totalQty);

    var maxQty = stats.rows.length ? stats.rows[0].qty : 0;
    el.rankList.innerHTML = '';
    el.statTableBody.innerHTML = '';

    if (!stats.rows.length) {
      var emptyRank = document.createElement('p');
      emptyRank.className = 'empty-state';
      emptyRank.textContent = '还没有任何订单，先在前台下几单或注入演示数据看看。';
      el.rankList.appendChild(emptyRank);

      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 4;
      emptyCell.className = 'admin-table__empty';
      emptyCell.textContent = '暂无数据';
      emptyRow.appendChild(emptyCell);
      el.statTableBody.appendChild(emptyRow);
      return;
    }

    var rankFragment = document.createDocumentFragment();
    stats.rows.slice(0, 8).forEach(function (row) {
      var wrap = document.createElement('div');
      wrap.className = 'rank-row';

      var head = document.createElement('div');
      head.className = 'rank-row__head';
      var name = document.createElement('span');
      name.className = 'rank-row__name';
      name.textContent = row.name;
      var numbers = document.createElement('span');
      numbers.className = 'rank-row__numbers';
      numbers.textContent = formatNumber(row.qty) + ' 件 · ' + formatPrice(formatNumber(row.revenue));
      head.appendChild(name);
      head.appendChild(numbers);

      var track = document.createElement('div');
      track.className = 'rank-row__track';
      var bar = document.createElement('span');
      bar.className = 'rank-row__bar';
      bar.style.width = (maxQty ? Math.round(row.qty / maxQty * 100) : 0) + '%';
      track.appendChild(bar);

      wrap.appendChild(head);
      wrap.appendChild(track);
      rankFragment.appendChild(wrap);
    });
    el.rankList.appendChild(rankFragment);

    var tableFragment = document.createDocumentFragment();
    stats.rows.forEach(function (row) {
      var tr = document.createElement('tr');

      var nameCell = document.createElement('td');
      nameCell.textContent = row.name;

      var qtyCell = document.createElement('td');
      qtyCell.textContent = formatNumber(row.qty);

      var revenueCell = document.createElement('td');
      revenueCell.textContent = formatPrice(formatNumber(row.revenue));

      var shareCell = document.createElement('td');
      shareCell.textContent = (row.share * 100).toFixed(1) + '%';

      tr.appendChild(nameCell);
      tr.appendChild(qtyCell);
      tr.appendChild(revenueCell);
      tr.appendChild(shareCell);
      tableFragment.appendChild(tr);
    });
    el.statTableBody.appendChild(tableFragment);
  }

  /* ------------------------------------------------------------------------
     商品管理
     ------------------------------------------------------------------------ */
  function buildProductRow(product) {
    var tr = document.createElement('tr');
    tr.dataset.id = product.id;

    var productCell = document.createElement('td');
    var wrap = document.createElement('div');
    wrap.className = 'admin-table__product';

    var image = document.createElement('img');
    image.className = 'admin-table__thumb';
    image.src = product.image || '';
    image.alt = product.name;
    image.loading = 'lazy';

    var text = document.createElement('div');
    text.className = 'admin-table__name';
    var strong = document.createElement('strong');
    strong.textContent = product.name;
    var small = document.createElement('span');
    small.textContent = product.point || '';
    text.appendChild(strong);
    text.appendChild(small);

    wrap.appendChild(image);
    wrap.appendChild(text);
    productCell.appendChild(wrap);

    var categoryCell = document.createElement('td');
    categoryCell.textContent = product.category;

    var priceCell = document.createElement('td');
    priceCell.textContent = formatPrice(product.price);

    var specCell = document.createElement('td');
    specCell.textContent = product.spec;

    var salesCell = document.createElement('td');
    salesCell.textContent = formatNumber(product.sales);

    var statusCell = document.createElement('td');
    var badge = document.createElement('span');
    var onShelf = product.status !== 'off';
    badge.className = 'badge ' + (onShelf ? 'badge--on' : 'badge--off');
    badge.textContent = onShelf ? '在售' : '已下架';
    statusCell.appendChild(badge);

    var actionCell = document.createElement('td');
    var actions = document.createElement('div');
    actions.className = 'admin-table__actions';

    var editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'link-button';
    editButton.dataset.action = 'edit';
    editButton.textContent = '编辑';

    var toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'link-button' + (onShelf ? ' link-button--danger' : '');
    toggleButton.dataset.action = 'toggle';
    toggleButton.textContent = onShelf ? '下架' : '上架';

    actions.appendChild(editButton);
    actions.appendChild(toggleButton);
    actionCell.appendChild(actions);

    tr.appendChild(productCell);
    tr.appendChild(categoryCell);
    tr.appendChild(priceCell);
    tr.appendChild(specCell);
    tr.appendChild(salesCell);
    tr.appendChild(statusCell);
    tr.appendChild(actionCell);
    return tr;
  }

  function renderProducts() {
    el.productTableBody.innerHTML = '';
    if (!products.length) {
      var tr = document.createElement('tr');
      var cell = document.createElement('td');
      cell.colSpan = 7;
      cell.className = 'admin-table__empty';
      cell.textContent = '还没有商品，点右上角「新增商品」添加。';
      tr.appendChild(cell);
      el.productTableBody.appendChild(tr);
      return;
    }

    var fragment = document.createDocumentFragment();
    products.forEach(function (product) {
      fragment.appendChild(buildProductRow(product));
    });
    el.productTableBody.appendChild(fragment);
  }

  function buildCategoryOptions() {
    var preset = ['鸡肉', '冻干', '洁齿', '训练奖励'];
    var seen = {};
    el.categoryOptions.innerHTML = '';
    preset.concat(products.map(function (item) { return item.category; })).forEach(function (name) {
      if (!name || seen[name]) return;
      seen[name] = true;
      var option = document.createElement('option');
      option.value = name;
      el.categoryOptions.appendChild(option);
    });
  }

  function buildImagePresets() {
    var used = {};
    el.pImagePreset.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '或从现有素材里选…';
    el.pImagePreset.appendChild(placeholder);

    ASSET_CHOICES.concat(products.map(function (item) {
      return { label: item.name, value: item.image };
    })).forEach(function (choice) {
      if (!choice.value || used[choice.value]) return;
      used[choice.value] = true;
      var option = document.createElement('option');
      option.value = choice.value;
      option.textContent = choice.label;
      el.pImagePreset.appendChild(option);
    });
  }

  function clearProductErrors() {
    setError(el.pName, document.getElementById('pNameError'), '');
    setError(el.pCategory, document.getElementById('pCategoryError'), '');
    setError(el.pPrice, document.getElementById('pPriceError'), '');
    setError(el.pSpec, document.getElementById('pSpecError'), '');
    setError(el.pSales, document.getElementById('pSalesError'), '');
    setError(el.pPoint, document.getElementById('pPointError'), '');
    setError(el.pIngredients, document.getElementById('pIngredientsError'), '');
    setError(el.pSuitable, document.getElementById('pSuitableError'), '');
    setError(null, document.getElementById('pImageError'), '');
  }

  function openProductForm(id) {
    editingProductId = id || null;
    var product = id ? LH.findProductById(products, id) : null;

    buildCategoryOptions();
    buildImagePresets();
    el.productForm.reset();
    clearProductErrors();

    el.productDialogTitle.textContent = product ? '编辑商品' : '新增商品';
    el.productDialogSub.textContent = product
      ? '修改后立即保存，前台刷新即可看到最新内容。'
      : '保存后会立即写入商品数据，前台刷新即可看到。';
    el.productSubmit.textContent = product ? '保存修改' : '保存商品';

    el.pName.value = product ? product.name : '';
    el.pCategory.value = product ? product.category : '';
    el.pPrice.value = product ? product.price : '';
    el.pSpec.value = product ? product.spec : '';
    el.pSales.value = product ? product.sales : 0;
    el.pPoint.value = product ? product.point : '';
    el.pIngredients.value = product ? product.ingredients : '';
    el.pSuitable.value = product ? product.suitable : '';
    el.pStatus.checked = product ? product.status !== 'off' : true;

    pendingImage = product ? product.image : '';
    updateImagePreview();
    showLayer(el.productDialog, 'product');
  }

  function updateImagePreview() {
    if (pendingImage) {
      el.pPreview.src = pendingImage;
      el.pPreview.classList.add('is-visible');
    } else {
      el.pPreview.removeAttribute('src');
      el.pPreview.classList.remove('is-visible');
    }
  }

  function handleProductSubmit(event) {
    event.preventDefault();

    var price = Number(el.pPrice.value);
    var sales = Number(el.pSales.value || 0);
    var data = {
      name: el.pName.value.trim(),
      category: el.pCategory.value.trim(),
      price: price,
      spec: el.pSpec.value.trim(),
      point: el.pPoint.value.trim(),
      ingredients: el.pIngredients.value.trim(),
      suitable: el.pSuitable.value.trim(),
      sales: sales,
      image: pendingImage,
      status: el.pStatus.checked ? 'on' : 'off'
    };
    var ok = true;

    if (!data.name) { setError(el.pName, document.getElementById('pNameError'), '请填写商品名称'); ok = false; }
    else setError(el.pName, document.getElementById('pNameError'), '');

    if (!data.category) { setError(el.pCategory, document.getElementById('pCategoryError'), '请填写分类'); ok = false; }
    else setError(el.pCategory, document.getElementById('pCategoryError'), '');

    if (el.pPrice.value === '' || isNaN(price) || price < 0) {
      setError(el.pPrice, document.getElementById('pPriceError'), '请填写不小于 0 的价格');
      ok = false;
    } else setError(el.pPrice, document.getElementById('pPriceError'), '');

    if (!data.spec) { setError(el.pSpec, document.getElementById('pSpecError'), '请填写规格'); ok = false; }
    else setError(el.pSpec, document.getElementById('pSpecError'), '');

    if (isNaN(sales) || sales < 0) { setError(el.pSales, document.getElementById('pSalesError'), '月销量不能为负'); ok = false; }
    else setError(el.pSales, document.getElementById('pSalesError'), '');

    if (!data.point) { setError(el.pPoint, document.getElementById('pPointError'), '请填写卖点'); ok = false; }
    else setError(el.pPoint, document.getElementById('pPointError'), '');

    if (!data.ingredients) { setError(el.pIngredients, document.getElementById('pIngredientsError'), '请填写主要成分'); ok = false; }
    else setError(el.pIngredients, document.getElementById('pIngredientsError'), '');

    if (!data.suitable) { setError(el.pSuitable, document.getElementById('pSuitableError'), '请填写适用宠物'); ok = false; }
    else setError(el.pSuitable, document.getElementById('pSuitableError'), '');

    if (!data.image) {
      setError(null, document.getElementById('pImageError'), '请先选择一张商品图片');
      ok = false;
    } else setError(null, document.getElementById('pImageError'), '');

    if (!ok) return;

    if (editingProductId) {
      var target = LH.findProductById(products, editingProductId);
      if (target) {
        target.name = data.name;
        target.category = data.category;
        target.price = data.price;
        target.spec = data.spec;
        target.point = data.point;
        target.ingredients = data.ingredients;
        target.suitable = data.suitable;
        target.sales = data.sales;
        target.image = data.image;
        target.status = data.status;
      }
    } else {
      products.push({
        id: LH.makeId('product'),
        name: data.name,
        category: data.category,
        price: data.price,
        spec: data.spec,
        point: data.point,
        ingredients: data.ingredients,
        suitable: data.suitable,
        sales: data.sales,
        image: data.image,
        status: data.status
      });
    }

    if (!LH.saveProducts(products)) {
      setError(null, document.getElementById('pImageError'),
        '浏览器存储空间不足，图片没能保存。请换一张更小的图片，或先重置演示数据再试。');
      return;
    }

    editingProductId = null;
    closeLayer(true);
    renderAll();
    showToast(data.name + ' 已保存');
  }

  function toggleProductStatus(id) {
    var product = LH.findProductById(products, id);
    if (!product) return;
    product.status = product.status === 'off' ? 'on' : 'off';
    if (!LH.saveProducts(products)) {
      product.status = product.status === 'off' ? 'on' : 'off';
      showToast('保存失败：浏览器存储空间不足');
      return;
    }
    renderAll();
    showToast(product.name + (product.status === 'off' ? ' 已下架，前台不再展示' : ' 已重新上架'));
  }

  /* ------------------------------------------------------------------------
     订单
     ------------------------------------------------------------------------ */
  function renderOrders() {
    var list = LH.getAllOrders();
    var sampleCount = list.filter(function (order) { return order.sample; }).length;

    el.orderTotal.textContent = list.length;
    el.orderSample.textContent = sampleCount;
    el.adminOrderList.innerHTML = '';

    if (!list.length) {
      var empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '还没有订单。前台下单或重置演示数据都会产生订单。';
      el.adminOrderList.appendChild(empty);
      return;
    }

    var fragment = document.createDocumentFragment();
    list.forEach(function (order) {
      var card = document.createElement('article');
      card.className = 'order-card';

      var top = document.createElement('div');
      top.className = 'order-card__top';

      var number = document.createElement('span');
      number.className = 'order-card__number';
      number.textContent = order.number;

      var meta = document.createElement('span');
      meta.className = 'order-card__time';

      if (order.sample) {
        var tag = document.createElement('span');
        tag.className = 'badge badge--sample';
        tag.textContent = '虚拟';
        meta.appendChild(tag);
        meta.appendChild(document.createTextNode(' '));
      }
      meta.appendChild(document.createTextNode(formatTime(order.createdAt)));
      meta.appendChild(document.createTextNode(' · ' + (order.buyer || '—')));

      top.appendChild(number);
      top.appendChild(meta);

      var summary = document.createElement('p');
      summary.className = 'order-card__meta';
      summary.appendChild(document.createTextNode('共 ' + order.count + ' 件 · 合计 '));
      var total = document.createElement('strong');
      total.className = 'order-card__total';
      total.textContent = formatPrice(formatNumber(order.total));
      summary.appendChild(total);

      var items = document.createElement('p');
      items.className = 'order-card__items';
      items.textContent = '商品：' + (order.items || []).map(function (item) {
        return item.name + ' ×' + item.qty;
      }).join('、');

      card.appendChild(top);
      card.appendChild(summary);
      card.appendChild(items);

      if (order.address) {
        var line = document.createElement('p');
        line.className = 'order-card__items';
        line.textContent = '收货：' + order.address.name + ' ' + maskPhone(order.address.phone) +
          ' · ' + order.address.region + ' ' + order.address.detail;
        card.appendChild(line);
      }
      fragment.appendChild(card);
    });
    el.adminOrderList.appendChild(fragment);
  }

  /* ------------------------------------------------------------------------
     分区切换与重置
     ------------------------------------------------------------------------ */
  function switchPanel(name) {
    currentPanel = name;
    Object.keys(el.panels).forEach(function (key) {
      var panel = el.panels[key];
      if (!panel) return;
      var active = key === name;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    Array.prototype.forEach.call(el.tabs, function (tab) {
      var active = tab.dataset.panel === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function disarmReset() {
    resetArmed = false;
    window.clearTimeout(resetTimer);
    el.resetButton.textContent = '重置演示数据';
    el.resetButton.classList.remove('is-armed');
  }

  function handleReset() {
    if (!resetArmed) {
      resetArmed = true;
      el.resetButton.textContent = '再点一次确认重置';
      el.resetButton.classList.add('is-armed');
      resetTimer = window.setTimeout(disarmReset, 4000);
      return;
    }
    disarmReset();
    LH.resetDemoData();
    products = LH.getProducts();
    LH.ensureSampleOrders();
    renderAll();
    showToast('演示数据已重置：商品回到初始 8 款，虚拟订单重新生成');
  }

  /* ------------------------------------------------------------------------
     渲染与事件
     ------------------------------------------------------------------------ */
  function renderAll() {
    renderStats();
    renderProducts();
    renderOrders();
  }

  function startConsole() {
    products = LH.getProducts();
    LH.ensureSampleOrders();
    renderAll();
    switchPanel(currentPanel);
  }

  el.loginForm.addEventListener('submit', handleLogin);
  el.logoutButton.addEventListener('click', logout);
  el.resetButton.addEventListener('click', handleReset);
  el.addProductButton.addEventListener('click', function () { openProductForm(null); });
  el.productForm.addEventListener('submit', handleProductSubmit);
  el.productDialog.addEventListener('input', function (event) {
    if (event.target === el.pImagePreset) return;
    clearProductErrors();
  });

  Array.prototype.forEach.call(el.tabs, function (tab) {
    tab.addEventListener('click', function () { switchPanel(tab.dataset.panel); });
  });

  el.productTableBody.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    var row = trigger.closest('tr');
    if (!row) return;
    if (trigger.dataset.action === 'edit') openProductForm(row.dataset.id);
    if (trigger.dataset.action === 'toggle') toggleProductStatus(row.dataset.id);
  });

  el.pImagePreset.addEventListener('change', function () {
    if (!el.pImagePreset.value) return;
    pendingImage = el.pImagePreset.value;
    updateImagePreview();
    setError(null, document.getElementById('pImageError'), '');
  });

  el.pImageFile.addEventListener('change', function () {
    var file = el.pImageFile.files && el.pImageFile.files[0];
    if (!file) return;

    LH.compressImage(file, 800, 0.82).then(function (result) {
      pendingImage = result.dataUrl;
      updateImagePreview();
      setError(null, document.getElementById('pImageError'), '');
      showToast('图片已压缩为 ' + result.width + '×' + result.height);
      el.pImagePreset.value = '';
    }).catch(function (error) {
      setError(null, document.getElementById('pImageError'), error.message || '图片处理失败');
    });
  });

  el.overlay.addEventListener('click', function () { closeLayer(); });

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-close]')) closeLayer();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeLayer();
  });

  /* 初始化：没有管理员登录态就先过门禁 */
  if (admin && admin.mode === 'admin') {
    el.adminName.textContent = admin.name;
    startConsole();
  } else {
    admin = null;
    showLayer(el.loginDialog, 'adminLogin');
  }
})();
