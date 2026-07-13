export const strings = {
  appName: '卡包', home: '卡包', coupons: '优惠券', me: '我的', search: '搜索', searchPlaceholder: '搜索卡片、商家或券码', clear: '清除',
  addCard: '添加卡片', addBankCard: '添加银行卡', addTransitCard: '添加交通卡', addMembershipCard: '添加会员卡', addCoupon: '添加优惠券',
  bankCards: '银行卡', transitCards: '交通卡', membershipCards: '会员卡', couponsTitle: '优惠券', ticketsTitle: '过期票券', archivedTickets: '已归档票券',
  rewards: '积分奖励', defaultCard: '默认', setDefault: '设为默认', rename: '重命名', editBankCard: '编辑银行卡', freeze: '冻结', frozen: '已冻结', unfreeze: '解冻', active: '可用',
  delete: '删除', deleteBankCard: '删除银行卡', confirmDelete: '确认删除', deleteConfirmMessage: '删除后无法恢复，请确认是否删除这张银行卡。',
  cancel: '取消', confirm: '确认', submit: '提交', save: '保存', back: '返回', done: '完成',
  cardName: '卡片昵称', bankName: '发卡银行', cardHolder: '持卡人', last4: '卡号后四位', cardNumber: '模拟卡号', maskedNumber: '卡号', cardType: '卡类型', debitCard: '借记卡', creditCard: '信用卡',
  memberNumber: '会员号', city: '城市', merchant: '商家', couponCode: '优惠券代码', value: '面值', expiry: '有效期至',
  points: '积分', balance: '余额', recharge: '充值', rechargeAmount: '充值金额', rechargeRecords: '充值记录', noRechargeRecords: '暂无充值记录',
  redeem: '核销', redeemed: '已核销', reward: '奖励', redeemReward: '兑换', redemptionRecords: '兑换记录', alreadyRedeemed: '已兑换', notEnoughPoints: '积分不足',
  archive: '归档', archived: '已归档', showCode: '显示条码或二维码', barcodeOrQRCode: '条码或二维码', barcode: '条码', qrcode: '二维码',
  noResults: '没有匹配结果', emptyState: '这里还没有内容', noBankCards: '还没有银行卡', noTransitCards: '还没有交通卡', noMembershipCards: '还没有会员卡', noCoupons: '还没有优惠券', noExpiredTickets: '没有待归档票券', noArchivedTickets: '没有已归档票券',
  cardDetail: '卡片详情', bankCardDetail: '银行卡详情', transitCardDetail: '交通卡详情', membershipDetail: '会员卡详情', couponDetail: '优惠券详情',
  issuer: '发行方', holder: '持卡人', status: '状态', metadata: '模拟卡片信息', network: '卡组织', verification: '验证方式', issuedAt: '模拟发行日期', device: '绑定设备', cardNetworkValue: '银联', verificationValue: '设备验证', issuedAtValue: '2024年1月1日', deviceValue: 'MobileGym 模拟设备',
  sortCards: '银行卡排序', moveUp: '上移', moveDown: '下移', moveTop: '置顶',
  quickAccess: '快捷入口', manageCards: '管理卡片', requiredFields: '请完整填写必填信息', invalidLast4: '请输入四位数字', invalidAmount: '请输入有效金额',
  recharge50: '充值 ¥50', recharge100: '充值 ¥100', rewardsForCard: '可兑换奖励', transactionRecharge: '充值', transactionRedeem: '兑换',
  searchHint: '输入关键词后自动展示结果', searchCards: '卡片', searchCoupons: '优惠券', searchTickets: '票券', recentSearches: '最近搜索',
  couponAvailable: '可使用', couponExpired: '已过期', expiryInputHint: 'YYYY-MM-DD', valueYuan: '元',
  settings: '设置', notifications: '通知', theme: '主题', sort: '排序', filterAll: '全部',
} as const;

export type StringKey = keyof typeof strings;
