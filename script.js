let challenges = [];
let editingId = null;
let deferredPrompt;
let allowPastEditing = false; // hidden feature flag: allows past start-dates and past-day edits

// Load challenges from localStorage
function loadChallenges() {
    const stored = localStorage.getItem('challenges');
    if (stored) {
        challenges = JSON.parse(stored);
    }

    // load hidden past-editing flag
    allowPastEditing = localStorage.getItem('allowPastEditing') === 'true';
}

// Save challenges to localStorage
function saveChallenges() {
    localStorage.setItem('challenges', JSON.stringify(challenges));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calculate current day index for a challenge
function getCurrentDayIndex(startDate, totalDays) {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, totalDays - 1));
}

// Render summary
function renderSummary() {
    const totalChallenges = challenges.length;
    let totalCompletedDays = 0;
    let totalDays = 0;
    
    challenges.forEach(challenge => {
        const currentDayIndex = getCurrentDayIndex(challenge.startDate, challenge.days);
        // detect if challenge starts in the future; if so, don't count any current days
        const startDateObj = new Date(challenge.startDate);
        const today = new Date();
        const diffTimeAll = today - startDateObj;
        const diffDaysAll = Math.floor(diffTimeAll / (1000 * 60 * 60 * 24));
        const challengeNotStarted = diffDaysAll < 0;
        const effectiveCurrent = challengeNotStarted ? -1 : currentDayIndex;
        totalDays += challenge.days;
        totalCompletedDays += challenge.progress.slice(0, Math.max(0, effectiveCurrent + 1)).filter(p => p).length;
    });
    
    const summaryEl = document.getElementById('summary');
    summaryEl.innerHTML = `
        <strong>Summary:</strong> ${totalChallenges} challenges, 
        ${totalCompletedDays} days completed out of ${totalDays} total days
    `;
}

// Render challenges
function renderChallenges() {
    const container = document.getElementById('challenges-container');
    container.innerHTML = '';
    
    challenges.forEach(challenge => {
        const currentDayIndex = getCurrentDayIndex(challenge.startDate, challenge.days);
        // determine if the challenge has already ended (today is after last day)
        const startDateObj = new Date(challenge.startDate);
        const today = new Date();
        const diffTimeAll = today - startDateObj;
        const diffDaysAll = Math.floor(diffTimeAll / (1000 * 60 * 60 * 24));
        const challengeEnded = diffDaysAll >= challenge.days;
        const challengeNotStarted = diffDaysAll < 0;
        // effective current day: -1 when not started, otherwise currentDayIndex
        const effectiveCurrent = challengeNotStarted ? -1 : currentDayIndex;
        const completedDays = challenge.progress.slice(0, Math.max(0, effectiveCurrent + 1)).filter(p => p).length;
        const progressPercentage = effectiveCurrent >= 0 ? (completedDays / (effectiveCurrent + 1)) * 100 : 0;
        const daysLeft = challengeNotStarted ? challenge.days : Math.max(0, challenge.days - effectiveCurrent - 1);
        
        const challengeEl = document.createElement('div');
        challengeEl.className = 'challenge';
        challengeEl.innerHTML = `
            <div class="challenge-header">
                <h3>${challenge.name}</h3>
                <div>
                    <button class="edit-btn" data-id="${challenge.id}">Edit</button>
                    <button class="reset-btn" data-id="${challenge.id}">Reset</button>
                    <button class="delete-btn" data-id="${challenge.id}">Delete</button>
                </div>
            </div>
            <p>Days left: ${daysLeft}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <p>Progress: ${completedDays}/${currentDayIndex + 1} days (${progressPercentage.toFixed(1)}%)</p>
            <div class="days-grid">
                        ${challenge.progress.map((completed, index) => {
                    const dayNumber = index + 1;
                            // If the challenge hasn't started, all days are future (disabled)
                            if (challengeNotStarted) {
                                var isPast = false;
                                var isToday = false;
                                var isFuture = true;
                            } else {
                                // If the challenge ended, treat all days as past. Whether they are editable
                                // depends on `allowPastEditing` hidden flag.
                                var isPast = challengeEnded ? true : index < currentDayIndex;
                                var isToday = !challengeEnded && index === currentDayIndex;
                                var isFuture = !challengeEnded && index > currentDayIndex;
                            }
                    let className = 'day-checkbox';
                    let disabled = '';
                    let checked = completed ? 'checked' : '';
                    
                    if (isPast) {
                        className += ' past';
                        // past days are editable only when allowPastEditing is true
                        disabled = allowPastEditing ? '' : 'disabled';
                    } else if (isToday) {
                        className += ' today';
                    } else if (isFuture) {
                        className += ' future';
                        disabled = 'disabled';
                        checked = '';
                    }
                    
                    return `
                        <div class="${className}">
                            <input type="checkbox" id="day-${challenge.id}-${index}" 
                                   ${checked} 
                                   ${disabled} 
                                   data-challenge-id="${challenge.id}" 
                                   data-day-index="${index}">
                            <label for="day-${challenge.id}-${index}">${dayNumber}</label>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.appendChild(challengeEl);
    });
    
    // Add event listeners (use currentTarget to avoid issues when click target is inner text)
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editChallenge(e.currentTarget.dataset.id));
    });
    document.querySelectorAll('.reset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => resetChallenge(e.currentTarget.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteChallenge(e.currentTarget.dataset.id));
    });
    document.querySelectorAll('input[type="checkbox"]:not([disabled])').forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress);
    });

    // Wire update button to submit the form when editing
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            const form = document.getElementById('challenge-form');
            if (typeof form.requestSubmit === 'function') {
                form.requestSubmit();
            } else {
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
        });
    }
}

// Add new challenge
function addChallenge(name, days, startDate) {
    const challenge = {
        id: generateId(),
        name,
        days: parseInt(days),
        startDate,
        progress: new Array(parseInt(days)).fill(false)
    };
    challenges.push(challenge);
    saveChallenges();
    renderChallenges();
    renderSummary();
}

// Update challenge
function updateChallenge(id, name, days, startDate) {
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
        challenge.name = name;
        challenge.days = parseInt(days);
        challenge.startDate = startDate;
        // Adjust progress array if days changed
        if (challenge.progress.length !== parseInt(days)) {
            const newProgress = new Array(parseInt(days)).fill(false);
            challenge.progress.forEach((p, i) => {
                if (i < newProgress.length) newProgress[i] = p;
            });
            challenge.progress = newProgress;
        }
        saveChallenges();
        renderChallenges();
        renderSummary();
    }
}

// Edit challenge
function editChallenge(id) {
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
        document.getElementById('task-name').value = challenge.name;
        document.getElementById('num-days').value = challenge.days;
        document.getElementById('start-date').value = challenge.startDate;
        editingId = id;
        document.getElementById('update-btn').style.display = 'inline-block';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        document.querySelector('button[type="submit"]').style.display = 'none';
    }
}

// Reset challenge
function resetChallenge(id) {
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
        challenge.progress.fill(false);
        saveChallenges();
        renderChallenges();
        renderSummary();
    }
}

// Delete challenge
function deleteChallenge(id) {
    challenges = challenges.filter(c => c.id !== id);
    saveChallenges();
    renderChallenges();
    renderSummary();
}

// Update progress
function updateProgress(e) {
    const challengeId = e.target.dataset.challengeId;
    const dayIndex = parseInt(e.target.dataset.dayIndex);
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
        const currentDayIndex = getCurrentDayIndex(challenge.startDate, challenge.days);
        // Determine challenge timing
        const startDateObj = new Date(challenge.startDate);
        const today = new Date();
        const diffTimeAll = today - startDateObj;
        const diffDaysAll = Math.floor(diffTimeAll / (1000 * 60 * 60 * 24));
        const challengeEnded = diffDaysAll >= challenge.days;
        const challengeNotStarted = diffDaysAll < 0;

        // If the challenge hasn't started yet, disallow any edits
        if (challengeNotStarted) return;

        // If hidden past-editing mode is enabled, allow editing any past day (including days before today)
        if (allowPastEditing) {
            // allow editing any day that is within the challenge length and not a future day
            if (dayIndex >= 0 && dayIndex < challenge.days && dayIndex <= currentDayIndex) {
                challenge.progress[dayIndex] = e.target.checked;
                saveChallenges();
                renderChallenges();
                renderSummary();
            }
            return;
        }

        // Default behavior: only allow updating today's task while active
        if (!challengeEnded && dayIndex === currentDayIndex) {
            challenge.progress[dayIndex] = e.target.checked;
            saveChallenges();
            renderChallenges();
            renderSummary();
        }
    }
}

// Form submission
document.getElementById('challenge-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('task-name').value;
    const days = document.getElementById('num-days').value;
    const startDate = document.getElementById('start-date').value;
    
    if (editingId) {
        updateChallenge(editingId, name, days, startDate);
        editingId = null;
        document.getElementById('update-btn').style.display = 'none';
        document.getElementById('cancel-btn').style.display = 'none';
        document.querySelector('button[type="submit"]').style.display = 'inline-block';
    } else {
        addChallenge(name, days, startDate);
    }
    
    e.target.reset();
});

// Cancel edit
document.getElementById('cancel-btn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('challenge-form').reset();
    document.getElementById('update-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
    document.querySelector('button[type="submit"]').style.display = 'inline-block';
});

// PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-prompt').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            document.getElementById('install-prompt').style.display = 'none';
        });
    }
});

document.getElementById('dismiss-btn').addEventListener('click', () => {
    document.getElementById('install-prompt').style.display = 'none';
});

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful');
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Initialize
loadChallenges();
renderChallenges();
renderSummary();

// Theme (dark mode) support
function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = '🌙';
    }
}

function loadTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    // Default to system preference if available
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    return false;
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const nextDark = !isDark;
    applyTheme(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
}

// Hook up theme button
document.addEventListener('DOMContentLoaded', () => {
    const isDark = loadTheme();
    applyTheme(isDark);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
    // Lock the start-date input to today's date only
    setStartDateToToday();
    // Apply past-editing mode (hidden feature) if enabled
    applyPastMode(allowPastEditing);
    // secret toggle: Ctrl+Shift+P to toggle past-editing mode
    document.addEventListener('keydown', (ev) => {
        if (ev.ctrlKey && ev.key && ev.key.toLowerCase() === 'q') {
            allowPastEditing = !allowPastEditing;
            localStorage.setItem('allowPastEditing', allowPastEditing ? 'true' : 'false');
            applyPastMode(allowPastEditing);
            showToast(`Past-editing ${allowPastEditing ? 'enabled' : 'disabled'}`);
        }
    });
});

// Set the `#start-date` input's value, min and max to today's date (YYYY-MM-DD)
function setStartDateToToday() {
    const input = document.getElementById('start-date');
    if (!input) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    // Default to today's date and allow selecting today or any future date
    input.value = todayStr;
    input.min = todayStr;
    // do NOT set input.max so future dates remain selectable
}

// Apply or remove past-editing mode effects (input min and rerender)
function applyPastMode(enabled) {
    const input = document.getElementById('start-date');
    if (input) {
        if (enabled) {
            input.removeAttribute('min');
        } else {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            input.min = `${yyyy}-${mm}-${dd}`;
            // if current value is earlier than min, reset to min
            if (input.value < input.min) input.value = input.min;
        }
    }
    // re-render so checkboxes reflect editable state
    renderChallenges();
}

// small ephemeral toast to indicate hidden toggle state
function showToast(message) {
    const id = 'past-mode-toast';
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.style.position = 'fixed';
        el.style.bottom = '18px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.background = 'rgba(0,0,0,0.8)';
        el.style.color = 'white';
        el.style.padding = '8px 12px';
        el.style.borderRadius = '6px';
        el.style.zIndex = 100000;
        document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.display = 'block';
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => { el.style.display = 'none'; }, 2000);
}
