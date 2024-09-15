document.addEventListener('DOMContentLoaded', () => {
    console.log('Fetching elements from the DOM...');

    const tableBody = document.querySelector('#templatesTable tbody');
    console.log('tableBody:', tableBody);

    const templateIDInput = document.querySelector('#templateID');
    console.log('templateIDInput:', templateIDInput);

    const templateNameInput = document.querySelector('#templateName');
    console.log('templateNameInput:', templateNameInput);

    const templateContentInput = document.querySelector('#templateContent');
    console.log('templateContentInput:', templateContentInput);

    const closeModalButton = document.querySelector('#closeModal');
    const cancelEditButton = document.querySelector('#cancelEdit');
    const saveChangesButton = document.querySelector('#saveChanges');
    console.log('closeModalButton:', closeModalButton);
    console.log('cancelEditButton:', cancelEditButton);
    console.log('saveChangesButton:', saveChangesButton);

    // Check if all elements are found
    if (!tableBody || !templateIDInput || !templateNameInput || !templateContentInput || !closeModalButton || !cancelEditButton || !saveChangesButton) {
        console.error('One or more elements are not found in the DOM.');
        return;
    }

    // Fetch and display templates
    async function fetchTemplates(page = 1, pageSize = 5) {
        try {
            const response = await fetch(`http://localhost:5174/api/Template/temp?page=${page}&pageSize=${pageSize}&_=${new Date().getTime()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Templates Response:', result);

            if (result && result.data) {
                populateTable(result.data);
                updatePaginationControls(result.page, result.pageSize, result.totalCount);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            alert('Failed to load template data. Please check the console for more details.');
        }
    }

    // Populate table with template data
    function populateTable(templates) {
        tableBody.innerHTML = '';

        templates.forEach(template => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${template.templateID}</td>
                <td>${template.templateName}</td>
                <td>${template.templateContent}</td>
                <td>${template.createdByUsername}</td>
                <td>${new Date(template.createdDate).toLocaleString()}</td>
                <td>${new Date(template.lastModifiedDate).toLocaleString()}</td>
                <td>
                    <button class="edit-btn" data-id="${template.templateID}">Edit</button>
                    <button class="delete-btn" data-id="${template.templateID}">Delete</button>
                    <button class="send-sms-btn" data-id="${template.templateID}">Send SMS</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        addEventListeners();
    }

    // Add event listeners to edit, delete, and send SMS buttons
    function addEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const templateID = event.target.getAttribute('data-id');
                console.log(`Fetching details for templateID: ${templateID}`);

                try {
                    const response = await fetch(`http://localhost:5174/api/Template/template/${templateID}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch template details: ${response.status} ${response.statusText}`);
                    }

                    const template = await response.json();
                    templateIDInput.value = template.templateID;
                    templateNameInput.value = template.templateName;
                    templateContentInput.value = template.templateContent;

                    editModal.style.display = 'block';
                } catch (error) {
                    console.error('Error fetching template details:', error);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const templateID = event.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this template?')) {
                    try {
                        const response = await fetch(`http://localhost:5174/api/Template/deletetemp/${templateID}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`Failed to delete template: ${response.status} ${response.statusText}`);
                        }

                        alert('Template deleted successfully');
                        fetchTemplates(); // Refresh the list
                    } catch (error) {
                        console.error('Error deleting template:', error);
                    }
                }
            });
        });

        document.querySelectorAll('.send-sms-btn').forEach(button => {
            button.addEventListener('click', () => {
                console.log('Send SMS button clicked');
                const templateID = button.getAttribute('data-id');
                console.log('Template ID:', templateID);

                const decodedToken = decodeToken();
                if (decodedToken) {
                    const userID = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
                    console.log('User ID:', userID);
                    console.log('Redirecting to sms.html with params:', { userID, templateID });
                    window.location.assign(`sms.html?userID=${encodeURIComponent(userID)}&templateID=${encodeURIComponent(templateID)}`);
                } else {
                    console.error('Cannot redirect: No valid token.');
                }
            });
        });
    }

    // Update pagination controls
    function updatePaginationControls(currentPage, pageSize, totalCount) {
        const totalPages = Math.ceil(totalCount / pageSize);
        paginationControls.innerHTML = '';

        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', () => fetchTemplates(currentPage - 1, pageSize));
            paginationControls.appendChild(prevButton);
        }

        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => fetchTemplates(currentPage + 1, pageSize));
            paginationControls.appendChild(nextButton);
        }
    }

    // Close edit modal
    closeModalButton.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    // Cancel editing
    cancelEditButton.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    // Save changes
    saveChangesButton.addEventListener('click', async () => {
        const templateID = templateIDInput.value;
        const templateName = templateNameInput.value;
        const templateContent = templateContentInput.value;

        console.log('Sending Update Request:', { templateID, templateName, templateContent });

        try {
            const response = await fetch(`http://localhost:5174/api/Template/edittemp/${templateID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ 
                    templateName, 
                    templateContent 
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update template: ${response.status} ${response.statusText}`);
            }

            alert('Template updated successfully');
            editModal.style.display = 'none';
            fetchTemplates(); // Refresh the list
        } catch (error) {
            console.error('Error updating template:', error);
            alert('Failed to update template. Please check the console for more details.');
        }
    });

    // Decode JWT token function
    function decodeToken() {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                return JSON.parse(jsonPayload);
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }
        return null;
    }

    // Initial fetch
    fetchTemplates();
});
