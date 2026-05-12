// Make query to the backend
async function jsonQuery( url, data = JSON.stringify({"data": false}) ) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data,
        });

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error with response: ', error);
    }
};