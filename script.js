document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthFeedback = document.querySelector('.strength-feedback');
    const suggestionsDiv = document.querySelector('.suggestions');
    const generateButton = document.getElementById('generateButton');
    const lengthInput = document.getElementById('lengthInput');
    const generatedPasswordDiv = document.querySelector('.generated-password .password-text');
    const copyButton = document.querySelector('.copy-btn');
    const historyList = document.querySelector('.history-list');
    const securityIndicators = document.querySelectorAll('.indicator');
    const submitFeedbackButton = document.getElementById('submitFeedback');
    const userFeedbackInput = document.getElementById('userFeedback');
    const clearHistoryButton = document.getElementById('clearHistory');

    // Password visibility toggle
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Real-time password strength checking
    passwordInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            checkPasswordStrength(this.value);
        } else {
            resetUI();
        }
    });

    // Copy to clipboard
    copyButton.addEventListener('click', function() {
        const password = generatedPasswordDiv.textContent;
        if (password) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    showToast('Password copied to clipboard!');
                })
                .catch(() => {
                    showToast('Failed to copy password');
                });
        }
    });

    // Generate password
    generateButton.addEventListener('click', async function() {
        const length = parseInt(lengthInput.value) || 12;
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ length })
        });

        const result = await response.json();
        generatedPasswordDiv.textContent = result.password;
        passwordInput.value = result.password;
        checkPasswordStrength(result.password);
    });

    // Submit user feedback
    submitFeedbackButton.addEventListener('click', function() {
        const feedback = userFeedbackInput.value;
        if (feedback) {
            // Here you can implement a function to send feedback to the server
            showToast('Thank you for your feedback!');
            userFeedbackInput.value = ''; // Clear the textarea
        } else {
            showToast('Please enter your feedback before submitting.');
        }
    });

    // Clear password history
    clearHistoryButton.addEventListener('click', function() {
        historyList.innerHTML = ''; // Clear the history list
        showToast('Password history cleared!');
    });

    async function checkPasswordStrength(password) {
        const response = await fetch('/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        });

        const result = await response.json();
        updateUI(result);
        updateSecurityIndicators(result.details);
        addToHistory(password, result.strength);
    }

    function updateUI(result) {
        // Update strength meter
        const strengthColors = {
            'Very Weak': '#e74c3c',
            'Weak': '#f39c12',
            'Moderate': '#f1c40f',
            'Strong': '#2ecc71',
            'Very Strong': '#27ae60'
        };

        strengthBar.style.width = `${(result.score / 8) * 100}%`;
        strengthBar.style.backgroundColor = strengthColors[result.strength];
        
        // Update feedback
        strengthFeedback.textContent = `Strength: ${result.strength}`;
        strengthFeedback.style.color = strengthColors[result.strength];

        // Update suggestions
        if (result.suggestions.length > 0) {
            suggestionsDiv.innerHTML = `
                <h3>Suggestions for improvement:</h3>
                <ul>
                    ${result.suggestions.map(s => `<li><i class="fas fa-exclamation-circle"></i> ${s}</li>`).join('')}
                </ul>
            `;
        } else {
            suggestionsDiv.innerHTML = '<p><i class="fas fa-check-circle"></i> Your password is strong!</p>';
        }
    }

    function updateSecurityIndicators(details) {
        securityIndicators.forEach(indicator => {
            const check = indicator.getAttribute('data-check');
            if (details[check]) {
                indicator.classList.add('valid');
            } else {
                indicator.classList.remove('valid');
            }
        });
    }

    function addToHistory(password, strength) {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.innerHTML = `
            <span class="password">${'•'.repeat(password.length)}</span>
            <span class="strength" style="color: ${getStrengthColor(strength)}">${strength}</span>
            <button class="view-password" title="View Password">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        // Add event listener for viewing password
        historyItem.querySelector('.view-password').addEventListener('click', function() {
            const passwordSpan = this.previousElementSibling;
            if (passwordSpan.textContent.includes('•')) {
                passwordSpan.textContent = password; // Show actual password
                this.querySelector('i').classList.toggle('fa-eye-slash');
            } else {
                passwordSpan.textContent = '•'.repeat(password.length); // Hide password
                this.querySelector('i').classList.toggle('fa-eye');
            }
        });

        historyList.prepend(historyItem);
    }

    function getStrengthColor(strength) {
        const colors = {
            'Very Weak': '#e74c3c',
            'Weak': '#f39c12',
            'Moderate': '#f1c40f',
            'Strong': '#2ecc71',
            'Very Strong': '#27ae60'
        };
        return colors[strength];
    }

    function resetUI() {
        strengthBar.style.width = '0';
        strengthFeedback.textContent = '';
        suggestionsDiv.innerHTML = '';
        securityIndicators.forEach(indicator => indicator.classList.remove('valid'));
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
});
