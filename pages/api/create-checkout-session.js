// Stripe integration for ticket payments
// Install Stripe: npm install stripe
let Stripe;
let stripe;

try {
  Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
  });
} catch (error) {
  console.warn('Stripe package not installed. Run: npm install stripe');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ 
      error: 'Stripe not configured',
      message: 'Please install Stripe: npm install stripe and set STRIPE_SECRET_KEY in environment variables'
    });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ 
      error: 'Stripe secret key not configured',
      message: 'Please set STRIPE_SECRET_KEY in your .env.local file'
    });
  }

  try {
    const { ticketType, amount, eventName, quantity } = req.body;

    if (!ticketType || !amount || !eventName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${eventName} - ${ticketType}`,
              description: `Delegate ticket for ${eventName}`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: quantity || 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/events?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/events?payment=cancelled`,
      metadata: {
        ticketType,
        eventName,
      },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
}

