import type { NavigationDeclaration } from './navigation.types';
const MAIN_SCROLL = [{ name: 'main', direction: 'vertical', description: '页面主滚动容器' }] as const;
export const NAVIGATION_DECLARATION = {
    app: 'wallet',
    routes: [
        { path: '/', component: 'WalletHome', params: {}, entryPoint: 'home', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.home.base',
                    search: {},
                    description: '卡包首页',
                    actions: []
                }], queryParams: {}, description: '卡包首页与分类入口' },
        { path: '/bank-cards', component: 'BankCards', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.bankCards.base',
                    search: {},
                    description: '银行卡列表',
                    actions: [
                        {
                            id: 'wallet.bankCards.item.default',
                            label: '设为默认',
                            behavior: 'other',
                            paramsSchema: { cardId: 'string' },
                            scope: 'item'
                        },
                        {
                            id: 'wallet.bankCards.item.freeze',
                            label: '冻解银行卡',
                            behavior: 'toggle',
                            paramsSchema: { cardId: 'string' },
                            scope: 'item'
                        },
                        {
                            id: 'wallet.bankCards.item.moveUp',
                            label: '上移',
                            behavior: 'other',
                            paramsSchema: { cardId: 'string' },
                            scope: 'item'
                        },
                        {
                            id: 'wallet.bankCards.item.moveDown',
                            label: '下移',
                            behavior: 'other',
                            paramsSchema: { cardId: 'string' },
                            scope: 'item'
                        },
                        {
                            id: 'wallet.bankCards.item.moveTop',
                            label: '置顶',
                            behavior: 'other',
                            paramsSchema: { cardId: 'string' },
                            scope: 'item'
                        },
                    ]
                }], queryParams: {}, description: '银行卡列表与排序操作' },
        { path: '/bank-cards/:id', component: 'BankCardDetail', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.bankCardDetail.base',
                    search: {},
                    description: '银行卡详情',
                    actions: [
                        {
                            id: 'wallet.bankCardDetail.default',
                            label: '设为默认',
                            behavior: 'other',
                            paramsSchema: { cardId: 'string' }
                        },
                        {
                            id: 'wallet.bankCardDetail.freeze',
                            label: '冻解银行卡',
                            behavior: 'toggle',
                            paramsSchema: { cardId: 'string' }
                        },
                    ]
                }], queryParams: {}, description: '银行卡完整信息与操作' },
        { path: '/bank-cards/:id/edit', component: 'EditBankCard', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.editBankCard.base',
                    search: {},
                    description: '重命名银行卡',
                    actions: [{
                            id: 'wallet.editBankCard.submit',
                            label: '保存昵称',
                            behavior: 'submit',
                            paramsSchema: { cardId: 'string', value: 'string' }
                        }]
                }], queryParams: {}, description: '银行卡编辑页' },
        { path: '/bank-cards/:id/delete', component: 'DeleteBankCard', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.deleteBankCard.base',
                    search: {},
                    description: '删除确认',
                    actions: [{
                            id: 'wallet.deleteBankCard.confirm',
                            label: '确认删除',
                            behavior: 'submit',
                            paramsSchema: { cardId: 'string' }
                        }]
                }], queryParams: {}, description: '独立删除确认页' },
        { path: '/bank-cards/add', component: 'AddBankCard', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.addBankCard.base',
                    search: {},
                    description: '添加银行卡',
                    actions: [{
                            id: 'wallet.addBankCard.submit',
                            label: '添加银行卡',
                            behavior: 'submit'
                        }]
                }], queryParams: {}, description: '银行卡添加表单' },
        { path: '/transit-cards', component: 'TransitCards', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.transitCards.base',
                    search: {},
                    description: '交通卡列表',
                    actions: []
                }], queryParams: {}, description: '交通卡列表' },
        { path: '/transit-cards/:id', component: 'TransitCardDetail', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.transitCardDetail.base',
                    search: {},
                    description: '交通卡详情',
                    actions: [{
                            id: 'wallet.transitCardDetail.recharge50',
                            label: '充值50元',
                            behavior: 'submit',
                            paramsSchema: { cardId: 'string' }
                        }, {
                            id: 'wallet.transitCardDetail.recharge100',
                            label: '充值100元',
                            behavior: 'submit',
                            paramsSchema: { cardId: 'string' }
                        }]
                }], queryParams: {}, description: '交通卡余额、充值和记录' },
        { path: '/transit-cards/add', component: 'AddTransitCard', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.addTransitCard.base',
                    search: {},
                    description: '添加交通卡',
                    actions: [{
                            id: 'wallet.addTransitCard.submit',
                            label: '添加交通卡',
                            behavior: 'submit'
                        }]
                }], queryParams: {}, description: '交通卡添加表单' },
        { path: '/membership-cards', component: 'MembershipCards', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.membershipCards.base',
                    search: {},
                    description: '会员卡列表',
                    actions: []
                }], queryParams: {}, description: '会员卡列表' },
        { path: '/membership-cards/:id', component: 'MembershipDetail', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.membershipDetail.base',
                    search: {},
                    description: '会员卡详情',
                    actions: []
                }], queryParams: {}, description: '会员号、积分和兑换记录' },
        { path: '/membership-cards/add', component: 'AddMembership', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.addMembership.base',
                    search: {},
                    description: '添加会员卡',
                    actions: [{
                            id: 'wallet.addMembership.submit',
                            label: '添加会员卡',
                            behavior: 'submit'
                        }]
                }], queryParams: {}, description: '会员卡添加表单' },
        { path: '/rewards/:id', component: 'Rewards', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.rewards.base',
                    search: {},
                    description: '积分奖励',
                    actions: [{
                            id: 'wallet.rewards.item.redeem',
                            label: '兑换奖励',
                            behavior: 'submit',
                            paramsSchema: { cardId: 'string', rewardId: 'string' },
                            scope: 'item'
                        }]
                }], queryParams: {}, description: '会员卡积分奖励列表' },
        { path: '/coupons', component: 'Coupons', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.coupons.base',
                    search: {},
                    description: '优惠券列表',
                    actions: []
                }], queryParams: {}, description: '优惠券列表' },
        { path: '/coupons/:id', component: 'CouponDetail', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.couponDetail.base',
                    search: {},
                    description: '优惠券详情',
                    actions: [{
                            id: 'wallet.couponDetail.redeem',
                            label: '核销优惠券',
                            behavior: 'submit',
                            paramsSchema: { couponId: 'string' }
                        }]
                }], queryParams: {}, description: '优惠券代码与核销状态' },
        { path: '/coupons/add', component: 'AddCoupon', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.addCoupon.base',
                    search: {},
                    description: '添加优惠券',
                    actions: [{
                            id: 'wallet.addCoupon.submit',
                            label: '添加优惠券',
                            behavior: 'submit'
                        }]
                }], queryParams: {}, description: '优惠券添加表单' },
        { path: '/expired-tickets', component: 'ExpiredTickets', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.expiredTickets.base',
                    search: {},
                    description: '过期票券',
                    actions: [{
                            id: 'wallet.expiredTickets.item.archive',
                            label: '归档票券',
                            behavior: 'other',
                            paramsSchema: { ticketId: 'string' },
                            scope: 'item'
                        }]
                }], queryParams: {}, description: '可归档的过期票券' },
        { path: '/archived-tickets', component: 'ArchivedTickets', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.archivedTickets.base',
                    search: {},
                    description: '已归档票券',
                    actions: []
                }], queryParams: {}, description: '已归档票券列表' },
        { path: '/search', component: 'Search', params: {}, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{
                    id: 'wallet.search.base',
                    search: {},
                    description: '全局搜索',
                    actions: [{
                            id: 'wallet.search.input',
                            label: '输入搜索词',
                            behavior: 'input',
                            paramsSchema: { value: 'string' }
                        }, {
                            id: 'wallet.search.clear',
                            label: '清除搜索词',
                            behavior: 'other'
                        }]
                }], queryParams: {}, description: '独立全局搜索页' },
        { path: '/code/bank/:id', component: 'BarcodeOrQRCode', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{ id: 'wallet.codeBank.base', search: {}, description: '银行卡码', actions: [] }], queryParams: {}, description: '银行卡条码或二维码' },
        { path: '/code/transit/:id', component: 'BarcodeOrQRCode', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{ id: 'wallet.codeTransit.base', search: {}, description: '交通卡码', actions: [] }], queryParams: {}, description: '交通卡条码或二维码' },
        { path: '/code/membership/:id', component: 'BarcodeOrQRCode', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{ id: 'wallet.codeMembership.base', search: {}, description: '会员卡码', actions: [] }], queryParams: {}, description: '会员卡条码或二维码' },
        { path: '/code/coupon/:id', component: 'BarcodeOrQRCode', params: { id: 'string' }, entryPoint: 'none', scrollContainers: MAIN_SCROLL, uiStates: [{ id: 'wallet.codeCoupon.base', search: {}, description: '优惠券码', actions: [] }], queryParams: {}, description: '优惠券条码或二维码' },
    ],
    transitions: [
        {
            id: 'wallet.home.bankCards.open',
            from: '/',
            to: '/bank-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开银行卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.home.transitCards.open',
            from: '/',
            to: '/transit-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开交通卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.home.membershipCards.open',
            from: '/',
            to: '/membership-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开会员卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.home.coupons.open',
            from: '/',
            to: '/coupons',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开优惠券',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.home.expiredTickets.open',
            from: '/',
            to: '/expired-tickets',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开过期票券',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.home.search.open',
            from: '/',
            to: '/search',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开搜索',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.bankCards.home',
            from: '/bank-cards',
            to: '/',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回卡包首页',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.bankCards.item.open',
            from: '/bank-cards',
            to: '/bank-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开银行卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.bankCards.add.open',
            from: '/bank-cards',
            to: '/bank-cards/add',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开添加银行卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.bankCardDetail.bankCards',
            from: '/bank-cards/:id',
            to: '/bank-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回银行卡列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.bankCardDetail.edit.open',
            from: '/bank-cards/:id',
            to: '/bank-cards/:id/edit',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开银行卡编辑',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.bankCardDetail.delete.open',
            from: '/bank-cards/:id',
            to: '/bank-cards/:id/delete',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开银行卡删除确认',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.bankCardDetail.code.open',
            from: '/bank-cards/:id',
            to: '/code/bank/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开银行卡码',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.editBankCard.detail',
            from: '/bank-cards/:id/edit',
            to: '/bank-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '返回银行卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.addBankCard.bankCards',
            from: '/bank-cards/add',
            to: '/bank-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回银行卡列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.deleteBankCard.detail',
            from: '/bank-cards/:id/delete',
            to: '/bank-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '取消删除并返回详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.deleteBankCard.bankCards',
            from: '/bank-cards/:id/delete',
            to: '/bank-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '删除后返回列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.transitCards.home',
            from: '/transit-cards',
            to: '/',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回卡包首页',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.transitCards.item.open',
            from: '/transit-cards',
            to: '/transit-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开交通卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.transitCards.add.open',
            from: '/transit-cards',
            to: '/transit-cards/add',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开添加交通卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.transitCardDetail.transitCards',
            from: '/transit-cards/:id',
            to: '/transit-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回交通卡列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.transitCardDetail.code.open',
            from: '/transit-cards/:id',
            to: '/code/transit/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开交通卡码',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.addTransitCard.transitCards',
            from: '/transit-cards/add',
            to: '/transit-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回交通卡列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.membershipCards.home',
            from: '/membership-cards',
            to: '/',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回卡包首页',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.membershipCards.item.open',
            from: '/membership-cards',
            to: '/membership-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开会员卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.membershipCards.add.open',
            from: '/membership-cards',
            to: '/membership-cards/add',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开添加会员卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.membershipDetail.membershipCards',
            from: '/membership-cards/:id',
            to: '/membership-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回会员卡列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.membershipDetail.rewards.open',
            from: '/membership-cards/:id',
            to: '/rewards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开积分奖励',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.membershipDetail.code.open',
            from: '/membership-cards/:id',
            to: '/code/membership/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开会员卡码',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.addMembership.membershipCards',
            from: '/membership-cards/add',
            to: '/membership-cards',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回会员卡列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.rewards.membershipDetail',
            from: '/rewards/:id',
            to: '/membership-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '返回会员卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.coupons.home',
            from: '/coupons',
            to: '/',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回卡包首页',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.coupons.item.open',
            from: '/coupons',
            to: '/coupons/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开优惠券详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.coupons.add.open',
            from: '/coupons',
            to: '/coupons/add',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开添加优惠券',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.couponDetail.coupons',
            from: '/coupons/:id',
            to: '/coupons',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回优惠券列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.couponDetail.code.open',
            from: '/coupons/:id',
            to: '/code/coupon/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开优惠券码',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.addCoupon.coupons',
            from: '/coupons/add',
            to: '/coupons',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回优惠券列表',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.expiredTickets.home',
            from: '/expired-tickets',
            to: '/',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回卡包首页',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.expiredTickets.archived.open',
            from: '/expired-tickets',
            to: '/archived-tickets',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '打开已归档票券',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.archivedTickets.expiredTickets',
            from: '/archived-tickets',
            to: '/expired-tickets',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '返回过期票券',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.search.home',
            from: '/search',
            to: '/',
            search: {},
            searchParams: {},
            mode: "push",
            params: {},
            label: '取消搜索并返回首页',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.search.bankCard.open',
            from: '/search',
            to: '/bank-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开搜索到的银行卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.search.transitCard.open',
            from: '/search',
            to: '/transit-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开搜索到的交通卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.search.membership.open',
            from: '/search',
            to: '/membership-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开搜索到的会员卡',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.search.coupon.open',
            from: '/search',
            to: '/coupons/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '打开搜索到的优惠券',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.code.bankCardDetail',
            from: '/code/bank/:id',
            to: '/bank-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '返回银行卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.code.transitCardDetail',
            from: '/code/transit/:id',
            to: '/transit-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '返回交通卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.code.membershipDetail',
            from: '/code/membership/:id',
            to: '/membership-cards/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '返回会员卡详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
        {
            id: 'wallet.code.couponDetail',
            from: '/code/coupon/:id',
            to: '/coupons/:id',
            search: {},
            searchParams: {},
            mode: "push",
            params: { id: 'string' },
            label: '返回优惠券详情',
            ui: {
                placement: "content",
                icon: "",
                gesture: "tap"
            }
        },
    ],
    capabilities: { historyBack: false },
} as const satisfies NavigationDeclaration;
export type TransitionId = typeof NAVIGATION_DECLARATION.transitions[number]['id'];
