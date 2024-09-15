document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameErrorSpan = document.getElementById('username-error');
    const passwordErrorSpan = document.getElementById('password-error');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        usernameErrorSpan.textContent = '';
        passwordErrorSpan.textContent = '';

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        let hasError = false;

        if (username === '') {
            usernameErrorSpan.textContent = 'Username is required';
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
            const response = await fetch('http://localhost:5174/api/User/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ UserName: username, Password: password })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful!');
                console.log('Login data:', data);

                // Store token in local storage
                localStorage.setItem('authToken', data.token);

                // Assuming you do not need UserID; adjust if needed
                 localStorage.setItem('userID', data.UserID);

                // Redirect to the template creation page
                window.location.href = 'templete.html'; // Ensure the URL is correct
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Username or password is incorrect.';
                usernameErrorSpan.textContent = errorMessage;
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login');
        }
    });

    usernameInput.addEventListener('blur', () => {
        if (usernameInput.value.trim() === '') {
            usernameErrorSpan.textContent = 'Username is required';
        } else {
            usernameErrorSpan.textContent = '';
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
