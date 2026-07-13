import React, { useState, useMemo } from 'react';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import {
  IcNavBack,
  IcMinus,
  IcPlus,
  IcDelete,
  IcCart,
  IcShop,
} from '../res/icons';
import TabBar from '../components/TabBar';

const CartPage: React.FC = () => {
  const { bindTap, bindBack, go } = useTaobaoGestures();
  const s = useTaobaoStrings();

  // Store state
  const cart = useTaobaoStore(st => st.cart);
  const products = useTaobaoStore(st => st.products);
  const skus = useTaobaoStore(st => st.skus);
  const updateCartItemQuantity = useTaobaoStore(st => st.updateCartItemQuantity);
  const toggleCartSelection = useTaobaoStore(st => st.toggleCartSelection);
  const toggleSelectAllCart = useTaobaoStore(st => st.toggleSelectAllCart);
  const removeCartItem = useTaobaoStore(st => st.removeCartItem);
  const initCheckoutFromCart = useTaobaoStore(st => st.initCheckoutFromCart);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Derive cart items with product info
  const cartItems = useMemo(() => {
    return cart.map(item => {
      const product = products[item.productId];
      const sku = skus[item.skuId];
      return {
        ...item,
        productTitle: product?.title ?? '未知商品',
        skuAttrs: sku?.attributes ?? {},
        stock: sku?.stock ?? 0,
      };
    });
  }, [cart, products, skus]);

  const selectedItems = useMemo(() => cartItems.filter(i => i.selected), [cartItems]);
  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [selectedItems]);

  const allSelected = cartItems.length > 0 && cartItems.every(i => i.selected);

  const handleSelectAll = () => {
    toggleSelectAllCart(!allSelected);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    initCheckoutFromCart();
    go('cart.checkout.open');
  };

  const handleDeleteConfirm = (cartItemId: string) => {
    removeCartItem(cartItemId);
    setDeleteConfirmId(null);
  };

  const formatSkuAttrs = (attrs: Record<string, string>): string => {
    return Object.values(attrs).join(', ');
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Top bar */}
      <div className="pt-10 px-4 pb-3 bg-white flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div {...bindBack()} className="p-1 cursor-pointer">
            <IcNavBack size={22} className="text-gray-700" />
          </div>
          <h1 className="text-lg font-medium text-gray-800">{s.cart_title}</h1>
        </div>
      </div>

      {cartItems.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center">
          <IcCart size={64} className="text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm mb-4">{s.cart_empty}</p>
          <span
            className="px-6 py-2 rounded-full text-sm bg-app-primary text-white cursor-pointer"
            onClick={() => go('tab.home')}
          >
            {s.cart_go_shopping}
          </span>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div
            className="flex-1 overflow-y-auto"
            data-scroll-container="main"
            data-scroll-direction="vertical"
          >
            {/* Select all header */}
            <div className="bg-white px-4 py-2.5 flex items-center border-b border-gray-100">
              <div
                className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mr-3"
                style={{
                  borderColor: allSelected ? 'var(--color-app-primary, #FF6A00)' : '#d1d5db',
                  backgroundColor: allSelected ? 'var(--color-app-primary, #FF6A00)' : 'transparent',
                }}
                onClick={handleSelectAll}
              >
                {allSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">{s.cart_select_all}</span>
              <span className="text-xs text-gray-400 ml-2">({cartItems.length}件)</span>
            </div>

            {/* Item list */}
            {cartItems.map(item => {
              const attrText = formatSkuAttrs(item.skuAttrs);
              return (
                <div
                  key={item.id}
                  className="bg-white px-4 py-3 flex items-start gap-3 border-b border-gray-50"
                >
                  {/* Checkbox */}
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mt-5 flex-shrink-0"
                    style={{
                      borderColor: item.selected ? 'var(--color-app-primary, #FF6A00)' : '#d1d5db',
                      backgroundColor: item.selected ? 'var(--color-app-primary, #FF6A00)' : 'transparent',
                    }}
                    onClick={() => toggleCartSelection(item.id)}
                    data-action="cart.item.select.toggle"
                    data-action-params={JSON.stringify({ cartItemId: item.id })}
                  >
                    {item.selected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Product image placeholder */}
                  <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-400 text-[10px]">{item.productTitle.slice(0, 8)}</span>
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-0.5">
                      {item.productTitle}
                    </h3>
                    {attrText && (
                      <p className="text-xs text-gray-400 mb-1">{attrText}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-red-500 text-sm font-bold">
                        ¥{item.unitPrice}
                      </span>
                      {/* Quantity controls + delete */}
                      <div className="flex items-center gap-2">
                        {/* Delete button */}
                        <button
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                          onClick={() => setDeleteConfirmId(item.id)}
                          data-action="cart.item.delete.confirm"
                          data-action-params={JSON.stringify({ cartItemId: item.id })}
                        >
                          <IcDelete size={16} />
                        </button>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                          <button
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            data-action="cart.item.quantity.set"
                            data-action-params={JSON.stringify({ cartItemId: item.id, delta: -1 })}
                          >
                            <IcMinus size={14} />
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-xs font-medium border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            data-action="cart.item.quantity.set"
                            data-action-params={JSON.stringify({ cartItemId: item.id, delta: 1 })}
                          >
                            <IcPlus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom spacing for bottom bar */}
            <div className="h-24" />
          </div>

          {/* Bottom bar */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center z-10">
            <div className="flex-1">
              <span className="text-sm text-gray-600">{s.cart_total}: </span>
              <span className="text-lg font-bold text-red-500">¥{totalPrice}</span>
            </div>
            <button
              className={`px-6 py-2.5 rounded-full text-sm font-medium text-white cursor-pointer ${
                selectedItems.length > 0 ? 'bg-app-primary' : 'bg-gray-300 cursor-not-allowed'
              }`}
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              data-trigger="cart.checkout.open"
            >
              {s.cart_checkout_count.replace('{count}', String(selectedItems.length))}
            </button>
          </div>
        </>
      )}

      <TabBar />

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl mx-8 p-6 w-[280px]">
            <p className="text-sm text-gray-700 text-center mb-5">{s.cart_delete_confirm}</p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-full text-sm border border-gray-200 text-gray-600 cursor-pointer"
                onClick={() => setDeleteConfirmId(null)}
              >
                {s.cart_delete_confirm_no}
              </button>
              <button
                className="flex-1 py-2.5 rounded-full text-sm bg-red-500 text-white cursor-pointer"
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
              >
                {s.cart_delete_confirm_yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
