# OpsMind AI - Full Stack Web Application

A comprehensive full-stack web application for enterprise SOP (Standard Operating Procedure) intelligence and operations management.

## Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Port**: 3000 (development)
- **Database**: In-memory store (easily extensible to SQLite or PostgreSQL)
- **API**: RESTful endpoints with Zod validation

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Port**: 5173 (development)
- **UI**: Modern CSS with responsive design
- **Icons**: Lucide React

### Features

#### OpsMind AI Modes
1. **SOP Generator** - Create structured Standard Operating Procedures
2. **Workflow Assistant** - Optimize and manage workflows
3. **Compliance Reviewer** - Ensure regulatory adherence
4. **Knowledge Search** - Search enterprise knowledge base
5. **Incident Response Guide** - Structured incident handling
6. **Employee Onboarding Assistant** - Streamline new employee setup
7. **Automation Advisor** - Identify automation opportunities
8. **Audit Preparation Assistant** - Prepare for audits and compliance reviews

## Project Structure

```
OPSMIND_AI/
├── src/                          # Backend source
│   ├── server.ts                 # Express server entry point
│   ├── app.ts                    # Express app configuration & routes
│   ├── db.ts                     # In-memory database layer
│   ├── opsmind.ts                # OpsMind AI logic
│   └── types.ts                  # TypeScript interfaces
├── client/                       # Frontend source
│   ├── src/
│   │   ├── App.tsx               # Main React component
│   │   ├── main.tsx              # React entry point
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Dashboard.tsx     # Statistics & overview
│   │   │   ├── QueryForm.tsx     # OpsMind query form
│   │   │   └── ResponseDisplay.tsx # Response rendering
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useOpsMindQuery.ts
│   │   ├── services/             # API communication
│   │   │   └── api.ts            # Axios API client
│   │   └── styles/               # CSS styling
│   │       ├── index.css
│   │       ├── App.css
│   │       ├── Header.css
│   │       ├── Dashboard.css
│   │       ├── QueryForm.css
│   │       └── ResponseDisplay.css
│   ├── index.html                # HTML entry point
│   ├── vite.config.ts            # Vite configuration
│   └── tsconfig.json             # TypeScript config
├── dist/                         # Build output
├── tests/                        # Test files
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ (for native ES modules support)
- npm 9+

### Installation

1. **Navigate to project directory:**
   ```bash
   cd C:\Users\Shree\Desktop\OPSMIND_AI
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

### Development

**Run both server and client in development mode:**
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

**Run server only:**
```bash
npm run dev:server
```

**Run client only:**
```bash
npm run dev:client
```

### Production

**Build for production:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

The server will serve the built React app from `/dist/client` and API endpoints from `/api`.

## API Endpoints

### Query OpsMind
- **POST** `/api/opsmind` - Submit a query to OpsMind AI
  ```json
  {
    "userQuestion": "How do I handle database failover?",
    "userRole": "SRE",
    "department": "Infrastructure",
    "mode": "Incident Response Guide"
  }
  ```

### Retrieve Data
- **GET** `/api/sop/:id` - Get a specific SOP entry
- **GET** `/api/sops` - List all SOP entries (with optional department filter)
- **GET** `/api/logs` - Get query logs
- **GET** `/api/stats` - Get system statistics

### Health Check
- **GET** `/health` - Service health status

## Database

The application uses an in-memory database layer that stores:
- **SOP Entries**: Generated procedures with full response data
- **Query Logs**: All API requests with success/error status

For production deployment, you can easily swap the in-memory implementation in `src/db.ts` with:
- SQLite (better-sqlite3)
- PostgreSQL (pg)
- MongoDB (mongoose)
- Any other database

## Development Workflow

### Type Checking
```bash
npm run typecheck
```

### Running Tests
```bash
npm test
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Key Technologies

| Component | Technology |
|-----------|-----------|
| Backend Framework | Express.js 4.19 |
| Frontend Library | React 19.1 |
| Build Tool | Vite 6.3 |
| Type System | TypeScript 5.8 |
| Validation | Zod 3.23 |
| HTTP Client | Axios 1.7 |
| UI Icons | Lucide React 0.378 |
| Task Runner | Concurrently 9.1 |

## Features Implemented

✅ Full-stack TypeScript application
✅ Express.js REST API with validation
✅ React SPA with modern UI
✅ Real-time statistics dashboard
✅ Query logging and persistence
✅ Responsive design
✅ Type-safe API communication
✅ Hot module reloading (HMR) in development
✅ Production-ready build pipeline
✅ Error handling and validation

## Future Enhancements

- [ ] User authentication & authorization
- [ ] Database persistence (SQLite/PostgreSQL)
- [ ] SOP versioning & approval workflow
- [ ] Integration with external services (Slack, Teams, ServiceNow)
- [ ] Advanced search with full-text indexing
- [ ] Audit trail & compliance reporting
- [ ] Real-time collaboration features
- [ ] Mobile app version

## Troubleshooting

### Port already in use
- Backend: Change PORT env variable: `PORT=3001 npm run dev:server`
- Frontend: Vite will prompt to use next available port

### Build failures
- Clear node_modules: `rm -r node_modules && npm install`
- Clear dist: `rm -r dist` then `npm run build`

### API not responding
- Ensure backend is running: `npm run dev:server`
- Check browser console for CORS issues
- Verify proxy settings in `client/vite.config.ts`

## Documentation

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)

## License

Proprietary - OpsMind AI

## Support

For issues or questions, please refer to the project documentation or contact the development team.
