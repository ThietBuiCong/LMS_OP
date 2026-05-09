export const fetchUsers = async () => {

    const response = await fetch(
        "http://localhost:5000/users"
    );

    if (!response.ok) {
        throw new Error("Fetch users failed");
    }

    return response.json();
};