// --- ESTADO DA APLICAÇÃO ---
let isAdmin = false;

// Lista de equipas inicial
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

// Inicializa as 11 jornadas se vazias
function initDefaultFixtures() {
  if (fixturesFase1.length === 0) {
    for (let i = 1; i <= 11; i++) {
      fixturesFase1.push({
        round: i,
        bye: '',
        matches: []
      });
    }
  }
}

// --- CARREGAMENTO DE DADOS ---
async function loadData() {
  try {
    const response = await fetch('dados.json?v=' + new Date().getTime());
    if (response.ok) {
      const serverData = await response.json();
      if (serverData.teams) localStorage.setItem('rugby_teams', JSON.stringify(serverData.teams));
      if (serverData.fixtures) localStorage.setItem('rugby_fixtures', JSON.stringify(serverData.fixtures));
    }
  } catch (err) {
    console.log('Sem dados.json remoto, a usar memória local:', err);
  }

  const savedTeams = localStorage.getItem('rugby_teams');
  const savedFixtures = localStorage.getItem('rugby_fixtures');

  if (savedTeams) teams = JSON.parse(savedTeams);
  if (savedFixtures) fixturesFase1 = JSON.parse(savedFixtures);

  initDefaultFixtures();
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
  teams.forEach(t => {
    t.j = 0; t.v = 0; t.e = 0; t.d = 0;
    t.em = 0; t.es = 0; t.pm = 0; t.ps = 0;
    t.bo = 0; t.bd = 0; t.pts = 0;
  });

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

        if (hTries >= 4) { home.bo++; home.pts += 1; }
        if (aTries >= 4) { away.bo++; away.pts += 1; }

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
      <td class="admin-only" style="display: ${isAdmin ? 'table-cell' : 'none'};">
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
        const hTries = m.homeTries !== null && m.homeTries !== undefined ? m.homeTries : '';
        const aTries = m.awayTries !== null && m.awayTries !== undefined ? m.awayTries : '';

        matchesHTML += `
          <div class="match-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 8px;">
            <div style="flex: 1; text-align: right; font-weight: bold; min-width: 120px;">${homeTeam.name}</div>
            
            <div style="margin: 0 10px; display: flex; align-items: center; gap: 5px;">
              <input type="number" class="score-input" value="${hScore}" ${!isAdmin ? 'disabled' : ''} placeholder="Pts" onchange="updateMatchDetails('${r.round}', '${m.id}', 'homeScore', this.value)" style="width: 50px; text-align: center;">
              <span>-</span>
              <input type="number" class="score-input" value="${aScore}" ${!isAdmin ? 'disabled' : ''} placeholder="Pts" onchange="updateMatchDetails('${r.round}', '${m.id}', 'awayScore', this.value)" style="width: 50px; text-align: center;">
            </div>

            <div style="flex: 1; text-align: left; font-weight: bold; min-width: 120px;">${awayTeam.name}</div>

            ${isAdmin ? `
              <div style="font-size: 0.8em; display: flex; align-items: center; gap: 4px; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">
                <span>Ensaios:</span>
                <input type="number" value="${hTries}" placeholder="E.Casa" onchange="updateMatchDetails('${r.round}', '${m.id}', 'homeTries', this.value)" style="width: 40px; text-align: center;">
                <span>-</span>
                <input type="number" value="${aTries}" placeholder="E.Fora" onchange="updateMatchDetails('${r.round}', '${m.id}', 'awayTries', this.value)" style="width: 40px; text-align: center;">
                <button class="btn btn-sm btn-sec" onclick="deleteMatch('${r.round}', '${m.id}')" title="Apagar Jogo" style="color: red; margin-left: 5px;"><i class="fas fa-trash"></i></button>
              </div>
            ` : ''}
          </div>
        `;
      });
    } else {
      matchesHTML = '<p style="font-size: 0.9em; color: #777;">Sem confrontos adicionados para esta jornada.</p>';
    }

    roundDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 2px solid #003366; padding-bottom: 5px;">
        <h4 style="margin: 0;">Jornada ${r.round}</h4>
        ${r.bye ? `<span style="font-size: 0.85em; background: #eef; padding: 2px 8px; border-radius: 4px; color: #003366;">Folga: <strong>${r.bye}</strong></span>` : ''}
      </div>
      <div>${matchesHTML}</div>
    `;

    container.appendChild(roundDiv);
  });
}

function updateMatchDetails(roundNum, matchId, field, val) {
  const round = fixturesFase1.find(r => r.round == roundNum);
  if (!round) return;
  const match = round.matches.find(m => m.id == matchId);
  if (!match) return;

  match[field] = val === '' ? null : parseInt(val);

  recalculateStandings();
  renderAll();
}

function deleteMatch(roundNum, matchId) {
  if (!confirm('Tem a certeza que deseja eliminar este jogo?')) return;
  const round = fixturesFase1.find(r => r.round == roundNum);
  if (!round) return;

  round.matches = round.matches.filter(m => m.id != matchId);
  recalculateStandings();
  renderAll();
}

// --- MODAL DE ADICIONAR JOGO ---
function openAddMatchModal() {
  const modal = document.getElementById('addMatchModal');
  const homeSelect = document.getElementById('matchHome');
  const awaySelect = document.getElementById('matchAway');

  if (!modal || !homeSelect || !awaySelect) return;

  homeSelect.innerHTML = '<option value="">Selecione...</option>';
  awaySelect.innerHTML = '<option value="">Selecione...</option>';

  teams.forEach(t => {
    homeSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    awaySelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
  });

  modal.classList.add('active');
}

function closeAddMatchModal() {
  const modal = document.getElementById('addMatchModal');
  if (modal) modal.classList.remove('active');
}

function handleAddMatchSubmit(e) {
  e.preventDefault();
  const roundNum = parseInt(document.getElementById('matchRound').value);
  const homeId = document.getElementById('matchHome').value;
  const awayId = document.getElementById('matchAway').value;

  if (homeId === awayId) {
    alert('A equipa da casa e a equipa visitante não podem ser a mesma!');
    return;
  }

  let round = fixturesFase1.find(r => r.round === roundNum);
  if (!round) {
    round = { round: roundNum, bye: '', matches: [] };
    fixturesFase1.push(round);
  }

  const newMatch = {
    id: 'm_' + Date.now(),
    homeId: homeId,
    awayId: awayId,
    homeScore: null,
    awayScore: null,
    homeTries: null,
    awayTries: null
  };

  round.matches.push(newMatch);
  saveData();
  closeAddMatchModal();
  renderAll();
}

// --- MODAL DE EDITAR TABELA ---
function openEditModal(teamId) {
  const t = teams.find(team => team.id === teamId);
  if (!t) return;

  document.getElementById('editTeamId').value = t.id;
  document.getElementById('editJ').value = t.j;
  document.getElementById('editV').value = t.v;
  document.getElementById('editE').value = t.e;
  document.getElementById('editD').value = t.d;
  document.getElementById('editPM').value = t.pm;
  document.getElementById('editPS').value = t.ps;
  document.getElementById('editBO').value = t.bo;
  document.getElementById('editBD').value = t.bd;
  document.getElementById('editPTS').value = t.pts;

  document.getElementById('editRowModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editRowModal').classList.remove('active');
}

function handleEditFormSubmit(e) {
  e.preventDefault();
  const teamId = document.getElementById('editTeamId').value;
  const t = teams.find(team => team.id === teamId);
  if (!t) return;

  t.j = parseInt(document.getElementById('editJ').value) || 0;
  t.v = parseInt(document.getElementById('editV').value) || 0;
  t.e = parseInt(document.getElementById('editE').value) || 0;
  t.d = parseInt(document.getElementById('editD').value) || 0;
  t.pm = parseInt(document.getElementById('editPM').value) || 0;
  t.ps = parseInt(document.getElementById('editPS').value) || 0;
  t.bo = parseInt(document.getElementById('editBO').value) || 0;
  t.bd = parseInt(document.getElementById('editBD').value) || 0;
  t.pts = parseInt(document.getElementById('editPTS').value) || 0;

  saveData();
  closeEditModal();
  renderAll();
}

// --- PAINEL ADMIN E ATUALIZAÇÕES DA UI ---
function updateAdminUI() {
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    el.style.display = isAdmin ? (el.tagName === 'TH' || el.tagName === 'TD' ? 'table-cell' : 'flex') : 'none';
  });

  const adminText = document.getElementById('adminText');
  const adminIcon = document.getElementById('adminIcon');
  if (adminText) adminText.textContent = isAdmin ? 'Sair Admin' : 'Entrar Admin';
  if (adminIcon) adminIcon.className = isAdmin ? 'fas fa-unlock' : 'fas fa-lock';
}

function toggleAdmin() {
  if (!isAdmin) {
    const pass = prompt('Introduza a palavra-passe de Administrador:');
    if (pass === 'admin123') {
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
  // Login Admin
  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) adminBtn.addEventListener('click', toggleAdmin);

  // Botões Exportar e Importar (debaixo do Admin)
  const btnExport = document.getElementById('btnExportData');
  if (btnExport) btnExport.addEventListener('click', exportDataJSON);

  const btnImport = document.getElementById('btnImportData');
  const fileInput = document.getElementById('importFileInput');
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importDataJSON);
  }

  // Modal Adicionar Jogo
  const btnAddMatch = document.getElementById('btnAddMatchFase1');
  if (btnAddMatch) btnAddMatch.addEventListener('click', openAddMatchModal);

  const btnCancelAddMatch = document.getElementById('btnCancelAddMatch');
  if (btnCancelAddMatch) btnCancelAddMatch.addEventListener('click', closeAddMatchModal);

  const addMatchForm = document.getElementById('addMatchForm');
  if (addMatchForm) addMatchForm.addEventListener('submit', handleAddMatchSubmit);

  // Modal Editar Tabela
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeEditModal);

  const editRowForm = document.getElementById('editRowForm');
  if (editRowForm) editRowForm.addEventListener('submit', handleEditFormSubmit);

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

  // Navegação
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

  // Carrega dados iniciais
  loadData();
});