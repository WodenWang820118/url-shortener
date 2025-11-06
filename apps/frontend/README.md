# URL Shortener Frontend

A modern, responsive Angular frontend for the URL shortening service. Built with Angular 20, PrimeNG, TailwindCSS v4, AnalogJS, and Vitest.

## Features

- 🔗 **URL Shortening**: Convert long URLs into short, shareable links
- 📱 **QR Code Generation**: Generate QR codes for shortened URLs
- 📋 **Copy to Clipboard**: One-click copying with toast notifications
- ✨ **Modern UI**: Professional design with PrimeNG Aura theme
- 🎨 **Responsive**: Mobile-first design with Tailwind CSS
- ⚡ **Fast**: Built with Vite for instant HMR
- ✅ **Form Validation**: Real-time URL validation
- 🧪 **Well Tested**: Comprehensive test coverage with Vitest (18 tests)

## Tech Stack

- **Framework**: Angular 20 (Standalone components)
- **UI Components**: PrimeNG 20 with Aura theme
- **Styling**: TailwindCSS v4 + tailwindcss-primeui
- **Icons**: PrimeIcons
- **Testing**: Vitest via AnalogJS
- **Build Tool**: Vite
- **QR Code**: angularx-qrcode
- **HTTP Client**: Angular HttpClient

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10 or higher)
- Backend services running (producer service on port 3000)

### Installation

The dependencies are managed at the workspace level. From the root directory:

```bash
pnpm install
```

### Development

Run the development server:

```bash
# From the root directory
pnpm run dev:frontend

# Or using nx directly
nx serve frontend
```

The application will be available at `http://localhost:4200`

### Testing

Run the test suite:

```bash
# Run tests
nx test frontend

# Run tests in watch mode
nx test frontend --watch

# Run tests with coverage
nx test frontend --coverage
```

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── url-shortener.component.ts        # Main URL shortener component
│   │   │   └── url-shortener.component.spec.ts   # Component tests
│   │   ├── services/
│   │   │   ├── url-shortener.service.ts          # API service
│   │   │   └── url-shortener.service.spec.ts     # Service tests
│   │   ├── app.ts                                # Root component
│   │   ├── app.config.ts                         # App configuration
│   │   └── app.routes.ts                         # Route configuration
│   ├── index.html                                # HTML entry point
│   ├── main.ts                                   # Application bootstrap
│   └── test-setup.ts                             # Test configuration
├── project.json                                  # Nx project configuration
├── vite.config.mts                              # Vite configuration
└── tsconfig.json                                # TypeScript configuration
```

## Usage

1. **Enter a URL**: Type or paste your long URL into the input field
2. **Shorten**: Click the "Shorten URL" button
3. **Copy**: Use the "Copy" button to copy the shortened URL
4. **QR Code**: Click "Show QR Code" to generate a QR code for the shortened URL
5. **Start Over**: Click "Shorten Another" to create a new shortened URL

## API Integration

The frontend connects to the producer service at `http://localhost:3000/api/shorten`.

Expected API response:

```typescript
{
  shortUrl: string; // Full shortened URL
  shortCode: string; // Short code identifier
  originalUrl: string; // Original long URL
  createdAt: string; // ISO timestamp
}
```

## Configuration

To change the backend API URL, modify the `apiUrl` in the `UrlShortenerService`:

```typescript
// apps/frontend/src/app/services/url-shortener.service.ts
private readonly apiUrl = 'http://localhost:3000/api';
```

## Testing

The application includes comprehensive tests:

- **Service Tests**: HTTP client interactions, error handling, URL formatting
- **Component Tests**: Form validation, URL shortening, QR code toggle, clipboard operations
- **App Tests**: Component rendering and integration

All tests use Vitest with Angular testing utilities.

## Building for Production

```bash
# Build the application
nx build frontend

# The build artifacts will be in dist/apps/frontend
```

## Dependencies

### Runtime Dependencies

- `@angular/common`: ~20.3.0
- `@angular/core`: ~20.3.0
- `@angular/forms`: ~20.3.0
- `@angular/platform-browser`: ~20.3.0
- `@angular/router`: ~20.3.0
- `@primeuix/themes`: ^1.2.5
- `angularx-qrcode`: ^20.0.0
- `primeicons`: ^7.0.0
- `primeng`: ^20.3.0
- `tailwindcss`: ^4.1.16
- `tailwindcss-primeui`: ^0.6.1
- `zone.js`: ~0.15.0

### Development Dependencies

- `@analogjs/platform`: ^2.0.2
- `@analogjs/vitest-angular`: ^2.0.2
- `@angular/build`: ~20.3.0
- `@tailwindcss/postcss`: ^4.1.16
- `vitest`: ^3.2.4

## Recent Updates

### PrimeNG and TailwindCSS v4 Migration

The frontend has been refactored to use:

- **PrimeNG Components**: Professional UI components (Card, Button, InputText, Message, Toast)
- **TailwindCSS v4**: Utility-first CSS framework for responsive design
- **Aura Theme**: Modern PrimeNG theme preset
- **PrimeIcons**: Comprehensive icon library

See [PRIMENG_TAILWIND_REFACTORING.md](../../PRIMENG_TAILWIND_REFACTORING.md) for detailed migration notes.

## License

This project is licensed under the ISC License.
