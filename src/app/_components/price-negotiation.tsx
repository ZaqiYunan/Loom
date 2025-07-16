"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DollarSign, MessageSquare, Check, X } from "lucide-react";

interface PriceNegotiationProps {
  customOrder: any;
  userRole: 'buyer' | 'seller';
  onUpdate?: () => void;
}

export default function PriceNegotiation({ customOrder, userRole, onUpdate }: PriceNegotiationProps) {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: negotiations, refetch: refetchNegotiations } = api.customOrder.getNegotiations.useQuery(
    { customOrderId: customOrder.id },
    { enabled: !!customOrder.id }
  );

  const proposePriceMutation = api.customOrder.proposePrice.useMutation({
    onSuccess: () => {
      setShowPriceForm(false);
      setPrice('');
      setMessage('');
      refetchNegotiations();
      onUpdate?.();
    },
  });

  const counterOfferMutation = api.customOrder.counterOffer.useMutation({
    onSuccess: () => {
      setShowPriceForm(false);
      setPrice('');
      setMessage('');
      refetchNegotiations();
      onUpdate?.();
    },
  });

  const acceptPriceMutation = api.customOrder.acceptPrice.useMutation({
    onSuccess: () => {
      refetchNegotiations();
      onUpdate?.();
    },
  });

  const handleSubmitPrice = async () => {
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return;
    
    setIsSubmitting(true);
    try {
      if (userRole === 'seller') {
        await proposePriceMutation.mutateAsync({
          customOrderId: customOrder.id,
          price: Number(price),
          message: message || undefined,
        });
      } else {
        await counterOfferMutation.mutateAsync({
          customOrderId: customOrder.id,
          price: Number(price),
          message: message || undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptPrice = async (negotiationId: number) => {
    await acceptPriceMutation.mutateAsync({
      customOrderId: customOrder.id,
      negotiationId,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agreed': return 'bg-green-100 text-green-800';
      case 'seller_proposed': return 'bg-blue-100 text-blue-800';
      case 'buyer_countered': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canNegotiate = customOrder.status === 'pending' || customOrder.status === 'negotiating';
  const canSellerPropose = userRole === 'seller' && (customOrder.negotiationStatus === 'none' || !customOrder.negotiationStatus);
  const canBuyerCounter = userRole === 'buyer' && customOrder.negotiationStatus === 'seller_proposed';
  const canSellerCounter = userRole === 'seller' && customOrder.negotiationStatus === 'buyer_countered';

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Price Negotiation</span>
        </h3>
        
        {customOrder.negotiationStatus && (
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(customOrder.negotiationStatus)}`}>
            {customOrder.negotiationStatus.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        )}
      </div>

      {/* Current Price Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {customOrder.initialPrice && (
            <div>
              <span className="font-medium text-gray-600">Initial Price:</span>
              <p className="text-lg font-semibold text-blue-600">${customOrder.initialPrice}</p>
            </div>
          )}
          {customOrder.proposedPrice && (
            <div>
              <span className="font-medium text-gray-600">Counter Offer:</span>
              <p className="text-lg font-semibold text-orange-600">${customOrder.proposedPrice}</p>
            </div>
          )}
          {customOrder.agreedPrice && (
            <div>
              <span className="font-medium text-gray-600">Agreed Price:</span>
              <p className="text-lg font-semibold text-green-600">${customOrder.agreedPrice}</p>
            </div>
          )}
        </div>
      </div>

      {/* Negotiation History */}
      {negotiations && negotiations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Negotiation History</h4>
          <div className="space-y-2">
            {negotiations.map((negotiation: any) => (
              <div key={negotiation.id} className="flex items-center justify-between bg-white border rounded-lg p-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      negotiation.proposedBy === 'seller' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {negotiation.proposedBy === 'seller' ? 'Seller' : 'Buyer'}
                    </span>
                    <span className="font-semibold">${negotiation.price}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(negotiation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {negotiation.message && (
                    <p className="text-sm text-gray-600 mt-1">{negotiation.message}</p>
                  )}
                </div>
                
                {negotiation.status === 'pending' && customOrder.negotiationStatus !== 'agreed' && (
                  <div className="flex space-x-2">
                    {((userRole === 'buyer' && negotiation.proposedBy === 'seller') || 
                      (userRole === 'seller' && negotiation.proposedBy === 'buyer')) && (
                      <button
                        onClick={() => handleAcceptPrice(negotiation.id)}
                        disabled={acceptPriceMutation.isPending}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" />
                        <span>Accept</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Negotiation Actions */}
      {canNegotiate && customOrder.negotiationStatus !== 'agreed' && (
        <div>
          {(canSellerPropose || canBuyerCounter || canSellerCounter) && !showPriceForm && (
            <button
              onClick={() => setShowPriceForm(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              <span>
                {canSellerPropose && 'Propose Price'}
                {canBuyerCounter && 'Make Counter Offer'}
                {canSellerCounter && 'Make Counter Offer'}
              </span>
            </button>
          )}

          {showPriceForm && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium mb-3">
                {canSellerPropose && 'Propose Initial Price'}
                {canBuyerCounter && 'Make Counter Offer'}
                {canSellerCounter && 'Make Counter Offer'}
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message with your offer..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitPrice}
                    disabled={!price || isSubmitting}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPriceForm(false);
                      setPrice('');
                      setMessage('');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {customOrder.negotiationStatus === 'agreed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Price Agreement Reached: ${customOrder.agreedPrice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
