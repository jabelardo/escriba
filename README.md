This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

To run this application, you need to set up the following environment variables in a `.env.local` file at the root of your project:

*   `GITHUB_ID`: Your GitHub OAuth App Client ID.
*   `GITHUB_SECRET`: Your GitHub OAuth App Client Secret.
*   `NEXTAUTH_SECRET`: A strong secret used to encrypt the NextAuth.js session token.

### How to get your GitHub OAuth App credentials:

1.  Go to your GitHub **Developer settings**.
2.  Create a new **OAuth App**.
3.  Set the **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github` (for local development).
4.  Generate a new client secret.

### How to generate `NEXTAUTH_SECRET`:

Run the following command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set it as the value for `NEXTAUTH_SECRET` in your `.env.local` file.

Example `.env.local` file:

```
GITHUB_ID="your_github_client_id_here"
GITHUB_SECRET="your_github_client_secret_here"
NEXTAUTH_SECRET="your_generated_secret_here"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.