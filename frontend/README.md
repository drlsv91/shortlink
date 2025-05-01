# ShortLink Frontend

The React TypeScript frontend application for the ShortLink URL shortening service.

## Technologies Used

- **React**: UI library
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast bundling and development server
- **ShadCN UI**: Component library for modern UI elements
- **React Router**: Client-side routing
- **Jest & Testing Library**: Testing framework
- **Tailwind CSS**: Utility-first CSS framework

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── services/api     # API interaction layer
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # ShadCN UI components
│   │   └── ...          # Custom components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── tests/               # Test files
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── jest.config.js       # Jest configuration
├── package.json         # Dependencies and scripts
├── Dockerfile           # Docker configuration
└── README.md            # This file
```

## Features

- **Create Short URLs**: Form to submit and generate short URLs
- **URL Listing**: Table view with search, sort, and pagination
- **Statistics**: Visual representation of URL usage
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: User-friendly error feedback

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

1. Install dependencies

```bash
pnpm install
```

2. Start development server

```bash
pnpm dev
```

The development server will start on http://localhost:5173

### Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_URL=http://localhost:3000  # URL to the backend API
```

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm preview`: Preview production build
- `pnpm lint`: Lint code
- `pnpm test`: Run tests
- `pnpm test:coverage`: Run tests with coverage report

## Testing

The frontend tests use Jest and React Testing Library. Run tests with:

```bash
pnpm test
```

## Building for Production

```bash
pnpm build
```

The build artifacts will be stored in the `dist/` directory.

## Docker

A Dockerfile is provided for containerization. Build the image with:

```bash
docker build -t shortlink-frontend .
```

Run the container with:

```bash
docker run -p 5173:80 shortlink-frontend
```

## Design Decisions

### UI Component Library

ShadCN UI was selected because:

- It provides high-quality, accessible components
- Components are unstyled and customizable with Tailwind CSS
- No runtime dependencies, resulting in smaller bundle size
- Components can be copied into the project for full control

### Code Organization

The project follows a feature-based organization where:

- Common components are in the `components` directory
- Features are grouped by domain in separate directories
- API interaction is abstracted away from components
- Type definitions are centralized for reuse
