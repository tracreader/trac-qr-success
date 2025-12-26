export default function Home() {
  return (
    <>
      <div className="locked-message">Select plays and pay to unlock your QR code</div>

      <button className="amount-btn" data-price="price_1SgBWF12BpOkNa2hGatsvuL3">1 Play - $1.39</button>
      <button className="amount-btn" data-price="price_1SgBWF12BpOkNa2hbJw7l1hn">3 Plays - $3.39</button>
      <button className="amount-btn" data-price="price_1SgBWF12BpOkNa2haBK3pIuS">5 Plays - $5.39</button>
      <button className="amount-btn" data-price="price_1SgBWF12BpOkNa2hf3YIdKxh">10 Plays - $10.39</button>

      <div className="qr-wrapper" id="qrContainer"></div>
      <div id="code"></div>
      <button id="downloadBtn">Download QR to Phone</button>

      <script dangerouslySetInnerHTML={{__html: `
        const stripe = Stripe('pk_test_51SfprM12BpOkNa2hhqFAfDqpJaCdtKCHapncnVCUNkTSNgua6gKOxX4nkgJoeebvBWFvZjuJc3ZBi1Qj5iGykt36004YAW5RUo');

        const SECRET = "TracReader2025!SuperSecretKey#987";
        const machineId = '0243';

        async function generateHMAC(message) {
          const enc = new TextEncoder();
          const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
          const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
          return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
        }

        // Check if already paid
        const paidData = localStorage.getItem('tracPaid');
        if (paidData) {
          const { plays, seed } = JSON.parse(paidData);
          unlockQR(plays, seed);
        }

        // Buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const priceId = btn.dataset.price;

            const response = await fetch('/api/create-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ priceId })
            });

            if (!response.ok) {
              const errorText = await response.text();
              alert('Error: ' + errorText);
              return;
            }

            const { id } = await response.json();

            const { error } = await stripe.redirectToCheckout({ sessionId: id });

            if (error) {
              alert(error.message);
            }
          });
        });

        // Success detection
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('session_id')) {
          const sessionId = urlParams.get('session_id');

          const amountStr = urlParams.get('amount') || '1.39';
          const playsMap = { '1.39': 1, '3.39': 3, '5.39': 5, '10.39': 10 };
          const plays = playsMap[amountStr] || 1;

          const seed = sessionId;

          localStorage.setItem('tracPaid', JSON.stringify({ plays, seed }));

          unlockQR(plays, seed);

          window.history.replaceState({}, '', window.location.pathname);
        }

        function unlockQR(plays, seed) {
          document.querySelector('.locked-message').style.display = 'none';

          generateHMAC(seed).then(hash => {
            const randomId = hash.substring(0, 4).toUpperCase();

            const dataToSign = `${plays}|${machineId}${randomId}`;

            generateHMAC(dataToSign).then(hash2 => {
              const shortSig = hash2.substring(0, 4).toUpperCase();
              const code = plays === 10 ? `10-${machineId}${randomId}${shortSig}` : `${plays}-${machineId}${randomId}${shortSig}`;

              document.getElementById('code').textContent = code;
              document.getElementById("qrContainer").innerHTML = "";
              new QRCode(document.getElementById("qrContainer"), {
                text: code,
                width: 360,
                height: 360,
                colorDark: "#000000",
                colorLight: "#FFFFFF",
                correctLevel: QRCode.CorrectLevel.H
              });

              document.getElementById('qrContainer').classList.add('unlocked');
              document.getElementById('code').classList.add('unlocked');
              document.getElementById('downloadBtn').classList.add('unlocked');

              document.getElementById('downloadBtn').onclick = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 440;
                canvas.height = 520;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const qrCanvas = document.querySelector('#qrContainer canvas');
                ctx.drawImage(qrCanvas, 40, 40, 360, 360);
                ctx.fillStyle = 'black';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(code, canvas.width / 2, 460);
                const url = canvas.toDataURL('image/png');
                const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                const a = document.createElement('a');
                a.href = url;
                a.download = `Trac-QR-${machineId}-${plays}plays-${randomSuffix}.png`;
                a.click();
              };
            });
          });
        }
      `}} />
    </>
  );
}
