const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // 1. Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { session_id } = req.query;

    if (!session_id || !session_id.startsWith('cs_')) {
        return res.status(400).json({ error: "Invalid session format" });
    }

    try {
        // 2. Fetch the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        // 3. CRITICAL: Check if payment was actually successful
        if (session.payment_status === 'paid') {
            return res.status(200).json({ 
                verified: true,
                customer: session.customer_details.email 
            });
        } else {
            return res.status(403).json({ verified: false, error: "Payment not completed" });
        }
    } catch (error) {
        console.error("Stripe Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
