"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "~/types";

// Declare Midtrans Snap for TypeScript
declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: any) => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: cartItems, isLoading } = api.cart.get.useQuery(
    undefined,
    { enabled: !!session }
  );
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Midtrans Snap script
  useEffect(() => {
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Sandbox URL
    const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-Nxrc1Bl8iiiDUxWU';

    const script = document.createElement('script');
    script.src = midtransScriptUrl;
    script.setAttribute('data-client-key', midtransClientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Only remove script if it still exists
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const createOrderMutation = api.order.create.useMutation({
    onSuccess: (orders) => {
      console.log('Orders created:', orders);
      // Since orders is an array, take the first order and create payment token
      if (orders && orders.length > 0) {
        const firstOrder = orders[0];
        console.log('First order:', firstOrder);
        if (firstOrder && typeof firstOrder.id === 'number') {
          createPaymentToken(firstOrder.id);
        } else {
          console.error('Order ID is not a number:', firstOrder);
          alert('Error: Invalid order ID');
          setIsProcessing(false);
        }
      } else {
        console.error('No orders returned:', orders);
        alert('Error: No orders created');
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      console.error('Order creation error:', error);
      alert(`Error creating order: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const createPaymentMutation = api.payment.createSnapToken.useMutation({
    onSuccess: (result) => {
      // Open Midtrans Snap payment popup
      if (window.snap) {
        window.snap.pay(result.token, {
          onSuccess: function(result: any) {
            alert('Payment successful!');
            console.log(result);
            router.push('/orders');
          },
          onPending: function(result: any) {
            alert('Payment pending, please complete your payment.');
            console.log(result);
            router.push('/orders');
          },
          onError: function(result: any) {
            alert('Payment failed!');
            console.log(result);
          },
          onClose: function() {
            alert('Payment cancelled.');
            setIsProcessing(false);
          }
        });
      } else {
        alert('Payment system not loaded properly. Please refresh the page.');
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      alert(`Error creating payment: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const createPaymentToken = (orderId: number) => {
    console.log('Creating payment token for order ID:', orderId);
    if (typeof orderId !== 'number' || isNaN(orderId)) {
      console.error('Invalid order ID:', orderId);
      alert('Error: Invalid order ID for payment');
      setIsProcessing(false);
      return;
    }
    createPaymentMutation.mutate({ orderId });
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total: number, item: CartItem) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;
    
    setIsProcessing(true);
    
    const orderItems = cartItems.map((item: CartItem) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    createOrderMutation.mutate({
      items: orderItems,
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to checkout</h1>
          <a href="/login" className="text-indigo-600 hover:text-indigo-800">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <a
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-4">
              {cartItems.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-gray-600 text-sm">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <hr />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-indigo-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Choose Your Payment Method</h3>
                <p className="text-gray-600 text-sm mb-6">
                  We support various payment methods including:
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm font-medium">Bank Transfer</div>
                    <div className="text-xs text-gray-500">BCA, BNI, BRI, Mandiri</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm font-medium">E-Wallet</div>
                    <div className="text-xs text-gray-500">GoPay, ShopeePay, OVO</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm font-medium">QRIS</div>
                    <div className="text-xs text-gray-500">Scan & Pay</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm font-medium">Retail</div>
                    <div className="text-xs text-gray-500">Indomaret, Alfamart</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold mb-4">
                  <span>Total Payment:</span>
                  <span className="text-indigo-600">${calculateTotal().toFixed(2)}</span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  You will be redirected to choose your preferred payment method
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
