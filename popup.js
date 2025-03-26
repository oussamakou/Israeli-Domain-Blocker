document.addEventListener('DOMContentLoaded', function() {
    // Tab handling
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tab.dataset.tab}-content`).classList.add('active');
        });
    });

    // Function to show toast message
    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // Function to check if a domain is valid
    function isValidDomain(domain) {
        const domainPattern = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$/;
        return domainPattern.test(domain);
    }

    // Function to create domain item element
    function createDomainItem(domain, isWhitelist = false) {
        const item = document.createElement('div');
        item.className = 'domain-item';
        
        const text = document.createElement('span');
        text.className = 'domain-text';
        text.textContent = domain;
        
        const actions = document.createElement('div');
        actions.className = 'action-buttons';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'icon-button edit-button';
        editBtn.textContent = 'Edit';
        editBtn.title = 'Edit domain';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-button delete-button';
        deleteBtn.textContent = 'Delete';
        deleteBtn.title = 'Delete domain';
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(text);
        item.appendChild(actions);

        // Edit functionality
        editBtn.addEventListener('click', () => {
            const newDomain = prompt('Edit domain:', domain);
            if (newDomain && newDomain !== domain && isValidDomain(newDomain)) {
                const storageKey = isWhitelist ? 'whitelistedDomains' : 'blockedDomains';
                chrome.storage.local.get(storageKey, (data) => {
                    const domains = data[storageKey] || [];
                    const index = domains.indexOf(domain);
                    if (index !== -1) {
                        domains[index] = newDomain;
                        chrome.storage.local.set({ [storageKey]: domains }, () => {
                            displayDomains(isWhitelist);
                            showToast('Domain updated successfully!');
                        });
                    }
                });
            } else if (newDomain && !isValidDomain(newDomain)) {
                showToast('Please enter a valid domain.');
            }
        });

        // Delete functionality
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to remove ${domain}?`)) {
                const storageKey = isWhitelist ? 'whitelistedDomains' : 'blockedDomains';
                chrome.storage.local.get(storageKey, (data) => {
                    const domains = data[storageKey] || [];
                    const index = domains.indexOf(domain);
                    if (index !== -1) {
                        domains.splice(index, 1);
                        chrome.storage.local.set({ [storageKey]: domains }, () => {
                            displayDomains(isWhitelist);
                            showToast('Domain removed successfully!');
                        });
                    }
                });
            }
        });

        return item;
    }

    // Function to display domains
    function displayDomains(isWhitelist = false) {
        const storageKey = isWhitelist ? 'whitelistedDomains' : 'blockedDomains';
        const containerId = isWhitelist ? 'whitelist' : 'domain-list';
        
        chrome.storage.local.get(storageKey, (data) => {
            const domains = data[storageKey] || [];
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            if (domains.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.textContent = `No ${isWhitelist ? 'whitelisted' : 'blocked'} domains yet`;
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.opacity = '0.7';
                emptyMessage.style.padding = '20px';
                container.appendChild(emptyMessage);
                return;
            }

            domains.forEach(domain => {
                container.appendChild(createDomainItem(domain, isWhitelist));
            });
        });
    }

    // Add domain handlers
    document.getElementById("blockButton").addEventListener("click", () => {
        const domainInput = document.getElementById("domain-input");
        const domain = domainInput.value.trim();
        
        if (!domain) return;
        
        if (!isValidDomain(domain)) {
            showToast('Please enter a valid domain.');
            return;
        }

        chrome.storage.local.get("blockedDomains", (data) => {
            const domains = data.blockedDomains || [];
            if (domains.includes(domain)) {
                showToast('This domain is already blocked.');
                return;
            }

            domains.push(domain);
            chrome.storage.local.set({ blockedDomains: domains }, () => {
                displayDomains(false);
                domainInput.value = '';
                showToast('Domain blocked successfully!');
            });
        });
    });

    document.getElementById("add-whitelist-btn").addEventListener("click", () => {
        const whitelistInput = document.getElementById("whitelist-input");
        const domain = whitelistInput.value.trim();
        
        if (!domain) return;
        
        if (!isValidDomain(domain)) {
            showToast('Please enter a valid domain.');
            return;
        }

        chrome.storage.local.get("whitelistedDomains", (data) => {
            const domains = data.whitelistedDomains || [];
            if (domains.includes(domain)) {
                showToast('This domain is already whitelisted.');
                return;
            }

            domains.push(domain);
            chrome.storage.local.set({ whitelistedDomains: domains }, () => {
                displayDomains(true);
                whitelistInput.value = '';
                showToast('Domain whitelisted successfully!');
            });
        });
    });

    // Bug report functionality
    const bugReport = document.querySelector('.bug-report');
    const bugModal = document.getElementById('bug-modal');
    const modalClose = document.querySelector('.modal-close');
    const bugDescription = document.getElementById('bug-description');
    const charCount = document.getElementById('char-count');
    const submitBug = document.getElementById('submit-bug');

    bugReport.addEventListener('click', () => {
        bugModal.classList.add('active');
    });

    modalClose.addEventListener('click', () => {
        bugModal.classList.remove('active');
        bugDescription.value = '';
        charCount.textContent = '0';
    });

    bugDescription.addEventListener('input', () => {
        charCount.textContent = bugDescription.value.length;
    });

    submitBug.addEventListener('click', () => {
        const description = bugDescription.value.trim();
        if (description.length < 10) {
            showToast('Please provide more details about the bug.');
            return;
        }

        // Send bug report to your endpoint
        const bugReport = {
            description,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            version: chrome.runtime.getManifest().version
        };

        // You can implement your own bug reporting endpoint
        // For now, we'll just log it and show a success message
        console.log('Bug Report:', bugReport);
        showToast('Bug report submitted successfully!');
        
        bugModal.classList.remove('active');
        bugDescription.value = '';
        charCount.textContent = '0';
    });

    // Initial display
    displayDomains(false);
    displayDomains(true);
});
