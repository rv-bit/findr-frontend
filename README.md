# Findr Frontend

> **Share your thoughts, connect with communities, and discover new ideas with a feature-rich blogging platform.**

Findr is a modern blogging platform inspired by the dynamic nature of Reddit, designed to provide a seamless and engaging user experience. It empowers users to create and share content, interact through upvotes and downvotes, and secure their accounts with advanced authentication methods. Built with cutting-edge web technologies, Findr offers a responsive and intuitive interface.

## Features
- **Rich Text Editor for Posts:** Create compelling content with a powerful and user-friendly rich text editor, supporting various formatting options.
- **Upvote/Downvote System:** Engage with posts and comments through an intuitive upvote and downvote mechanism, fostering community interaction and content curation.
- **Enhanced Security with Better Auth:** Benefit from robust authentication features, ensuring the security of user accounts and data.
- **Social Authentication (GitHub & Google):** Conveniently sign up and log in using your existing GitHub and Google accounts for a streamlined onboarding experience.
- **Two-Factor Authentication (2FA):** Add an extra layer of security to your account with 2FA, protecting against unauthorized access.
- **Modern UI with Tailwind & ShadCN:** Enjoy a beautiful and responsive user interface, crafted with the power of Tailwind CSS for utility-first styling and ShadCN UI for pre-built, accessible components.

## Stack
- **React 19 (new compiler)**
- **[React Router V7](https://reactrouter.com/)**
- **[Tailwind](https://tailwindcss.com/)**
- **[Better Auth](https://www.better-auth.com/)**
- **[ShadCN](https://ui.shadcn.com/)**

### Prerequisites

- [Bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone [https://github.com/rv-bit/findr-frontend.git](https://github.com/rv-bit/findr-frontend.git)

# Navigate into the project directory
cd findr-frontend

# Install dependencies
npm install # or yarn install
```

### ENV Example
```bash
VITE_API_URL= // URL that server is running on
VITE_AUTH_API_URL= // URL that server is running on with a /auth at the end
