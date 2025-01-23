# TLAScanner

An advanced web-based security tool for malware detection and vulnerability scanning.

## Features

- 🔍 **URL Scanner**: Detect malicious domains and analyze suspicious URLs
- 🛡️ **CVE Lookup**: Search and analyze known vulnerabilities
- 📁 **File Scanner**: Perform deep analysis of files for potential threats
- 📊 **Real-time Dashboard**: Monitor scans and threat status
- 📝 **Detailed Reports**: Generate comprehensive security reports

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, ShadCN UI
- **Backend**: Node.js/Express
- **Database**: PostgreSQL
- **Hosting**: Vercel (Frontend), AWS/Render (Backend)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/tlascanner.git
   cd tlascanner
   ```

2. Install dependencies:

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add necessary API keys for VirusTotal, NVD, etc.

4. Start development servers:

   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd ../backend
   npm run dev
   ```

## Documentation

For detailed information about the project structure and implementation details, see [project-detail.md](./project-detail.md).

## License

MIT License - See [LICENSE](./LICENSE) for details
