import type { StringKey } from './strings';

export const stringsEn: Partial<Record<StringKey, string>> = {
  appName: 'Wallet', home: 'Wallet', coupons: 'Coupons', me: 'Me', search: 'Search', searchPlaceholder: 'Search cards, merchants, or codes', clear: 'Clear',
  addCard: 'Add Card', addBankCard: 'Add Bank Card', addTransitCard: 'Add Transit Card', addMembershipCard: 'Add Membership', addCoupon: 'Add Coupon',
  bankCards: 'Bank Cards', transitCards: 'Transit Cards', membershipCards: 'Membership', couponsTitle: 'Coupons', ticketsTitle: 'Expired Tickets', archivedTickets: 'Archived Tickets',
  rewards: 'Rewards', defaultCard: 'Default', setDefault: 'Set as Default', rename: 'Rename', editBankCard: 'Edit Bank Card', freeze: 'Freeze', frozen: 'Frozen', unfreeze: 'Unfreeze', active: 'Active',
  delete: 'Delete', deleteBankCard: 'Delete Bank Card', confirmDelete: 'Confirm Delete', deleteConfirmMessage: 'This bank card cannot be restored after deletion. Delete it?',
  cancel: 'Cancel', confirm: 'Confirm', submit: 'Submit', save: 'Save', back: 'Back', done: 'Done',
  cardName: 'Card Nickname', bankName: 'Bank', cardHolder: 'Card Holder', last4: 'Last 4 Digits', cardNumber: 'Simulated Card Number', maskedNumber: 'Card Number', cardType: 'Card Type', debitCard: 'Debit', creditCard: 'Credit',
  memberNumber: 'Member Number', city: 'City', merchant: 'Merchant', couponCode: 'Coupon Code', value: 'Value', expiry: 'Valid Until',
  points: 'Points', balance: 'Balance', recharge: 'Recharge', rechargeAmount: 'Recharge Amount', rechargeRecords: 'Recharge History', noRechargeRecords: 'No recharge history',
  redeem: 'Redeem', redeemed: 'Redeemed', reward: 'Reward', redeemReward: 'Redeem', redemptionRecords: 'Redemption History', alreadyRedeemed: 'Redeemed', notEnoughPoints: 'Not enough points',
  archive: 'Archive', archived: 'Archived', showCode: 'Show Barcode or QR Code', barcodeOrQRCode: 'Barcode or QR Code', barcode: 'Barcode', qrcode: 'QR Code',
  noResults: 'No matching results', emptyState: 'Nothing here yet', noBankCards: 'No bank cards', noTransitCards: 'No transit cards', noMembershipCards: 'No membership cards', noCoupons: 'No coupons', noExpiredTickets: 'No tickets to archive', noArchivedTickets: 'No archived tickets',
  cardDetail: 'Card Detail', bankCardDetail: 'Bank Card Details', transitCardDetail: 'Transit Card Details', membershipDetail: 'Membership Details', couponDetail: 'Coupon Details',
  issuer: 'Issuer', holder: 'Card Holder', status: 'Status', metadata: 'Simulated Card Metadata', network: 'Network', verification: 'Verification', issuedAt: 'Simulated Issue Date', device: 'Bound Device', cardNetworkValue: 'UnionPay', verificationValue: 'Device Verification', issuedAtValue: 'Jan 1, 2024', deviceValue: 'MobileGym Simulated Device',
  sortCards: 'Sort Bank Cards', moveUp: 'Move Up', moveDown: 'Move Down', moveTop: 'Move to Top',
  quickAccess: 'Quick Access', manageCards: 'Manage Cards', requiredFields: 'Complete all required fields', invalidLast4: 'Enter four digits', invalidAmount: 'Enter a valid amount',
  recharge50: 'Recharge ¥50', recharge100: 'Recharge ¥100', rewardsForCard: 'Available Rewards', transactionRecharge: 'Recharge', transactionRedeem: 'Redeem',
  searchHint: 'Results update as you type', searchCards: 'Cards', searchCoupons: 'Coupons', searchTickets: 'Tickets', recentSearches: 'Recent Searches',
  couponAvailable: 'Available', couponExpired: 'Expired', expiryInputHint: 'YYYY-MM-DD', valueYuan: 'CNY',
  settings: 'Settings', notifications: 'Notifications', theme: 'Theme', sort: 'Sort', filterAll: 'All',
};
