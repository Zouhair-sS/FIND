# FIND. - Premium E-Commerce Platform

FIND is a premium, modern e-commerce storefront designed to showcase a seamless integration with **AlyaPay**. Built with a focus on high-end aesthetics, smooth animations, and a frictionless user experience, the platform mirrors the design standards of top-tier technology retailers.

## 🚀 Tech Stack

### Frontend
*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **HTTP Client**: Axios (configured for secure, cross-origin requests)

### Backend
*   **Framework**: [Laravel 11](https://laravel.com/)
*   **Database**: SQLite (for rapid development/demo purposes)
*   **Authentication**: Laravel Sanctum (Stateful SPA Session Cookies)

## ✨ Key Features

*   **Premium UI/UX**: Clean, minimalist aesthetic with glassmorphism effects and tailored micro-interactions.
*   **Smart Cart System**: Includes both a dedicated `/cart` page and a smooth, slide-out Cart Drawer with tactile quantity toggles and layout animations.
*   **Frictionless Authentication**: 
    *   Zero-authentication required for browsing, searching, and cart management.
    *   Smart Checkout Gateway offering "Guest Checkout", "Sign In", or "Create Account".
    *   Stateful, HTTP-only cookie-based authentication (no vulnerable `localStorage` tokens).
*   **Dynamic Search & Filtering**: Real-time product search with debounced API queries and visual dropdown results.
*   **AlyaPay Integration (In Progress)**: The platform is specifically architected to demonstrate the power and simplicity of the AlyaPay payment gateway during the checkout flow.

## 🛠️ Local Development Setup

To run this project locally, you will need two separate terminal windows for the frontend and backend.

### 1. Backend (Laravel)
```bash
cd backend

# Install PHP dependencies
composer install

# Set up your environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations and seeders (populates demo products)
php artisan migrate --seed

# Create the storage symlink (required for uploaded images to display)
php artisan storage:link

# Start the Laravel development server (runs on http://127.0.0.1:8000)
php artisan serve
```

### 2. Frontend (Next.js)
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Next.js development server (runs on http://localhost:3000)
npm run dev
```

## 🔒 Authentication Flow
The application uses **Laravel Sanctum's SPA Authentication**. 
Ensure your `.env` in the backend has the correct configurations for localhost development to allow credentials and cookies to pass successfully:
```env
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```
And ensure your frontend `axios` instance is configured with `withCredentials: true`.

## 🤝 Contributing
Since this is a showcase environment for AlyaPay integration, please ensure any UI contributions match the existing premium design language (use Framer Motion for layout changes, maintain high-contrast minimalist typography).
