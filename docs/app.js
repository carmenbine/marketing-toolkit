document.addEventListener('DOMContentLoaded', () => {
  const pillrow = document.querySelector('.pillrow');
  const cards = document.querySelectorAll('.card');

  if (!pillrow || !cards.length) return;

  const tools = [
    { name: 'UTM Builder', index: 0 },
    { name: 'A/B Test', index: 1 }
  ];

  tools.forEach((tool, i) => {
    const btn = document.createElement('button');
    btn.textContent = tool.name;
    btn.className = 'pill';
    if (i === 0) btn.classList.add('active');

    btn.addEventListener('click', () => {
      cards.forEach((card, idx) => {
        card.style.display = idx === tool.index ? 'block' : 'none';
      });

      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    });

    pillrow.appendChild(btn);
  });

  cards.forEach((card, idx) => {
    card.style.display = idx === 0 ? 'block' : 'none';
  });
});

function buildUTM() {
  const base = document.getElementById('baseUrl')?.value?.trim() || '';
  const source = document.getElementById('utmSource')?.value?.trim() || '';
  const medium = document.getElementById('utmMedium')?.value?.trim() || '';
  const campaign = document.getElementById('utmCampaign')?.value?.trim() || '';
  const result = document.getElementById('utmResult');

  if (!result) return;

  if (!base) {
    result.textContent = 'Enter a base URL.';
    return;
  }

  let url;
  try {
    url = new URL(base);
  } catch {
    result.textContent = 'Enter a valid URL, including https://';
    return;
  }

  if (source) url.searchParams.set('utm_source', source);
  if (medium) url.searchParams.set('utm_medium', medium);
  if (campaign) url.searchParams.set('utm_campaign', campaign);

  result.textContent = url.toString();
}

function calculateAB() {
  const aConv = parseFloat(document.getElementById('aConv')?.value || '0');
  const aVis = parseFloat(document.getElementById('aVis')?.value || '0');
  const bConv = parseFloat(document.getElementById('bConv')?.value || '0');
  const bVis = parseFloat(document.getElementById('bVis')?.value || '0');
  const result = document.getElementById('abResult');

  if (!result) return;

  if (aVis <= 0 || bVis <= 0) {
    result.textContent = 'Enter visitor counts greater than 0 for both A and B.';
    return;
  }

  const aRate = (aConv / aVis) * 100;
  const bRate = (bConv / bVis) * 100;

  let winner = 'Tie';
  if (aRate > bRate) winner = 'A wins';
  if (bRate > aRate) winner = 'B wins';

  result.textContent = `A: ${aRate.toFixed(2)}% | B: ${bRate.toFixed(2)}% → ${winner}`;
}
      card.style.display = 'none';
    });

    if (id === 'utm') {
      document.querySelector('.card:nth-of-type(1)').style.display = 'block';
    }

    if (id === 'ab') {
      document.querySelector('.card:nth-of-type(2)').style.display = 'block';
    }

    if (id === 'seo') {
      document.querySelector('.card:nth-of-type(3)').style.display = 'block';
    }
  }
});
