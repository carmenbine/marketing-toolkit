document.addEventListener('DOMContentLoaded', () => {

  // 🔹 UTM BUILDER
  window.buildUTM = function () {
    const base = document.getElementById('baseUrl').value;
    const source = document.getElementById('utmSource').value;
    const medium = document.getElementById('utmMedium').value;
    const campaign = document.getElementById('utmCampaign').value;

    if (!base) {
      alert("Enter a base URL");
      return;
    }

    const url = `${base}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;
    document.getElementById('utmResult').textContent = url;
  };

  // 🔹 A/B TEST CALCULATOR
  window.calculateAB = function () {
    const aConv = Number(document.getElementById('aConv').value);
    const aVis = Number(document.getElementById('aVis').value);
    const bConv = Number(document.getElementById('bConv').value);
    const bVis = Number(document.getElementById('bVis').value);

    if (!aVis || !bVis) {
      alert("Enter visitor numbers");
      return;
    }

    const aRate = (aConv / aVis) * 100;
    const bRate = (bConv / bVis) * 100;

    let winner = "Tie";
    if (aRate > bRate) winner = "A wins";
    if (bRate > aRate) winner = "B wins";

    document.getElementById('abResult').textContent =
      `A: ${aRate.toFixed(2)}% | B: ${bRate.toFixed(2)}% → ${winner}`;
  };

});
