'use client';
import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCreateOrder, useVerifyPayment } from '@/hooks/useSubscription';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export function useRazorpay() {
  const scriptLoaded = useRef(false);
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  useEffect(() => {
    if (scriptLoaded.current || document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      scriptLoaded.current = true;
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.body.appendChild(script);
  }, []);

  const openCheckout = useCallback(
    async ({
      planKey,
      forRole,
      userName,
      userEmail,
    }: {
      planKey: string;
      forRole: string;
      userName?: string;
      userEmail?: string;
    }) => {
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh and try again.');
        return;
      }

      let orderData: Awaited<ReturnType<typeof createOrder.mutateAsync>> | undefined;
      try {
        orderData = await createOrder.mutateAsync({ planKey, forRole });
      } catch {
        return;
      }

      if (!orderData) return;

      const { orderId, amount, currency, key, subscriptionId } = orderData;

      const options: RazorpayOptions = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: 'JobKatta',
        description: `${planKey} Plan`,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: '#6d28d9' },
        handler: (response) => {
          verifyPayment.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            subscriptionId,
            planKey,
            forRole,
          });
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.', { icon: '⚠️' });
          },
        },
      };

      new window.Razorpay(options).open();
    },
    [createOrder, verifyPayment]
  );

  return {
    openCheckout,
    isCreatingOrder: createOrder.isPending,
    isVerifying: verifyPayment.isPending,
  };
}
