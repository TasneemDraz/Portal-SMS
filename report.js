document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    const form = document.getElementById('filter-form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        
        console.log('Filter button clicked'); // Debugging

        // Retrieve values from form inputs
        const username = document.getElementById('username').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        console.log('Username:', username); // Debugging
        console.log('Date From:', dateFrom); // Debugging
        console.log('Date To:', dateTo); // Debugging

        // Construct the API URL with query parameters
        const apiUrl = `http://localhost:5174/api/Reporting?username=${encodeURIComponent(username)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;

        // Retrieve token from localStorage or other secure storage
        const token = localStorage.getItem('authToken'); 
        
        if (!token) {
            console.error('No token found. Please log in.');
            return;
        }

        // Fetch data from the API
        fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Clear previous results
            const tableBody = document.querySelector('#sms-report tbody');
            tableBody.innerHTML = '';

            // Populate table with new data
            data.forEach(record => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${record.messageID}</td>
                    <td>${record.senderUsername}</td>
                    <td>${record.phoneNumber}</td>
                    <td>${record.messageContent}</td>
                    <td>${record.senderUser}</td>
                    <td>${new Date(record.dateTimeSent).toLocaleString()}</td>
                `;
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
    });

    // Handle CSV export
    document.getElementById('export-csv').addEventListener('click', function() {
        // Retrieve values from form inputs
        const username = document.getElementById('username').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        // Construct the API URL with query parameters for export
        const exportUrl = `http://localhost:5174/api/Reporting/export?username=${encodeURIComponent(username)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;

        // Retrieve token from localStorage or other secure storage
        const token = localStorage.getItem('authToken'); 

        if (!token) {
            console.error('No token found. Please log in.');
            return;
        }

        // Fetch CSV file from the API
        fetch(exportUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Create a download link for the CSV file
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'MessagesReport.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => console.error('Error exporting CSV:', error));
    });
});
