<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Email Assistant Chrome Extension

This is a Chrome Extension project for Gmail that provides AI-powered email composition and reply assistance using OpenAI's API.

## Project Context

- **Technology Stack**: Vanilla JavaScript, TailwindCSS, Chrome Extension APIs, OpenAI API
- **Target Platform**: Chrome browsers with Gmail integration
- **AI Model**: OpenAI GPT (using provided API key)

## Key Components

1. **manifest.json** - Chrome extension configuration
2. **content.js** - Gmail page injection and sidebar management
3. **sidebar.html/js** - Main UI with Compose and Reply tabs
4. **background.js** - Service worker for extension lifecycle
5. **popup.html/js** - Extension popup interface

## Development Guidelines

- Use modern ES6+ JavaScript features
- Follow Chrome Extension Manifest V3 best practices
- Implement responsive design with TailwindCSS
- Ensure Gmail compatibility across different views
- Handle API errors gracefully with user feedback
- Maintain clean, readable code with proper error handling

## Security Considerations

- API key is embedded for development (should be moved to secure storage for production)
- Use Content Security Policy appropriately
- Validate all user inputs before API calls
- Handle sensitive email content securely

## Gmail Integration Notes

- Extension injects as a right-side floating sidebar
- Detects opened emails for reply functionality
- Provides smooth toggle animations
- Adapts to different Gmail layouts and views
