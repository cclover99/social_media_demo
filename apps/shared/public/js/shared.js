// Make query to the backend
// Eg data = JSON.stringify({"data": false}) 
async function jsonQuery( url, data = '{}') {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data,
        });

        // If response wants to redirect
        if (response.redirected) {
            window.location.href = response.url; 
            return; 
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error with response: ', error);
    }
};