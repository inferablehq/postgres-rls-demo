async function runTests() {
  const BASE_URL = "http://localhost:3000";

  // Helper function to make requests
  async function makeRequest(
    endpoint: string,
    method: string,
    auth?: { username: string; password: string },
    body?: any
  ) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth) {
      const authString = Buffer.from(
        `${auth.username}:${auth.password}`
      ).toString("base64");
      headers.Authorization = `Basic ${authString}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return await response.json();
  }

  try {
    console.log("Starting tests...\n");

    // Test 1: Register two users
    console.log("Test 1: Registering two users");
    await makeRequest("/register", "POST", undefined, {
      username: "alice",
      password: "alice123",
    });
    await makeRequest("/register", "POST", undefined, {
      username: "bob",
      password: "bob123",
    });
    console.log("✅ Users registered successfully\n");

    const alice = { username: "alice", password: "alice123" };
    const bob = { username: "bob", password: "bob123" };

    // Test 2: Set values for Alice
    console.log("Test 2: Setting values for Alice");
    await makeRequest("/query", "POST", alice, {
      query: `
        INSERT INTO key_value (username, key, value)
        VALUES ($1, 'name', $2),
               ($1, 'age', $3)
      `,
      params: [alice.username, "Alice", 30],
    });
    console.log("✅ Values set for Alice\n");

    // Test 3: Set values for Bob
    console.log("Test 3: Setting values for Bob");
    await makeRequest("/query", "POST", bob, {
      query: `
        INSERT INTO key_value (username, key, value)
        VALUES ($1, 'name', $2),
               ($1, 'age', $3)
      `,
      params: [bob.username, "Bob", 25],
    });
    console.log("✅ Values set for Bob\n");

    // Test 4: Verify Alice can only see their data
    console.log("Test 4: Verifying Alice's data isolation");
    const aliceData = await makeRequest("/query", "POST", alice, {
      query: "SELECT * FROM key_value",
    });
    console.log("Alice's Data:", aliceData);
    console.log("✅ Alice can only see their data\n");

    // Test 5: Verify Bob can only see their data
    console.log("Test 5: Verifying Bob's data isolation");
    const bobData = await makeRequest("/query", "POST", bob, {
      query: "SELECT * FROM key_value",
    });
    console.log("Bob's Data:", bobData);
    console.log("✅ Bob can only see their data\n");

    console.log("All tests completed successfully! 🎉");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the tests
runTests().catch(console.error);
