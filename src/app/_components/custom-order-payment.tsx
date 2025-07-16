"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { CreditCard, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CustomOrderPaymentProps {
  orderId: number;
  amount: number;
  paymentStatus: string;
  onUpdate?: () => void;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: any) => void;
    };
  }
}

export default function CustomOrderPayment({ orderId, amount, paymentStatus, onUpdate }: CustomOrderPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const createPaymentMutation = api.customOrder.createPayment.useMutation({
    onSuccess: (data) => {
      if (data.snapToken) {
        // Load Midtrans Snap script if not already loaded
        if (!window.snap) {
          const script = document.createElement('script');
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
          script.onload = () => {
            window.snap.pay(data.snapToken, {
              onSuccess: function(result: any) {
                console.log('Payment success:', result);
                handlePaymentSuccess(result);
              },
              onPending: function(result: any) {
                console.log('Payment pending:', result);
                handlePaymentPending(result);
              },
              onError: function(result: any) {
                console.log('Payment error:', result);
                handlePaymentError(result);
              },
              onClose: function() {
                console.log('Payment popup closed');
                setIsProcessing(false);
              }
            });
          };
          document.head.appendChild(script);
        } else {
          window.snap.pay(data.snapToken, {
            onSuccess: function(result: any) {
              console.log('Payment success:', result);
              handlePaymentSuccess(result);
            },
            onPending: function(result: any) {
              console.log('Payment pending:', result);
              handlePaymentPending(result);
            },
            onError: function(result: any) {
              console.log('Payment error:', result);
              handlePaymentError(result);
            },
            onClose: function() {
              console.log('Payment popup closed');
              setIsProcessing(false);
            }
          });
        }
      }
    },
    onError: (error) => {
      setPaymentError(error.message);
      setIsProcessing(false);
    },
  });

  const handlePaymentNotificationMutation = api.customOrder.handlePaymentNotification.useMutation({
    onSuccess: () => {
      onUpdate?.();
      setIsProcessing(false);
    },
  });

  const handlePaymentSuccess = (result: any) => {
    handlePaymentNotificationMutation.mutate({
      customOrderId: orderId,
      transactionStatus: 'settlement',
      paymentType: result.payment_type,
    });
  };

  const handlePaymentPending = (result: any) => {
    handlePaymentNotificationMutation.mutate({
      customOrderId: orderId,
      transactionStatus: 'pending',
      paymentType: result.payment_type,
    });
  };

  const handlePaymentError = (result: any) => {
    setPaymentError('Payment failed. Please try again.');
    setIsProcessing(false);
  };

  const handlePayClick = () => {
    setIsProcessing(true);
    setPaymentError("");
    createPaymentMutation.mutate({ customOrderId: orderId });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PROCESSING': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'FAILED': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  // Don't show payment section if no agreed price
  if (!amount) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          <span>Payment</span>
        </h3>
        
        {paymentStatus && (
          <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getPaymentStatusColor(paymentStatus)}`}>
            {getPaymentStatusIcon(paymentStatus)}
            <span>{paymentStatus.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
          </span>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-gray-600">Total Amount:</span>
            <p className="text-2xl font-bold text-indigo-600">${amount}</p>
          </div>
        </div>
      </div>

      {/* Payment Actions */}
      {paymentStatus === 'PENDING' || paymentStatus === 'FAILED' ? (
        <div>
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{paymentError}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handlePayClick}
            disabled={isProcessing || createPaymentMutation.isPending}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing || createPaymentMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Pay Now - ${amount}</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Secure payment powered by Midtrans
          </p>
        </div>
      ) : paymentStatus === 'PROCESSING' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <h4 className="font-medium text-yellow-800 mb-1">Payment Processing</h4>
          <p className="text-yellow-700 text-sm">
            Your payment is being processed. This may take a few minutes.
          </p>
        </div>
      ) : paymentStatus === 'PAID' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-green-800 mb-1">Payment Successful</h4>
          <p className="text-green-700 text-sm">
            Your payment has been processed successfully. The seller will now start working on your order.
          </p>
        </div>
      ) : null}
    </div>
  );
}
