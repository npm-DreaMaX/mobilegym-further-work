import React, { useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import {
  IcNavBack,
  IcLocation,
  IcCoupon,
  IcTruck,
  IcNavForward,
  IcTag,
  IcCircle,
} from '../res/icons';
import type { Coupon } from '../types';
import { TAOBAO_CONFIG } from '../data';

const CheckoutPage: React.FC = () => {
  const { bindTap, bindBack, go, back } = useTaobaoGestures();
  const s = useTaobaoStrings();
  const [searchParams, setSearchParams] = useSearchParams();

  // Store state
  const checkoutDraft = useTaobaoStore(st => st.checkoutDraft);
  const addresses = useTaobaoStore(st => st.addresses);
  const products = useTaobaoStore(st => st.products);
  const skus = useTaobaoStore(st => st.skus);
  const userCoupons = useTaobaoStore(st => st.userCoupons);
  const setCheckoutDraft = useTaobaoStore(st => st.setCheckoutDraft);
  const submitOrder = useTaobaoStore(st => st.submitOrder);

  // Check for selected address from URL (when returning from /addresses?select=true)
  const selectedAddressId = searchParams.get('selectedAddress');
  useEffect(() => {
    if (selectedAddressId) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) {
        setCheckoutDraft({ addressId: selectedAddressId });
        // Clean up the URL
        setSearchParams({}, { replace: true });
      }
    }
  }, [selectedAddressId, addresses, setCheckoutDraft, setSearchParams]);

  // Also read from checkoutDraft if it was set by initCheckoutFromCart or elsewhere
  const selectedAddress = useMemo(() => {
    if (!checkoutDraft.addressId) return null;
    return addresses.find(a => a.id === checkoutDraft.addressId) || null;
  }, [checkoutDraft.addressId, addresses]);

  // Check for selected coupon from URL (when returning from /coupons?select=true)
  const selectedCouponId = searchParams.get('selectedCoupon');
  useEffect(() => {
    if (selectedCouponId) {
      setCheckoutDraft({ couponId: selectedCouponId });
      setSearchParams({}, { replace: true });
    }
  }, [selectedCouponId, setCheckoutDraft, setSearchParams]);

  const selectedCoupon = useMemo(() => {
    if (!checkoutDraft.couponId) return null;
    const allCoupons = (TAOBAO_CONFIG as any).coupons || {};
    return allCoupons[checkoutDraft.couponId] as Coupon | undefined;
  }, [checkoutDraft.couponId]);

  // Build item details from draft
  const checkoutItems = useMemo(() => {
    return checkoutDraft.items.map(item => {
      const product = products[item.productId];
      const sku = skus[item.skuId];
      return {
        ...item,
        productTitle: product?.title ?? '未知商品',
        skuAttrs: sku?.attributes ?? {},
        subtotal: item.unitPrice * item.quantity,
      };
    });
  }, [checkoutDraft.items, products, skus]);

  // Calculate totals
  const { subtotal, shippingFee, discount, payable } = useMemo(() => {
    const sub = checkoutItems.reduce((sum, item) => sum + item.subtotal, 0);
    const ship = 0; // Standard shipping free

    let disc = 0;
    if (selectedCoupon && sub >= selectedCoupon.threshold) {
      disc = selectedCoupon.discount;
    }

    return {
      subtotal: sub,
      shippingFee: ship,
      discount: disc,
      payable: Math.max(0, sub + ship - disc),
    };
  }, [checkoutItems, selectedCoupon]);

  const canSubmit = checkoutDraft.addressId !== null && checkoutItems.length > 0;

  const handleSubmitOrder = () => {
    if (!canSubmit) return;
    const newOrder = submitOrder();
    // Navigate to payment page after successful order
    // Use a small timeout to let the store update
    setTimeout(() => {
      const orderId = useTaobaoStore.getState().orders.slice(-1)[0]?.id;
      if (orderId) {
        go('checkout.payment.open', { orderId });
      }
    }, 50);
  };

  const handleSelectAddress = () => {
    go('checkout.address.select.open');
  };

  const handleSelectCoupon = () => {
    go('checkout.coupon.select.open');
  };

  const formatSkuAttrs = (attrs: Record<string, string>): string => {
    return Object.values(attrs).join(', ');
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Top bar */}
      <div className="pt-10 px-4 pb-3 bg-white flex items-center border-b border-gray-100">
        <div {...bindBack()} className="p-1 cursor-pointer mr-3">
          <IcNavBack size={22} className="text-gray-700" />
        </div>
        <h1 className="text-lg font-medium text-gray-800">{s.checkout_title}</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-24"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Address section */}
        <div
          className="bg-white mt-2 px-4 py-4 flex items-start gap-3 cursor-pointer"
          onClick={handleSelectAddress}
          data-action="checkout.address.select.open"
        >
          <IcLocation size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {selectedAddress ? (
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-800">{selectedAddress.name}</span>
                  <span className="text-xs text-gray-500">{selectedAddress.phone}</span>
                  {selectedAddress.isDefault && (
                    <span className="text-[10px] text-app-primary border border-app-primary rounded px-1">
                      {s.address_default}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedAddress.province}{selectedAddress.city}{selectedAddress.district} {selectedAddress.detail}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-800">{s.checkout_address}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.checkout_address_required}</p>
              </div>
            )}
          </div>
          <IcNavForward size={16} className="text-gray-300 flex-shrink-0 mt-1" />
        </div>

        {/* Items section */}
        <div className="bg-white mt-2 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">{s.checkout_items}</h3>
          {checkoutItems.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">{s.checkout_empty}</p>
          ) : (
            <div className="space-y-3">
              {checkoutItems.map((item, idx) => {
                const attrText = formatSkuAttrs(item.skuAttrs);
                return (
                  <div key={item.cartItemId || idx} className="flex items-start gap-3">
                    {/* Image placeholder */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-400 text-[10px]">{item.productTitle.slice(0, 8)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-gray-800 line-clamp-2 leading-tight mb-0.5">
                        {item.productTitle}
                      </h4>
                      {attrText && (
                        <p className="text-xs text-gray-400 mb-0.5">{attrText}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                        <span className="text-sm text-gray-800">
                          ¥{item.unitPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coupon section */}
        <div
          className="bg-white mt-2 px-4 py-3 flex items-center gap-3 cursor-pointer"
          onClick={handleSelectCoupon}
          data-action="checkout.coupon.select.open"
        >
          <IcCoupon size={20} className="text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm text-gray-700">{s.coupon_title}</span>
            {selectedCoupon ? (
              <p className="text-xs text-app-primary mt-0.5">
                {selectedCoupon.name} (满{selectedCoupon.threshold}减{selectedCoupon.discount})
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">{s.coupon_no_available}</p>
            )}
          </div>
          <IcNavForward size={16} className="text-gray-300 flex-shrink-0" />
        </div>

        {/* Shipping method */}
        <div className="bg-white mt-2 px-4 py-3 flex items-center gap-3">
          <IcTruck size={20} className="text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm text-gray-700">{s.checkout_shipping}</span>
            <p className="text-xs text-gray-400 mt-0.5">{s.checkout_shipping_standard}</p>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white mt-2 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{s.checkout_subtotal}</span>
            <span className="text-sm text-gray-800">¥{subtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{s.checkout_shipping_fee}</span>
            <span className="text-sm text-green-500">{shippingFee === 0 ? '免运费' : `¥${shippingFee}`}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{s.checkout_discount}</span>
              <span className="text-sm text-red-500">-¥{discount}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-800">{s.checkout_payable}</span>
            <span className="text-xl font-bold text-red-500">¥{payable}</span>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {s.checkout_payable}: <span className="text-lg font-bold text-red-500">¥{payable}</span>
          </span>
        </div>
        <button
          className={`w-full py-3 rounded-full text-sm font-medium text-white cursor-pointer ${
            canSubmit ? 'bg-app-primary' : 'bg-gray-300 cursor-not-allowed'
          }`}
          onClick={handleSubmitOrder}
          disabled={!canSubmit}
          data-action="checkout.order.submit.go"
        >
          {s.checkout_submit}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
