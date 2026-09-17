(() => {
  const { recommend, currentCards } = window.UpgradeEngine;
  const $ = (id) => document.getElementById(id);
  const els = { current: $('current-gpu'), goal: $('goal'), budget: $('budget'), budgetValue: $('budget-value'), currentStats: $('current-stats'), featured: $('featured-result'), list: $('recommendation-list'), compatibility: $('compatibility'), compare: $('compare-grid'), compareExplanation: $('compare-explanation'), score: $('match-score') };
  let selectedId = null;
  const rubles = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const goalTitles = { '1080p': '1080p игры', '1440p': '1440p игры', ai: 'ИИ / рендер' };
  const goalReason = { '1080p': 'Баланс прироста FPS и цены для Full HD.', '1440p': 'Запас по мощности и памяти для 1440p.', ai: 'Приоритет: видеопамять и производительность в задачах ИИ.' };

  currentCards.forEach(card => { const o = new Option(card.name, card.id); els.current.add(o); });
  els.current.value = 'rtx3060';

  function currentCard() { return currentCards.find(card => card.id === els.current.value); }
  function renderCurrent() { const card = currentCard(); els.currentStats.innerHTML = `<span>условный балл <b>${card.score}</b></span><span>память <b>${card.vram} ГБ</b></span>`; }
  function renderCompare(choice) {
    const now = currentCard();
    if (!choice) { els.compare.innerHTML = ''; return; }
    const max = Math.max(now.score, choice.score, 1);
    const card = (title, item, isNew) => `<article class="compare-card ${isNew ? 'new' : ''}"><span class="badge">${isNew ? 'ВЫБРАННЫЙ ШАГ' : 'СЕЙЧАС'}</span><h3>${item.name}</h3><div class="bar-row"><div class="bar-label"><span>условная мощность</span><b>${item.score}</b></div><div class="bar"><i style="width:${item.score / max * 100}%"></i></div></div><div class="bar-row"><div class="bar-label"><span>память</span><b>${item.vram} ГБ</b></div><div class="bar"><i style="width:${item.vram / 16 * 100}%"></i></div></div><div class="bar-row"><div class="bar-label"><span>потребление</span><b>${item.watts || '—'} Вт</b></div><div class="bar"><i style="width:${Math.min((item.watts || 0) / 300 * 100,100)}%"></i></div></div></article>`;
    els.compare.innerHTML = card('Сейчас', now, false) + card('После', choice, true);
    els.compareExplanation.textContent = `${choice.name} даёт ориентировочно +${choice.gain}% к условной мощности относительно ${now.name}.`;
  }
  function render() {
    renderCurrent();
    const result = recommend({ current: els.current.value, budget: Number(els.budget.value), goal: els.goal.value });
    els.budgetValue.textContent = rubles(Number(els.budget.value));
    const choice = result.options.find(x => x.id === selectedId) || result.best;
    selectedId = choice?.id || null;
    els.score.textContent = choice ? `+${choice.gain}% потенциал` : 'нет совпадений';
    if (!choice) { els.featured.innerHTML = '<p class="eyebrow">Нужен другой бюджет</p><h3>Пока без честного апгрейда.</h3><p class="reason">Подними бюджет или выбери более старую текущую карту: мы не показываем варианты с маленькой разницей.</p>'; els.list.innerHTML = ''; els.compatibility.innerHTML = ''; renderCompare(null); return; }
    els.featured.innerHTML = `<div class="featured-grid"><div><p class="eyebrow">ЛУЧШЕЕ СООТНОШЕНИЕ</p><h3>${choice.name}</h3><div class="model-meta"><span><b>${choice.vram} ГБ</b> VRAM</span><span><b>+${choice.gain}%</b> условный прирост</span><span>${choice.condition}</span></div><p class="reason">${goalReason[els.goal.value]} В бюджете после выбора останется ${rubles(result.remaining)}.</p></div><div class="price">${rubles(choice.price)}</div></div>`;
    els.compatibility.innerHTML = `<div><b>БП от ${choice.psu} Вт</b>ориентир по мощности</div><div><b>${choice.connector}</b>питание видеокарты</div><div><b>до ${choice.length} мм</b>проверь длину корпуса</div>`;
    els.list.innerHTML = result.options.map((gpu, index) => `<article class="upgrade-card ${gpu.id === selectedId ? 'selected' : ''}"><span class="badge">${index === 0 ? 'РЕКОМЕНДУЕМ' : 'ВАРИАНТ ' + String(index + 1).padStart(2,'0')}</span><h3>${gpu.name}</h3><p>${gpu.brand} · ${gpu.condition}<br>${gpu.vram} ГБ VRAM · БП от ${gpu.psu} Вт</p><div class="metric-row"><span>${rubles(gpu.price)}</span><b>+${gpu.gain}%</b></div><button class="select-card" data-id="${gpu.id}" type="button">Сравнить этот вариант</button></article>`).join('');
    els.list.querySelectorAll('[data-id]').forEach(btn => btn.addEventListener('click', () => { selectedId = btn.dataset.id; render(); document.querySelector('.compare-panel').scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
    renderCompare(choice);
  }
  document.querySelectorAll('[data-goal]').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('[data-goal]').forEach(x => x.classList.remove('active')); btn.classList.add('active'); els.goal.value = btn.dataset.goal; selectedId = null; render(); }));
  els.current.addEventListener('change', () => { selectedId = null; render(); });
  els.budget.addEventListener('input', () => { els.budgetValue.textContent = rubles(Number(els.budget.value)); });
  els.budget.addEventListener('change', () => { selectedId = null; render(); });
  $('recommend-btn').addEventListener('click', () => { selectedId = null; render(); $('result-title').focus?.(); });
  render();
})();