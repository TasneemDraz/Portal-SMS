document.addEventListener('DOMContentLoaded', () => {
    // Retrieve token from local storage
    const token = localStorage.getItem('authToken');
    console.log('Retrieved Token:', token);

    // Validate token format
    if (!token || token.split('.').length !== 3) {
        console.error('Invalid token format.');
        alert('Invalid token format. Redirecting to login page...');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Decode the token
        const decodedToken = jwt_decode(token);
        console.log('Decoded Token:', decodedToken);

        // Extract userID from the token
        const userIDArray = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        let userID;

        if (Array.isArray(userIDArray)) {
            // Extract userID from array if it's in array format
            userID = userIDArray[1]; // Adjust index based on actual data structure
        } else {
            // If it's not an array, use it directly
            userID = userIDArray;
        }

        console.log('User ID:', userID);

        if (userID) {
            // Handle form submission for sending SMS
            const recipientInput = document.getElementById('recipients');
            const messageContentInput = document.getElementById('messageContent');
            const form = document.getElementById('sendMessageForm');

            const urlParams = new URLSearchParams(window.location.search);
            const templateID = urlParams.get('templateID');

            if (recipientInput && messageContentInput && form) {
                form.addEventListener('submit', async function(event) {
                    event.preventDefault();

                    const recipients = recipientInput.value.trim();
                    const messageContent = messageContentInput.value.trim();

                    console.log('Form Values:', { recipients, messageContent, userID, templateID });

                    // Validate recipients
                    if (!validateRecipients(recipients)) {
                        alert('Recipients must start with +20 followed by exactly 11 digits.');
                        return;
                    }

                    if (recipients === '' || messageContent === '' || !templateID) {
                        alert('Please fill out all fields and ensure templateID is provided.');
                        return;
                    }

                    try {
                        const parsedTemplateID = parseInt(templateID, 10);

                        const response = await fetch('http://localhost:5174/api/Message/sendmessage', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                UserId: String(userID),          // Ensure UserId is a string
                                Recipients: recipients,          // Ensure Recipients is a string
                                MessageContent: messageContent,  // Ensure MessageContent is a string
                                TemplateId: parsedTemplateID    // Ensure TemplateId is an integer
                            })
                        });

                        console.log('Response Status:', response.status);

                        if (response.ok) {
                            alert('SMS sent successfully!');
                        } else {
                            const errorText = await response.text(); // Read raw text for debugging
                            console.error('Error Response Data:', errorText);
                            alert(`Error: ${errorText || 'Failed to send SMS'}`);
                        }
                    } catch (error) {
                        console.error('Error during SMS sending:', error);
                        alert('An error occurred during SMS sending');
                    }
                });
            } else {
                console.error('Input elements not found.');
                alert('Form elements not found.');
            }

            // Handle file upload for admin
            const uploadFileForm = document.getElementById('uploadFileForm');
            const fileInput = document.getElementById('fileInput');
            const responseMessage = document.getElementById('responseMessage');

            if (uploadFileForm && fileInput) {
                uploadFileForm.addEventListener('submit', async function(event) {
                    event.preventDefault();

                    const file = fileInput.files[0];
                    if (!file) {
                        alert('Please choose a CSV file.');
                        return;
                    }

                    const formData = new FormData();
                    formData.append('file', file); // Ensure the field name matches server expectations

                    try {
                        const uploadResponse = await fetch('http://localhost:5174/api/Message/send-sms', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: formData
                        });

                        console.log('Upload Response Status:', uploadResponse.status);

                        if (uploadResponse.ok) {
                            const result = await uploadResponse.json();
                            responseMessage.textContent = 'File uploaded and SMS sent successfully!';
                        } else {
                            const errorText = await uploadResponse.text();
                            console.error('Upload Error Response Data:', errorText);
                            responseMessage.textContent = `Error: ${errorText || 'Failed to upload file'}`;
                        }
                    } catch (error) {
                        console.error('Error during file upload:', error);
                        responseMessage.textContent = 'An error occurred during file upload';
                    }
                });
            } else {
                console.error('File upload elements not found.');
                alert('File upload elements not found.');
            }
        } else {
            alert('Failed to retrieve user information. Redirecting to login page...');
            window.location.href = 'login.html';
        }
    } catch (e) {
        console.error('Failed to decode token:', e.message || e);
        alert('Failed to decode token. Redirecting to login page...');
        window.location.href = 'login.html';
    }

    function validateRecipients(value) {
        const countryCode = '\\+2';  // Escape the '+' character
        const regex = new RegExp(`^${countryCode}\\d{11}$`);
        return regex.test(value);
    }
});
