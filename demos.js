/**
 * GiftlyInvited Demo Logic
 * Handles authentication, registry management, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentUser = null;
    let registries = JSON.parse(localStorage.getItem('demo_registries') || '[]');

    // DOM Elements
    const loginContainer = document.getElementById('demo-login');
    const appContainer = document.getElementById('demo-app');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabButtons = document.querySelectorAll('.demo-tab');
    const tabContents = document.querySelectorAll('.demo-tab-content');
    const createRegistryForm = document.getElementById('createRegistryForm');
    const registriesList = document.getElementById('registriesList');
    const registryCount = document.getElementById('registryCount');

    // Modal Elements
    const modal = document.getElementById('registryModal');
    const modalClose = document.querySelector('.demo-modal-close');
    const modalOverlay = document.querySelector('.demo-modal-overlay');
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemForm = document.getElementById('addItemForm');
    const itemForm = document.getElementById('itemForm');
    const cancelAddItem = document.getElementById('cancelAddItem');
    const copyCodeBtn = document.getElementById('copyCodeBtn');

    // Initialization
    checkSession();

    // Event Listeners
    loginForm?.addEventListener('submit', handleLogin);
    logoutBtn?.addEventListener('click', handleLogout);

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    createRegistryForm?.addEventListener('submit', handleCreateRegistry);

    // Modal interactions
    modalClose?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);
    addItemBtn?.addEventListener('click', () => {
        addItemForm.style.display = 'block';
        addItemBtn.style.display = 'none';
    });
    cancelAddItem?.addEventListener('click', () => {
        addItemForm.style.display = 'none';
        addItemBtn.style.display = 'block';
        itemForm.reset();
    });
    itemForm?.addEventListener('submit', handleAddItem);
    copyCodeBtn?.addEventListener('click', handleCopyCode);

    // --- Authentication ---

    function handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const errorMsg = document.getElementById('loginError');

        if (user.toLowerCase() === 'admin' && pass === 'admin') {
            currentUser = { name: 'Admin', username: 'admin' };
            localStorage.setItem('demo_user', JSON.stringify(currentUser));
            errorMsg.style.display = 'none';
            renderApp();
        } else {
            errorMsg.textContent = 'Invalid credentials. Try admin / admin';
            errorMsg.style.display = 'block';
        }
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('demo_user');
        renderApp();
    }

    function checkSession() {
        const saved = localStorage.getItem('demo_user');
        if (saved) {
            currentUser = JSON.parse(saved);
        }
        renderApp();
    }

    function renderApp() {
        if (currentUser) {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
            updateDashboard();
        } else {
            loginContainer.style.display = 'flex';
            appContainer.style.display = 'none';
            loginForm.reset();
        }
    }

    // --- Tabs ---

    function switchTab(tabId) {
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
    }

    // --- Registry Management ---

    function handleCreateRegistry(e) {
        e.preventDefault();

        const name = document.getElementById('registryName').value;
        const date = document.getElementById('eventDate').value;
        const desc = document.getElementById('registryDescription').value;

        const newRegistry = {
            id: Date.now().toString(),
            name,
            date,
            description: desc,
            formattedDate: date ? new Date(date).toLocaleDateString() : 'No date set',
            inviteCode: generateInviteCode(),
            items: []
        };

        registries.unshift(newRegistry); // Add to top
        saveRegistries();

        // Switch to dashboard
        switchTab('dashboard');
        createRegistryForm.reset();
        updateDashboard();
    }

    function generateInviteCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function saveRegistries() {
        localStorage.setItem('demo_registries', JSON.stringify(registries));
    }

    function updateDashboard() {
        registryCount.textContent = registries.length;
        registriesList.innerHTML = '';

        if (registries.length === 0) {
            registriesList.innerHTML = `
        <div class="demo-empty-state">
          <span class="demo-empty-icon">📦</span>
          <p>No registries yet. Create your first one!</p>
        </div>`;
            return;
        }

        registries.forEach(reg => {
            const card = document.createElement('div');
            card.className = 'card registry-card';
            card.innerHTML = `
        <div class="registry-header">
          <div>
            <h4>${reg.name}</h4>
            <span class="muted">${reg.formattedDate}</span>
          </div>
          <span class="badge">${reg.items.length} Items</span>
        </div>
        <p>${reg.description || 'No description'}</p>
        <div class="registry-actions">
          <button class="btn btn-sm" onclick="openRegistry('${reg.id}')">Manage</button>
          <button class="btn btn-sm btn-ghost" onclick="deleteRegistry('${reg.id}')">Delete</button>
        </div>
      `;
            registriesList.appendChild(card);
        });
    }

    // Expose to window for onclick handlers
    window.deleteRegistry = (id) => {
        if (confirm('Are you sure you want to delete this registry?')) {
            registries = registries.filter(r => r.id !== id);
            saveRegistries();
            updateDashboard();
        }
    };

    window.openRegistry = (id) => {
        const registry = registries.find(r => r.id === id);
        if (!registry) return;

        document.getElementById('modalRegistryName').textContent = registry.name;
        document.getElementById('modalInviteCode').textContent = registry.inviteCode;
        modal.dataset.currentId = id; // Store ID on modal

        renderItems(registry);

        modal.style.display = 'flex';
    };

    function closeModal() {
        modal.style.display = 'none';
        addItemForm.style.display = 'none';
        addItemBtn.style.display = 'block';
    }

    // --- Items Management ---

    // --- Items Management ---

    function handleAddItem(e) {
        e.preventDefault();
        const registryId = modal.dataset.currentId;
        const registry = registries.find(r => r.id === registryId);
        if (!registry) return;

        const fileInput = document.getElementById('itemImage');
        let imageSrc = null;

        const processItem = (imgData) => {
            const newItem = {
                id: Date.now().toString(),
                title: document.getElementById('itemTitle').value,
                price: document.getElementById('itemPrice').value,
                quantity: parseInt(document.getElementById('itemQuantity').value) || 1,
                url: document.getElementById('itemUrl').value,
                description: document.getElementById('itemDescription').value,
                image: imgData,
                claimed: 0
            };

            registry.items.push(newItem);
            saveRegistries();
            renderItems(registry);
            itemForm.reset();
            addItemForm.style.display = 'none';
            addItemBtn.style.display = 'block';
            updateDashboard();
        };

        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                processItem(e.target.result);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            processItem(null);
        }
    }

    function renderItems(registry) {
        const list = document.getElementById('itemsList');
        list.innerHTML = '';

        if (registry.items.length === 0) {
            list.innerHTML = '<p class="muted text-center">No items added yet.</p>';
            return;
        }

        registry.items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'demo-item-card';
            el.innerHTML = `
        <div class="item-info">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" style="max-width: 50px; height: auto; border-radius: 4px; margin-right: 10px;">` : ''}
          <div style="flex:1;">
            <h5>${item.title}</h5>
            <div class="item-meta">
                <span>R${item.price || '0'}</span>
                <span>Req: ${item.quantity}</span>
                <span>Claimed: ${item.claimed}</span>
            </div>
            ${item.description ? `<p class="muted small">${item.description}</p>` : ''}
            ${item.url ? `<a href="${item.url}" target="_blank" class="small">View Link</a>` : ''}
          </div>
        </div>
      `;
            list.appendChild(el);
        });
    }

    function handleCopyCode() {
        const code = document.getElementById('modalInviteCode').textContent;
        navigator.clipboard.writeText(code);
        copyCodeBtn.textContent = 'Copied!';
        setTimeout(() => copyCodeBtn.textContent = '📋 Copy', 2000);
    }

    // --- Guest Simulation ---
    const findRegistryBtn = document.getElementById('findRegistryBtn');
    const guestView = document.getElementById('guestRegistryView');

    findRegistryBtn?.addEventListener('click', () => {
        const code = document.getElementById('inviteCodeInput').value.trim().toUpperCase();
        const registry = registries.find(r => r.inviteCode === code);

        if (registry) {
            renderGuestView(registry);
            guestView.style.display = 'grid';
        } else {
            alert('Registry not found. Check the invite code.');
            guestView.style.display = 'none';
        }
    });

    function renderGuestView(registry) {
        guestView.innerHTML = `
      <div class="guest-header">
        <h4>${registry.name}</h4>
        <p>${registry.description || ''}</p>
        <span class="muted date">📅 ${registry.formattedDate}</span>
      </div>
      <div class="guest-items-grid">
        ${registry.items.map(item => `
          <div class="guest-item-card">
            ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
            <h5>${item.title}</h5>
            <p>R${item.price}</p>
            <p>Wanted: ${item.quantity} | Claimed: ${item.claimed}</p>
            <div class="guest-actions">
              <button class="btn-primary btn-sm" onclick="toggleClaimItem('${registry.id}', '${item.id}')">
                ${item.claimed >= item.quantity ? 'Un-claim Gift' : 'Claim Gift'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    }

    window.toggleClaimItem = (regId, itemId) => {
        const registry = registries.find(r => r.id === regId);
        const item = registry?.items.find(i => i.id === itemId);

        if (item) {
            if (item.claimed >= item.quantity) {
                // Unclaim logic: reduce claimed count, but not below 0
                item.claimed = Math.max(0, item.claimed - 1);
                alert(`You have un-claimed: ${item.title}`);
            } else {
                // Claim logic
                item.claimed++;
                alert(`You have claimed: ${item.title}`);
            }
            saveRegistries();
            renderGuestView(registry);
        }
    };
});
