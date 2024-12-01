# Postgres row-level security demo

This is a demo of how to implement multi-user authentication on Postgres with Row-Level Security.

It showcases how to:

1. Create users for each role
2. Create a table with RLS enabled
3. Create policies to manage access to the table based on the user's role

## Usage

1. Clone the repo
2. Run `docker-compose up --build`
3. To run the test, `npx tsx test.ts`

> **Disclaimer**: This is an educational demo to understand RLS concepts. Don't use this code in production as it lacks proper security measures, connection pooling optimizations, and other essential features.
