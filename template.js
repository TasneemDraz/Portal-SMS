document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    console.log('Retrieved Token:', token);

    if (!token || token.split('.').length !== 3) {
        console.error('Invalid token format.');
        alert('Invalid token format. Redirecting to login page...');
        window.location.href = 'login.html';
        return;
    }

    try {
        const decodedToken = jwt_decode(token);
        console.log('Decoded Token:', decodedToken);

        const userID = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        console.log('User ID:', userID);

        if (userID) {
            const createdByInput = document.getElementById('createdBy');
            const lastModifiedByInput = document.getElementById('lastModifiedBy');
            const templateNameInput = document.getElementById('templateName');
            const templateContentInput = document.getElementById('templateContent');
            const form = document.getElementById('templateForm');

            if (createdByInput && lastModifiedByInput && templateNameInput && templateContentInput && form) {
                createdByInput.value = userID;
                lastModifiedByInput.value = userID;
            } else {
                console.error('Input elements not found.');
                alert('Form elements not found.');
                return;
            }

            form.addEventListener('submit', async function(event) {
                event.preventDefault();

                const templateName = templateNameInput.value.trim();
                const templateContent = templateContentInput.value.trim();
                const createdBy = createdByInput.value.trim();
                const lastModifiedBy = lastModifiedByInput.value.trim();

                console.log('Form Values:', { templateName, templateContent, createdBy, lastModifiedBy });

                if (templateName === '' || templateContent === '' || createdBy === '' || lastModifiedBy === '') {
                    alert('Please fill out all fields.');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:5174/api/Template/addtemp', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({
                            TemplateName: templateName,
                            TemplateContent: templateContent,
                            CreatedBy: createdBy,
                            CreatedDate: new Date().toISOString(), 
                            LastModifiedBy: lastModifiedBy,
                            LastModifiedDate: new Date().toISOString()
                        })
                    });

                    console.log('Response Status:', response.status);

                    if (response.ok) {
                        alert('Template created successfully!');
                        window.location.href = 'alltempletes.html'; 
                    } else {
                        const data = await response.json();
                        console.error('Error Response Data:', data);

                        if (data.errors) {
                            for (const [field, messages] of Object.entries(data.errors)) {
                                console.error(`Validation Error - ${field}: ${messages.join(', ')}`);
                            }
                        }
                        
                        alert(`Error: ${data.title || 'Failed to create template'}`);
                    }
                } catch (error) {
                    console.error('Error during template creation:', error);
                    alert('An error occurred during template creation');
                }
            });
        } else {
            alert('Failed to retrieve user information. Redirecting to login page...');
            window.location.href = 'login.html';
        }
    } catch (e) {
        console.error('Failed to decode token:', e.message || e);
        alert('Failed to decode token. Redirecting to login page...');
        window.location.href = 'login.html';
    }
});
