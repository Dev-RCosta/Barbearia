import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// PROTÓTIPO: implementar autenticação antes da publicação.
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
const auth = getAuth(app);
signInAnonymously(auth).catch(error => console.error('[ADMIN AUTH]', error));

const HOURS = Array.from({ length: 11 }, (_, index) => `${String(index + 9).padStart(2, '0')}:00`);
const PROFESSIONALS = { Rodrigo: 'Jhonne', Melqui: 'Pedro' };
const SERVICES = [
    'Acabamento', 'Maquina e Tesoura', 'Corte Maquina', 'Corte Tesoura',
    'Corte + Barba', 'Barba + Sobrancelha', 'Corte Infantil', 'Outro'
];

const pad = value => String(value).padStart(2, '0');
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const displayDate = value => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
const normalizeHour = value => String(value || '').slice(0, 5);
const technicalProfessional = value => PROFESSIONALS[value] ? value : Object.keys(PROFESSIONALS).find(key => PROFESSIONALS[key] === value) || value;
const commercialProfessional = value => PROFESSIONALS[value] || value || 'Barbeiro';
const isCancelled = reservation => reservation.status === 'cancelado';

async function readReservations() {
    const snapshot = await getDocs(collection(db, 'agendamentos'));
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

function reservationDate(item) { return item.dataISO || item.data || ''; }
function reservationHour(item) { return normalizeHour(item.hora || item.horario); }
function reservationProfessional(item) {
    return technicalProfessional(item.barbeiroNome || item.profissionalNome || item.profissional || '');
}
function matchesProfessional(item, professional) {
    const raw = item.barbeiroNome || item.profissionalNome || item.profissional || '';
    return technicalProfessional(raw) === technicalProfessional(professional) || String(item.diaProf || '').endsWith(`#${professional}`);
}
function sortReservations(items) { return items.sort((a, b) => reservationHour(a).localeCompare(reservationHour(b))); }
function getClientName(item) { return item.clienteNome || item.cliente || 'Cliente sem nome'; }
function getService(item) { return item.servicoNome || item.servico || 'Serviço não informado'; }
function getPhone(item) { return item.telefone || item.phone || item.clienteTelefone || 'Não informado'; }
function getProducts(item) {
    if (!Array.isArray(item.produtos) || !item.produtos.length) return 'Nenhum';
    return item.produtos.map(product => product.nome || product.name).filter(Boolean).join(', ');
}
function setMessage(text, error = false) {
    const element = document.getElementById('adminMessage');
    if (!element) return;
    element.textContent = text;
    element.style.color = error ? '#d0a0a0' : '';
}

function reservationSummary(item) {
    return `
        <div class="detail-line"><strong>Cliente</strong><span>${escapeHtml(getClientName(item))}</span></div>
        <div class="detail-line"><strong>Telefone</strong><span>${escapeHtml(getPhone(item))}</span></div>
        <div class="detail-line"><strong>Data</strong><span>${escapeHtml(displayDate(reservationDate(item)))}</span></div>
        <div class="detail-line"><strong>Hora</strong><span>${escapeHtml(reservationHour(item))}</span></div>
        <div class="detail-line"><strong>Barbeiro</strong><span>${escapeHtml(commercialProfessional(reservationProfessional(item)))}</span></div>
        <div class="detail-line"><strong>Serviço</strong><span>${escapeHtml(getService(item))}</span></div>
        <div class="detail-line"><strong>Produtos</strong><span>${escapeHtml(getProducts(item))}</span></div>
        <div class="detail-line"><strong>Empire Club</strong><span>${item.raclubMembro || item.raclub?.status === 'membro' ? 'Membro' : 'Não informado'}</span></div>
    `;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function populateServices(selected = '') {
    const select = document.getElementById('formService');
    if (!select) return;
    const options = [...new Set([...SERVICES, selected].filter(Boolean))];
    select.innerHTML = options.map(service => `<option value="${escapeHtml(service)}">${escapeHtml(service)}</option>`).join('');
    select.value = selected || options[0];
}

function populateHours(selected = '') {
    const select = document.getElementById('formTime');
    if (!select) return;
    select.innerHTML = HOURS.map(hour => `<option value="${hour}">${hour}</option>`).join('');
    select.value = selected || HOURS[0];
}

function openModal(item = null, mode = 'view') {
    const modal = document.getElementById('reservationModal');
    const form = document.getElementById('reservationForm');
    const details = document.getElementById('reservationDetails');
    const actions = document.getElementById('viewActions');
    modal.dataset.reservationId = item?.id || '';
    modal.dataset.professional = currentProfessional;
    modal.dataset.mode = mode;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    form.hidden = mode !== 'edit' && mode !== 'new';
    details.hidden = mode !== 'view';
    actions.hidden = mode !== 'view';
    document.getElementById('modalTitle').textContent = mode === 'new' ? 'Nova reserva' : mode === 'edit' ? 'Editar reserva' : 'Detalhes da reserva';
    if (mode === 'view') {
        details.innerHTML = reservationSummary(item);
        currentReservation = item;
    } else {
        fillForm(item || { dataISO: selectedDate, hora: HOURS[0], barbeiroNome: currentProfessional });
    }
}

function closeModal() {
    const modal = document.getElementById('reservationModal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    currentReservation = null;
}

function fillForm(item) {
    document.getElementById('formClientName').value = getClientName(item) === 'Cliente sem nome' ? '' : getClientName(item);
    document.getElementById('formPhone').value = getPhone(item) === 'Não informado' ? '' : getPhone(item);
    document.getElementById('formDate').value = reservationDate(item) || selectedDate;
    populateServices(getService(item) === 'Serviço não informado' ? '' : getService(item));
    populateHours(reservationHour(item));
}

async function hasConflict(date, hour, professional, ignoredId = '') {
    const reservations = await readReservations();
    return reservations.some(item => item.id !== ignoredId && !isCancelled(item) && reservationDate(item) === date && reservationHour(item) === hour && matchesProfessional(item, professional));
}

async function saveReservation(event) {
    event.preventDefault();
    const modal = document.getElementById('reservationModal');
    const id = modal.dataset.reservationId;
    const professional = modal.dataset.professional || currentProfessional;
    const data = {
        dataISO: document.getElementById('formDate').value,
        hora: document.getElementById('formTime').value,
        diaProf: `${document.getElementById('formDate').value}#${professional}`,
        barbeiroNome: professional,
        profissional: 'barbeiro',
        clienteNome: document.getElementById('formClientName').value.trim(),
        cliente: document.getElementById('formClientName').value.trim(),
        telefone: document.getElementById('formPhone').value.trim(),
        servicoNome: document.getElementById('formService').value,
        servico: document.getElementById('formService').value,
        status: 'confirmado',
        updatedAt: serverTimestamp()
    };
    if (!data.clienteNome || !data.dataISO || !data.hora || !data.servicoNome) return setMessage('Preencha os campos obrigatórios.', true);
    if (await hasConflict(data.dataISO, data.hora, professional, id)) return setMessage('Este horário já está reservado.', true);
    const reservationId = id || `ag_${data.dataISO}_${data.hora}_barbeiro`;
    await setDoc(doc(db, 'agendamentos', reservationId), data, { merge: true });
    closeModal();
    setMessage('Reserva salva.');
    await renderSchedule();
    if (isAdminPage) await renderToday();
}

async function cancelReservation() {
    if (!currentReservation?.id) return;
    if (!window.confirm('Cancelar esta reserva? O registro será mantido.')) return;
    await setDoc(doc(db, 'agendamentos', currentReservation.id), { status: 'cancelado', updatedAt: serverTimestamp() }, { merge: true });
    closeModal();
    setMessage('Reserva cancelada.');
    await renderSchedule();
    if (isAdminPage) await renderToday();
}

function renderScheduleRows(reservations) {
    const list = document.getElementById('scheduleList');
    if (!list) return;
    const byHour = new Map(reservations.map(item => [reservationHour(item), item]));
    list.innerHTML = HOURS.map(hour => {
        const item = byHour.get(hour);
        if (!item) return `<div class="schedule-row available"><strong class="schedule-time">${hour}</strong><div class="schedule-main"><strong>HORÁRIO LIVRE</strong><span>Disponível para reserva</span></div><div class="schedule-actions"><button class="button button-primary new-at-hour" data-hour="${hour}" type="button">+ RESERVAR</button></div></div>`;
        const cancelled = isCancelled(item);
        return `<div class="schedule-row ${cancelled ? 'cancelled' : 'reserved'}"><strong class="schedule-time">${hour}</strong><div class="schedule-main"><strong>${escapeHtml(cancelled ? 'RESERVA CANCELADA' : getClientName(item))}</strong><span>${escapeHtml(getService(item))}</span></div><div class="schedule-actions"><button class="button button-secondary view-reservation" data-id="${item.id}" type="button">${cancelled ? 'VER' : 'EDITAR'}</button></div></div>`;
    }).join('');
    list.querySelectorAll('.view-reservation').forEach(button => button.addEventListener('click', () => {
        const item = currentReservations.find(reservation => reservation.id === button.dataset.id);
        if (item) openModal(item, 'view');
    }));
    list.querySelectorAll('.new-at-hour').forEach(button => button.addEventListener('click', () => openModal({ dataISO: selectedDate, hora: button.dataset.hour, barbeiroNome: currentProfessional }, 'new')));
}

async function renderSchedule() {
    if (!document.getElementById('scheduleList')) return;
    try {
        currentReservations = sortReservations((await readReservations()).filter(item => reservationDate(item) === selectedDate && matchesProfessional(item, currentProfessional)));
        renderScheduleRows(currentReservations);
        document.getElementById('agendaDateLabel').textContent = displayDate(selectedDate);
    } catch (error) {
        document.getElementById('scheduleList').innerHTML = '<p class="empty-state">Não foi possível carregar a agenda.</p>';
        console.error('[ADMIN AGENDA]', error);
    }
}

async function renderToday() {
    if (!document.getElementById('todayReservations')) return;
    const today = dateKey(new Date());
    document.getElementById('todayLabel').textContent = displayDate(today);
    try {
        const reservations = sortReservations((await readReservations()).filter(item => reservationDate(item) === today && !isCancelled(item)));
        const list = document.getElementById('todayReservations');
        list.innerHTML = reservations.length ? reservations.map(item => `<div class="reservation-row"><strong>${reservationHour(item)}</strong><span>${escapeHtml(getClientName(item))}</span><span class="professional">${escapeHtml(commercialProfessional(reservationProfessional(item)))}</span><span>${escapeHtml(getService(item))}</span></div>`).join('') : '<p class="empty-state">Nenhuma reserva para hoje.</p>';
    } catch (error) {
        document.getElementById('todayReservations').innerHTML = '<p class="empty-state">Não foi possível carregar as reservas.</p>';
        console.error('[ADMIN HOJE]', error);
    }
}

let currentProfessional = new URLSearchParams(window.location.search).get('profissional') || 'Rodrigo';
currentProfessional = technicalProfessional(currentProfessional);
let selectedDate = dateKey(new Date());
let currentReservations = [];
let currentReservation = null;
const isAdminPage = Boolean(document.getElementById('todayReservations'));

function setupBarberPage() {
    if (!document.getElementById('scheduleList')) return;
    const name = commercialProfessional(currentProfessional);
    document.getElementById('barberTitle').textContent = `AGENDA DO ${name.toUpperCase()}`;
    document.getElementById('barberSubtitle').textContent = `Reservas de ${name}`;
    document.getElementById('agendaDate').value = selectedDate;
    document.querySelectorAll('[data-date-offset]').forEach(button => button.addEventListener('click', () => {
        selectedDate = dateKey(new Date(Date.now() + Number(button.dataset.dateOffset) * 86400000));
        document.getElementById('agendaDate').value = selectedDate;
        document.querySelectorAll('.date-tab').forEach(tab => tab.classList.toggle('active', tab === button));
        renderSchedule();
    }));
    document.getElementById('agendaDate').addEventListener('change', event => {
        selectedDate = event.target.value || dateKey(new Date());
        document.querySelectorAll('.date-tab').forEach(tab => tab.classList.remove('active'));
        renderSchedule();
    });
    document.getElementById('newReservationButton').addEventListener('click', () => openModal({ dataISO: selectedDate, hora: HOURS[0], barbeiroNome: currentProfessional }, 'new'));
    renderSchedule();
}

document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModal));
document.getElementById('reservationForm')?.addEventListener('submit', saveReservation);
document.getElementById('editReservationButton')?.addEventListener('click', () => openModal(currentReservation, 'edit'));
document.getElementById('cancelReservationButton')?.addEventListener('click', cancelReservation);
document.getElementById('reservationModal')?.addEventListener('click', event => { if (event.target.id === 'reservationModal') closeModal(); });

setupBarberPage();
renderToday();
