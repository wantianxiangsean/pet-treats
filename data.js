/* ==========================================================================
   岚禾小食 · 共享数据层
   前台（index.html）与后台（admin.html）共用这一份存储约定：
   商品、订单、地址、身份都存在浏览器本地，两个页面读写同一批键。
   ========================================================================== */
(function (window) {
  'use strict';

  var STORE_KEYS = {
    auth: 'lh.auth',
    admin: 'lh.admin',
    addresses: 'lh.addresses',
    orders: 'lh.orders',
    products: 'lh.products',
    sampleOrders: 'lh.sampleOrders',
    sampleSeedAt: 'lh.sampleSeedAt'
  };

  var DEMO_ACCOUNT = { user: 'demo', pass: 'pet123' };
  var ADMIN_ACCOUNT = { user: 'admin', pass: 'pet888' };

  /* ------------------------------------------------------------------------
     存储读写
     ------------------------------------------------------------------------ */
  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var value = JSON.parse(raw);
      return value === null || value === undefined ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* 存储被禁用时忽略 */
    }
  }

  function makeId(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' +
      Math.floor(Math.random() * 1679616).toString(36);
  }

  /* ------------------------------------------------------------------------
     商品种子：新站点第一次打开时写进 lh.products
     ------------------------------------------------------------------------ */
  var PRODUCT_SEED = [
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
      image: 'assets/images/product-cheese-heart-biscuits.jpg',
      status: 'on'
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
      image: 'assets/images/product-chicken-jerky-strips.jpg',
      status: 'on'
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
      image: 'assets/images/product-salmon-training-bites.jpg',
      status: 'on'
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
      image: 'assets/images/product-herbal-dental-chews.jpg',
      status: 'on'
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
      image: 'assets/images/product-freeze-dried-chicken-cubes.jpg',
      status: 'on'
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
      image: 'assets/images/product-air-dried-duck-slices.jpg',
      status: 'on'
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
      image: 'assets/images/product-veggie-cookies.jpg',
      status: 'on'
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
      image: 'assets/images/product-dental-soft-strips.jpg',
      status: 'on'
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getProducts() {
    var stored = read(STORE_KEYS.products, null);
    if (stored && stored.length) {
      // 兼容早期没有 status 字段的数据
      for (var i = 0; i < stored.length; i++) {
        if (!stored[i].status) stored[i].status = 'on';
      }
      return stored;
    }
    var seed = clone(PRODUCT_SEED);
    write(STORE_KEYS.products, seed);
    return seed;
  }

  function saveProducts(list) {
    return write(STORE_KEYS.products, list);
  }

  function findProductById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /* ------------------------------------------------------------------------
     订单
     ------------------------------------------------------------------------ */
  function getRealOrders() {
    return read(STORE_KEYS.orders, []);
  }

  var SAMPLE_BUYERS = [
    '王小禾', '李毛毛', '陈小满', '周有财', '孙团团',
    '吴小豆', '郑阿黄', '赵喜乐', '钱多多', '冯小圆'
  ];

  var SAMPLE_PLACES = [
    { region: '浙江省 杭州市 西湖区', detail: '文一西路 100 号 3 单元 501' },
    { region: '江苏省 南京市 鼓楼区', detail: '中山北路 88 号 2001 室' },
    { region: '上海市 徐汇区', detail: '漕溪北路 45 号 12 楼' },
    { region: '广东省 深圳市 南山区', detail: '科苑路 15 号 B 座 902' },
    { region: '四川省 成都市 武侯区', detail: '天府大道 500 号 6 栋 3 单元' },
    { region: '北京市 朝阳区', detail: '建国路 99 号 8 层' }
  ];

  function pickOne(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function orderNumberFor(stamp, tail) {
    var date = new Date(stamp);
    return 'LH-' + date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + '-' + tail;
  }

  function buildSampleOrders() {
    var products = getProducts();
    var sellable = products.filter(function (item) { return item.status !== 'off'; });
    if (!sellable.length) sellable = products;

    var orders = [];
    var now = Date.now();
    var day = 24 * 60 * 60 * 1000;

    for (var i = 0; i < 80; i++) {
      var createdAt = now - Math.floor(Math.random() * 60 * day) - Math.floor(Math.random() * day);
      var place = pickOne(SAMPLE_PLACES);
      var kinds = 1 + Math.floor(Math.random() * 3);
      var items = [];
      var used = {};

      for (var j = 0; j < kinds; j++) {
        var product = pickOne(sellable);
        if (!product || used[product.id]) continue;
        used[product.id] = true;
        items.push({
          id: product.id,
          name: product.name,
          qty: 1 + Math.floor(Math.random() * 3),
          price: product.price
        });
      }
      if (!items.length && sellable.length) {
        items.push({ id: sellable[0].id, name: sellable[0].name, qty: 1, price: sellable[0].price });
      }

      var count = items.reduce(function (sum, item) { return sum + item.qty; }, 0);
      var total = items.reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);

      orders.push({
        number: orderNumberFor(createdAt, String(1000 + Math.floor(Math.random() * 8999))),
        createdAt: createdAt,
        buyer: pickOne(SAMPLE_BUYERS),
        count: count,
        total: total,
        items: items,
        address: {
          name: pickOne(SAMPLE_BUYERS),
          phone: '1' + (3 + Math.floor(Math.random() * 6)) + String(Math.floor(Math.random() * 900000000) + 100000000),
          region: place.region,
          detail: place.detail
        },
        sample: true
      });
    }

    orders.sort(function (a, b) { return b.createdAt - a.createdAt; });
    return orders;
  }

  function ensureSampleOrders() {
    var stored = read(STORE_KEYS.sampleOrders, null);
    if (stored && stored.length) return stored;
    var generated = buildSampleOrders();
    if (!write(STORE_KEYS.sampleOrders, generated)) return generated;
    write(STORE_KEYS.sampleSeedAt, Date.now());
    return generated;
  }

  function getSampleOrders() {
    return read(STORE_KEYS.sampleOrders, []);
  }

  function getAllOrders() {
    var real = getRealOrders().map(function (order) {
      return Object.assign({}, order, { sample: false });
    });
    var sample = getSampleOrders().map(function (order) {
      return Object.assign({}, order, { sample: true });
    });
    return real.concat(sample).sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  /* ------------------------------------------------------------------------
     演示数据重置：只清商品覆盖与虚拟订单，不碰真实订单、地址与身份
     ------------------------------------------------------------------------ */
  function resetDemoData() {
    remove(STORE_KEYS.products);
    remove(STORE_KEYS.sampleOrders);
    remove(STORE_KEYS.sampleSeedAt);
  }

  /* ------------------------------------------------------------------------
     图片压缩：长边压到 maxEdge、转 JPEG，避免撑爆 localStorage
     ------------------------------------------------------------------------ */
  function compressImage(file, maxEdge, quality) {
    var limit = maxEdge || 800;
    var level = quality || 0.82;

    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error('请选择图片文件'));
        return;
      }

      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('读取图片失败')); };
      reader.onload = function () {
        var image = new Image();
        image.onerror = function () { reject(new Error('图片解析失败')); };
        image.onload = function () {
          var scale = Math.min(1, limit / Math.max(image.width, image.height));
          var width = Math.max(1, Math.round(image.width * scale));
          var height = Math.max(1, Math.round(image.height * scale));

          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          var context = canvas.getContext('2d');
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);

          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', level),
            width: width,
            height: height
          });
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.LH = {
    STORE_KEYS: STORE_KEYS,
    DEMO_ACCOUNT: DEMO_ACCOUNT,
    ADMIN_ACCOUNT: ADMIN_ACCOUNT,
    PRODUCT_SEED: PRODUCT_SEED,
    read: read,
    write: write,
    remove: remove,
    makeId: makeId,
    getProducts: getProducts,
    saveProducts: saveProducts,
    findProductById: findProductById,
    getRealOrders: getRealOrders,
    getSampleOrders: getSampleOrders,
    ensureSampleOrders: ensureSampleOrders,
    getAllOrders: getAllOrders,
    resetDemoData: resetDemoData,
    compressImage: compressImage
  };
})(window);
