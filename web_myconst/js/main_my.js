const DATA_URL = "../dist/data/summary.json";

const state = {
  payload: null,
  seasons: [],
  selectedIndex: 0,
  selectedPlayer: null,
};

const dom = {
    seasonSelect: document.getElementById("season-select"),
    refreshButton: document.getElementById("refresh-button"),
    workbookName: document.getElementById("workbook-name"),
    dateRange: document.getElementById("date-range"),
    totalGames: document.getElementById("total-games"),
    totalPlayers: document.getElementById("total-players"),
    generatedAt: document.getElementById("generated-at"),
    playerTableBody: document.querySelector("#player-table tbody"),
    playerSearch: document.getElementById("player-search"),
    historyList: document.getElementById("history-list"),
    historyLimit: document.getElementById("history-limit"),
    historyTemplate: document.getElementById("history-item-template"),
    detailCard: document.getElementById("player-detail"),
    detailPlaceholder: document.querySelector("#player-detail .placeholder"),
    detailContent: document.querySelector("#player-detail .detail-content"),
    detailName: document.getElementById("detail-name"),
    detailRank: document.getElementById("detail-rank"),
    detailAverage: document.getElementById("detail-average"),
    detailAverageRank: document.getElementById("detail-average-rank"),
    detailTopRate: document.getElementById("detail-top-rate"),
    detailLastRate: document.getElementById("detail-last-rate"),
    detailBest: document.getElementById("detail-best"),
    detailWorst: document.getElementById("detail-worst"),
    detailGames: document.getElementById("detail-games"),
    detailTotal: document.getElementById("detail-total"),
    detailHistoryList: document.getElementById("detail-history"),
    detailHistoryTemplate: document.getElementById("detail-history-item-template"),
    placementBars: document.querySelectorAll(".placement-chart .bar"),
  };




















// 折れ線グラフ（スコア推移）
const ctxLine = document.getElementById('scoreChart').getContext('2d');
new Chart(ctxLine, {
  type: 'line',
  data: {
    labels: ["東1","東2","東3","東4","南1","南2","南3","南4"],
    datasets: [
      { label: "滝沢 和典", borderColor: "#ff6b6b", data: [25000,27000,26000,25500,26000,31000,29500,28000], tension: 0.4 },
      { label: "勝又 健志", borderColor: "#f06595", data: [25000,24000,23000,24500,25500,21000,26000,25000], tension: 0.4 },
      { label: "萩原 聖人", borderColor: "#fab005", data: [25000,22000,21000,19500,18500,17000,15000,24000], tension: 0.4 },
      { label: "多井 隆晴", borderColor: "#ffd43b", data: [25000,27000,30000,30500,30000,31000,29500,23000], tension: 0.4 }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false, ticks: { color: "#aaa" } },
      x: { ticks: { color: "#aaa" } }
    },
    plugins: {
      legend: { labels: { color: "#ccc" } },
    }
  }
});

// 最近の対戦データ
const recentMatches = [
  { date: "2025/10/31 13:40", room: "段位戦: 玉の間・四人南", player: "kiyoyoyoyo", points: 32300, rank: 4, score: -200 },
  { date: "2025/10/31 13:13", room: "段位戦: 玉の間・四人南", player: "kiyoyoyoyo", points: 28800, rank: 3, score: -6500 },
  { date: "2025/10/30 18:30", room: "段位戦: 玉の間・四人南", player: "kiyoyoyoyo", points: 33700, rank: 4, score: 1600 },
  { date: "2025/10/28 07:25", room: "段位戦: 玉の間・四人南", player: "kiyoyoyoyo", points: 41200, rank: 2, score: 1200 },
];

const table = document.getElementById('recentTable');
recentMatches.forEach(m => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${m.date}<br><span style="color:#aaa;font-size:0.8em">${m.room}</span></td>
    <td>${m.player}</td>
    <td>${m.points.toLocaleString()}</td>
    <td>${m.rank}位</td>
    <td>${m.score > 0 ? '+'+m.score : m.score}</td>
  `;
  table.appendChild(tr);
});

// 和了タイプ円グラフ
new Chart(document.getElementById('pieChart'), {
  type: 'pie',
  data: {
    labels: ["立直", "副露", "闇聴"],
    datasets: [{
      data: [65, 31, 4],
      backgroundColor: ["#3b82f6", "#22c55e", "#a855f7"]
    }]
  },
  options: {
    plugins: { legend: { labels: { color: "#ccc" } } }
  }
});

// 順位分布棒グラフ
new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ["1位","2位","3位","4位"],
    datasets: [{
      data: [31,19,26,24],
      backgroundColor: ["#facc15","#38bdf8","#a78bfa","#f87171"]
    }]
  },
  options: {
    scales: {
      x: { ticks: { color: "#aaa" } },
      y: { ticks: { color: "#aaa" } }
    },
    plugins: { legend: { display: false } }
  }
});
