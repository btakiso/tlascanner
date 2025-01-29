# TLA Scanner Frontend

A modern, responsive web application for advanced threat detection and vulnerability analysis.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Getting Started

1. Clone the repository:

```bash
git clone [your-repository-url]
cd tlascanner/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Dependencies

This project uses several key dependencies:

### Core Dependencies

- Next.js 14.2.16
- React 18
- TypeScript
- Tailwind CSS

### UI Components and Styling

- shadcn/ui components (via @radix-ui)
- Framer Motion (for animations)
- Lucide React (for icons)
- next-themes (for dark/light mode)
- Tailwind CSS (for styling)
- class-variance-authority (for component variants)
- clsx (for conditional classes)

### Form Handling

- React Hook Form
- Zod (for validation)

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── [feature].tsx     # Feature-specific components
├── lib/                   # Utility functions
└── public/               # Static assets
```

## Features

- Modern UI with shadcn components
- Dark/Light mode support
- Smooth animations with Framer Motion
- Fully responsive design
- Advanced search capabilities
- Security analysis tools

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Adding New Components

We use shadcn/ui for our components. To add a new component:

```bash
npx shadcn-ui@latest add [component-name]
```

## Styling

This project uses Tailwind CSS for styling. The main configuration is in:

- `tailwind.config.js`
- `app/globals.css`

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Common Issues

If you encounter any issues with dependencies, try:

```bash
# Clear npm cache
npm cache clean --force

# Remove existing modules
rm -rf node_modules
rm -rf .next

# Reinstall dependencies
npm install
```

## License

[Your License Here]
