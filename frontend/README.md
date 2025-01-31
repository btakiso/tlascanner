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

2.Install dependencies:

```bash
npm install
```

3.Install required shadcn/ui components:

```bash
# Install essential UI components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

4.Run the development server:

```bash
npm run dev
```

5.Build the required styles:

```bash
# Make sure Tailwind CSS classes are generated
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting Common Display Issues

If components are not displaying:

1. Clear Next.js cache and rebuild:

```bash
# Remove .next directory
rm -rf .next
# Rebuild the application
npm run build
npm run dev
```

2.Check CSS generation:

```bash
# Ensure Tailwind classes are generated
npm run build
```

3.Verify component dependencies:

- Check that all shadcn/ui components are installed (step 3 above)
- Make sure `globals.css` is properly imported in `layout.tsx`
- Confirm that `tailwind.config.js` includes all necessary paths

4.Theme Provider Issues:

- Verify `theme-provider.tsx` is properly set up
- Check that `ThemeProvider` wraps the application in `layout.tsx`

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

frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── magicui/          # Custom UI components
│   └── [feature].tsx     # Feature-specific components
├── lib/                   # Utility functions
└── public/               # Static assets

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

# Rebuild the application
npm run build
```

## License

[Your License Here]
