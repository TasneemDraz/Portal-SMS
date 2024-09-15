document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleInput = document.getElementById('role');
    const usernameErrorSpan = document.getElementById('username-error');
    const emailErrorSpan = document.getElementById('email-error');
    const passwordErrorSpan = document.getElementById('password-error');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission
        
        usernameErrorSpan.textContent = '';
        emailErrorSpan.textContent = '';
        passwordErrorSpan.textContent = '';

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleInput.value;

        let hasError = false;

        if (username === '') {
            usernameErrorSpan.textContent = 'Username is required';
            hasError = true;
        }

        if (email === '') {
            emailErrorSpan.textContent = 'Email is required';
            hasError = true;
        }

        if (password === '') {
            passwordErrorSpan.textContent = 'Password is required';
            hasError = true;
        }

        if (hasError) {
            return; // Stop if validation fails
        }

        try {
            const response = await fetch('http://localhost:5174/api/User/register', { // Update URL to your API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, role })
            });

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                const data = await response.json();
                const errorMessage = data.message || 'Registration failed.';
                usernameErrorSpan.textContent = errorMessage;
                emailErrorSpan.textContent = errorMessage;
                passwordErrorSpan.textContent = errorMessage;
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred during registration');
        }
    });

    usernameInput.addEventListener('blur', () => {
        if (usernameInput.value.trim() === '') {
            usernameErrorSpan.textContent = 'Username is required';
        } else {
            usernameErrorSpan.textContent = '';
        }
    });

    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim() === '') {
            emailErrorSpan.textContent = 'Email is required';
        } else {
            emailErrorSpan.textContent = '';
        }
    });

    passwordInput.addEventListener('blur', () => {
        if (passwordInput.value.trim() === '') {
            passwordErrorSpan.textContent = 'Password is required';
        } else {
            passwordErrorSpan.textContent = '';
        }
    });
});
