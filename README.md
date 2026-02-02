# 📱 Habit Tracker

> A beautiful, minimal Progressive Web App for building and maintaining daily habits with offline support.

![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen?style=flat-square) 
![License MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Version 1.0](https://img.shields.io/badge/Version-1.0-green?style=flat-square)

---

## ✨ Overview

Habit Tracker is a lightweight, privacy-first Progressive Web App designed to help you build and maintain positive habits. With its clean, intuitive interface and offline capabilities, you can track your daily habits anywhere, anytime—no account required.

## 🎯 Key Features

- **Clean & Intuitive UI** – Fast, distraction-free interface optimized for daily use
- **Offline-First** – Works seamlessly offline with service worker caching
- **PWA Ready** – Install to your home screen and use like a native app
- **Privacy Focused** – All data stored locally in your browser; no cloud sync or tracking
- **Zero Dependencies** – Lightweight codebase with minimal overhead

## 🚀 Quick Start

### Open Locally
Simply open `index.html` in your browser for an instant preview.

### Full PWA Experience
Serve the project with any HTTP server to enable service worker registration and the install prompt:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server . -p 8000
```

Then visit `http://localhost:8000` in your browser.

## 📖 Usage

1. **Add a Habit** – Use the form to create a new habit with title and frequency
2. **Mark Complete** – Tap/click a habit to mark it complete for the day
3. **Track Progress** – View your streak and daily completion stats
4. **Install App** – Tap the browser's install button to add to your home screen

## 📁 Project Structure

```
├── index.html          # Main app markup
├── styles.css          # Theme and layout
├── script.js           # App logic and data persistence
├── sw.js               # Service worker for caching
├── manifest.json       # PWA metadata
├── icon-192.png        # App icon (small)
├── icon-512.png        # App icon (large)
└── README.md           # This file
```

## 🎨 Design

- **Color Palette** – Soft neutrals with accent colors for progress and actions
- **Typography** – System fonts for optimal readability and performance
- **Spacing** – Consistent 8px baseline grid for visual harmony
- **Accessibility** – WCAG-compliant contrast, keyboard navigation, and screen reader support

## 🔒 Privacy & Data

✅ **Your data stays yours.** All habit information is stored locally in your browser using localStorage. This project has no backend, no cloud sync, and does not collect or transmit any personal data.

## 🛠️ Development

### Customize Theme
Edit `styles.css` to change colors, fonts, and spacing.

### Modify Functionality
Update `script.js` to add new features or change behavior.

### Adjust Caching
Modify `sw.js` to customize the service worker caching strategy.

## 📋 Roadmap

- [ ] Theme settings (light/dark mode)
- [ ] Notification reminders
- [ ] Habit categories and filtering
- [ ] Weekly/monthly statistics dashboard
- [ ] Export habit data as CSV

## 🤝 Contributing

Contributions are welcome! For bug fixes or small improvements, feel free to open a pull request. For larger features, please open an issue first to discuss.

**Guidelines:**
- Keep commits focused and descriptive
- Test your changes locally
- Follow the existing code style

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for habit builders everywhere.**
