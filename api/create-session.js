const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = JSON.parse(req.body || '{}');
      const priceId = body.priceId;

      if (!priceId) {
        return res.status(400).json({ error: 'Missing priceId' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        success_url: `${req.headers.origin || 'https://' + req.headers.host}/?success=true`,
        cancel_url: `${req.headers.origin || 'https://' + req.headers.host}/?cancel=true`,
      });

      res.status(200).json({ id: session.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Internal error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
