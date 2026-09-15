import { loadStripe } from '@stripe/stripe-js';
import { createActor } from '../declarations/backend';

const env = import.meta.env;
const DEFAULT_BACKEND_CANISTER_ID = 'rrkah-fqaaa-aaaaa-aaaaq-cai';

const normalizeBackendResult = (result) => {
  if (result?.ok !== undefined) {
    return { success: true, value: result.ok };
  }

  if (result?.err !== undefined) {
    return { success: false, error: result.err };
  }

  return result;
};

const paymentService = {
  stripe: null,
  backendActor: null,
  // Initialize the payment service
  async init() {
    try {
      if (this.backendActor) {
        return { success: true };
      }

      // Initialize Stripe when a publishable key is configured. During beta the
      // pricing CTAs are disabled, so missing Stripe config should not break the page.
      const stripePublishableKey = env.VITE_STRIPE_PUBLISHABLE_KEY;
      this.stripe = stripePublishableKey ? await loadStripe(stripePublishableKey) : null;
      
      // Initialize backend actor
      const canisterId = env.VITE_BACKEND_CANISTER_ID || DEFAULT_BACKEND_CANISTER_ID;
      this.backendActor = createActor(canisterId, {
        agentOptions: {
          host: env.PROD
            ? 'https://ic0.app' 
            : (env.VITE_DFX_HOST || 'http://localhost:4943')
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
      return { success: false, error: error.message };
    }
  },

  async initialize() {
    return this.init();
  },

  // Create checkout session
  async createCheckoutSession(userId, planType) {
    try {
      if (!this.backendActor) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      const result = normalizeBackendResult(
        await this.backendActor.createCheckoutSession(userId, planType)
      );
      
      if (result.success) {
        return { success: true, sessionId: result.value || result.sessionId };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { success: false, error: error.message };
    }
  },

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId) {
    try {
      if (!this.stripe) {
        const stripePublishableKey = env.VITE_STRIPE_PUBLISHABLE_KEY;
        this.stripe = stripePublishableKey ? await loadStripe(stripePublishableKey) : null;
      }
      
      if (!this.stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await this.stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to redirect to checkout:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify subscription after successful payment
  async verifySubscription(sessionId) {
    try {
      if (!this.backendActor) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      const result = normalizeBackendResult(await this.backendActor.verifySubscription(sessionId));
      return result.success
        ? { success: true, subscriptionId: result.value }
        : { success: false, error: result.error };
    } catch (error) {
      console.error('Error verifying subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user subscription status
  async getUserSubscription(userId) {
    try {
      if (!this.backendActor) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      const result = await this.backendActor.getUserSubscription(userId);
      const normalized = normalizeBackendResult(result);

      if (normalized?.success !== undefined) {
        return {
          success: normalized.success,
          subscription: normalized.value || normalized.subscription || null,
          error: normalized.error,
        };
      }

      return {
        success: true,
        subscription: Array.isArray(result) ? (result[0] || null) : result,
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancel user subscription
  async cancelSubscription(subscriptionId) {
    try {
      if (!this.backendActor) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      const result = normalizeBackendResult(await this.backendActor.cancelSubscription(subscriptionId));
      return result.success
        ? { success: true, message: result.value }
        : { success: false, error: result.error };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user has active subscription
  async hasActiveSubscription(userId) {
    try {
      const result = await this.getUserSubscription(userId);
      
      if (result.success && result.subscription) {
        const subscription = result.subscription;
        const now = Date.now() * 1000000; // Convert to nanoseconds
        
        return subscription.status === 'Active' && 
               subscription.currentPeriodEnd > now;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  },

  // Get subscription plan details
  getSubscriptionPlanDetails(plan) {
    const plans = {
      Basic: {
        name: 'Basic',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Access to basic workout routines',
          'Progress tracking',
          'Community support'
        ]
      },
      Premium: {
        name: 'Premium',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'All Basic features',
          'Advanced workout routines',
          'Personalized meal plans',
          'Priority support',
          'Advanced analytics'
        ]
      },
      PremiumPlus: {
        name: 'Premium Plus',
        price: 29.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'All Premium features',
          '1-on-1 coaching sessions',
          'Custom workout creation',
          'Nutrition consultation',
          'Early access to new features'
        ]
      }
    };

    return plans[plan] || null;
  }
};

export default paymentService;
export { paymentService };
