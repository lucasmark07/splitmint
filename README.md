# 💸 SplitMint

**SplitMint** is a full-stack expense-sharing application that helps groups split bills, track expenses, and manage settlements efficiently.

## Features

- 🔐 **User Authentication** - Secure signup and login
- 👥 **Group Management** - Create and manage expense groups
- 💰 **Expense Tracking** - Add and split expenses among group members
- 📊 **Balance Tracking** - View who owes whom in each group
- 🏦 **Settlement Calculation** - Automatically calculate optimal settlements

## Tech Stack

### Backend
- **Node.js + Express.js** - REST API server
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend (Web)
- **React 18+** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool
- **Axios** - HTTP client

### Mobile
- **React Native (Expo)** - Cross-platform mobile app

## Project Structure

```
splitmint/
├── backend/          # Node.js API server
│   ├── routes/       # API endpoints
│   ├── db/           # Database setup
│   ├── middleware/   # Express middleware
│   └── server.js     # Entry point
├── web/              # React web application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── context/  # Auth context
│   │   └── utils/    # API utilities
│   └── vite.config.js
├── mobile/           # React Native app
├── database/         # SQLite database file
└── package.json      # Root package config
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

```bash
cd backend
npm install
node server.js
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

App runs on `http://localhost:5173`

### Environment Variables

Create `.env` in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login

### Groups
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create group
- `DELETE /api/groups/:id` - Delete group

### Expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses/:group_id` - Get group expenses

### Balances
- `GET /api/balances/:group_id` - Get group balances

### Settlements
- `GET /api/settlements/:group_id` - Get settlements
- `POST /api/settlements` - Record settlement

## Database Schema

### Users
- `user_id` - Primary key
- `name` - User's name
- `email` - Email address (unique)
- `password` - Hashed password
- `upi_id` - UPI ID for payments

### Groups
- `group_id` - Primary key
- `group_name` - Group name
- `created_by` - User who created
- `created_at` - Timestamp

### Expenses
- `expense_id` - Primary key
- `group_id` - Foreign key
- `paid_by` - User who paid
- `amount` - Expense amount
- `description` - Expense description
- `created_at` - Timestamp

### Settlements
- `settlement_id` - Primary key
- `payer_id` - User paying
- `receiver_id` - User receiving
- `amount` - Settlement amount
- `group_id` - Group context
- `settlement_date` - Timestamp

## Development

### Running Tests
```bash
cd backend
npm test
```

### Building for Production
```bash
cd web
npm run build
```

## Commit History

Recent changes:
- **refactor: remove password reset feature from codebase** - Removed forgot password and reset password functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ by the SplitMint team**
