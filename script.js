document.addEventListener("DOMContentLoaded", () => {
    if (annyang) {
      const commands = {
        'hello': () => alert('Hello World'),
        'change the color to *color': color => document.body.style.background = color,
        'navigate to *page': page => {
          const pages = ['home', 'stocks', 'dogs'];
          if (pages.includes(page.toLowerCase())) {
            window.location.href = `${page.toLowerCase()}.html`;
          }
        },
        'lookup *ticker': ticker => {
          const tickerInput = document.getElementById('ticker');
          if (tickerInput) {
            tickerInput.value = ticker.toUpperCase();
            document.getElementById('days').value = '30';
            document.getElementById('stockForm').dispatchEvent(new Event('submit'));
          }
        },
        'load dog breed *breed': breed => {
          const button = Array.from(document.querySelectorAll('#breed-buttons button'))
            .find(btn => btn.textContent.toLowerCase() === breed.toLowerCase());
          if (button) button.click();
        }
      };
      annyang.addCommands(commands);
      annyang.start();
    }
  
    const quoteEl = document.getElementById("quoteText");
    if (quoteEl) {
      fetch("https://zenquotes.io/api/random")
        .then(res => res.json())
        .then(data => quoteEl.innerText = `${data[0].q} — ${data[0].a}`)
        .catch(() => quoteEl.innerText = "Failed to load quote.");
    }
  
    const stockForm = document.getElementById('stockForm');
    if (stockForm) {
      stockForm.addEventListener('submit', async e => {
        e.preventDefault();
        const ticker = document.getElementById('ticker').value;
        const days = document.getElementById('days').value;
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - parseInt(days));
        const formatDate = d => d.toISOString().split('T')[0];
  
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${formatDate(start)}/${formatDate(end)}?adjusted=true&sort=asc&limit=120&apiKey=v4px9GgNZOExu81MvMR4ihQ3wGzAQ7L4`;
  
        try {
          const res = await fetch(url);
          const data = await res.json();
  
          if (!data.results || data.results.length === 0) {
            alert("No data found for that ticker and date range.");
            return;
          }
  
          const ctx = document.getElementById('stockChart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: data.results.map(p => new Date(p.t).toLocaleDateString()),
              datasets: [{
                label: `${ticker} Closing Prices`,
                data: data.results.map(p => p.c),
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true
                }
              },
              scales: {
                y: {
                  beginAtZero: false
                },
                x: {
                  ticks: {
                    maxTicksLimit: 10
                  }
                }
              }
            }
          });
        } catch (err) {
          console.error("Error fetching stock data:", err);
          alert("Something went wrong. Check the ticker and try again.");
        }
      });
  
      fetch("https://tradestie.com/api/v1/apps/reddit?date=2022-04-03")
        .then(res => res.json())
        .then(data => {
          const top5 = data.slice(0, 5);
          const tbody = document.querySelector("#redditTable tbody");
          top5.forEach(stock => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
              <td>${stock.no_of_comments}</td>
              <td>${stock.sentiment} ${stock.sentiment === 'Bullish' ? '🐂' : '🐻'}</td>`;
            tbody.appendChild(tr);
          });
        });
    }
  
    const carousel = document.getElementById('carousel');
    if (carousel) {
      fetch("https://dog.ceo/api/breeds/image/random/10")
        .then(res => res.json())
        .then(data => {
          carousel.innerHTML = data.message.map(url => `<img src="${url}" style="width:20%">`).join('');
        });
    }
  
    const breedBtns = document.getElementById('breed-buttons');
    if (breedBtns) {
      fetch("https://api.thedogapi.com/v1/breeds")
        .then(res => res.json())
        .then(breeds => {
          breeds.forEach(breed => {
            const btn = document.createElement('button');
            btn.textContent = breed.name;
            btn.className = 'btn';
            btn.onclick = () => {
              document.getElementById('breed-info').classList.remove('hidden');
              document.getElementById('breed-name').innerText = breed.name;
              document.getElementById('breed-description').innerText = breed.temperament || 'No description';
              document.getElementById('breed-lifespan').innerText = `Life span: ${breed.life_span}`;
            };
            breedBtns.appendChild(btn);
          });
        });
    }
  });
   