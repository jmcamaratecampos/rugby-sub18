// --- ESTADO DA APLICAÇÃO ---
let isAdmin = false;

// Lista de equipas inicial caso não exista dados guardados
let teams = [
  { id: 'direito', name: 'GD Direito', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'cdul', name: 'CDUL', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'agronomia', name: 'Agronomia', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'belenenses', name: 'CF "Os Belenenses"', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'cascais', name: 'GDS Cascais', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'benfica', name: 'SL Benfica', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'cdup', name: 'CDUP', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'academica', name: 'AAC Coimbra', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'technico', name: 'CR Técnico', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'lousa', name: 'RC Lousã', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 },
  { id: 'saomiguel', name: 'CR São Miguel', j: 0, v: 0, e: 0, d: 0, em: 0, es: 0, pm: 0, ps: 0, bo: 0, bd: 0, pts: 0 }
];

let fixturesFase1 = [];

// --- CARREGAMENTO DE DADOS ---
async function loadData() {
  try {
    // Tenta carregar o dados.json publicado no servidor/GitHub
    const response = await fetch('dados.json?v=' + new Date().getTime());
    if (response.ok) {
      const serverData = await response.json();
      if (serverData.teams) localStorage.setItem('rugby_teams', JSON.stringify(serverData.teams));
      if (serverData.fixtures) localStorage.setItem('rugby_fixtures', JSON.stringify(serverData.fixtures));
    }
  } catch (err) {
    console.log('Sem dados.json remoto ou erro ao carregar, a usar localStorage:', err);
  }

  const savedTeams = localStorage.getItem('rugby_teams');
  const savedFixtures = localStorage.getItem('rugby_fixtures');

  if (savedTeams) teams = JSON.parse(savedTeams);
  if (savedFixtures) fixturesFase1 = JSON.parse(savedFixtures);

  renderAll();
}

function saveData() {
  localStorage.setItem('rugby_teams', JSON.stringify(teams));
  localStorage.setItem('rugby_fixtures', JSON.stringify(fixturesFase1));
}

// --- EXPORTAR E IMPORTAR JSON ---
function exportDataJSON() {
  const dataToExport = {
    teams: teams,
    fixtures: fixturesFase1,
    exportedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dados.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData.teams && importedData.fixtures) {
        teams = importedData.teams;
        fixturesFase1 = importedData.fixtures;
        saveData();
        renderAll();
        alert('Dados importados com sucesso!');
      } else {
        alert('O ficheiro JSON selecionado não tem a estrutura correta.');
      }
    } catch (err) {
      alert('Erro ao ler o ficheiro JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// --- RECALCULAR TABELA COM BASE NOS JOGOS ---
function recalculateStandings() {
  // Reseta estatísticas das equipas
  teams.forEach(t => {
    t.j = 0; t.v = 0; t.e = 0; t.d = 0;
    t.em = 0; t.es = 0; t.pm = 0; t.ps = 0;
    t.bo = 0; t.bd = 0; t.pts = 0;
  });

  // Percorre todos os jogos realizados e acumula pontos
  fixturesFase1.forEach(roundData => {
    if (!roundData.matches) return;
    roundData.matches.forEach(match => {
      if (match.homeScore !== null && match.awayScore !== null && match.homeScore !== '' && match.awayScore !== '') {
        const home = teams.find(t => t.id === match.homeId);
        const away = teams.find(t => t.id === match.awayId);

        if (!home || !away) return;

        const hScore = parseInt(match.homeScore) || 0;
        const aScore = parseInt(match.awayScore) || 0;
        const hTries = parseInt(match.homeTries) || 0;
        const aTries = parseInt(match.awayTries) || 0;

        home.j++; away.j++;
        home.pm += hScore; home.ps += aScore;
        away.pm += aScore; away.ps += hScore;
        home.em += hTries; away.es += hTries;
        away.em += aTries; home.es += aTries;

        // Vitória / Empate / Derrota
        if (hScore > aScore) {
          home.v++; home.pts += 4;
          away.d++;
        } else if (aScore > hScore) {
          away.v++; away.pts += 4;
          home.d++;
        } else {
          home.e++; home.pts += 2;
          away.e++; away.pts += 2;
        }

        // Bónus Ofensivo (4 ou mais ensaios)
        if (hTries >= 4) { home.bo++; home.pts += 1; }
        if (aTries >= 4) { away.bo++; away.pts += 1; }

        // Bónus Defensivo (Derrota por 7 ou menos pontos)
        if (hScore > aScore && (hScore - aScore) <= 7) { away.bd++; away.pts += 1; }
        if (aScore > hScore && (aScore - hScore) <= 7) { home.bd++; home.pts += 1; }
      }
    });
  });

  saveData();
}

// --- RENDERIZAÇÃO ---
function renderAll() {
  renderTableFase1();
  renderFixturesFase1();
  updateAdminUI();
}

function renderTableFase1() {
  // Ordena equipas por Pontos (PTS) desc. e depois por Diferença de Pontos (DP)
  const sorted = [...teams].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const dpB = b.pm - b.ps;
    const dpA = a.pm - a.ps;
    return dpB - dpA;
  });

  const tbody = document.getElementById('tbodyFase1');
  if (!tbody) return;
  tbody.innerHTML = '';

  sorted.forEach((t, index) => {
    const dp = t.pm - t.ps;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td><strong>${t.name}</strong></td>
      <td>${t.j}</td>
      <td>${t.v}</td>
      <td>${t.e}</td>
      <td>${t.d}</td>
      <td>${t.em}</td>
      <td>${t.es}</td>
      <td>${t.pm}</td>
      <td>${t.ps}</td>
      <td>${dp > 0 ? '+' + dp : dp}</td>
      <td>${t.bo}</td>
      <td>${t.bd}</td>
      <td><strong>${t.pts}</strong></td>
      <td class="admin-only">
        <button class="btn btn-sm btn-sec" onclick="openEditModal('${t.id}')"><i class="fas fa-edit"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderFixturesFase1() {
  const container = document.getElementById('fixturesFase1');
  if (!container) return;
  container.innerHTML = '';

  if (fixturesFase1.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum jogo agendado na 1ª Fase.</p>';
    return;
  }

  fixturesFase1.forEach(r => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round-card card mt-1';
    
    let matchesHTML = '';
    if (r.matches && r.matches.length > 0) {
      r.matches.forEach(m => {
        const homeTeam = teams.find(t => t.id === m.homeId) || { name: m.homeId };
        const awayTeam = teams.find(t => t.id === m.awayId) || { name: m.awayId };
        const hScore = m.homeScore !== null && m.homeScore !== undefined ? m.homeScore : '';
        const aScore = m.awayScore !== null && m.awayScore !== undefined ? m.awayScore : '';

        matchesHTML += `
          <div class="match-row" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <div style="flex: 1; text-align: right; font-weight: bold;">${homeTeam.name}</div>
            <div style="margin: 0 15px; display: flex; align-items: center; gap: 5px;">
              <input type="number" class="score-input" value="${hScore}" ${!isAdmin ? 'disabled' : ''} onchange="updateScore('${r.round}', '${m.id}', 'home', this.value)" style="width: 45px; text-align: center;">
              <span>-</span>
              <input type="number" class="score-input" value="${aScore}" ${!isAdmin ? 'disabled' : ''} onchange="updateScore('${r.round}', '${m.id}', 'away', this.value)" style="width: 45px; text-align: center;">
            </div>
            <div style="flex: 1; text-align: left; font-weight: bold;">${awayTeam.name}</div>
          </div>
        `;
      });
    } else {
      matchesHTML = '<p style="font-size: 0.9em; color: #777;">Sem confrontos nesta jornada.</p>';
    }

    roundDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px;">
        <h4 style="margin: 0;">Jornada ${r.round}</h4>
        ${r.bye ? `<span style="font-size: 0.85em; background: #eee; padding: 2px 8px; border-radius: 4px;">Folga: <strong>${r.bye}</strong></span>` : ''}
      </div>
      <div>${matchesHTML}</div>
    `;

    container.appendChild(roundDiv);
  });
}

function updateScore(roundNum, matchId, type, val) {
  const round = fixturesFase1.find(r => r.round == roundNum);
  if (!round) return;
  const match = round.matches.find(m => m.id == matchId);
  if (!match) return;

  const numVal = val === '' ? null : parseInt(val);
  if (type === 'home') match.homeScore = numVal;
  if (type === 'away') match.awayScore = numVal;

  recalculateStandings();
  renderAll();
}

// --- PAINEL ADMIN E ATUALIZAÇÕES DA UI ---
function updateAdminUI() {
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    el.style.display = isAdmin ? 'inline-block' : 'none';
  });

  const adminText = document.getElementById('adminText');
  const adminIcon = document.getElementById('adminIcon');
  if (adminText) adminText.textContent = isAdmin ? 'Sair Admin' : 'Entrar Admin';
  if (adminIcon) adminIcon.className = isAdmin ? 'fas fa-unlock' : 'fas fa-lock';
}

function toggleAdmin() {
  if (!isAdmin) {
    const pass = prompt('Introduza a palavra-passe de Administrador:');
    if (pass === 'admin123') { // Podes alterar a palavra-passe aqui
      isAdmin = true;
      alert('Modo Administrador ativado!');
    } else if (pass !== null) {
      alert('Palavra-passe incorreta!');
    }
  } else {
    isAdmin = false;
    alert('Modo Administrador desativado.');
  }
  renderAll();
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  // Botão Admin Login
  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) adminBtn.addEventListener('click', toggleAdmin);

  // Botões Exportar e Importar
  const btnExport = document.getElementById('btnExportData');
  if (btnExport) btnExport.addEventListener('click', exportDataJSON);

  const btnImport = document.getElementById('btnImportData');
  const fileInput = document.getElementById('importFileInput');
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importDataJSON);
  }

  // Menu Sidebar
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  const overlay = document.getElementById('overlay');

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    });
  }

  if (closeSidebar && sidebar && overlay) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // Navegação entre Fases
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetPhase = link.getAttribute('data-phase');
      document.querySelectorAll('.phase-section').forEach(sec => {
        sec.classList.remove('active');
      });
      const activeSec = document.getElementById(targetPhase);
      if (activeSec) activeSec.classList.add('active');

      if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      }
    });
  });

  // Carrega os dados ao iniciar a aplicação
  loadData();
});