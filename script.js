// script.js - Gestion du stock de câbles

function initApp() {
  if (!window.firebaseDB) {
    setTimeout(initApp, 100);
    return;
  }

  const db = window.firebaseDB;
  const ref = window.firebaseRef;
  const onValue = window.firebaseOnValue;
  const set = window.firebaseSet;

  const stockRef = ref(db, 'stock');
  let stockData = {};
  let currentFace = 'P';
  let editingItem = null;

  // Données initiales
  const initialData = {
    P: {
      ranges: [
        {
          id: 'p-range-1',
          name: 'Rangée 1',
          tourets: [
            { id: 'p1-a', label: 'A', cable: 'AUCUNE DONNÉE', image: '' },
            { id: 'p1-b', label: 'B', cable: '2X6', image: '' },
            { id: 'p1-c', label: 'C', cable: '14X4', image: '' }
          ]
        },
        {
          id: 'p-range-2',
          name: 'Rangée 2',
          tourets: [
            { id: 'p2-a', label: 'A', cable: '7X4', image: '' },
            { id: 'p2-b', label: 'B', cable: '2X6', image: '' },
            { id: 'p2-c', label: 'C', cable: '14X4', image: '' }
          ]
        },
        {
          id: 'p-range-3',
          name: 'Rangée 3',
          tourets: [
            { id: 'p3-a', label: 'A', cable: '2X6', image: '' },
            { id: 'p3-b', label: 'B', cable: '10X4', image: '' },
            { id: 'p3-c', label: 'C', cable: '7X6', image: '' }
          ]
        },
        {
          id: 'p-range-4',
          name: 'Rangée 4',
          tourets: [
            { id: 'p4-a', label: 'A', cable: '19X4', image: '' },
            { id: 'p4-b', label: 'B', cable: '19X4', image: '' },
            { id: 'p4-c', label: 'C', cable: '2X4', image: '' }
          ]
        },
        {
          id: 'p-range-5',
          name: 'Rangée 5',
          tourets: [
            { id: 'p5-a', label: 'A', cable: '2X16', image: '' },
            { id: 'p5-b', label: 'B', cable: '4X1.5', image: '' },
            { id: 'p5-c', label: 'C', cable: '14X4', image: '' }
          ]
        }
      ]
    },
    Q: {
      ranges: [
        {
          id: 'q-range-1',
          name: 'Rangée 1',
          tourets: [
            { id: 'q1-a', label: 'A', cable: 'crocus 228 100M', image: '' },
            { id: 'q1-b', label: 'B', cable: '4X6', image: '' },
            { id: 'q1-c', label: 'C', cable: '7X4', image: '' }
          ]
        },
        {
          id: 'q-range-2',
          name: 'Rangée 2',
          tourets: [
            { id: 'q2-a', label: 'A', cable: 'crocus 228 106M', image: '' },
            { id: 'q2-b', label: 'B', cable: '7X1.5', image: '' },
            { id: 'q2-c', label: 'C', cable: '14X4', image: '' }
          ]
        },
        {
          id: 'q-range-3',
          name: 'Rangée 3',
          tourets: [
            { id: 'q3-a', label: 'A', cable: '8X16', image: '' },
            { id: 'q3-b', label: 'B', cable: '2X6', image: '' },
            { id: 'q3-c', label: 'C', cable: '7X6', image: '' }
          ]
        },
        {
          id: 'q-range-4',
          name: 'Rangée 4',
          tourets: [
            { id: 'q4-a', label: 'A', cable: '10X4', image: '' },
            { id: 'q4-b', label: 'B', cable: '4X4', image: '' },
            { id: 'q4-c', label: 'C', cable: '4X4', image: '' }
          ]
        },
        {
          id: 'q-range-5',
          name: 'Rangée 5',
          tourets: [
            { id: 'q5-a', label: 'A', cable: '14X4', image: '' },
            { id: 'q5-b', label: 'B', cable: '4X6', image: '' },
            { id: 'q5-c', label: 'C', cable: 'acome', image: '' }
          ]
        }
      ]
    }
  };

  // Charger et synchroniser en temps réel
  onValue(stockRef, (snapshot) => {
    const data = snapshot.val();
    
    if (!data || Object.keys(data).length === 0) {
      console.log("Base vide → création des données initiales");
      stockData = initialData;
      set(stockRef, stockData);
    } else {
      stockData = data;
    }
    
    renderStock();
    updateStats();
  });

  // Navigation entre faces
  const navTabs = document.querySelectorAll('.nav-tab[data-face]');
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const face = tab.getAttribute('data-face');
      switchFace(face);
    });
  });

  // Onglet statistiques
  document.getElementById('statsTab').addEventListener('click', () => {
    document.getElementById('stockView').style.display = 'none';
    document.getElementById('statsView').style.display = 'block';
    
    navTabs.forEach(t => t.classList.remove('active'));
    document.getElementById('statsTab').classList.add('active');
    updateStats();
  });

  function switchFace(face) {
    currentFace = face;
    document.getElementById('stockView').style.display = 'block';
    document.getElementById('statsView').style.display = 'none';
    
    navTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-face="${face}"]`).classList.add('active');
    document.getElementById('statsTab').classList.remove('active');
    
    renderStock();
  }

  // Rendu du stock
  function renderStock() {
    const container = document.getElementById('stockContainer');
    container.innerHTML = '';
    
    const face = stockData[currentFace];
    if (!face || !face.ranges) return;
    
    face.ranges.forEach((range, rangeIndex) => {
      const rangeCard = document.createElement('div');
      rangeCard.className = 'range-card';
      
      rangeCard.innerHTML = `
        <div class="range-header">
          <div class="range-title">
            <div class="range-number">${rangeIndex + 1}</div>
            <div class="range-name" onclick="editRangeName('${currentFace}', ${rangeIndex})">${range.name}</div>
          </div>
          <div class="range-actions">
            <button class="btn-edit" onclick="addTouret('${currentFace}', ${rangeIndex})">+ Touret</button>
            <button class="btn-delete" onclick="deleteRange('${currentFace}', ${rangeIndex})">🗑️</button>
          </div>
        </div>
        <div class="tourets-grid" id="tourets-${currentFace}-${rangeIndex}"></div>
      `;
      
      container.appendChild(rangeCard);
      
      // Rendre les tourets
      const touretsGrid = document.getElementById(`tourets-${currentFace}-${rangeIndex}`);
      range.tourets.forEach((touret, touretIndex) => {
        const touretCard = createTouretCard(touret, currentFace, rangeIndex, touretIndex);
        touretsGrid.appendChild(touretCard);
      });
    });
  }

  function createTouretCard(touret, face, rangeIndex, touretIndex) {
    const card = document.createElement('div');
    card.className = 'touret-card';
    if (!touret.cable || touret.cable === 'AUCUNE DONNÉE') {
      card.classList.add('empty');
    }
    
    const cableName = touret.cable && touret.cable !== 'AUCUNE DONNÉE' ? touret.cable : 'Vide';
    const isEmpty = !touret.cable || touret.cable === 'AUCUNE DONNÉE';
    
    card.innerHTML = `
      <div class="touret-header">
        <div class="touret-label">TOURET ${touret.label}</div>
        <div class="touret-menu">
          <button class="touret-btn" onclick="editTouret('${face}', ${rangeIndex}, ${touretIndex})" title="Éditer">✏️</button>
          <button class="touret-btn" onclick="deleteTouret('${face}', ${rangeIndex}, ${touretIndex})" title="Supprimer">🗑️</button>
        </div>
      </div>
      <div class="cable-name ${isEmpty ? 'empty' : ''}" onclick="editTouret('${face}', ${rangeIndex}, ${touretIndex})">
        ${cableName}
      </div>
      ${touret.image ? `<img src="${touret.image}" class="touret-image" alt="${cableName}">` : ''}
    `;
    
    return card;
  }

  // Édition d'une rangée
  window.editRangeName = function(face, rangeIndex) {
    const newName = prompt('Nouveau nom de la rangée:', stockData[face].ranges[rangeIndex].name);
    if (newName && newName.trim()) {
      stockData[face].ranges[rangeIndex].name = newName.trim();
      set(stockRef, stockData);
    }
  };

  // Ajouter une rangée
  document.getElementById('addRangeBtn').addEventListener('click', () => {
    const rangeName = prompt('Nom de la nouvelle rangée:', `Rangée ${stockData[currentFace].ranges.length + 1}`);
    if (!rangeName) return;
    
    const newRange = {
      id: `${currentFace.toLowerCase()}-range-${Date.now()}`,
      name: rangeName.trim(),
      tourets: [
        { id: `t-${Date.now()}-a`, label: 'A', cable: '', image: '' },
        { id: `t-${Date.now()}-b`, label: 'B', cable: '', image: '' },
        { id: `t-${Date.now()}-c`, label: 'C', cable: '', image: '' }
      ]
    };
    
    stockData[currentFace].ranges.push(newRange);
    set(stockRef, stockData);
  });

  // Supprimer une rangée
  window.deleteRange = function(face, rangeIndex) {
    if (confirm('Voulez-vous vraiment supprimer cette rangée ?')) {
      stockData[face].ranges.splice(rangeIndex, 1);
      set(stockRef, stockData);
    }
  };

  // Ajouter un touret
  window.addTouret = function(face, rangeIndex) {
    const label = prompt('Label du touret (A, B, C, etc.):', '');
    if (!label) return;
    
    const newTouret = {
      id: `t-${Date.now()}`,
      label: label.trim().toUpperCase(),
      cable: '',
      image: ''
    };
    
    stockData[face].ranges[rangeIndex].tourets.push(newTouret);
    set(stockRef, stockData);
  };

  // Éditer un touret
  window.editTouret = function(face, rangeIndex, touretIndex) {
    editingItem = { face, rangeIndex, touretIndex, type: 'touret' };
    const touret = stockData[face].ranges[rangeIndex].tourets[touretIndex];
    
    document.getElementById('modalTitle').textContent = `Éditer Touret ${touret.label}`;
    document.getElementById('editName').value = touret.cable || '';
    
    const imagePreview = document.getElementById('imagePreview');
    if (touret.image) {
      imagePreview.innerHTML = `<img src="${touret.image}" alt="Preview">`;
    } else {
      imagePreview.innerHTML = '';
    }
    
    document.getElementById('editModal').classList.add('active');
  };

  // Supprimer un touret
  window.deleteTouret = function(face, rangeIndex, touretIndex) {
    if (confirm('Voulez-vous vraiment supprimer ce touret ?')) {
      stockData[face].ranges[rangeIndex].tourets.splice(touretIndex, 1);
      set(stockRef, stockData);
    }
  };

  // Gestion de l'upload d'image
  document.getElementById('editImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop lourde (max 2 Mo)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imagePreview = document.getElementById('imagePreview');
      imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  });

  // Sauvegarder les modifications
  window.saveEdit = function() {
    if (!editingItem) return;
    
    const { face, rangeIndex, touretIndex } = editingItem;
    const newName = document.getElementById('editName').value.trim();
    
    const imagePreview = document.getElementById('imagePreview').querySelector('img');
    const newImage = imagePreview ? imagePreview.src : '';
    
    stockData[face].ranges[rangeIndex].tourets[touretIndex].cable = newName;
    if (newImage) {
      stockData[face].ranges[rangeIndex].tourets[touretIndex].image = newImage;
    }
    
    set(stockRef, stockData);
    closeModal();
  };

  // Fermer le modal
  window.closeModal = function() {
    document.getElementById('editModal').classList.remove('active');
    editingItem = null;
    document.getElementById('editName').value = '';
    document.getElementById('editImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
  };

  // Filtrer les matériaux
  window.filterMaterials = function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rangeCards = document.querySelectorAll('.range-card');
    
    rangeCards.forEach(card => {
      const rangeName = card.querySelector('.range-name').textContent.toLowerCase();
      const cables = Array.from(card.querySelectorAll('.cable-name')).map(el => el.textContent.toLowerCase());
      
      const matches = rangeName.includes(searchTerm) || cables.some(cable => cable.includes(searchTerm));
      card.style.display = matches ? '' : 'none';
    });
  };

  // Export CSV
  window.exportToCSV = function() {
    let csv = 'Face,Rangée,Touret,Câble,Image\n';
    
    Object.keys(stockData).forEach(face => {
      stockData[face].ranges.forEach(range => {
        range.tourets.forEach(touret => {
          const cable = (touret.cable || 'Vide').replace(/"/g, '""');
          const hasImage = touret.image ? 'Oui' : 'Non';
          csv += `"${face}","${range.name}","${touret.label}","${cable}","${hasImage}"\n`;
        });
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_cables_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Statistiques
  function updateStats() {
    let totalTourets = 0;
    let totalRanges = 0;
    let lowStock = 0;
    
    Object.keys(stockData).forEach(face => {
      totalRanges += stockData[face].ranges.length;
      stockData[face].ranges.forEach(range => {
        totalTourets += range.tourets.length;
        range.tourets.forEach(touret => {
          if (!touret.cable || touret.cable === 'AUCUNE DONNÉE' || touret.cable === '') {
            lowStock++;
          }
        });
      });
    });
    
    document.getElementById('totalTourets').textContent = totalTourets;
    document.getElementById('totalRanges').textContent = totalRanges;
    document.getElementById('lowStock').textContent = lowStock;
    
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('lastUpdate').textContent = time;
    
    // Détails par face
    const faceDetails = document.getElementById('faceDetails');
    if (faceDetails) {
      let detailsHTML = '<div style="display: grid; gap: 1rem; margin-top: 1rem;">';
      
      Object.keys(stockData).forEach(face => {
        const ranges = stockData[face].ranges.length;
        const tourets = stockData[face].ranges.reduce((sum, r) => sum + r.tourets.length, 0);
        
        detailsHTML += `
          <div style="background: var(--bg-hover); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--primary);">Face ${face}</h4>
            <p style="color: var(--text-secondary);">${ranges} rangées • ${tourets} tourets</p>
          </div>
        `;
      });
      
      detailsHTML += '</div>';
      faceDetails.innerHTML = detailsHTML;
    }
  }
}

// Horloge
function updateClock() {
  const now = new Date();
  const parisTime = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
  document.getElementById('clock').textContent = parisTime;
}
setInterval(updateClock, 1000);
updateClock();

// Dark mode
const themeToggle = document.getElementById('themeToggle');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    themeToggle.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    themeToggle.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
});

// Démarre l'app
initApp();