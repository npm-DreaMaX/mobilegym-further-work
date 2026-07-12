# Daily 10 App Production Plan

> 为 10 个目标 App 规划生成策略。目标 App 名字使用原名，不加 Lite。每项参考价值见 `EXEMPLAR_APP_AND_BENCHMARK_AUDIT.md`。
> 推荐生成顺序（见末尾）：从简到繁、参考充分度优先。

---

## 1. Wallet（卡包）— 各种电子卡

| 项目 | 内容 |
|------|------|
| **App 目标** | 电子卡集中管理：银行卡/会员卡/优惠券/交通卡/支付码展示与切换 |
| **UI 显示名** | 卡包 |
| **代码目录名** | `Wallet` |
| **manifest.id** | `'wallet'` |
| **designViewportWidth** | 360 |
| **参考示例** | Alipay（`bankCards` 管理 + `intentFilters` ACTION_PAY 收银台 + `RealisticQRCode`）、Ebay（`build_compare_counts_checks` 数字答案）、Weather（card list + 简单 toggle） |
| **主要页面** | 首页(卡列表+默认卡)、卡详情(barcode/QR 展示)、添加卡页、卡排序页、卡类型分类页、设置页、我的 |
| **主要实体** | Card(id/type/issuer/number/maskedNumber/balance/expiry/barcode/scheme/sortOrder)、CardType(bank/member/coupon/transit) |
| **world data** | CardType 目录(图标/色/label)、发卡机构列表(15+ 银行参考 Alipay BANK_OPTIONS) |
| **runtime state** | cards[]、defaultCardId、recentUsedIds、settings(theme/notification)、user |
| **benchmark 设计重点** | 卡查询(L1)、默认卡切换(L1)、添加卡(L2)、卡排序(L2)、按类型筛选计数(L3)、跨卡余额比较(L3)、扫码展示导航(L2) |
| **生成优先级** | **P0** — 最简单，直接复用 Alipay bankCards，结构清晰 |
| **风险点** | barcode/QR 渲染复用 `RealisticQRCode`；支付收银台 intent 声明；卡排序的 `._order` expected_changes |

## 2. Duolingo — 多语言打卡学习

| 项目 | 内容 |
|------|------|
| **App 目标** | 课程打卡、技能树、连续天数(streak)、XP、打卡记录 |
| **UI 显示名** | Duolingo |
| **代码目录名** | `Duolingo` |
| **manifest.id** | `'duolingo'` |
| **designViewportWidth** | 412 |
| **参考示例** | Spotify（顺序内容消费/queue/repeat → lesson queue、`AddToQueueAndPlay`、`SetSleepTimer`、streak/XP 数字 answer）、Weather（streak 数字 AnswerSheet、settings toggle + `_invert_criteria`）、Ebay（focused 小而美结构） |
| **主要页面** | 首页(技能树 path)、课程页(题目+进度)、个人页(streak/XP/成就)、商店页、排行榜页、设置页、每日任务页 |
| **主要实体** | Lesson(id/unit/skill/completed/xp)、Skill(id/name/level/lessons)、Streak(days/lastPracticeDate)、User(xp/streak/league)、Course(language)、DailyQuest |
| **world data** | 课程内容库(skill tree + lesson 题库)、语言列表、成就定义 |
| **runtime state** | user(xp/streak/league)、completedLessonIds、currentLesson、dailyProgress、settings(reminder/sound/streakProtection)、leaderboard |
| **benchmark 设计重点** | 完成课程(L2 operate)、查 streak 天数(L1)、查 XP(L1)、连续打卡激励开关(L2)、完成 N 课得 XP(L3)、排行榜查询(L2)、每日任务进度(L3) |
| **生成优先级** | **P1** — focused App，Spotify 范本充分 |
| **风险点** | streak 按 `TimeService.now()` 跨日判定；lesson 进度的 `expected_changes`（completedLessonIds/recentPlays 类）；streak 数字 grounded answer |

## 3. GoogleDrive — 海外云盘

| 项目 | 内容 |
|------|------|
| **App 目标** | 文件/文件夹浏览、搜索、筛选、收藏、分享、回收站、存储用量 |
| **UI 显示名** | Google Drive |
| **代码目录名** | `GoogleDrive` |
| **manifest.id** | `'googledrive'` |
| **designViewportWidth** | 412 |
| **参考示例** | Ebay（`products.json` 大数据集 + `filter_products`/`sort_products` 纯函数 + 搜索快照 + `check_has_snapshot`）、Map（搜索 + `geo:` deep-link 范式）、Spotify（`SearchAlbumInfo` 多字段 grounded answer） |
| **主要页面** | 首页(文件列表 tab：最近/星标/我的)、文件夹页、搜索页、文件详情页、回收站页、存储用量页、设置页、共享页 |
| **主要实体** | File(id/name/type/size/owner/modified/starred/shared/thumbnail)、Folder、SharedDrive、StorageUsage(used/total/byType) |
| **world data** | 大型文件数据集(参考 Ebay products.json 10000+ 条，放 `data/files.json`+`loader.ts`)、文件类型目录 |
| **runtime state** | files(overlay 删除/收藏/重命名/移动)、starredIds、recentSearches、trash、settings(viewMode/sortOption)、storageUsage、user |
| **benchmark 设计重点** | 文件搜索(L2)、按类型/大小/时间筛选计数(L3)、查文件大小(L1)、查总用量(L2)、收藏文件(L2)、删除到回收站(L2)、排序切换(L2)、两文件夹文件数比较(L3)、最近文件列表(L1) |
| **生成优先级** | **P1** — Ebay 范本直接，大数据集+搜索快照模式成熟 |
| **风险点** | 大文件数据集经 `loader.ts` 异步加载 + store action 暴露给 bench；文件大小/数量 grounded number answer；删除/收藏的 `expected_changes` 精确声明 |

## 4. Zhihu — 问答/内容社区

| 项目 | 内容 |
|------|------|
| **App 目标** | 关注流/推荐流、问答、文章、收藏夹、搜索、发布、个人页 |
| **UI 显示名** | 知乎 |
| **代码目录名** | `Zhihu` |
| **manifest.id** | `'zhihu'` |
| **designViewportWidth** | 412 |
| **参考示例** | Spotify（content list + like/follow + `CreateNewPlaylist`/`FilterLikedSongsToPlaylist` collections、`ListLibraryArtists` repeatable set AnswerSheet）、Wechat（post content `PostMomentsText`）、Weather（read-then-answer 结构字段 `WarmestDayInWeek`） |
| **主要页面** | 首页(推荐/关注 tab)、问题详情页、回答页、文章页、搜索页、收藏夹页、个人页、发布页、想法页 |
| **主要实体** | Question(id/title/answers/author)、Answer(id/question/author/content/votes)、Article(id/title/author/content)、User(id/name/following/followers)、Collection(收藏夹)、Comment |
| **world data** | 问题/回答/文章内容库(world data，参考 Spotify data/)、话题树、用户库 |
| **runtime state** | user、followedQuestionIds/followedAuthorIds、likedAnswerIds、collections(动态)、playHistory/recentViews、settings(notify/theme)、searchHistory、drafts |
| **benchmark 设计重点** | 查回答数(L1)、关注问题(L2)、点赞回答(L2)、收藏到夹(L2)、搜索内容(L2)、查收藏夹内容数(L3)、发布想法(L2)、比较两作者粉丝数(L3)、查最高赞回答(L3) |
| **生成优先级** | **P2** — Spotify content 范本充分，但内容库需准备 |
| **风险点** | 内容点赞/收藏的 id-diff 判定（参考 Spotify `customPlaylists`）；followedIds 与 followingCount 不可同存；repeatable set AnswerSheet |

## 5. ChinaMobile — 中国移动

| 项目 | 内容 |
|------|------|
| **App 目标** | 话费/流量/套餐查询与办理、账单、充值、积分、设置 |
| **UI 显示名** | 中国移动 |
| **代码目录名** | `ChinaMobile` |
| **manifest.id** | `'chinamobile'` |
| **designViewportWidth** | 412 |
| **参考示例** | Alipay（`rechargeCards`/`redeemRechargeCard` 充值卡 + bankCards + balance）、Railway12306（auth/SMS + `passengers` 管理 + `registerStateAdapter` + `memoSelector`）、Weather（settings toggle + `_invert_criteria` + unit picker）、Map（`ModifyMultiSettings` 多 settings toggle） |
| **主要页面** | 首页(用量 dashboard：话费/流量/套餐)、充值页、流量包办理页、账单页、套餐页、积分页、我的页、设置页(多分类) |
| **主要实体** | User(phone/balance/dataUsage/plan/points)、Plan(id/name/price/data/voice)、DataPackage、Bill(month/items)、Order、RechargeCard |
| **world data** | 套餐目录、流量包目录、账单模板、客服电话(SERVICE_PHONES 参考 Railway) |
| **runtime state** | user(balance/dataUsage/points)、activePlan、orders、bills、rechargeCards、settings(notification/theme)、searchHistory、auth |
| **benchmark 设计重点** | 查话费余额(L1)、查剩余流量(L1)、充值(L2)、办理流量包(L3)、查本月账单总额(L2)、积分查询(L1)、套餐变更(L3)、多设置开关(L2)、流量预警阈值(L2) |
| **生成优先级** | **P2** — Alipay 充值卡 + Railway auth 范本充分 |
| **风险点** | 用量 dashboard 按 `TimeService` 月周期重置；充值扣款/加流量的 balance 状态机；auth + SMS 验证码（参考 Railway SmsGateway） |

## 6. Cainiao — 菜鸟快递物流

| 项目 | 内容 |
|------|------|
| **App 目标** | 包裹查询、物流追踪、取件码、寄件、驿站、地址管理 |
| **UI 显示名** | 菜鸟 |
| **代码目录名** | `Cainiao` |
| **manifest.id** | `'cainiao'` |
| **designViewportWidth** | 412 |
| **参考示例** | Railway12306（搜索表单 from/to + searchHistory + `executeQuery` 异步 + `_temp` loading + `orders` 模型 + 确定性模拟）、Map（驿站 POI + `geo:` deep-link + `CheckDriveRoute`）、Weather（query+AnswerSheet + `ConditionalAction` 条件路由）、Alipay（`recordTransfer` 富交易模型） |
| **主要页面** | 首页(包裹列表+搜索)、包裹详情(物流时间线)、寄件页(表单+地址)、取件页(取件码+驿站列表)、驿站页(地图 POI 简化为列表)、地址管理页、我的页、扫码页 |
| **主要实体** | Package(id/trackingNo/carrier/status/from/to/events[]/eta)、Station(驿站 id/name/address/location/pickupCode)、Address、Carrier |
| **world data** | 快递公司列表(15+)、驿站 POI 数据、城市/地址数据、物流事件模板 |
| **runtime state** | packages[]、recentSearches、defaultAddress、settings(notification/pickup)、user、addressBook |
| **benchmark 设计重点** | 查包裹状态(L1)、物流事件追踪(L2)、查取件码(L2)、寄件填写(L3)、多包裹比较状态(L3)、驿站查询(L2)、条件路由("若已到站则提醒取件"参考 `ConditionalAction` L4)、地址管理(L2) |
| **生成优先级** | **P2** — 中等复杂度，Railway+Map 范本充分 |
| **风险点** | 物流时间线 UI 高保真；驿站地图简化为列表（不接真实 Google Maps，用 Map 的 POI 列表模式）；扫码模拟；确定性物流事件序列（参考 Railway availabilityGenerator） |

## 7. Gmail — 海外邮箱

| 项目 | 内容 |
|------|------|
| **App 目标** | 收件箱、邮件线程、撰写、标签、搜索、归档、设置、账户 |
| **UI 显示名** | Gmail |
| **代码目录名** | `Gmail` |
| **manifest.id** | `'gmail'` |
| **designViewportWidth** | 412 |
| **参考示例** | Wechat（chat-thread/message 判定 `new_sent_texts_to` id-diff + 条件回复 `ConditionalReplyToBoss` + label/blacklist `BlacklistContact` + auth + `ReadMyWxid` profile 读字段）、Spotify（`SearchAlbumInfo` 多字段 grounded answer：线程数+最后发件人）、Railway12306（auth + SMS） |
| **主要页面** | 收件箱(分类 tab：主要/社交/推广)、线程详情页、撰写页、标签管理页、搜索页、设置页、账户页、星标页 |
| **主要实体** | Thread(id/subject/lastSender/messages[]/labels/starred/unread)、Email(id/thread/from/to/subject/body/attachments/time)、Label、Contact、Attachment |
| **world data** | 邮件内容库(world data 线程/邮件，参考 Wechat data/)、标签目录、联系人库 |
| **runtime state** | threads(overlay 已读/星标/归档/标签)、drafts、labels、starredThreadIds、searchHistory、settings(inboxType/threadsDensity/notification)、user、auth |
| **benchmark 设计重点** | 查未读数(L1)、查线程数(L1)、标星(L2)、归档线程(L2)、打标签(L2)、撰写发送(L2)、条件回复("若 Boss 问过 X 则回 Y" L3)、搜索邮件(L2)、查线程最后发件人(L1)、多标签过滤计数(L3) |
| **生成优先级** | **P3** — Wechat 范本充分但需线程模型 |
| **风险点** | 线程消息 id-diff 判定（参考 Wechat `new_sent_texts_to`）；撰写/发送的 `expected_changes`（drafts/threads）；标签 list-find 判定 `BlacklistContact` 范式；auth |

## 8. Telegram — 海外通讯工具

| 项目 | 内容 |
|------|------|
| **App 目标** | 聊天、联系人、频道、群组、消息发送/转发、设置、账户 |
| **UI 显示名** | Telegram |
| **代码目录名** | `Telegram` |
| **manifest.id** | `'telegram'` |
| **designViewportWidth** | 412 |
| **参考示例** | Wechat（chat list/detail/message send 判定/contact 权限/blacklist/message→feed 转移 `ConditionalReplyToBoss`/`PostMomentFromChat` + auth + share-intent + `SEARCHABLE_FEATURES` gated features）、Weather（settings toggle）、Railway12306（auth + SMS + device-trust） |
| **主要页面** | 聊天列表页、聊天详情页、联系人页、频道页、新建聊天页、设置页、个人资料页、转发分享页 |
| **主要实体** | Chat(id/type(private/group/channel)/peer/lastMessage/messages[])、Message(id/chat/sender/type/content/time)、User/Contact、Channel、Draft |
| **world data** | 消息内容库(world data，参考 Wechat data/)、频道内容库、联系人库 |
| **runtime state** | chats(消息增)、contacts(blocklist/mute)、messages、drafts、settings(notification/privacy/theme)、authorizedApps、searchHistory、user、auth |
| **benchmark 设计重点** | 查未读数(L1)、发消息(L2)、转发消息(L2)、屏蔽联系人(L2)、静音会话(L2)、条件回复(L3)、查联系人资料(L1)、频道消息查询(L2)、搜索消息(L2)、消息→频道转发(L3) |
| **生成优先级** | **P3** — Wechat 范本最充分（几乎 1:1），但状态复杂 |
| **风险点** | 直接复刻 Wechat 消息写入 id-diff 判定；频道 vs 私聊差异；auth + SMS；`SEARCHABLE_FEATURES` gated feature 模式 |

## 9. Didi — 滴滴出行网约车

| 项目 | 内容 |
|------|------|
| **App 目标** | 打车叫车、路线规划、行程管理、支付、优惠券 |
| **UI 显示名** | 滴滴出行 |
| **代码目录名** | `Didi` |
| **manifest.id** | `'didi'` |
| **designViewportWidth** | 412 |
| **参考示例** | Map（地点搜索/route mode/最近/最高评 `CheckHighestRatedPlace`/`CheckDriveRoute`/`EstimateDrivingCost` 1:1 映射起终点+估价）、Railway12306（`executeQuery` 异步 + `_temp` loading + 订单全链路 + 确定性可订性 + `AuthGuard`）、Alipay（`AmountKeyboard`+`PaymentPasswordModal` 出行支付） |
| **主要页面** | 首页(地图+起终点输入)、路线规划页(车型选择+估价)、确认下单页、行程进行中页、行程历史页、我的页、支付页、优惠券页 |
| **主要实体** | Trip(id/from/to/serviceType/fare/status/driver/eta)、Driver(name/rating/plate)、Place、ServiceType(快车/专车/出租)、Payment、Coupon |
| **world data** | 城市/地点 POI(参考 Map places.json)、车型目录、费率规则、司机库 |
| **runtime state** | trips[]、currentTrip、recentPlaces、coupons、paymentMethods、settings、user、searchHistory |
| **benchmark 设计重点** | 查最近行程(L1)、规划路线估价(L2)、下单叫车(L3)、查行程费用(L1)、查司机信息(L2)、选车型(L2)、用优惠券(L3)、条件叫车("若快车>估价 X 则叫专车" L4)、行程历史查询(L2) |
| **生成优先级** | **P3** — Map+Railway 范本充分，但路线+订单全链路复杂 |
| **风险点** | 地图简化为列表/静态 POI（不接真实 Google Maps，复用 Map 离线瓦片或简化）；确定性估价（参考 Railway availabilityGenerator PRNG 模拟）；行程状态机（下单→进行中→完成）；`AmountKeyboard` 复用 |

## 10. Amazon — 全球综合电商

| 项目 | 内容 |
|------|------|
| **App 目标** | 商品搜索/详情/购物车/下单/订单/评价/账户 |
| **UI 显示名** | Amazon |
| **代码目录名** | `Amazon` |
| **manifest.id** | `'amazon'` |
| **designViewportWidth** | 412 |
| **参考示例** | Ebay（`EbaySearchSnapshot`+`lastCompare` 搜索快照 + `products.json` 大数据集 + `filter_products`/`sort_products` + `check_has_snapshot` + `build_compare_counts_checks` 几乎 1:1）、Spotify（`SearchBuildPlaylistAndPlay` search→add→checkout 复合流）、Railway12306（`orders` 订单模型 + 退款流程） |
| **主要页面** | 首页、搜索页、商品详情页、分类页、购物车页、结算页、订单页、我的页、评价页、设置页 |
| **主要实体** | Product(id/title/brand/price/rating/images/category)、Category、Cart(items)、Order(id/items/status/total)、Address、Review |
| **world data** | 商品大数据集(参考 Ebay products.json 10000+，放 `data/products.json`+`loader.ts`)、分类树、评价库 |
| **runtime state** | cart、orders、savedItems(wishlist)、recentSearches、addresses、search(current/history/lastCompare 参考 Ebay)、settings、user |
| **benchmark 设计重点** | 商品搜索(L2)、按品牌/价格/评分筛选计数(L3)、查最便宜商品(L4)、两商品比价(L3)、加购物车(L2)、下单(L3)、查订单状态(L1)、查购物车商品数(L1)、两分类商品数比较(L3)、收藏商品(L2)、排序切换(L2)、查最高评商品(L3) |
| **生成优先级** | **P3** — Ebay 范本几乎 1:1，但需 10000+ 商品数据集 |
| **风险点** | 大商品数据集 `loader.ts` 异步 + store action 暴露 bench；搜索快照 `EbaySearchSnapshot` 复刻；`expected_changes` 恒含 `["search.current","search.history","search.lastCompare","recentSearches"]`；订单状态机 |

---

## 推荐生成顺序

```
P0: Wallet          (最简，Alipay bankCards 直接复用)
P1: Duolingo        (Spotify focused 范本)
P1: GoogleDrive     (Ebay 大数据集+搜索范本)
P2: Zhihu           (Spotify content 范本)
P2: ChinaMobile     (Alipay 充值 + Railway auth)
P2: Cainiao         (Railway 搜索+Map POI)
P3: Gmail           (Wechat thread 范本)
P3: Telegram        (Wechat 1:1 范本)
P3: Didi            (Map+Railway 路线+订单)
P3: Amazon          (Ebay 1:1 范本，需大数据集)
```

顺序理由：从简到繁、参考充分度优先。Wallet 最快验证生成流程；Duolingo/GoogleDrive 复用单一范本；Zhihu/ChinaMobile/Cainiao 需准备内容库/数据但范本清晰；Gmail/Telegram 复刻 Wechat 线程模型但状态复杂；Didi/Amazon 范本最 1:1 但需大地图/商品数据集与全链路状态机。

## 下一步建议

**先生成 Wallet**：结构最简（card list + detail + add），直接复用 Alipay `bankCards`/`RealisticQRCode`/`intentFilters` ACTION_PAY，能在最少代码量内跑通"App 生成 → nav artifacts → benchmark suite"全流程，验证 `APP_GENERATION_PROMPT_TEMPLATE.md` + `APP_VALIDATION_PROTOCOL.md` 是否完备，再批量推进后续 App。
