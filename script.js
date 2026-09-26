/**
 * VAULTEX — CONTROLO FINANCEIRO PESSOAL
 * Português de Portugal (pt-PT), Valores em Euros (€) e Sons Táteis VIP
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de Ícones Lucide
  if (window.lucide) window.lucide.createIcons();

  // Chaves do LocalStorage
  const STORAGE_KEY_CONFIG = 'vaultex_pt_config';
  const STORAGE_KEY_TRANSACTIONS = 'vaultex_pt_tx';
  const STORAGE_KEY_SOUND = 'vaultex_sound_enabled';

  // Configuração Padrão em Euros
  const defaultConfig = {
    name1: '1ª Pessoa',
    name2: '2ª Pessoa',
    currency: '€'
  };

  // Exemplos Iniciais em Euros (€)
  const defaultTransactions = [
    {
      id: 'tx-1',
      desc: 'Vencimento / Ordenado Principal',
      amount: 2200.00,
      date: new Date().toISOString().split('T')[0],
      category: 'Ordenado & Rendimentos',
      payer: '1ª Pessoa',
      type: 'receita'
    },
    {
      id: 'tx-2',
      desc: 'Renda da Casa & Condomínio',
      amount: 750.00,
      date: new Date().toISOString().split('T')[0],
      category: 'Habitação & Despesas Domésticas',
      payer: '1ª Pessoa',
      type: 'despesa'
    },
    {
      id: 'tx-3',
      desc: 'Compras de Supermercado',
      amount: 320.50,
      date: new Date().toISOString().split('T')[0],
      category: 'Supermercado & Alimentação',
      payer: 'Outro',
      type: 'despesa'
    },
    {
      id: 'tx-4',
      desc: 'Jantar no Fim de Semana',
      amount: 65.00,
      date: new Date().toISOString().split('T')[0],
      category: 'Lazer & Restauração',
      payer: '1ª Pessoa',
      type: 'despesa'
    },
    {
      id: 'tx-5',
      desc: 'Rendimento Extra / Trabalho Freelance',
      amount: 450.00,
      date: new Date().toISOString().split('T')[0],
      category: 'Ordenado & Rendimentos',
      payer: 'Outro',
      type: 'receita'
    }
  ];

  // Carregar dados salvos ou padrões
  let config = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIG)) || defaultConfig;
  if (!config.name1 || config.name1 === 'David' || config.name1 === 'User') {
    config.name1 = '1ª Pessoa';
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
  if (config.currency !== '$' && config.currency !== '€') {
    config.currency = '€';
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
  let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS)) || defaultTransactions;
  transactions.forEach(t => {
    if (t.payer === 'David' || t.payer === 'User') t.payer = '1ª Pessoa';
  });
  let soundEnabled = localStorage.getItem(STORAGE_KEY_SOUND) !== 'false'; // Padrão: ativado

  let activeMemberFilter = 'todos'; // 'todos' | 'David' | 'Outro'
  let currentEntryType = 'despesa'; // 'despesa' | 'receita'
  let categoryChart = null;

  // --- MOTOR DE ÁUDIO VIP (Web Audio API) ---
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        // Clique tátil luxuoso e nítido
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'save') {
        // Chime nobre de confirmação
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const chordOsc = audioCtx.createOscillator();
          const chordGain = audioCtx.createGain();
          chordOsc.type = 'triangle';
          chordOsc.frequency.value = freq;
          chordOsc.connect(chordGain);
          chordGain.connect(audioCtx.destination);
          chordGain.gain.setValueAtTime(0.03, now + idx * 0.05);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + idx * 0.05);
          chordOsc.start(now + idx * 0.05);
          chordOsc.stop(now + 0.35 + idx * 0.05);
        });
      } else if (type === 'delete') {
        // Som sutil de remoção
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      console.warn('Áudio não bloqueante:', e);
    }
  }

  // Alternar Som no Cabeçalho
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');

  function updateSoundUI() {
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', soundEnabled ? 'volume-2' : 'volume-x');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem(STORAGE_KEY_SOUND, soundEnabled ? 'true' : 'false');
      updateSoundUI();
      if (soundEnabled) {
        playSound('save');
        showToast('Som dos cliques ativado');
      } else {
        showToast('Modo silencioso ativado');
      }
    });
  }

  // Clique no Logo Vaultex: Voltar suavemente ao topo da página
  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      playSound('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    brandLogo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playSound('click');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Formatação de Moeda: 1.250,00 € ou $ 1.250,00
  function formatMoney(value) {
    const sym = config.currency === '$' ? '$' : '€';
    const num = parseFloat(value) || 0;
    const formatted = num.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return sym === '$' ? `$ ${formatted}` : `${formatted} €`;
  }

  // Notificação Toast
  const toastContainer = document.getElementById('toastContainer');
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Atualizar Nomes dos Membros na Interface
  function updateMemberNamesInUI() {
    document.querySelectorAll('.member-name-1').forEach(el => el.textContent = config.name1);
    document.querySelectorAll('.member-name-2').forEach(el => el.textContent = config.name2);

    const payerSelect = document.getElementById('entryPayer');
    if (payerSelect) {
      payerSelect.options[0].textContent = config.name1;
      payerSelect.options[1].textContent = config.name2;
    }
  }

  // Filtro de Membros (Todos / David / 2ª Pessoa)
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      playSound('click');
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeMemberFilter = chip.getAttribute('data-member');
      renderDashboard();
    });
  });

  // RENDERIZAÇÃO COMPLETA DO DASHBOARD
  function renderDashboard() {
    // 1. Filtrar lista de movimentações com base no membro ativo
    const filteredTx = transactions.filter(t => {
      if (activeMemberFilter === '1ª Pessoa') return t.payer === '1ª Pessoa';
      if (activeMemberFilter === 'Outro') return t.payer === 'Outro';
      return true;
    });

    // 2. Calcular Totais (Entradas, Despesas e Poupanças Guardadas)
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalSavings = 0;
    let inflowCount = 0;
    let outflowCount = 0;
    let savingsCount = 0;

    let davidInflow = 0;
    let davidOutflow = 0;
    let davidSavings = 0;

    let partnerInflow = 0;
    let partnerOutflow = 0;
    let partnerSavings = 0;

    // Os cartões principais representam apenas o membro selecionado.
    filteredTx.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'receita') {
        totalInflow += amt;
        inflowCount++;
      } else if (t.type === 'poupanca') {
        totalSavings += amt;
        savingsCount++;
      } else {
        totalOutflow += amt;
        outflowCount++;
      }
    });

    // O quadro comparativo mantém os totais individuais de ambos os membros.
    transactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'receita') {
        if (t.payer === '1ª Pessoa') davidInflow += amt;
        else partnerInflow += amt;
      } else if (t.type === 'poupanca') {
        if (t.payer === '1ª Pessoa') davidSavings += amt;
        else partnerSavings += amt;
      } else {
        if (t.payer === '1ª Pessoa') davidOutflow += amt;
        else partnerOutflow += amt;
      }
    });

    // Saldo Disponível (Livre de Despesas e Poupanças)
    const netTotal = totalInflow - totalOutflow - totalSavings;
    const davidBalance = davidInflow - davidOutflow - davidSavings;
    const partnerBalance = partnerInflow - partnerOutflow - partnerSavings;

    // 3. Atualizar Cards Principais
    const totalBalanceDisplay = document.getElementById('totalBalanceDisplay');
    const monthInflowDisplay = document.getElementById('monthInflowDisplay');
    const monthOutflowDisplay = document.getElementById('monthOutflowDisplay');
    const monthSavingsTotalDisplay = document.getElementById('monthSavingsTotalDisplay');

    if (totalBalanceDisplay) {
      if (activeMemberFilter === '1ª Pessoa') totalBalanceDisplay.textContent = formatMoney(davidBalance);
      else if (activeMemberFilter === 'Outro') totalBalanceDisplay.textContent = formatMoney(partnerBalance);
      else totalBalanceDisplay.textContent = formatMoney(netTotal);
    }

    if (monthInflowDisplay) monthInflowDisplay.textContent = `+ ${formatMoney(totalInflow)}`;
    if (monthOutflowDisplay) monthOutflowDisplay.textContent = `- ${formatMoney(totalOutflow)}`;
    
    // Card de Poupança & Cofrinho
    if (monthSavingsTotalDisplay) {
      if (activeMemberFilter === '1ª Pessoa') monthSavingsTotalDisplay.textContent = formatMoney(davidSavings);
      else if (activeMemberFilter === 'Outro') monthSavingsTotalDisplay.textContent = formatMoney(partnerSavings);
      else monthSavingsTotalDisplay.textContent = formatMoney(totalSavings);
    }

    const inflowCountEl = document.getElementById('inflowCount');
    const outflowCountEl = document.getElementById('outflowCount');
    const monthSavingsRateEl = document.getElementById('monthSavingsRate');

    if (inflowCountEl) inflowCountEl.textContent = `${inflowCount} entrada(s) registada(s)`;
    if (outflowCountEl) outflowCountEl.textContent = `${outflowCount} despesa(s) paga(s)`;

    if (monthSavingsRateEl) {
      const curSavings = activeMemberFilter === '1ª Pessoa' ? davidSavings : (activeMemberFilter === 'Outro' ? partnerSavings : totalSavings);
      const curInflow = activeMemberFilter === '1ª Pessoa' ? davidInflow : (activeMemberFilter === 'Outro' ? partnerInflow : totalInflow);
      if (curInflow > 0 && curSavings > 0) {
        const rate = Math.round((curSavings / curInflow) * 100);
        monthSavingsRateEl.textContent = `${rate}% dos rendimentos guardados`;
      } else {
        monthSavingsRateEl.textContent = `${savingsCount} registo(s) no cofre`;
      }
    }

    // 4. Atualizar Quadro Individual (1ª Pessoa vs 2ª Pessoa)
    const davidInflowText = document.getElementById('davidInflowText');
    const davidOutflowText = document.getElementById('davidOutflowText');
    const davidSavingsText = document.getElementById('davidSavingsText');
    const davidBalanceText = document.getElementById('davidBalanceText');

    if (davidInflowText) davidInflowText.textContent = formatMoney(davidInflow);
    if (davidOutflowText) davidOutflowText.textContent = formatMoney(davidOutflow);
    if (davidSavingsText) davidSavingsText.textContent = formatMoney(davidSavings);
    if (davidBalanceText) davidBalanceText.textContent = formatMoney(davidBalance);

    const partnerInflowText = document.getElementById('partnerInflowText');
    const partnerOutflowText = document.getElementById('partnerOutflowText');
    const partnerSavingsText = document.getElementById('partnerSavingsText');
    const partnerBalanceText = document.getElementById('partnerBalanceText');

    if (partnerInflowText) partnerInflowText.textContent = formatMoney(partnerInflow);
    if (partnerOutflowText) partnerOutflowText.textContent = formatMoney(partnerOutflow);
    if (partnerSavingsText) partnerSavingsText.textContent = formatMoney(partnerSavings);
    if (partnerBalanceText) partnerBalanceText.textContent = formatMoney(partnerBalance);

    // 5. Renderizar Gráfico e Lista de Categorias
    renderCategoryChart(filteredTx);

    // 6. Renderizar Tabela de Registos
    renderTable();
  }

  // GRÁFICO DE CATEGORIAS (Chart.js)
  function renderCategoryChart(txList) {
    const categoryTotals = {};
    let totalExpenses = 0;

    txList.forEach(t => {
      if (t.type === 'despesa') {
        const cat = t.category || 'Outros';
        const val = parseFloat(t.amount) || 0;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + val;
        totalExpenses += val;
      }
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    const colors = [
      '#d4af37', // Ouro
      '#10b981', // Esmeralda
      '#f59e0b', // Âmbar
      '#fb7185', // Rosa
      '#60a5fa', // Azul
      '#a78bfa', // Roxo
      '#94a3b8'  // Cinza
    ];

    // Atualizar Lista Lateral de Categorias
    const breakdownList = document.getElementById('categoryBreakdownList');
    if (breakdownList) {
      breakdownList.innerHTML = '';
      if (labels.length === 0) {
        breakdownList.innerHTML = `<div style="color: #64748b; font-size: 0.85rem;">Nenhuma despesa para apresentar até ao momento.</div>`;
      } else {
        labels.forEach((cat, index) => {
          const val = categoryTotals[cat];
          const pct = totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
          const color = colors[index % colors.length];

          const item = document.createElement('div');
          item.className = 'category-item';
          item.innerHTML = `
            <div class="category-item-name">
              <span class="cat-color-badge" style="background: ${color};"></span>
              <span>${cat} (${pct}%)</span>
            </div>
            <span class="category-item-val">${formatMoney(val)}</span>
          `;
          breakdownList.appendChild(item);
        });
      }
    }

    // Canvas do Gráfico
    const canvas = document.getElementById('categoryDonutChart');
    if (!canvas) return;

    if (categoryChart) categoryChart.destroy();

    const ctx = canvas.getContext('2d');
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Sem despesas'],
        datasets: [{
          data: values.length ? values : [1],
          backgroundColor: labels.length ? colors.slice(0, labels.length) : ['#222738'],
          borderColor: '#0e1017',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        cutout: '72%'
      }
    });
  }

  // TABELA DE REGISTOS
  const searchInput = document.getElementById('searchTx');
  const filterTypeSelect = document.getElementById('filterTypeSelect');

  if (searchInput) searchInput.addEventListener('input', renderTable);
  if (filterTypeSelect) {
    filterTypeSelect.addEventListener('change', () => {
      playSound('click');
      renderTable();
    });
  }

  function renderTable() {
    const tbody = document.getElementById('transactionsTbody');
    const emptyState = document.getElementById('emptyState');
    if (!tbody) return;

    tbody.innerHTML = '';

    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const typeFilter = filterTypeSelect ? filterTypeSelect.value : 'todos';

    let list = transactions.filter(t => {
      // Membro
      if (activeMemberFilter === '1ª Pessoa' && t.payer !== '1ª Pessoa') return false;
      if (activeMemberFilter === 'Outro' && t.payer !== 'Outro') return false;
      // Pesquisa
      if (term && !t.desc.toLowerCase().includes(term) && !t.category.toLowerCase().includes(term)) return false;
      // Tipo
      if (typeFilter !== 'todos' && t.type !== typeFilter) return false;
      return true;
    });

    if (list.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    } else {
      if (emptyState) emptyState.style.display = 'none';
    }

    // Ordenar por data decrescente
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    list.forEach(t => {
      const tr = document.createElement('tr');
      const isReceita = t.type === 'receita';
      const isPoupanca = t.type === 'poupanca';
      const payerName = t.payer === '1ª Pessoa' ? config.name1 : config.name2;
      const payerBadgeClass = t.payer === '1ª Pessoa' ? 'badge-payer-d' : 'badge-payer-p';
      const formattedDate = t.date ? new Date(t.date + 'T00:00:00').toLocaleDateString('pt-PT') : '-';

      let typeBadge = '';
      let amountColor = '#fff';
      let amountPrefix = '-';

      if (isReceita) {
        typeBadge = '<span style="font-size: 0.75rem; font-weight: 600; color: #34d399;">+ Entrada</span>';
        amountColor = '#34d399';
        amountPrefix = '+';
      } else if (isPoupanca) {
        typeBadge = '<span style="font-size: 0.75rem; font-weight: 600; color: #60a5fa;"><i data-lucide="piggy-bank" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;"></i>Poupança</span>';
        amountColor = '#60a5fa';
        amountPrefix = '🔒';
      } else {
        typeBadge = '<span style="font-size: 0.75rem; font-weight: 600; color: #fb7185;">- Despesa</span>';
        amountColor = '#fff';
        amountPrefix = '-';
      }

      tr.innerHTML = `
        <td style="color: #94a3b8; font-size: 0.78rem;">${formattedDate}</td>
        <td><strong>${t.desc}</strong></td>
        <td><span class="badge-category">${t.category}</span></td>
        <td><span class="badge-payer ${payerBadgeClass}">${payerName}</span></td>
        <td>${typeBadge}</td>
        <td class="text-right" style="font-weight: 700; color: ${amountColor};">
          ${amountPrefix} ${formatMoney(t.amount)}
        </td>
        <td class="text-center">
          <button class="btn-del" data-id="${t.id}" title="Eliminar registo"><i data-lucide="trash-2"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();

    // Eventos de Eliminação
    tbody.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', () => {
        playSound('delete');
        const id = btn.getAttribute('data-id');
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
        renderDashboard();
        showToast('Registo eliminado.');
      });
    });
  }

  // MODAL DE ADICIONAR VALOR / DESPESA
  const entryModal = document.getElementById('entryModal');
  const btnOpenNewEntry = document.getElementById('btnOpenNewEntry');
  const btnQuickAdd = document.getElementById('btnQuickAdd');
  const btnEmptyStateAdd = document.getElementById('btnEmptyStateAdd');
  const btnCloseEntryModal = document.getElementById('btnCloseEntryModal');
  const btnCancelEntry = document.getElementById('btnCancelEntry');
  const entryForm = document.getElementById('entryForm');

  const btnTypeExpense = document.getElementById('btnTypeExpense');
  const btnTypeIncome = document.getElementById('btnTypeIncome');
  const btnTypeSavings = document.getElementById('btnTypeSavings');
  const btnQuickSave = document.getElementById('btnQuickSave');
  const entryCategory = document.getElementById('entryCategory');
  const entryCustomCategory = document.getElementById('entryCustomCategory');

  const expenseCategories = [
    'Supermercado & Alimentação',
    'Habitação & Despesas Domésticas',
    'Lazer & Restauração',
    'Transportes & Combustível',
    'Saúde & Farmácia',
    'Compras Pessoais',
    'Outros'
  ];

  const incomeCategories = [
    'Ordenado & Rendimentos',
    'Trabalho Extra / Freelance',
    'Prendas & Prémios',
    'Rendimentos de Investimentos',
    'Outros'
  ];

  const savingsCategories = [
    'Poupança Geral',
    'Fundo de Emergência',
    'Investimentos & PPR',
    'Férias & Viagens',
    'Carro / Habitação',
    'Objetivo Específico',
    'Outros'
  ];

  function updateCategoryOptions(type) {
    if (!entryCategory) return;
    let list = expenseCategories;
    if (type === 'receita') list = incomeCategories;
    else if (type === 'poupanca') list = savingsCategories;

    entryCategory.innerHTML = list.map(c => `<option value="${c}">${c}</option>`).join('');
    updateCustomCategoryField();
  }

  function updateCustomCategoryField(focus = false) {
    if (!entryCategory || !entryCustomCategory) return;

    const isCustomCategory = entryCategory.value.startsWith('Outros');
    entryCustomCategory.hidden = !isCustomCategory;
    entryCustomCategory.required = isCustomCategory;

    if (!isCustomCategory) {
      entryCustomCategory.value = '';
    } else if (focus) {
      entryCustomCategory.focus();
    }
  }

  if (entryCategory) entryCategory.addEventListener('change', () => updateCustomCategoryField(true));

  function selectEntryType(type) {
    currentEntryType = type;
    if (btnTypeExpense) btnTypeExpense.classList.toggle('active', type === 'despesa');
    if (btnTypeIncome) btnTypeIncome.classList.toggle('active', type === 'receita');
    if (btnTypeSavings) btnTypeSavings.classList.toggle('active', type === 'poupanca');
    updateCategoryOptions(type);

    const descInput = document.getElementById('entryDesc');
    if (descInput) {
      if (type === 'poupanca') {
        descInput.placeholder = 'Ex: Fundo de Emergência, Reforço Poupança, Viagem...';
      } else if (type === 'receita') {
        descInput.placeholder = 'Ex: Vencimento, Trabalho Freelance, Bónus...';
      } else {
        descInput.placeholder = 'Ex: Supermercado, Renda da Casa, Eletricidade, Jantar...';
      }
    }
  }

  // Inicialização do Flatpickr em Português
  let entryDatePicker = null;
  const entryDateInput = document.getElementById('entryDate');
  if (entryDateInput && typeof flatpickr !== 'undefined') {
    entryDatePicker = flatpickr(entryDateInput, {
      locale: 'pt',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd-M-Y',
      defaultDate: new Date(),
      disableMobile: true
    });
  }

  function openEntryModal() {
    if (!entryModal) return;
    playSound('click');
    entryModal.classList.add('active');
    const today = new Date().toISOString().split('T')[0];
    if (entryDatePicker) {
      entryDatePicker.setDate(today);
    } else {
      document.getElementById('entryDate').value = today;
    }
    selectEntryType(currentEntryType || 'despesa');
    document.getElementById('entryDesc').focus();
  }

  function closeEntryModal() {
    if (!entryModal) return;
    playSound('click');
    entryModal.classList.remove('active');
    entryForm.reset();
    if (entryDatePicker) {
      entryDatePicker.setDate(new Date());
    }
  }

  if (btnOpenNewEntry) btnOpenNewEntry.addEventListener('click', () => { selectEntryType('despesa'); openEntryModal(); });
  if (btnQuickAdd) btnQuickAdd.addEventListener('click', () => { selectEntryType('despesa'); openEntryModal(); });
  if (btnQuickSave) btnQuickSave.addEventListener('click', () => { openEntryModal(); selectEntryType('poupanca'); });
  if (btnEmptyStateAdd) btnEmptyStateAdd.addEventListener('click', () => { selectEntryType('despesa'); openEntryModal(); });
  if (btnCloseEntryModal) btnCloseEntryModal.addEventListener('click', closeEntryModal);
  if (btnCancelEntry) btnCancelEntry.addEventListener('click', closeEntryModal);

  // Alternar entre Despesa, Entrada e Poupança
  if (btnTypeExpense) btnTypeExpense.addEventListener('click', () => { playSound('click'); selectEntryType('despesa'); });
  if (btnTypeIncome) btnTypeIncome.addEventListener('click', () => { playSound('click'); selectEntryType('receita'); });
  if (btnTypeSavings) btnTypeSavings.addEventListener('click', () => { playSound('click'); selectEntryType('poupanca'); });

  // Submeter Formulário de Novo Registo
  if (entryForm) {
    entryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const desc = document.getElementById('entryDesc').value.trim();
      const amount = parseFloat(document.getElementById('entryAmount').value);
      const date = document.getElementById('entryDate').value;
      const selectedCategory = entryCategory.value;
      const customCategory = entryCustomCategory.value.trim();
      const category = selectedCategory.startsWith('Outros') ? customCategory : selectedCategory;
      const payer = document.getElementById('entryPayer').value;

      if (!desc || isNaN(amount) || amount <= 0 || !date || !category) {
        alert('Por favor, indique uma descrição, categoria e valor válidos.');
        return;
      }

      const newTx = {
        id: 'tx-' + Date.now(),
        desc,
        amount,
        date,
        category,
        payer,
        type: currentEntryType
      };

      transactions.unshift(newTx);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));

      closeEntryModal();
      renderDashboard();
      playSound('save');
      const typeLabel = currentEntryType === 'despesa' ? 'Despesa' : (currentEntryType === 'poupanca' ? 'Poupança guardada' : 'Entrada');
      showToast(`${typeLabel} registada com sucesso!`);
    });
  }

  // MODAL DE DEFINIÇÕES (Nomes e Moeda)
  const settingsModal = document.getElementById('settingsModal');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettingsModal = document.getElementById('btnCloseSettingsModal');
  const btnCancelSettings = document.getElementById('btnCancelSettings');
  const settingsForm = document.getElementById('settingsForm');

  const cfgName1 = document.getElementById('cfgName1');
  const cfgName2 = document.getElementById('cfgName2');
  const cfgCurrency = document.getElementById('cfgCurrency');

  const btnReloadDemo = document.getElementById('btnReloadDemo');
  const btnClearData = document.getElementById('btnClearData');

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      playSound('click');
      cfgName1.value = config.name1;
      cfgName2.value = config.name2;
      cfgCurrency.value = config.currency || '€';
      settingsModal.classList.add('active');
    });
  }

  function closeSettingsModal() {
    if (settingsModal) {
      playSound('click');
      settingsModal.classList.remove('active');
    }
  }

  if (btnCloseSettingsModal) btnCloseSettingsModal.addEventListener('click', closeSettingsModal);
  if (btnCancelSettings) btnCancelSettings.addEventListener('click', closeSettingsModal);

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const n1 = cfgName1.value.trim();
      const n2 = cfgName2.value.trim();
      const cur = cfgCurrency.value;

      if (n1) config.name1 = n1;
      if (n2) config.name2 = n2;
      if (cur) config.currency = cur;

      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      updateMemberNamesInUI();
      closeSettingsModal();
      renderDashboard();
      playSound('save');
      showToast('Definições guardadas com sucesso!');
    });
  }

  // Recarregar Exemplos
  if (btnReloadDemo) {
    btnReloadDemo.addEventListener('click', () => {
      playSound('click');
      if (confirm('Deseja recarregar a lista de exemplos em Euros?')) {
        transactions = [...defaultTransactions];
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
        renderDashboard();
        closeSettingsModal();
        playSound('save');
        showToast('Exemplos recarregados.');
      }
    });
  }

  // Apagar Tudo
  if (btnClearData) {
    btnClearData.addEventListener('click', () => {
      playSound('click');
      if (confirm('Tem a certeza de que deseja eliminar todas as despesas e valores para começar do início?')) {
        transactions = [];
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
        renderDashboard();
        closeSettingsModal();
        playSound('delete');
        showToast('Cofre reiniciado.');
      }
    });
  }

  // Inicialização
  updateMemberNamesInUI();
  updateSoundUI();
  renderDashboard();
});
