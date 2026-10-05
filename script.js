// 1. Configuração do Firebase (Substitui com os teus dados do Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDzjiryvRxZ4L2UCGhnRUgS1XCzUUP2Bvw",
  authDomain: "rugby-sub18.firebaseapp.com",
  databaseURL: "https://rugby-sub18-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "rugby-sub18",
  storageBucket: "rugby-sub18.firebasestorage.app",
  messagingSenderId: "718619882663",
  appId: "1:718619882663:web:6f9b598766e255073cd782",
  measurementId: "G-WRCMJ62RD4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Lista local para guardar as alterações temporárias
let jogos = [];

// 2. Carregar jogos da base de dados assim que a página abre
window.onload = function() {
  database.ref('jogos').once('value').then((snapshot) => {
    const data = snapshot.val();
    if (data) {
      jogos = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    renderizarTabela();
  });
};

// 3. Adicionar um novo jogo à lista local
function adicionarJogo() {
  const equipa1 = document.getElementById('equipa1').value;
  const equipa2 = document.getElementById('equipa2').value;
  const dataJogo = document.getElementById('dataJogo').value;

  if (!equipa1 || !equipa2 || !dataJogo) {
    alert('Por favor, preenche todos os campos do jogo.');
    return;
  }

  const novoJogo = {
    id: 'jogo_' + Date.now(),
    equipa1: equipa1,
    res1: '',
    res2: '',
    equipa2: equipa2,
    data: dataJogo
  };

  jogos.push(novoJogo);
  renderizarTabela();

  // Limpar campos
  document.getElementById('equipa1').value = '';
  document.getElementById('equipa2').value = '';
  document.getElementById('dataJogo').value = '';
}

// 4. Renderizar a tabela na página
function renderizarTabela() {
  const tbody = document.getElementById('tabelaJogos');
  tbody.innerHTML = '';

  jogos.forEach((jogo, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${jogo.data}</td>
      <td>${jogo.equipa1}</td>
      <td>
        <input type="number" class="score-input" value="${jogo.res1}" onchange="atualizarResultado(${index}, 'res1', this.value)">
        -
        <input type="number" class="score-input" value="${jogo.res2}" onchange="atualizarResultado(${index}, 'res2', this.value)">
      </td>
      <td>${jogo.equipa2}</td>
      <td>
        <button class="btn-delete" onclick="eliminarJogo(${index})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 5. Atualizar os resultados localmente ao digitar
function atualizarResultado(index, campo, valor) {
  jogos[index][campo] = valor;
}

// 6. Eliminar jogo localmente
function eliminarJogo(index) {
  jogos.splice(index, 1);
  renderizarTabela();
}

// 7. PUBLICAR ALTERAÇÕES NA NET (Grava no Firebase)
function publicarAlteracoes() {
  // Converter array para objeto indexado
  const jogosObjeto = {};
  jogos.forEach(jogo => {
    jogosObjeto[jogo.id] = jogo;
  });

  database.ref('jogos').set(jogosObjeto)
    .then(() => {
      alert('✅ Alterações publicadas com sucesso! Todos os visitantes já podem ver os novos dados.');
    })
    .catch((error) => {
      alert('❌ Erro ao publicar: ' + error.message);
    });
}