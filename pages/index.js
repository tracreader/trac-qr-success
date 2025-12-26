import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51SfprM12BpOkNa2hhqFAfDqpJaCdtKCHapncnVCUNkTSNgua6gKOxX4nkgJoeebvBWFvZjuJc3ZBi1Qj5iGykt36004YAW5RUo');

export default function Home() {
  const fetchClientSecret = async (priceId) => {
    const res = await fetch('/api/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    return data.clientSecret;
  };

  const options = { fetchClientSecret };

  return (
    <div style={{ background: 'black', color: '#FFFF00', fontFamily: 'Arial', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '2.5em', color: '#FF4444', margin: '50px 0' }}>Select plays and pay to unlock your QR code</div>

      <button style={{ padding: '20px 40px', fontSize: '2em', background: '#FFFF00', color: 'black', border: 'none', borderRadius: '15px', cursor: 'pointer', margin: '15px' }} onClick={() => fetchClientSecret('price_1SgBWF12BpOkNa2hGatsvuL3').then(cs => window.location.href = `?cs=${cs}`)}>1 Play - $1.39</button>
      <button style={{ padding: '20px 40px', fontSize: '2em', background: '#FFFF00', color: 'black', border: 'none', borderRadius: '15px', cursor: 'pointer', margin: '15px' }} onClick={() => fetchClientSecret('price_1SgBWF12BpOkNa2hbJw7l1hn').then(cs => window.location.href = `?cs=${cs}`)}>3 Plays - $3.39</button>
      <button style={{ padding: '20px 40px', fontSize: '2em', background: '#FFFF00', color: 'black', border: 'none', borderRadius: '15px', cursor: 'pointer', margin: '15px' }} onClick={() => fetchClientSecret('price_1SgBWF12BpOkNa2haBK3pIuS').then(cs => window.location.href = `?cs=${cs}`)}>5 Plays - $5.39</button>
      <button style={{ padding: '20px 40px', fontSize: '2em', background: '#FFFF00', color: 'black', border: 'none', borderRadius: '15px', cursor: 'pointer', margin: '15px' }} onClick={() => fetchClientSecret('price_1SgBWF12BpOkNa2hf3YIdKxh').then(cs => window.location.href = `?cs=${cs}`)}>10 Plays - $10.39</button>

      <div className="qr-wrapper" id="qrContainer"></div>
      <div id="code"></div>
      <button id="downloadBtn">Download QR to Phone</button>

      {new URLSearchParams(window.location.search).get('cs') && (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: new URLSearchParams(window.location.search).get('cs') }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
}
