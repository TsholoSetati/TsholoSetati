/**
 * GiftlyInvited Demo Logic
 * Handles authentication, registry management, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentUser = null;
    let registries = JSON.parse(localStorage.getItem('demo_registries') || '[]');
    let currentGuestName = localStorage.getItem('demo_guest_name') || null;
    let isAdminRevealMode = false;

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
    const toastContainer = document.getElementById('toast-container');

    // Stats Elements
    const dashboardStats = document.getElementById('dashboardStats');
    const statsTotalValue = document.getElementById('statsTotalValue');
    const statsProgress = document.getElementById('statsProgress');
    const statsText = document.getElementById('statsText');

    // Modal Elements
    const modal = document.getElementById('registryModal');
    const modalClose = document.querySelector('.demo-modal-close');
    const modalOverlay = document.querySelector('.demo-modal-overlay');
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemForm = document.getElementById('addItemForm');
    const itemForm = document.getElementById('itemForm');
    const cancelAddItem = document.getElementById('cancelAddItem');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const adminModeToggle = document.getElementById('adminModeToggle');
    const creatorFilterSort = document.getElementById('creatorFilterSort');

    // Guest Elements
    const guestIdentityForm = document.getElementById('guestIdentityForm');
    const guestCodeSection = document.getElementById('guestCodeSection');
    const guestNameInput = document.getElementById('guestNameInput');
    const confirmGuestNameBtn = document.getElementById('confirmGuestNameBtn');

    // Initialization
    checkSession();
    updateGuestState();

    // Event Listeners
    loginForm?.addEventListener('submit', handleLogin);
    logoutBtn?.addEventListener('click', handleLogout);

    // Landing Page Listeners
    document.getElementById('landingFindBtn')?.addEventListener('click', () => {
        const code = document.getElementById('landingInviteCode').value.trim().toUpperCase();
        if (code) {
            handleGuestEntry(code);
        } else {
            showToast('Please enter an invite code', 'error');
        }
    });

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
        // Hide sort controls when adding item
        if (creatorFilterSort) creatorFilterSort.parentElement.style.display = 'none';
    });
    cancelAddItem?.addEventListener('click', () => {
        addItemForm.style.display = 'none';
        addItemBtn.style.display = 'block';
        if (creatorFilterSort) creatorFilterSort.parentElement.style.display = 'block';
        itemForm.reset();
    });
    itemForm?.addEventListener('submit', handleAddItem);
    copyCodeBtn?.addEventListener('click', handleCopyCode);

    adminModeToggle?.addEventListener('change', (e) => {
        isAdminRevealMode = e.target.checked;
        const registryId = modal.dataset.currentId;
        const registry = registries.find(r => r.id === registryId);
        if (registry) renderItems(registry);
    });

    creatorFilterSort?.addEventListener('change', () => {
        const registryId = modal.dataset.currentId;
        const registry = registries.find(r => r.id === registryId);
        if (registry) renderItems(registry);
    });

    confirmGuestNameBtn?.addEventListener('click', () => {
        const name = guestNameInput.value.trim();
        if (name) {
            currentGuestName = name;
            localStorage.setItem('demo_guest_name', name);
            updateGuestState();
        } else {
            showToast('Please enter your name to continue', 'error');
        }
    });

    // --- Authentication ---

    function handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const errorMsg = document.getElementById('loginError');

        // Admin Login
        if (user.toLowerCase() === 'admin' && pass === 'admin') {
            currentUser = { name: 'Admin', role: 'admin' };
            localStorage.setItem('demo_user', JSON.stringify(currentUser));
            errorMsg.style.display = 'none';
            renderApp();
        }
        // Rebone Login
        else if (user.toLowerCase() === 'rebone' && pass === 'babyshower') {
            currentUser = { name: 'Rebone', role: 'creator' };
            localStorage.setItem('demo_user', JSON.stringify(currentUser));
            errorMsg.style.display = 'none';
            renderApp();
        }
        else {
            errorMsg.textContent = 'Invalid credentials.';
            errorMsg.style.display = 'block';
        }
    }

    function handleGuestEntry(code) {
        const registry = registries.find(r => r.inviteCode === code);
        if (registry) {
            currentUser = { name: 'Guest', role: 'guest', activeRegistryCode: code };
            localStorage.setItem('demo_user', JSON.stringify(currentUser));
            renderApp();
            // Pre-fill guest view
            setTimeout(() => {
                renderGuestView(registry);
                guestView.style.display = 'grid';
            }, 100);
        } else {
            showToast('Registry not found.', 'error');
        }
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('demo_user');
        // Reset view state
        window.location.reload();
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

            // Role-Based UI
            if (currentUser.role === 'guest') {
                // Hide Dashboard/Create tabs
                document.querySelectorAll('.demo-tab[data-tab="dashboard"], .demo-tab[data-tab="create"]').forEach(el => el.style.display = 'none');
                // Auto switch to guest
                switchTab('guest');
                // Hide search box in guest tab since they already entered code
                document.getElementById('guestCodeSection').style.display = 'none';
                logoutBtn.innerHTML = '<i class="ph ph-hand-waving icon-inline"></i> Exit Guest View';

                // If we have a code, load it
                if (currentUser.activeRegistryCode) {
                    const reg = registries.find(r => r.inviteCode === currentUser.activeRegistryCode);
                    if (reg) renderGuestView(reg);
                }

            } else {
                // Admin/Creator View
                document.querySelectorAll('.demo-tab').forEach(el => el.style.display = 'inline-block');
                logoutBtn.innerHTML = '<i class="ph ph-sign-out icon-inline"></i> Sign Out';

                // Update specific UI for Rebone vs Admin
                const welcomeMsg = document.querySelector('.demo-welcome h3');
                if (welcomeMsg) welcomeMsg.innerHTML = `Welcome back, ${currentUser.name}! <i class="ph ph-hand-waving icon-inline"></i>`;

                // Hide Admin Toggle for Rebone
                if (currentUser.role === 'creator') {
                    document.querySelector('.role-toggle-container').style.display = 'none';
                } else {
                    document.querySelector('.role-toggle-container').style.display = 'flex';
                }

                updateDashboard();
            }

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

    function updateGuestState() {
        if (currentGuestName) {
            guestIdentityForm.style.display = 'none';
            guestCodeSection.style.display = 'block';
        } else {
            guestIdentityForm.style.display = 'block';
            guestCodeSection.style.display = 'none';
        }
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
        showToast('Registry created successfully!', 'success');

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

        // Update Stats
        let totalVal = 0;
        let totalItems = 0;
        let claimedItems = 0;

        registries.forEach(r => {
            r.items.forEach(i => {
                totalVal += (Number(i.price) || 0) * (Number(i.quantity) || 1);
                totalItems += Number(i.quantity) || 1;
                claimedItems += Number(i.claimed) || 0;
            });
        });

        statsTotalValue.textContent = `R${totalVal.toLocaleString()}`;
        const percent = totalItems > 0 ? Math.round((claimedItems / totalItems) * 100) : 0;
        statsProgress.style.width = `${percent}%`;
        statsText.textContent = `${percent}% Fulfilled (${claimedItems}/${totalItems} gifts)`;
        if (registries.length > 0) {
            dashboardStats.style.display = 'flex';
        }

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
            showToast('Registry deleted', 'success');
        }
    };

    window.openRegistry = (id) => {
        const registry = registries.find(r => r.id === id);
        if (!registry) return;

        document.getElementById('modalRegistryName').textContent = registry.name;
        document.getElementById('modalInviteCode').textContent = registry.inviteCode;
        modal.dataset.currentId = id; // Store ID on modal

        // Reset Admin Toggle
        adminModeToggle.checked = false;
        isAdminRevealMode = false;

        renderItems(registry);
        modal.style.display = 'flex';
        if (creatorFilterSort) creatorFilterSort.parentElement.style.display = 'block';
    };

    function closeModal() {
        modal.style.display = 'none';
        addItemForm.style.display = 'none';
        addItemBtn.style.display = 'block';
    }

    // --- Items Management ---

    function handleAddItem(e) {
        e.preventDefault();
        const registryId = modal.dataset.currentId;
        const registry = registries.find(r => r.id === registryId);
        if (!registry) return;

        const fileInput = document.getElementById('itemImage');

        const processItem = (imgData) => {
            const newItem = {
                id: Date.now().toString(),
                title: document.getElementById('itemTitle').value,
                price: document.getElementById('itemPrice').value,
                quantity: parseInt(document.getElementById('itemQuantity').value) || 1,
                category: document.getElementById('itemCategory').value,
                url: document.getElementById('itemUrl').value,
                description: document.getElementById('itemDescription').value,
                image: imgData,
                claimed: 0,
                claims: [], // Array of { name: 'John', date: ... }
                thankYouSent: false
            };

            registry.items.push(newItem);
            saveRegistries();
            renderItems(registry);
            itemForm.reset();
            addItemForm.style.display = 'none';
            addItemBtn.style.display = 'block';
            if (creatorFilterSort) creatorFilterSort.parentElement.style.display = 'block';
            updateDashboard();
            showToast('Item added successfully!', 'success');
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

    // Helper to sort items
    function sortItems(items, sortMode) {
        let sorted = [...items];
        switch (sortMode) {
            case 'price-asc': return sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            case 'price-desc': return sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            case 'status': return sorted.sort((a, b) => (b.claimed - a.claimed)); // Claimed items first
            case 'newest':
            default: return sorted.reverse(); // Default is newest first (based on push order)
        }
    }

    function renderItems(registry) {
        const list = document.getElementById('itemsList');
        list.innerHTML = '';

        if (registry.items.length === 0) {
            list.innerHTML = '<p class="muted text-center">No items added yet.</p>';
            return;
        }

        const sortMode = creatorFilterSort ? creatorFilterSort.value : 'newest';
        const sortedItems = sortItems(registry.items, sortMode);

        sortedItems.forEach(item => {
            const isFulfilled = item.claimed >= item.quantity;

            // Logic for showing claimers
            let claimerDisplay = '';
            if (item.claimed > 0) {
                if (isAdminRevealMode) {
                    // Admin sees names
                    const names = item.claims ? item.claims.map(c => c.name).join(', ') : 'Unknown';
                    claimerDisplay = `<div class="claimer-info admin-reveal"><i class="ph ph-gift icon-inline"></i> Claimed by: <strong>${names}</strong></div>`;
                } else {
                    // Creator sees only status
                    claimerDisplay = `<div class="claimer-info creator-view"><i class="ph ph-gift icon-inline"></i> ${item.claimed} purchased (Names hidden until Reveal)</div>`;
                }
            }

            const el = document.createElement('div');
            el.className = `demo-item-card ${isFulfilled ? 'fulfilled' : ''}`;
            el.innerHTML = `
        <div class="item-info">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">` : ''}
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between;">
                <h5>${item.title} <span class="category-tag">${item.category || 'General'}</span></h5>
                <span class="muted">R${item.price || '0'}</span>
            </div>
            
            <div class="item-meta">
                 <span>Req: ${item.quantity}</span>
                 <span>Has: <strong>${item.claimed}</strong></span>
            </div>
            
            ${claimerDisplay}

            <div class="item-admin-controls" style="margin-top:8px; border-top:1px solid #eee; padding-top:8px;">
                 <label class="thank-you-label">
                    <input type="checkbox" onchange="toggleThankYou('${registry.id}', '${item.id}', this)" ${item.thankYouSent ? 'checked' : ''}> 
                    💌 Thank You Sent?
                 </label>
            </div>
          </div>
        </div>
      `;
            list.appendChild(el);
        });
    }

    window.toggleThankYou = (regId, itemId, checkbox) => {
        const registry = registries.find(r => r.id === regId);
        const item = registry?.items.find(i => i.id === itemId);
        if (item) {
            item.thankYouSent = checkbox.checked;
            saveRegistries();
            showToast(item.thankYouSent ? 'Marked as Sent!' : 'Marked as Not Sent');
        }
    };

    function handleCopyCode() {
        const code = document.getElementById('modalInviteCode').textContent;
        navigator.clipboard.writeText(code);
        copyCodeBtn.innerHTML = '<i class="ph ph-check icon-inline"></i> Copied!';
        setTimeout(() => copyCodeBtn.innerHTML = '<i class="ph ph-copy icon-inline"></i> Copy', 2000);
        showToast('Invite code copied to clipboard');
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
            showToast(`Found registry: ${registry.name}`, 'success');
        } else {
            showToast('Registry not found. Check the invite code.', 'error');
            guestView.style.display = 'none';
        }
    });

    function renderGuestView(registry) {
        // Guest Filter Controls
        const filterHtml = `
            <div class="guest-filters" style="margin-bottom: 20px; grid-column: 1/-1;">
                 <input type="text" id="guestSearch" placeholder="Search gifts..." class="form-control" style="max-width:300px; display:inline-block; margin-right:10px;">
                 <select id="guestSort" class="form-control" style="max-width:200px; display:inline-block;">
                    <option value="default">Sort: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                 </select>
            </div>
        `;

        guestView.innerHTML = `
      <div class="guest-header" style="grid-column: 1/-1;">
        <h4>${registry.name}</h4>
        <p>${registry.description || ''}</p>
        <span class="muted date">📅 ${registry.formattedDate}</span>
      </div>
      ${filterHtml}
      <div class="guest-items-grid" id="guestGridContainer" style="grid-column: 1/-1; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
        <!-- Items Injected Here -->
      </div>
    `;

        renderGuestGrid(registry, registry.items);

        // Attach listeners for guest search/sort
        document.getElementById('guestSearch')?.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = registry.items.filter(i => i.title.toLowerCase().includes(term));
            renderGuestGrid(registry, filtered);
        });

        document.getElementById('guestSort')?.addEventListener('change', (e) => {
            const sorted = sortItems(registry.items, e.target.value);
            renderGuestGrid(registry, sorted);
        });
    }

    function renderGuestGrid(registry, items) {
        const container = document.getElementById('guestGridContainer');
        container.innerHTML = items.map(item => `
          <div class="guest-item-card" style="display:flex; flex-direction:column;">
            ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
            <div class="guest-item-content" style="flex:1;">
                <span class="category-tag-small">${item.category || 'General'}</span>
                <h5>${item.title}</h5>
                <p>R${item.price}</p>
                <div class="progress-bar-sm">
                    <div class="fill" style="width: ${(item.claimed / item.quantity) * 100}%"></div>
                </div>
                <p><small>${item.claimed} / ${item.quantity} claimed</small></p>
            </div>
            <div class="guest-actions" style="margin-top:10px;">
              <button class="btn-primary btn-sm" style="width:100%" onclick="toggleClaimItem('${registry.id}', '${item.id}')">
                ${isClaimedByMe(item) ? 'Un-claim Gift' : (item.claimed >= item.quantity ? 'Fulfilled' : 'Claim Gift')}
              </button>
            </div>
          </div>
        `).join('')
    }

    function isClaimedByMe(item) {
        if (!item.claims) return false;
        return item.claims.some(c => c.name === currentGuestName);
    }

    window.toggleClaimItem = (regId, itemId) => {
        if (!currentGuestName) {
            showToast('Please enter your name first', 'error');
            // Scroll to name input?
            return;
        }

        const registry = registries.find(r => r.id === regId);
        const item = registry?.items.find(i => i.id === itemId);

        if (item) {
            // Ensure claims array exists
            if (!item.claims) item.claims = [];

            const myClaimIndex = item.claims.findIndex(c => c.name === currentGuestName);

            if (myClaimIndex >= 0) {
                // UNCLAIM
                item.claims.splice(myClaimIndex, 1);
                item.claimed = Math.max(0, item.claimed - 1);
                showToast(`You have un-claimed: ${item.title}`);
            } else {
                // CLAIM
                if (item.claimed >= item.quantity) {
                    showToast('This item is already fully claimed!', 'error');
                    return;
                }
                item.claims.push({ name: currentGuestName, date: new Date().toISOString() });
                item.claimed++;
                showToast(`You have claimed: ${item.title}`, 'success');
            }
            saveRegistries();
            // Re-render only grid to keep filters
            renderGuestGrid(registry, registry.items);
        }
    };

    // --- Toast Notification System ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
