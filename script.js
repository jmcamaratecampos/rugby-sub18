// LISTA DAS 11 EQUIPAS E CORES
const INITIAL_TEAMS = [
  { id: 'direito', name: 'GD Direito', colorClass: 'bg-direito' },
  { id: 'cdul', name: 'CDUL', colorClass: 'bg-cdul' },
  { id: 'agronomia', name: 'Agronomia', colorClass: 'bg-agronomia' },
  { id: 'belenenses', name: 'Belenenses', colorClass: 'bg-belenenses' },
  { id: 'cascais', name: 'GDS Cascais', colorClass: 'bg-cascais' },
  { id: 'academica', name: 'Académica', colorClass: 'bg-academica' },
  { id: 'cdup', name: 'CDUP', colorClass: 'bg-cdup' },
  { id: 'sport', name: 'Sport Rugby', colorClass: 'bg-sport' },
  { id: 'santarem', name: 'Santarém', colorClass: 'bg-santarem' },
  { id: 'tecnico', name: 'Técnico', colorClass: 'bg-tecnico' },
  { id: 'saomiguel', name: 'São Miguel', colorClass: 'bg-saomiguel' }
];

// ESTADO DO SISTEMA
let isAdmin = false;
let standingsFase1 = [];
let fixturesFase1 = [];

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupNavigation();
  setupAdmin();
  renderAll();
});

// NAVEGAÇÃO & MENU LATERAL
function setupNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMenu = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  };

  menuToggle.addEventListener('click', toggleMenu);
  closeSidebar.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPhase = link.dataset.phase;

      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.phase-section').forEach(s => s.classList.remove('active'));

      link.classList.add('active');
      document.getElementById(targetPhase).classList.add('active');
      toggleMenu();
    });
  });
}

// MODO ADMIN
function setupAdmin() {
  const adminBtn = document.getElementById('adminBtn');
  const adminIcon = document.getElementById('adminIcon');
  const adminText = document.getElementById('adminText');

  adminBtn.addEventListener('click', () => {
    if (!isAdmin) {
      const pass = prompt('Introduza a palavra-passe do Admin:');
      if (pass === 'rugby123') { // Palavra-passe predefinida
        isAdmin = true;
        document.body.classList.add('admin-mode');
        adminIcon.className = 'fas fa-unlock';
        adminText.textContent = 'Admin Ativo';
        adminBtn.classList.add('active');
        renderAll();
      } else if (pass !== null) {
        alert('Palavra-passe errada!');
      }
    } else {
      isAdmin = false;
      document.body.classList.remove('admin-mode');
      adminIcon.className = 'fas fa-lock';
      adminText.textContent = 'Entrar Admin';
      adminBtn.classList.remove('active');
      renderAll();
    }
  });

  document.getElementById('btnSortearFase1').addEventListener('click', generateFixturesFase1);
}

// CARREGAR / GUARDAR DADOS (`localStorage`)
function loadData() {
  const savedStandings = localStorage.getItem('rugby_standings_f1');
  if (savedStandings) {
    standingsFase1 = JSON.parse(savedStandings);
  } else {
    standingsFase1 = INITIAL_TEAMS.map(team => ({
      ...team, J: 0, V: 0, E: 0, D: 0, EM: 0, ES: 0, PM: 0, PS: 0, BO: 0, BD: 0, PTS: 0
    }));
  }

  const savedFixtures = localStorage.getItem('rugby_fixtures_f1');
  if (savedFixtures) {
    fixturesFase1 = JSON.parse(savedFixtures);
  }
}

function saveData() {
  localStorage.setItem('rugby_standings_f1', JSON.stringify(standingsFase1));
  localStorage.setItem('rugby_fixtures_f1', JSON.stringify(fixturesFase1));
}

// RENDERIZAÇÃO
function renderAll() {
  renderTableFase1();
  renderFixturesFase1();
}

function renderTableFase1() {
  const tbody = document.getElementById('tbodyFase1');
  tbody.innerHTML = '';

  // Ordenar Tabela
  standingsFase1.sort((a, b) => {
    if (b.PTS !== a.PTS) return b.PTS - a.PTS;
    return (b.PM - b.PS) - (a.PM - a.PS); // Diferença de Pontos
  });

  standingsFase1.forEach((team, index) => {
    const dp = team.PM - team.PS;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="team-cell">
        <span class="team-badge ${team.colorClass}"></span>
        ${team.name}
      </td>
      <td>${team.J}</td>
      <td>${team.V}</td>
      <td>${team.E}</td>
      <td>${team.D}</td>
      <td>${team.EM}</td>
      <td>${team.ES}</td>
      <td>${team.PM}</td>
      <td>${team.PS}</td>
      <td>${dp > 0 ? '+' + dp : dp}</td>
      <td>${team.BO}</td>
      <td>${team.BD}</td>
      <td><strong>${team.PTS}</strong></td>
      <td class="admin-only">
        <button class="btn btn-sm btn-sec" onclick="openEditModal('${team.id}')"><i class="fas fa-edit"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// GERADOR DE JOGOS (11 JORNADAS COM FOLGA)
function generateFixturesFase1() {
  if (!confirm('Isto irá reiniciar o calendário da 1ª Fase. Continuar?')) return;

  const teams = [...INITIAL_TEAMS];
  const totalRounds = 11;
  fixturesFase1 = [];

  // Algoritmo Berger (Round Robin para 11 equipas)
  let list = [...teams, { id: 'bye', name: 'Folga' }];
  for (let round = 0; round < totalRounds; round++) {
    const roundFixtures = { round: round + 1, bye: '', matches: [] };
    for (let i = 0; i < list.length / 2; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];

      if (home.id === 'bye') {
        roundFixtures.bye = away.name;
      } else if (away.id === 'bye') {
        roundFixtures.bye = home.name;
      } else {
        roundFixtures.matches.push({
          id: `r${round+1}_m${i}`,
          homeId: home.id,
          awayId: away.id,
          homeScore: null,
          awayScore: null,
          homeTries: null,
          awayTries: null,
          date: ''
        });
      }
    }
    fixturesFase1.push(roundFixtures);
    list.splice(1, 0, list.pop()); // Rotação das equipas
  }

  recalculateStandings();
  saveData();
  renderAll();
}

function renderFixturesFase1() {
  const container = document.getElementById('fixturesFase1');
  container.innerHTML = '';

  if (fixturesFase1.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum jogo gerado. Inicie sessão como Admin e clique em "Sortear / Gerar Jogos".</p>';
    return;
  }

  fixturesFase1.forEach(r => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round-card';
    
    let matchesHtml = '';
    r.matches.forEach(m => {
      const homeTeam = INITIAL_TEAMS.find(t => t.id === m.homeId);
      const awayTeam = INITIAL_TEAMS.find(t => t.id === m.awayId);

      matchesHtml += `
        <div class="match-row">
          <div class="match-teams">
            <span class="team-badge ${homeTeam.colorClass}"></span> <strong>${homeTeam.name}</strong>
            vs
            <span class="team-badge ${awayTeam.colorClass}"></span> <strong>${awayTeam.name}</strong>
          </div>
          <div>
            <input type="date" class="match-date-input" value="${m.date}" ${!isAdmin ? 'disabled' : ''} onchange="updateMatchDate('${r.round}', '${m.id}', this.value)">
          </div>
          <div class="match-scores">
            <input type="number" placeholder="Pts" class="match-score-input" value="${m.homeScore ?? ''}" ${!isAdmin ? 'disabled' : ''} onchange="updateMatchResult('${r.round}', '${m.id}', 'homeScore', this.value)">
            (${m.homeTries ?? 0}E)
            -
            <input type="number" placeholder="Pts" class="match-score-input" value="${m.awayScore ?? ''}" ${!isAdmin ? 'disabled' : ''} onchange="updateMatchResult('${r.round}', '${m.id}', 'awayScore', this.value)">
            (${m.awayTries ?? 0}E)
          </div>
          <div class="admin-only">
            <button class="btn btn-sm btn-primary" onclick="promptTries('${r.round}', '${m.id}')">Ensaios</button>
          </div>
        </div>
      `;
    });

    roundDiv.innerHTML = `
      <div class="round-title">
        <span>Jornada ${r.round}</span>
        <span class="bye-tag">Folga: ${r.bye}</span>
      </div>
      ${matchesHtml}
    `;
    container.appendChild(roundDiv);
  });
}

// REGISTO E CÁLCULO DE RESULTADOS
function updateMatchDate(round, matchId, val) {
  const roundObj = fixturesFase1.find(r => r.round == round);
  const match = roundObj.matches.find(m => m.id == matchId);
  match.date = val;
  saveData();
}

function updateMatchResult(round, matchId, field, val) {
  const roundObj = fixturesFase1.find(r => r.round == round);
  const match = roundObj.matches.find(m => m.id == matchId);
  match[field] = val !== '' ? parseInt(val) : null;

  recalculateStandings();
  saveData();
  renderAll();
}

function promptTries(round, matchId) {
  const roundObj = fixturesFase1.find(r => r.round == round);
  const match = roundObj.matches.find(m => m.id == matchId);

  const homeTries = prompt('Ensaios da equipa da Casa:', match.homeTries ?? 0);
  const awayTries = prompt('Ensaios da equipa Visitante:', match.awayTries ?? 0);

  if (homeTries !== null && awayTries !== null) {
    match.homeTries = parseInt(homeTries) || 0;
    match.awayTries = parseInt(awayTries) || 0;
    recalculateStandings();
    saveData();
    renderAll();
  }
}

// CÁLCULO AUTOMÁTICO DAS PONTUAÇÕES DE RUGBY
function recalculateStandings() {
  // Reiniciar Estatísticas
  standingsFase1.forEach(t => {
    t.J = 0; t.V = 0; t.E = 0; t.D = 0;
    t.EM = 0; t.ES = 0; t.PM = 0; t.PS = 0;
    t.BO = 0; t.BD = 0; t.PTS = 0;
  });

  fixturesFase1.forEach(r => {
    r.matches.forEach(m => {
      if (m.homeScore !== null && m.awayScore !== null) {
        const home = standingsFase1.find(t => t.id === m.homeId);
        const away = standingsFase1.find(t => t.id === m.awayId);

        const hScore = m.homeScore;
        const aScore = m.awayScore;
        const hTries = m.homeTries || 0;
        const aTries = m.awayTries || 0;

        // Atualizar Jogos e Pontos
        home.J++; away.J++;
        home.PM += hScore; home.PS += aScore;
        away.PM += aScore; away.PS += hScore;
        home.EM += hTries; home.ES += aTries;
        away.EM += aTries; away.ES += hTries;

        // Vitória, Empate, Derrota
        if (hScore > aScore) {
          home.V++; home.PTS += 4;
          away.D++;
        } else if (aScore > hScore) {
          away.V++; away.PTS += 4;
          home.D++;
        } else {
          home.E++; home.PTS += 2;
          away.E++; away.PTS += 2;
        }

        // Bónus Ofensivo (4 ou mais ensaios)
        if (hTries >= 4) { home.BO++; home.PTS += 1; }
        if (aTries >= 4) { away.BO++; away.PTS += 1; }

        // Bónus Defensivo (Derrota por 7 ou menos pontos)
        if (hScore > aScore && (hScore - aScore) <= 7) { away.BD++; away.PTS += 1; }
        if (aScore > hScore && (aScore - hScore) <= 7) { home.BD++; home.PTS += 1; }
      }
    });
  });
}

// EDIÇÃO MANUTENÇÃO DIRETA NA TABELA (MODAL)
function openEditModal(teamId) {
  const team = standingsFase1.find(t => t.id === teamId);
  document.getElementById('editTeamId').value = team.id;
  document.getElementById('editJ').value = team.J;
  document.getElementById('editV').value = team.V;
  document.getElementById('editE').value = team.E;
  document.getElementById('editD').value = team.D;
  document.getElementById('editPM').value = team.PM;
  document.getElementById('editPS').value = team.PS;
  document.getElementById('editBO').value = team.BO;
  document.getElementById('editBD').value = team.BD;
  document.getElementById('editPTS').value = team.PTS;

  document.getElementById('editRowModal').classList.add('open');
}

document.getElementById('btnCancelEdit').addEventListener('click', () => {
  document.getElementById('editRowModal').classList.remove('open');
});

document.getElementById('editRowForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('editTeamId').value;
  const team = standingsFase1.find(t => t.id === id);

  team.J = parseInt(document.getElementById('editJ').value) || 0;
  team.V = parseInt(document.getElementById('editV').value) || 0;
  team.E = parseInt(document.getElementById('editE').value) || 0;
  team.D = parseInt(document.getElementById('editD').value) || 0;
  team.PM = parseInt(document.getElementById('editPM').value) || 0;
  team.PS = parseInt(document.getElementById('editPS').value) || 0;
  team.BO = parseInt(document.getElementById('editBO').value) || 0;
  team.BD = parseInt(document.getElementById('editBD').value) || 0;
  team.PTS = parseInt(document.getElementById('editPTS').value) || 0;

  document.getElementById('editRowModal').classList.remove('open');
  saveData();
  renderAll();
});