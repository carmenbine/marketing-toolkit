document.addEventListener('DOMContentLoaded', () => {
  const pillrow = document.querySelector('.pillrow');

  if (!pillrow) return;

  const tools = [
    { name: "UTM Builder", id: "utm" },
    { name: "A/B Test", id: "ab" },
    { name: "SEO Preview", id: "seo" }
  ];

  tools.forEach(tool => {
    const btn = document.createElement('button');
    btn.textContent = tool.name;
    btn.className = 'pill';

    btn.addEventListener('click', () => {
      showTool(tool.id);
    });

    pillrow.appendChild(btn);
  });

  function showTool(id) {
    document.querySelectorAll('.card').forEach(card => {
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
