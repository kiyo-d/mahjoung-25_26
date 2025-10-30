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

function formatNumber(value, digits = 1) {
  return Number(value).toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function formatDateRange(start, end) {
  if (start && end) {
    return `${start} 〜 ${end}`;
  }
  if (start) {
    return start;
  }
  return "-";
}

function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function getCurrentSeason() {
  return state.seasons[state.selectedIndex] ?? state.seasons[0] ?? null;
}

function populateSeasonOptions() {
  clearChildren(dom.seasonSelect);
  state.seasons.forEach((season, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${season.summary.season} (${season.summary.total_games} 半荘)`;
    dom.seasonSelect.appendChild(option);
  });
  dom.seasonSelect.value = String(state.selectedIndex);
}

function renderSummary(season) {
  const { summary } = season;
  dom.workbookName.textContent = summary.workbook || "-";
  dom.dateRange.textContent = formatDateRange(summary.start_date, summary.end_date);
  dom.totalGames.textContent = summary.total_games.toLocaleString("ja-JP");
  dom.totalPlayers.textContent = summary.total_players.toLocaleString("ja-JP");
  dom.generatedAt.textContent = new Date(state.payload.generated_at).toLocaleString("ja-JP");
}

function updateTableSelection() {
  const rows = dom.playerTableBody.querySelectorAll("tr[data-player]");
  rows.forEach((row) => {
    row.classList.toggle("is-selected", row.dataset.player === state.selectedPlayer);
  });
}

function renderPlayers(season) {
  const query = dom.playerSearch.value.trim().toLowerCase();
  const rows = season.players.filter((player) => !query || player.name.toLowerCase().includes(query));

  clearChildren(dom.playerTableBody);

  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 11;
    td.textContent = "該当データがありません";
    td.classList.add("text-muted");
    tr.appendChild(td);
    dom.playerTableBody.appendChild(tr);
    return;
  }

  rows.forEach((player) => {
    const tr = document.createElement("tr");
    tr.dataset.player = player.name;

    const cells = [
      () => {
        const td = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "rank-badge";
        badge.textContent = player.rank;
        td.appendChild(badge);
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.textContent = player.name;
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.textContent = player.games_played;
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.textContent = formatNumber(player.total_score, 1);
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.textContent = formatNumber(player.average_score, 2);
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.textContent = formatNumber(player.average_rank, 2);
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.classList.add("proportion");
        td.textContent = formatPercent(player.top_rate);
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.classList.add("proportion");
        td.textContent = formatPercent(player.last_rate);
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.textContent = formatNumber(player.best_score, 1);
        return td;
      },
      () => {
        const td = document.createElement("td");
        td.textContent = formatNumber(player.worst_score, 1);
        return td;
      },
      () => {
        const td = document.createElement("td");
        const counts = player.rank_counts;
        td.textContent = `1位 ${counts.first}｜2位 ${counts.second}｜3位 ${counts.third}｜4位 ${counts.fourth}`;
        return td;
      },
    ];

    cells.forEach((factory) => tr.appendChild(factory()));

    tr.addEventListener("click", () => {
      if (state.selectedPlayer === player.name) {
        return;
      }
      state.selectedPlayer = player.name;
      updateTableSelection();
      renderPlayerDetail(player, season);
    });

    dom.playerTableBody.appendChild(tr);
  });

  updateTableSelection();
}

function renderPlacementChart(counts) {
  const total = counts.first + counts.second + counts.third + counts.fourth;
  dom.placementBars.forEach((bar) => {
    const rank = Number(bar.dataset.rank);
    const valueSpan = bar.querySelector(".value");
    const fill = bar.querySelector(".bar-fill");
    let count = 0;
    if (rank === 1) count = counts.first;
    else if (rank === 2) count = counts.second;
    else if (rank === 3) count = counts.third;
    else if (rank === 4) count = counts.fourth;

    const percentage = total ? Math.round((count / total) * 100) : 0;
    fill.style.width = total ? `${percentage}%` : "0%";
    valueSpan.textContent = `${count} (${percentage}%)`;
  });
}

function renderPlayerDetail(player, season) {
  const hasPlayer = Boolean(player);
  dom.detailPlaceholder.classList.toggle("hidden", hasPlayer);
  dom.detailContent.classList.toggle("hidden", !hasPlayer);

  if (!hasPlayer) {
    dom.detailName.textContent = "-";
    dom.detailRank.textContent = "-";
    clearChildren(dom.detailHistoryList);
    dom.placementBars.forEach((bar) => {
      bar.querySelector(".bar-fill").style.width = "0%";
      bar.querySelector(".value").textContent = "0 (0%)";
    });
    return;
  }

  dom.detailName.textContent = player.name;
  dom.detailRank.textContent = `総合 ${player.rank} 位`;
  dom.detailAverage.textContent = formatNumber(player.average_score, 2);
  dom.detailAverageRank.textContent = formatNumber(player.average_rank, 2);
  dom.detailTopRate.textContent = formatPercent(player.top_rate);
  dom.detailLastRate.textContent = formatPercent(player.last_rate);
  dom.detailBest.textContent = formatNumber(player.best_score, 1);
  dom.detailWorst.textContent = formatNumber(player.worst_score, 1);
  dom.detailGames.textContent = player.games_played.toLocaleString("ja-JP");
  dom.detailTotal.textContent = formatNumber(player.total_score, 1);

  renderPlacementChart(player.rank_counts);
  renderPlayerRecentHistory(player, season);
}

function renderPlayerRecentHistory(player, season) {
  clearChildren(dom.detailHistoryList);

  const games = season.history.filter((game) =>
    game.players.some((entry) => entry.name === player.name)
  );
  const recent = games.slice(-8).reverse();

  if (!recent.length) {
    const li = document.createElement("li");
    li.textContent = "対局履歴がありません";
    dom.detailHistoryList.appendChild(li);
    return;
  }

  recent.forEach((game) => {
    const fragment = dom.detailHistoryTemplate.content.cloneNode(true);
    const date = fragment.querySelector(".date");
    const score = fragment.querySelector(".score");
    const rank = fragment.querySelector(".rank");

    const entry = game.players.find((item) => item.name === player.name);
    const numericScore = Number(entry.score);

    date.textContent = game.date || "-";
    score.textContent = `${numericScore >= 0 ? "+" : ""}${formatNumber(numericScore, 1)} 点`;
    score.classList.toggle("positive", numericScore > 0);
    score.classList.toggle("negative", numericScore < 0);
    rank.textContent = `${entry.rank} 位`;

    dom.detailHistoryList.appendChild(fragment);
  });
}

function renderHistory(season) {
  clearChildren(dom.historyList);
  const limit = Number(dom.historyLimit.value);
  const historyLength = season.history.length;
  const items = season.history.slice(Math.max(0, historyLength - limit));

  if (!items.length) {
    const empty = document.createElement("li");
    empty.textContent = "対局履歴がありません";
    dom.historyList.appendChild(empty);
    return;
  }

  const template = dom.historyTemplate.content;

  items
    .slice()
    .reverse()
    .forEach((game) => {
      const clone = document.importNode(template, true);
      clone.querySelector(".game-date").textContent = game.date || "未設定";
      clone.querySelector(".game-index").textContent = `#${game.game_index}`;

      const placementList = clone.querySelector(".placement");
      game.players
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .forEach((player) => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${player.rank}位 ${player.name}</strong>` +
            `<span>${formatNumber(player.score, 1)} 点</span>`;
          if (player.rank === 1) {
            const badge = document.createElement("span");
            badge.className = "badge-win";
            badge.textContent = "WIN";
            li.appendChild(badge);
          }
          placementList.appendChild(li);
        });

      dom.historyList.appendChild(clone);
    });
}

function ensureSelectedPlayer(season) {
  if (!season.players.length) {
    state.selectedPlayer = null;
    return null;
  }

  const current = season.players.find((player) => player.name === state.selectedPlayer);
  if (current) {
    return current;
  }

  state.selectedPlayer = season.players[0].name;
  return season.players[0];
}

function render() {
  const season = getCurrentSeason();
  if (!season) {
    return;
  }

  renderSummary(season);
  renderPlayers(season);
  const selectedPlayer = ensureSelectedPlayer(season);
  renderPlayerDetail(selectedPlayer, season);
  renderHistory(season);
}

async function loadData() {
  try {
    dom.refreshButton.disabled = true;
    dom.refreshButton.textContent = "読込中...";
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    const payload = await response.json();
    state.payload = payload;
    state.seasons = payload.seasons ?? [];
    state.selectedIndex = 0;
    state.selectedPlayer = state.seasons[0]?.players?.[0]?.name ?? null;
    populateSeasonOptions();
    render();
  } catch (error) {
    console.error(error);
    alert("データの読み込みに失敗しました。ブラウザのコンソールを確認してください。");
  } finally {
    dom.refreshButton.disabled = false;
    dom.refreshButton.textContent = "最新データを再読込";
  }
}

function setupEventHandlers() {
  dom.refreshButton.addEventListener("click", () => loadData());

  dom.seasonSelect.addEventListener("change", (event) => {
    state.selectedIndex = Number(event.target.value) || 0;
    const season = getCurrentSeason();
    state.selectedPlayer = season?.players?.[0]?.name ?? null;
    render();
  });

  dom.playerSearch.addEventListener("input", () => render());

  dom.historyLimit.addEventListener("change", () => {
    const season = getCurrentSeason();
    if (season) {
      renderHistory(season);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupEventHandlers();
  loadData();
});
