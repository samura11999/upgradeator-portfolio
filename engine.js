/* Static educational estimates, not live prices or measured benchmarks. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UpgradeEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const currentCards = [
    { id: 'gtx1050ti', name: 'GeForce GTX 1050 Ti', score: 30, vram: 4 },
    { id: 'gtx1660', name: 'GeForce GTX 1660 SUPER', score: 70, vram: 6 },
    { id: 'rtx2060', name: 'GeForce RTX 2060', score: 85, vram: 6 },
    { id: 'rtx3060', name: 'GeForce RTX 3060', score: 100, vram: 12 },
    { id: 'rtx3070', name: 'GeForce RTX 3070', score: 145, vram: 8 },
    { id: 'rtx4070', name: 'GeForce RTX 4070', score: 190, vram: 12 }
  ];
  const catalog = [
    { id: 'rx6600', name: 'Radeon RX 6600', brand: 'AMD', price: 21500, vram: 8, score: 105, watts: 132, psu: 450, length: 240, connector: '1 × 8-pin', condition: 'Новая', compute: 70 },
    { id: 'rtx3060', name: 'GeForce RTX 3060', brand: 'NVIDIA', price: 28900, vram: 12, score: 100, watts: 170, psu: 550, length: 242, connector: '1 × 8-pin', condition: 'Новая', compute: 130 },
    { id: 'rx6700xt', name: 'Radeon RX 6700 XT', brand: 'AMD', price: 32900, vram: 12, score: 150, watts: 230, psu: 650, length: 267, connector: '8 + 6-pin', condition: 'Б/у · проверить', compute: 95 },
    { id: 'rtx4060', name: 'GeForce RTX 4060', brand: 'NVIDIA', price: 34900, vram: 8, score: 125, watts: 115, psu: 550, length: 250, connector: '1 × 8-pin', condition: 'Новая', compute: 170 },
    { id: 'rx7700xt', name: 'Radeon RX 7700 XT', brand: 'AMD', price: 46900, vram: 12, score: 185, watts: 245, psu: 700, length: 280, connector: '2 × 8-pin', condition: 'Новая', compute: 135 },
    { id: 'rtx4070', name: 'GeForce RTX 4070', brand: 'NVIDIA', price: 58900, vram: 12, score: 190, watts: 200, psu: 650, length: 269, connector: '1 × 16-pin', condition: 'Новая', compute: 250 },
    { id: 'rx7800xt', name: 'Radeon RX 7800 XT', brand: 'AMD', price: 55900, vram: 16, score: 215, watts: 263, psu: 700, length: 300, connector: '2 × 8-pin', condition: 'Новая', compute: 155 }
  ];
  function goalValue(card, goal) {
    if (goal === 'ai') return card.compute + card.vram * 10 + (card.brand === 'NVIDIA' ? 20 : 0);
    if (goal === '1440p') return card.score + card.vram * 5;
    return card.score;
  }

  function recommend({ current, budget, goal }) {
    const baseline = currentCards.find(card => card.id === current);
    const options = catalog
      .filter(card => card.price <= budget && card.score >= baseline.score * 1.25)
      .filter(card => goal !== 'ai' || (card.vram >= baseline.vram && card.brand === 'NVIDIA'))
      .map(card => ({
        ...card,
        gain: Math.round((card.score / baseline.score - 1) * 100),
        fit: goalValue(card, goal)
      }))
      .sort((a, b) => {
        const aValue = goal === 'ai' ? a.fit / a.price : (a.score - baseline.score) / a.price;
        const bValue = goal === 'ai' ? b.fit / b.price : (b.score - baseline.score) / b.price;
        return bValue - aValue || a.price - b.price;
      });
    return { options, best: options[0] || null, remaining: options.length ? budget - options[0].price : budget };
  }
  return { recommend, currentCards, catalog };
});
