# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Noor Layers - Frontend Setup Guide

## Tech Stack
- **React + Vite** (frontend)
- **React Router v6** (navigation)
- **Axios** (HTTP client for C# API)
- **Context API** (Auth + Cart state)

## Installation

```bash
# 1. Create Vite React project
npm create vite@latest noor-layers-client -- --template react
cd noor-layers-client

# 2. Install dependencies
npm install axios react-router-dom

# 3. Replace src/ with the provided files
# 4. Set your API URL
cp .env.example .env
# Edit VITE_API_BASE_URL to point to your C# API

# 5. Run
npm run dev
```

## CORS — C# API Setup
In your C# `Program.cs`, add:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:5173")  // Vite dev port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

app.UseCors("AllowFrontend");
```

## API Response Shape Expected
The frontend expects these shapes from your C# API:

### Login/Register Response
```json
{ "token": "jwt_string", "user": { "id": "...", "email": "...", "firstName": "..." } }
```

### Products List
```json
{ "items": [...], "totalPages": 5, "page": 1 }
```

### Cart
```json
{
  "items": [{ "productId": "...", "productName": "...", "price": 8000, "quantity": 2, "imageUrl": "..." }],
  "total": 16000
}
```

### Order Checkout Response
```json
{ "id": "order_id", "total": 16000, "userEmail": "user@email.com" }
```

### Payment Initialize Response
```json
{ "paymentUrl": "https://paystack.com/pay/xxx" }
```

## Pages
| Route | Page | Auth Required |
|-------|------|---------------|
| / | Home | No |
| /products | Products listing | No |
| /products/:id | Product details | No |
| /cart | Cart + Checkout | Yes |
| /orders | Order history | Yes |
| /login | Login | No |
| /register | Register | No |