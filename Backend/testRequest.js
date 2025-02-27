const fetch = require("node-fetch");

const testRegister = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "testuser",
                email: "test@example.com",
                password: "123456"
            })
        });

        const data = await response.json();
        console.log("📌 Response:", data);
    } catch (error) {
        console.error("❌ Error:", error);
    }
};

testRegister();
