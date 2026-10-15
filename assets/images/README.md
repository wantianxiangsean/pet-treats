# 图片素材说明

9 张都是真实照片，统一做了暖色调处理并裁成 4:3：首屏 1200×900，商品图 800×600，单张 60–230 KB。

**画面里只出现猫狗可以吃的东西**：狗粮、狗饼干、鸡胸肉、三文鱼、风干肉片、天然咬胶、冻干肉粒，
没有巧克力、咖啡、葡萄、洋葱、调味熟食这类对猫狗有害或不该喂的食物。

## 每张图是什么

| 文件 | 画面内容 | 检索来源 |
| --- | --- | --- |
| `hero-natural-pet-treats.jpg` | 牧羊犬趴在木地板上，旁边一碗狗粮 | Bing 图片：「dog waiting for food bowl kitchen」 |
| `product-cheese-heart-biscuits.jpg` | 牛皮纸袋里的骨头形狗饼干 | 「dog biscuits homemade baking tray」 |
| `product-chicken-jerky-strips.jpg` | 切片鸡胸肉，白底无杂物 | 「raw chicken breast fillet on board」 |
| `product-salmon-training-bites.jpg` | 木砧板上的生三文鱼块 | 「raw salmon cubes board」 |
| `product-herbal-dental-chews.jpg` | 两根天然咬胶棒，白底 | 「natural dog chew stick」 |
| `product-freeze-dried-chicken-cubes.jpg` | 白碗里的生鸡肉粒配胡萝卜、西兰花 | 「freezer dried dog food cubes bowl」 |
| `product-air-dried-duck-slices.jpg` | 俯拍的生肉薄片 | 「sliced raw meat thin board」 |
| `product-veggie-cookies.jpg` | 一堆骨头形狗饼干，白底 | 「dog biscuits carrot homemade」 |
| `product-dental-soft-strips.jpg` | 叠放的深色肉干条，白底 | 「beef strips dried」 |

## 授权需要你确认

这些图是通过 Bing 图片搜索、并开启「可免费商用」授权过滤（`filterui:license-L2_L3_L4_L5_L6`）筛出来的，
同时排除了 Walmart / Chewy / Amazon 这类会带品牌包装的零售站点。但**授权信息来自 Bing 的元数据**，
不等同于逐张核验过的授权书。

正式发布前建议二选一：

1. 换成自己拍的产品图（推荐，也更贴合真实商品）；
2. 或者逐张核对原图所在页面的授权声明。

另外这些是通用食物与宠物照片，**跟岚禾小食真实卖的东西并不一一对应**，比如「原切鸡胸肉条」用的是
切片鸡胸肉的照片，「风干鸭胸薄片」用的是生肉片。

## 换成自己的照片

文件名保持不变，直接覆盖即可，页面代码不用改：

| 文件名 | 建议尺寸 |
| --- | --- |
| `hero-natural-pet-treats.jpg` | 1200×900 |
| `product-*.jpg` | 800×600 |

页面用 `object-fit: cover` 裁切，窄一点宽一点也能用，4:3 最贴合卡片比例。

## 想用 AI 生成时的提示词

如果之后要生成或重拍，用这组提示词，风格基线和参考图一致：浅色陶瓷器皿、亚麻桌布、柔和自然光、
暖白背景、干净留白、无文字无水印，**画面里不要出现巧克力、咖啡、葡萄、洋葱等对猫狗有害的食物**。

```text
Use case: photorealistic-natural
Asset type: 宠物零食电商网站首屏图
Scene: 明亮安静的家居场景，浅色木桌铺一块亚麻桌布
Subject: 桌上三只浅色陶瓷器皿，分别装着风干鸡胸肉条、冻干鸡肉粒、骨头形狗饼干；
         一只奶白色小型犬和一只浅灰色猫安静地坐在两旁，看向零食
Style/medium: 真实质感的生活方式摄影，不是插画
Composition: 4:3 横幅，桌面对角线构图，右侧留一点负空间
Lighting/mood: 上午的柔和侧光，暖白基调，温暖、干净、有食欲
Constraints: 不出现文字、水印、logo、人手，也不出现人类的咖啡、甜点、酒类
```

```text
Use case: product-mockup
Asset type: 电商商品图
Scene: 暖白色亚麻桌布，浅色陶瓷碗
Subject: 碗里装着【商品名】，另有两三颗散落在碗边
Style/medium: 静物商品摄影，真实质感
Composition: 4:3 横幅，俯视 45 度，主体居中，四周留白
Lighting/mood: 柔和自然光从左上打来，阴影浅而柔
Constraints: 纯商品，无文字、无水印、无包装、无品牌标识、无人手
```

【商品名】替换成：骨头形羊奶酪小饼干／原切鸡胸肉条／三文鱼冻干小粒／天然洁齿咬胶棒／
冻干鸡肉粒／风干鸭胸薄片／混合蔬果小饼干／牙洁冻干软条。

更早之前那套矢量插画已移出资源目录，暂时放在 `%TEMP%\pt\svg-backup\`。
