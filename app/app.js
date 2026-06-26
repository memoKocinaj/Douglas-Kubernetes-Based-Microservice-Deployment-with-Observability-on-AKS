const express = require('express');
const client = require('prom-client');

const app = express();

client.collectDefaultMetrics();

// ✅ Coin toss counter
const coinCounter = new client.Counter({
  name: 'coin_toss_total',
  help: 'Total coin toss results',
  labelNames: ['result'], // heads / tails
});

// ✅ Dice roll counter
const diceCounter = new client.Counter({
  name: 'dice_roll_total',
  help: 'Total dice roll outcomes',
  labelNames: ['value'], // 1–6
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AKS App</title>
    </head>
    <body>
      <h1>🎯 AKS Demo App</h1>

      <button onclick="tossCoin()">🪙 Toss Coin</button>
      <button onclick="rollDice()">🎲 Roll Dice</button>

      <h2 id="result"></h2>

      <script>
        async function tossCoin() {
          const res = await fetch('/coin');
          const text = await res.text();
          document.getElementById('result').innerText = 'Coin: ' + text;
        }

        async function rollDice() {
          const res = await fetch('/dice');
          const text = await res.text();
          document.getElementById('result').innerText = text;
        }
      </script>
    </body>
    </html>
  `);
});

// ✅ Coin toss endpoint
app.get('/coin', (req, res) => {
  const result = Math.random() > 0.5 ? 'heads' : 'tails';
  coinCounter.inc({ result });
  res.send(result);
});

// ✅ Dice roll endpoint
app.get('/dice', (req, res) => {
  const value = Math.floor(Math.random() * 6) + 1;
  diceCounter.inc({ value: String(value) });
  res.send(`Rolled: ${value}`);
});

// ✅ Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(3000, () => {
  console.log('App running on port 3000');
});
