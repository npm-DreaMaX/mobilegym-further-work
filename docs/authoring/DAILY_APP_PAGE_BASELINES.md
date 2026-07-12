# Daily App Page Baselines

> 回答"每个 App 每次普通打开到底是什么样"。即 `__SIM__.reset()` 后、benchmark setup 注入前的默认外观与默认数据来源。
> 区分：**world data**（固定只读，`data/*.json`/`constants.ts`）vs **runtime overlay**（`state.ts`+`defaults.json`，benchmark setup 会改）。
> 所有 App `designViewportWidth` 见 `DAILY_10_APP_PRODUCTION_PLAN.md`。

---

## 1. Wallet（卡包）

- **默认首页**：卡列表（横向 swipe 卡堆，默认卡居中前置），顶部搜索+扫码，底部 tab（卡包/优惠/我的）。
- **默认列表内容**：3–5 张卡（1 银行卡 + 1 会员卡 + 1 交通卡 + 1 优惠券），来自 `defaults.json` cards。
- **默认详情页**：选中卡的 barcode/QR 全屏展示 + 卡号脱敏 + 余额。
- **默认用户/账号状态**：已登录，user(name/avatar/phone) 来自 `defaults.json`，无 auth 流程（直接登录态）。
- **默认底部 tab**：卡包 / 优惠 / 我的。
- **固定来自 world data**：CardType 目录（图标/色/label，`constants.ts`）、发卡机构列表（`constants.ts`，参考 Alipay BANK_OPTIONS）。
- **benchmark setup 改 runtime overlay**：`cards`（增删卡）、`defaultCardId`、`cards[].sortOrder`（排序 task）、`settings.themeId`（翻转）。
- **必须高保真**：卡堆横向 swipe、barcode/QR 渲染（复用 `RealisticQRCode`）、卡号脱敏。
- **只做模拟**：扫码功能（模拟，不接真实相机/网络）；支付码刷新（模拟动态码，`TimeService.realNow` 做动画）。

## 2. Duolingo

- **默认首页**：技能树 path（纵向滚动，各 skill 单元节点连线），顶部 streak 火焰 + 当前 league，底部 tab（学习/排行榜/个人）。
- **默认列表内容**：5–8 个 skill 节点（每个含 N lesson，已完成部分节点亮起），来自 `defaults.json` skillTree。
- **默认详情页**：点 skill 进 lesson 列表 → 点 lesson 进课程页（题目+进度条）。
- **默认用户/账号状态**：已登录，user(xp/streak=7/league)、completedLessonIds(若干) 来自 `defaults.json`。
- **默认底部 tab**：学习 / 排行榜 / 个人。
- **固定来自 world data**：课程题库（`data/lessons.json`+`loader.ts`）、语言列表、成就定义（`constants.ts`）。
- **benchmark setup 改 runtime overlay**：`user.streak`、`user.xp`、`completedLessonIds`、`dailyProgress`、`settings.reminder`（翻转）。
- **必须高保真**：技能树连线节点、streak 火焰、lesson 进度条。
- **只做模拟**：题目判定（模拟正确/错误反馈，不接真实 LLM）；发音（模拟，不接 TTS）；排行榜实时（静态数据 + 模拟排名变化）。

## 3. GoogleDrive

- **默认首页**：文件列表（默认"最近"tab），顶部搜索+存储用量条，底部 tab（主页/星标/共享/我的）。
- **默认列表内容**：8–12 个文件（混合类型 doc/sheet/img/pdf，有星标有共享），来自 `data/files.json`。
- **默认详情页**：文件信息（名/类型/大小/修改时间/owner/共享状态）+ 操作菜单。
- **默认用户/账号状态**：已登录，user(name/email/storageUsage used/total) 来自 `defaults.json`。
- **默认底部 tab**：主页 / 星标 / 共享 / 我的。
- **固定来自 world data**：大文件数据集（`data/files.json` 10000+，`loader.ts`）、文件类型目录（`constants.ts`）。
- **benchmark setup 改 runtime overlay**：`files` overlay（删/收藏/重命名/移动）、`starredIds`、`trash`、`search.current`/`search.history`/`search.lastCompare`（参考 Ebay）、`settings.sortOption`/`viewMode`（翻转）。
- **必须高保真**：文件列表（icon+名+meta）、搜索筛选 UI（参考 Ebay FilterDrawer/SortModal）、存储用量条。
- **只做模拟**：文件预览（缩略图占位，不接真实内容渲染）；下载/上传（模拟，不接网络）；共享链接生成（模拟）。

## 4. Zhihu

- **默认首页**：推荐流（"推荐"tab 默认），信息流卡片（问题+回答摘要+作者+赞数），底部 tab（首页/会员/通知/我的）。
- **默认列表内容**：10–15 条内容（问题/文章/想法混合），来自 `data/` world data。
- **默认详情页**：问题详情（标题+多回答）→ 回答详情（全文+评论）；或文章详情。
- **默认用户/账号状态**：已登录，user(name/avatar/following/followers)、followedQuestionIds/likedAnswerIds 若干 来自 `defaults.json`。
- **默认底部 tab**：首页 / 会员 / 通知 / 我的。
- **固定来自 world data**：问题/回答/文章内容库（`data/`，参考 Spotify data/）、话题树、用户库。
- **benchmark setup 改 runtime overlay**：`followedQuestionIds`/`followedAuthorIds`、`likedAnswerIds`、`collections`(动态 playlist)、`searchHistory`、`settings.themeId`（翻转）。
- **必须高保真**：信息流卡片、问题/回答详情排版、收藏夹列表。
- **只做模拟**：搜索（静态数据过滤，不接网络）；推荐算法（静态顺序）；通知实时（静态列表）。

## 5. ChinaMobile

- **默认首页**：用量 dashboard（大数字话费余额 + 流量环形进度 + 套餐名 + 积分），快捷入口（充值/流量包/账单），底部 tab（首页/商城/我的）。
- **默认列表内容**：首页 dashboard 卡片 + 我的页订单/账单入口。
- **默认详情页**：账单详情（月账单明细）/ 套餐详情 / 流量包办理。
- **默认用户/账号状态**：已登录，user(phone/balance/dataUsage/points/activePlan) 来自 `defaults.json`，auth session loggedIn:true（参考 Railway）。
- **默认底部 tab**：首页 / 商城 / 我的。
- **固定来自 world data**：套餐目录、流量包目录、账单模板、客服电话 SERVICE_PHONES（`constants.ts`/`data/`）。
- **benchmark setup 改 runtime overlay**：`user.balance`/`user.dataUsage`/`user.points`、`activePlan`、`orders`、`rechargeCards`、`settings.*`（toggle 翻转，参考 Weather/Map）。
- **必须高保真**：用量 dashboard（大数字+环形进度）、账单明细、套餐卡。
- **只做模拟**：充值扣款（模拟支付，参考 Alipay recharge 流程）；流量包生效（模拟延迟，`TimeService`）；短信验证码（经 `SmsGateway.receiveMessage`，参考 Railway）。

## 6. Cainiao

- **默认首页**：包裹列表（卡片列表，每张含 trackingNo/状态/收件人/最新物流节点），顶部搜索+扫码，底部 tab（首页/寄件/我的）。
- **默认列表内容**：3–5 个包裹（混合状态：运输中/已到站/已取件），来自 `defaults.json` packages。
- **默认详情页**：包裹详情（物流时间线，纵向节点列表，含时间+地点+状态）。
- **默认用户/账号状态**：已登录，user(name/phone/defaultAddress) 来自 `defaults.json`。
- **默认底部 tab**：首页 / 寄件 / 我的。
- **固定来自 world data**：快递公司列表(15+)、驿站 POI 数据、城市/地址、物流事件模板（`constants.ts`/`data/`）。
- **benchmark setup 改 runtime overlay**：`packages`（增删改状态）、`recentSearches`、`defaultAddress`、`settings.notification`（翻转）。
- **必须高保真**：物流时间线（节点+时间+地点）、包裹卡片、取件码展示。
- **只做模拟**：扫码（模拟）；驿站地图（简化为列表，不接真实 Google Maps，复用 Map POI 列表模式）；物流实时更新（静态时间线 + 确定性事件序列，参考 Railway availabilityGenerator）；寄件下单（模拟）。

## 7. Gmail

- **默认首页**：收件箱（"主要"tab 默认），邮件线程列表（avatar+发件人+主题+摘要+时间+星标），顶部搜索+侧边菜单，底部无 tab（FAB 撰写）。
- **默认列表内容**：8–12 个线程（混合分类：主要/社交/推广），来自 `data/` world data。
- **默认详情页**：线程详情（主题+多邮件折叠展开+发件人/时间/正文）。
- **默认用户/账号状态**：已登录，user(name/email)、threads 标签/已读状态 来自 `defaults.json`，auth session（参考 Railway）。
- **默认底部 tab**：无底部 tab；分类切换在顶部（主要/社交/推广）；FAB 撰写。
- **固定来自 world data**：邮件内容库（`data/`，参考 Wechat data/）、标签目录、联系人库。
- **benchmark setup 改 runtime overlay**：`threads` overlay（已读/星标/归档/标签）、`drafts`、`starredThreadIds`、`searchHistory`、`settings.inboxType`（翻转）。
- **必须高保真**：线程列表+折叠展开、撰写编辑器、标签 chip。
- **只做模拟**：发送邮件（模拟，写入 drafts/threads，不接 SMTP）；附件上传（模拟）；实时推送（静态通知列表）。

## 8. Telegram

- **默认首页**：聊天列表（avatar+名字+最后消息+时间+未读 badge），顶部搜索+菜单，底部无 tab（FAB 新建）。
- **默认列表内容**：4–6 个会话（私聊+群+频道混合，含未读），来自 `data/` world data。
- **默认详情页**：聊天详情（消息气泡列表，区分发送/接收，含时间分隔符，参考 Wechat ChatDetail）。
- **默认用户/账号状态**：已登录，user(name/phone/username)、contacts 若干 来自 `defaults.json`，auth session（参考 Railway/Wechat）。
- **默认底部 tab**：无底部 tab；FAB 新建聊天；菜单切换设置/联系人/频道。
- **固定来自 world data**：消息内容库（`data/`，参考 Wechat data/）、频道内容库、联系人库。
- **benchmark setup 改 runtime overlay**：`chats`（消息增，参考 Wechat `upsertChatMessages`）、`contacts`(blocklist/mute)、`drafts`、`settings.notification`/`privacy`（翻转）、`authorizedApps`。
- **必须高保真**：消息气泡（发送/接收+时间分隔符）、未读 badge、聊天输入栏（`data-keep-keyboard` + flex 非 fixed）。
- **只做模拟**：发送/接收（写入 chats，不接网络）；语音/视频通话（模拟）；实时推送（静态）；AI 回复（可选，参考 Wechat `AIService.chat`）。

## 9. Didi

- **默认首页**：地图全屏（顶部起终点输入框，底部服务类型选择+估价，地图上定位 pin），无底部 tab 或轻量 tab（出行/我的）。
- **默认列表内容**：首页即地图+输入；行程历史在"我的"页列表。
- **默认详情页**：行程进行中（地图+司机信息+预计到达）或行程历史详情（路线+费用）。
- **默认用户/账号状态**：已登录，user(name/phone)、recentPlaces(家/公司)、paymentMethods 来自 `defaults.json`。
- **默认底部 tab**：出行 / 我的（或无 tab，地图为主）。
- **固定来自 world data**：城市/地点 POI（参考 Map places.json）、车型目录、费率规则、司机库（`data/`/`constants.ts`）。
- **benchmark setup 改 runtime overlay**：`trips`（新增行程）、`currentTrip`、`recentPlaces`、`coupons`、`searchHistory`（参考 Railway）、`settings`。
- **必须高保真**：地图定位 pin、起终点输入、车型选择+估价卡、行程进行中状态。
- **只做模拟**：地图（简化为静态/离线瓦片或列表 POI，不接真实 Google Maps 或复用 Map 离线瓦片）；实时司机位置（模拟移动，`TimeService.realNow`）；估价（确定性模拟，参考 Railway PRNG）；叫车匹配（模拟延迟）；支付（复用 Alipay AmountKeyboard）。

## 10. Amazon

- **默认首页**：搜索栏+分类入口+推荐商品瀑布流，底部 tab（首页/分类/购物车/我的）。
- **默认列表内容**：6–10 个推荐商品卡（图+名+价+评分），来自 `data/products.json` homeProducts 子集。
- **默认详情页**：商品详情（大图+标题+价+评分+评论数+加购/立即购买按钮）。
- **默认用户/账号状态**：已登录，user(name/email)、cart(若干)、addresses 来自 `defaults.json`。
- **默认底部 tab**：首页 / 分类 / 购物车 / 我的。
- **固定来自 world data**：商品大数据集（`data/products.json` 10000+，`loader.ts`，参考 Ebay）、分类树（`data/categories.json`）、评价库。
- **benchmark setup 改 runtime overlay**：`cart`、`orders`、`savedItems`(wishlist)、`recentSearches`、`search.current`/`history`/`lastCompare`（参考 Ebay）、`settings.themeId`（翻转）。
- **必须高保真**：商品卡瀑布流、商品详情页、搜索筛选 UI（复用 Ebay FilterDrawer/SortModal）、购物车列表。
- **只做模拟**：搜索（静态 `filter_products` 过滤，参考 Ebay，不接网络）；图片（CDN URL 或占位，参考 Ebay `resolveEbayImage`）；下单支付（模拟，参考 Railway 订单状态机）；评论提交（模拟写入）。

---

## 共性基线

- 所有 App：`__SIM__.reset()` 后回到 `defaults.json` + `constants.ts` 定义的默认态；登录态默认 loggedIn（除 Railway/Wechat 有 auth 流程的，默认 session.loggedIn=true）。
- benchmark setup 通过 `apps.<appId>.*` path 注入 runtime overlay，**不改** world data（`data/*.json` 只读）。
- 高保真页 = 列表/详情/输入三类核心交互面；模拟项 = 任何需真实网络/相机/地图/支付网关的，一律走本地 store action + 静态/确定性数据。
- 底部 tab 数量 3–5；无 tab 的 App（Gmail/Telegram/Didi）用 FAB 或地图为主。
