// ===== Navegação mobile & smooth =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    navLinks.classList.contains('active')
        ? icon.classList.replace('bx-menu', 'bx-x')
        : icon.classList.replace('bx-x', 'bx-menu');
});
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const id = a.getAttribute('href');
        const t = document.querySelector(id);
        if (!t) return;
        window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
        navLinks?.classList.remove('active');
    });
});

// ===== Estado =====
let ctx = { profissional: null, wa: null, colecao: 'agendamentos' }; // <-- força agendamentos
let agendamentoContexto = {
    nomeCliente: '',
    produtos: [],
    totalProdutos: 0,
    raclub: { status: 'nao' },
    servico: null // {nome, valor}
};

// ===== Constantes =====
const REVIEW_URL = document.getElementById('btnAvaliarGoogle')?.getAttribute('href') || '';

const PRODUTOS = [
    { nome: "Pomada Líquida DA Force MEN", preco: 39.99 },
    { nome: "Leave-in", preco: 39.99 },
    { nome: "Tônico Capilar Dom Pelo", preco: 49.99 },
    { nome: "Balm Para Barba", preco: 39.99 },
    { nome: "Pomada Modeladora - Efeito Teia", preco: 34.99 },
    { nome: "Pomada Modeladora - Efeito Seco ", preco: 34.99 },
];

// >>> Catálogo de serviços mostrado no modal
const SERVICOS = [
    { nome: 'Selecionar...', valor: null, placeholder: true }, // primeira linha
    { nome: 'Acabamento ', valor: 20.00 },
    { nome: 'Maquina e Tesoura', valor: 40.00 },
    { nome: 'Corte Maquina', valor: 40.00 },
    { nome: 'Corte Tesoura', valor: 50.00 },
    { nome: 'Alisamento Americano', valor: 40.00 },
    { nome: 'Corte Infantil', valor: 50.00 },
    { nome: 'Blindado', valor: 60.00 },
    { nome: 'Corte + Barba + Alisamento Prime', valor: 150.00 },
    { nome: 'Corte e Escova', valor: 70.00 },
    { nome: 'Corte Fantasia', valor: 60.00 },
    { nome: 'Barba + Sobrancelha', valor: 55.00 },
    { nome: 'Corte + Barba + Sobrancelha', valor: 90.00 },
    { nome: 'Corte + Alisamento Prime', valor: 95.00 },
    { nome: 'Corte + Progressiva', valor: 115.00 },
    { nome: 'Corte + Sobrancelha', valor: 65.00 },
    { nome: 'Corte + Feminino', valor: 70.00 },
    { nome: 'Matizar', valor: 30.00 },
    { nome: 'Progressiva', valor: 70.00 },
    { nome: 'Taper Fade', valor: 40.00 },
    { nome: 'Navalhado', valor: 45.00 },
    { nome: 'Alisamento + Corte + Barba + Pigmentação + Sobrancelha', valor: 230.00 },
    { nome: 'Alisamento Prime + Corte + Pigmentação + Sobrancelha', valor: 175.00 },
    { nome: 'Alisamento Prime + Corte Maquina + Barba', valor: 140.00 },
    { nome: 'Alisamento Prime + Corte Tesoura', valor: 125.00 },
    { nome: 'Alisamento Prime + Corte Tesoura + Barba', valor: 160.00 },
    { nome: 'Alisamento Prime + Navalhado', valor: 120.00 },
    { nome: 'Alisamento Prime + Navalhado + Barba', valor: 145.00 },
    { nome: 'Aplicação de Colorção', valor: 45.00 },
    { nome: 'Barba + Acabamento', valor: 55.00 },
    { nome: 'Barba + Hidratação', valor: 55.00 },
    { nome: 'Barba + Pigmentação', valor: 60.00 },
    { nome: 'Barba + Limpeza de Pele', valor: 65.00 },
    { nome: 'Botox + Navalhado + Barba', valor: 110.00 },
    { nome: 'Botox Prime + Corte Maquina + Barba', valor: 120.00 },
    { nome: 'Botox Prime + Corte Tesoura + Barba', valor: 130.00 },
    { nome: 'Corte + Barba + Limpeza de Pele', valor: 120.00 },
    { nome: 'Corte + Barba', valor: 75.00 },
    { nome: 'Corte + Hidratação + Escova', valor: 65.00 },
    { nome: 'Corte + Alisamento Americano', valor: 75.00 },
    { nome: 'Corte + Alisamento Prime + Sobrancelha', valor: 130.00 },
    { nome: 'Corte + Barba + Alisamento Americano', valor: 100.00 },
    { nome: 'Corte + Barba + Botox Prime', valor: 120.00 },
    { nome: 'Corte + Barba + Limpeza de Pele', valor: 120.00 },
    { nome: 'Corte + Barba + Limpeza de Pele + Sobrancelha + Pigmentação Capilar', valor: 145.00 },
    { nome: 'Corte + Barba + Sobrancelha + Botox Prime', valor: 160.00 },
    { nome: 'Corte + Botox + Sobrancelha ', valor: 110.00 },
    { nome: 'Corte + Botox Prime', valor: 105.00 },
    { nome: 'Corte + Luzes', valor: 115.00 },
    { nome: 'Corte + Luzes + Sobrancelha', valor: 140.00 },
    { nome: 'Corte + Luzes + Progressiva', valor: 165.00 },
    { nome: 'Corte + Pigmentação + Barba', valor: 100.00 },
];

const toBRL = (n) => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ===== Helpers de modal =====
function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function fecharModal(id) { document.getElementById(id).style.display = 'none'; }
window.fecharModal = fecharModal;

// ===== Persistência (RA Club) =====
function salvarContextoSessao() {
    try {
        sessionStorage.setItem('agendamentoCtx', JSON.stringify(agendamentoContexto));
        sessionStorage.setItem('ctx', JSON.stringify(ctx));
    } catch { }
}
function restaurarContextoSessao() {
    try {
        const c1 = sessionStorage.getItem('agendamentoCtx');
        const c2 = sessionStorage.getItem('ctx');
        if (c1) agendamentoContexto = JSON.parse(c1);
        if (c2) ctx = JSON.parse(c2);
    } catch { }
}
function tentarRetomarPosCheckout() {
    const flag = sessionStorage.getItem('raclubCheckoutRedirect');
    if (flag === '1') {
        sessionStorage.removeItem('raclubCheckoutRedirect');
        restaurarContextoSessao();
        if (ctx?.colecao && ctx?.profissional) {
            agendamentoContexto.raclub = { status: 'assinar_link' };
            fecharModal('modalRAClub');
            abrirModalAgendamento();
        }
    }
}
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tentarRetomarPosCheckout();
});

// ===== Fluxo Nome → Produtos → RA Club → Agendamento =====
const nomeClienteInput = document.getElementById('nomeCliente');
document.getElementById('btnClienteContinuar')?.addEventListener('click', () => {
    const nome = (nomeClienteInput.value || '').trim();
    if (!nome) { alert('Digite seu nome para continuar.'); return; }
    agendamentoContexto.nomeCliente = nome;
    fecharModal('modalCliente');
    abrirModalProdutos();
});

// Produtos
const produtosContainer = document.getElementById('produtosContainer');
const prodTotalSpan = document.getElementById('prodTotal');
const btnProdutosPular = document.getElementById('btnProdutosPular');
const btnProdutosContinuar = document.getElementById('btnProdutosContinuar');

function renderProdutos() {
    produtosContainer.innerHTML = '';
    PRODUTOS.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.dataset.index = i;
        card.innerHTML = `
      <div class="p-name">${p.nome}</div>
      <div class="p-price">${toBRL(p.preco)}</div>
      <small class="muted">Toque para selecionar</small>
    `;
        card.addEventListener('click', () => toggleProduto(i, card));
        produtosContainer.appendChild(card);
    });
}
function toggleProduto(index, cardEl) {
    const item = PRODUTOS[index];
    const exists = agendamentoContexto.produtos.find(pr => pr.nome === item.nome);
    if (exists) {
        agendamentoContexto.produtos = agendamentoContexto.produtos.filter(pr => pr.nome !== item.nome);
        cardEl.classList.remove('active');
    } else {
        agendamentoContexto.produtos.push({ nome: item.nome, preco: item.preco });
        cardEl.classList.add('active');
    }
    agendamentoContexto.totalProdutos = agendamentoContexto.produtos.reduce((s, it) => s + (it.preco || 0), 0);
    prodTotalSpan.textContent = toBRL(agendamentoContexto.totalProdutos);
}
function abrirModalProdutos() {
    agendamentoContexto.produtos = [];
    agendamentoContexto.totalProdutos = 0;
    prodTotalSpan.textContent = toBRL(0);
    renderProdutos();
    abrirModal('modalProdutos');
}
btnProdutosPular?.addEventListener('click', () => { fecharModal('modalProdutos'); abrirModalRAClub(); });
btnProdutosContinuar?.addEventListener('click', () => { fecharModal('modalProdutos'); abrirModalRAClub(); });

// RA Club
const btnRAJaMembro = document.getElementById('btnRAJaMembro');
const btnRANao = document.getElementById('btnRANao');
const btnRAAssinar = document.getElementById('btnRAAssinar');
function abrirModalRAClub() { abrirModal('modalRAClub'); }
btnRAJaMembro?.addEventListener('click', () => { agendamentoContexto.raclub = { status: 'membro' }; fecharModal('modalRAClub'); abrirModalAgendamento(); });
btnRANao?.addEventListener('click', () => { agendamentoContexto.raclub = { status: 'nao' }; fecharModal('modalRAClub'); abrirModalAgendamento(); });
if (btnRAAssinar) {
    const RA_CLUB_CHECKOUT_URL = btnRAAssinar.getAttribute('href') || '';
    btnRAAssinar.addEventListener('click', () => {
        agendamentoContexto.raclub = { status: 'assinar_link' };
        salvarContextoSessao();
        sessionStorage.setItem('raclubCheckoutRedirect', '1');
        if (!RA_CLUB_CHECKOUT_URL) alert('Link de checkout não configurado.');
    });
}

// Agendamento (data/hora)
const dataInput = document.getElementById('data');
const horaSelect = document.getElementById('hora');

// >>> horários fixos 09:00–18:00 de 1 em 1 hora
const MAPA_FIM_EXPEDIENTE = {
    'Rodrigo': '18:30',
    'Melqui': '17:30'
};
// AJUSTE: passo de 60 min e janela 09:00–18:00
function gerarIntervalos(inicio = '09:00', fim = '18:00', passoMin = 60) {
    const out = [];
    let [h, m] = inicio.split(':').map(Number);
    const [hF, mF] = fim.split(':').map(Number);
    while (h < hF || (h === hF && m <= mF)) {
        out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        m += passoMin;
        while (m >= 60) { m -= 60; h += 1; }
    }
    return out;
}
function fillHorasForProf(/* prof */) {
    const lista = gerarIntervalos('09:00', '18:00', 60); // 09 → 18 de 1h em 1h
    horaSelect.innerHTML = `<option value="">Selecione um horário</option>` +
        lista.map(h => `<option>${h}</option>`).join('');
}

function resetSelectVisual() {
    for (const opt of horaSelect.options) {
        if (!opt.value) continue;
        opt.disabled = false;
        opt.classList.remove('reservado');
    }
}
function abrirModalAgendamento() {
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = String(hoje.getMonth() + 1).padStart(2, "0");
    const d = String(hoje.getDate()).padStart(2, "0");
    dataInput.min = `${y}-${m}-${d}`;
    dataInput.value = "";

    // horários fixos
    fillHorasForProf(ctx.profissional);

    horaSelect.value = "";
    resetSelectVisual();

    // exibe serviço atual no "display"
    const display = document.getElementById('servicoDisplay');
    display.value = agendamentoContexto.servico
        ? `${agendamentoContexto.servico.nome} — ${toBRL(agendamentoContexto.servico.valor)}`
        : '';

    abrirModal('modal');
}

// Botões dos profissionais
document.querySelectorAll('.openModalBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        ctx.profissional = btn.dataset.pro || 'Profissional'; // guardamos o nome exibido
        ctx.wa = btn.dataset.wa || '5581999999999';
        // SEM usar coleções separadas; o painel lê "agendamentos"
        ctx.colecao = 'agendamentos';
        salvarContextoSessao();
        abrirModal('modalCliente');
    });
});

// ===== Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    doc, getDoc, setDoc, serverTimestamp,
    collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPWbaq4y8XY_MSXwft3J0rwXFYlzH4Z70",
  authDomain: "barbearia-amostra.firebaseapp.com",
  projectId: "barbearia-amostra",
  storageBucket: "barbearia-amostra.firebasestorage.app",
  messagingSenderId: "974173474485",
  appId: "1:974173474485:web:3306ad4181d1e33be778fc",
  measurementId: "G-RCEJZL6B7C"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔐 Login anônimo para cumprir as regras (request.auth != null)
const auth = getAuth(app);
signInAnonymously(auth).catch((e) => {
    console.error("Anon auth error:", e);
});
onAuthStateChanged(auth, (user) => {
    console.log("Auth user:", user ? user.uid : null);
});

const confirmarBtn = document.getElementById('confirmarBtn');
const toKey = (ymd, hhmm, profSlug) => `ag_${ymd}_${hhmm}_${profSlug}`;
const normalizeHora = (h) => (h || "").padStart(5, "0");

// ======== chave agregada para evitar índice composto ========
const diaProfKey = (ymd, prof) => `${ymd}#${prof}`;

// === Listar ocupados SEM índice composto (1 where) ===
async function getReservasByDate(ymd) {
    const q = query(
        collection(db, 'agendamentos'),
       where("diaProf", "==", diaProfKey(ymd, ctx.profissional || "barbeiro"))

    );
    const snap = await getDocs(q);
    const horasOcupadas = new Set();
    snap.forEach(d => {
        const row = d.data();
        if (row?.hora) horasOcupadas.add(row.hora);
    });
    return horasOcupadas;
}
async function carregarIndisponiveis() {
    if (!dataInput?.value) return;
    resetSelectVisual();
    try {
        const horas = await getReservasByDate(dataInput.value);
        for (const opt of horaSelect.options) {
            if (!opt.value) continue;
            const ocupado = horas.has(opt.value);
            opt.disabled = ocupado;
            opt.classList.toggle('reservado', ocupado);
            if (ocupado && horaSelect.value === opt.value) horaSelect.value = '';
        }
    } catch (e) {
        console.error("Erro ao carregar horários:", e);
        alert("Não foi possível consultar os horários agora.");
    }
}
dataInput?.addEventListener('change', carregarIndisponiveis);

// ===== Modal de Serviço =====
const servicoDisplay = document.getElementById('servicoDisplay');
const servicoLista = document.getElementById('servicoLista');
const servicoCancelar = document.getElementById('servicoCancelar');
const servicoConfirmarWpp = document.getElementById('servicoConfirmarWpp');

// 🔍 busca
const svcSearch = document.getElementById('svcSearch');
let svcFilterText = "";
const norm = (s) => (s || "").normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function getFilteredServicos() {
    const base = SERVICOS.slice(1);
    if (!svcFilterText.trim()) return [SERVICOS[0], ...base];
    const f = norm(svcFilterText);
    const filtered = base.filter(s => norm(s.nome).includes(f));
    return [SERVICOS[0], ...filtered];
}
function renderListaServicos() {
    const items = getFilteredServicos();
    servicoLista.innerHTML = items.map((s) => {
        const checked = agendamentoContexto.servico
            ? (agendamentoContexto.servico.nome === s.nome ? 'checked' : '')
            : (s.placeholder ? 'checked' : '');
        const sub = s.placeholder ? '' : `<div class="svc-muted">${s.valor != null ? toBRL(s.valor) : ''}</div>`;
        return `
      <label class="svc-row" data-nome="${s.nome}">
        <div class="svc-left">
          <div class="svc-name">${s.nome}</div>
          ${sub}
        </div>
        <input class="svc-radio" type="radio" name="svc" value="${s.nome}" ${checked} />
      </label>
    `;
    }).join('');
    servicoLista.querySelectorAll('.svc-row').forEach(row => {
        row.addEventListener('click', () => {
            const radio = row.querySelector('input[type="radio"]');
            if (!radio) return;
            radio.checked = true;
        });
    });
}
function abrirServico() {
    svcFilterText = "";
    if (svcSearch) svcSearch.value = "";
    renderListaServicos();
    abrirModal('servicoModal');
}
servicoDisplay?.addEventListener('click', abrirServico);
servicoCancelar?.addEventListener('click', () => fecharModal('servicoModal'));
svcSearch?.addEventListener('input', (e) => { svcFilterText = e.target.value || ""; renderListaServicos(); });

servicoConfirmarWpp?.addEventListener('click', () => {
    const sel = servicoLista.querySelector('input[name="svc"]:checked');
    if (!sel) { alert('Selecione um serviço.'); return; }
    const nomeSel = sel.value;
    const s = SERVICOS.find(x => x.nome === nomeSel);
    if (!s || s.placeholder) { alert('Selecione um serviço.'); return; }

    agendamentoContexto.servico = { nome: s.nome, valor: s.valor };
    servicoDisplay.value = `${s.nome} — ${toBRL(s.valor)}`;
    fecharModal('servicoModal');

    if (dataInput.value && horaSelect.value) {
        confirmarBtn.click();
    }
});

// ===== Confirmar agendamento =====
confirmarBtn?.addEventListener('click', async () => {
    const data = dataInput?.value;
    const hora = horaSelect?.value;
    if (!data || !hora) { alert("Selecione data e horário."); return; }
    if (!agendamentoContexto.servico) { alert("Selecione o serviço."); abrirServico(); return; }
    if (!ctx.wa) { alert("Profissional não definido."); return; }

    confirmarBtn.disabled = true;
    const originalText = confirmarBtn.textContent;
    confirmarBtn.textContent = "Reservando...";

    try {
        const hhmm = normalizeHora(hora);

        // ⚠️ Doc id único em "agendamentos"
        const profSlug = "barbeiro";
        const ref = doc(db, 'agendamentos', toKey(data, hhmm, profSlug));

        // evita overbooking
        const checkSnap = await getDoc(ref);
        if (checkSnap.exists()) {
            await carregarIndisponiveis();
            alert("Este horário já foi reservado. Escolha outro, por favor.");
            return;
        }

        const isRaClub = agendamentoContexto?.raclub?.status === 'membro';

        // ✅ Campos compatíveis com o PAINEL + diaProf para consulta sem índice
        await setDoc(ref, {
            dataISO: data,
            hora: hhmm,
            profissional: "barbeiro",
            diaProf: diaProfKey(data, "barbeiro"),
            barbeiroNome: ctx.profissional,
            clienteNome: agendamentoContexto.nomeCliente || null,
            cliente: agendamentoContexto.nomeCliente || null,
            servico: agendamentoContexto.servico?.nome || null,
            valor: agendamentoContexto.servico?.valor ?? 0,
            servicoNome: agendamentoContexto.servico?.nome || null,
            servicoValor: agendamentoContexto.servico?.valor ?? null,
            produtos: agendamentoContexto.produtos || [],
            totalProdutos: agendamentoContexto.totalProdutos || 0,
            raclub: agendamentoContexto.raclub || { status: 'nao' },
            raclubMembro: isRaClub,
            clienteTipo: isRaClub ? 'raclub' : 'cliente',
            tags: isRaClub ? ['raclub'] : [],
            bloqueado: false,
            pagamentoForma: "",
            createdAt: serverTimestamp()
        });

        try { await carregarIndisponiveis(); } catch (e) {
            console.warn("Falhou recarregar indisponíveis (UI):", e);
        }

        const dataBR = new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
        const servicoTxt = agendamentoContexto.servico
            ? `Serviço: ${agendamentoContexto.servico.nome} (${toBRL(agendamentoContexto.servico.valor)})\n`
            : '';

        let produtosTxt = "Sem produtos adicionais";
        if (agendamentoContexto.produtos.length) {
            const list = agendamentoContexto.produtos.map(p => `${p.nome} (${toBRL(p.preco)})`).join(', ');
            produtosTxt = `Produtos: ${list} | Total: ${toBRL(agendamentoContexto.totalProdutos)}`;
        }

        let raclubTxt = "RA Club: Não";
        if (agendamentoContexto.raclub.status === 'membro') raclubTxt = "RA Club: Já sou membro";
        else if (agendamentoContexto.raclub.status === 'assinar') raclubTxt = "RA Club: Quero assinar";
        else if (agendamentoContexto.raclub.status === 'assinar_link') raclubTxt = "RA Club: Quero assinar (via link)";

        const mensagem =
            `Olá! Sou ${agendamentoContexto.nomeCliente}${isRaClub ? " (RA Club)" : ""}.
Agendamento Confirmado com ${ctx.profissional} para o dia ${dataBR} às ${hhmm}.
${servicoTxt}${produtosTxt}
${raclubTxt}`;

        const url = `https://wa.me/${ctx.wa}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");

        const reviewBtn = document.getElementById('btnAvaliarGoogle');
        if (REVIEW_URL && !/SEU_PLACE_ID_AQUI/i.test(REVIEW_URL)) reviewBtn.href = REVIEW_URL;
        setTimeout(() => abrirModal('modalAvaliacao'), 400);

        fecharModal('modal');
    } catch (err) {
        console.error("[RESERVA]", err);
        alert("Não foi possível concluir a reserva. Tente novamente.");
    } finally {
        confirmarBtn.disabled = false;
        confirmarBtn.textContent = originalText || "Agendar via WhatsApp";
    }
});

// Util
function formatDateBR(ymd) {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
}

// Fechar modal clicando fora
window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(m => {
        if (e.target === m) m.style.display = 'none';
    });
});

// Retomar fluxo pós-checkout
tentarRetomarPosCheckout();
