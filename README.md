# AI Email Assistant for Gmail

A powerful Chrome Extension that integrates AI-powered email composition and reply assistance directly into Gmail using OpenAI's API.

## 🎯 Features

### Gmail Sidebar Integration
- **Fixed Right-Side Sidebar**: Always accessible floating sidebar in Gmail
- **Smooth Toggle Animation**: Beautiful slide-in/out animations
- **Non-Intrusive Design**: Doesn't interfere with Gmail's functionality

### Compose Tab ✍️
- **Email Subject Input**: Enter the subject line
- **Intent Description**: Describe what you want to write about
- **Tone Selection**: Choose from Formal, Friendly, or Neutral tones
- **AI Generation**: Creates complete, well-formatted emails
- **Copy Functionality**: Easy copy-to-clipboard with visual feedback

### Reply Tab 💬
- **Auto Email Detection**: Automatically reads currently opened emails
- **Smart Context Understanding**: AI understands the email content
- **Contextual Replies**: Generates relevant, appropriate responses
- **Direct Gmail Integration**: Insert replies directly into Gmail's compose box
- **Multiple Output Options**: Copy or insert directly

## 🛠 Technical Stack

- **Frontend**: Vanilla JavaScript, TailwindCSS
- **Chrome APIs**: Manifest V3, Content Scripts, Background Service Worker
- **AI Integration**: OpenAI API (GPT model)
- **Design**: Modern, clean UI with smooth animations

## 📦 Installation & Setup

### Development Setup

1. **Clone/Download** this project to your local machine

2. **Install Icons** (Required):
   - Add icon files to the `icons/` directory:
     - `icon16.png` (16x16 pixels)
     - `icon32.png` (32x32 pixels) 
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)

3. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select this project folder

4. **Test on Gmail**:
   - Open [Gmail](https://mail.google.com)
   - Look for the floating blue button on the right side
   - Click to open the AI assistant sidebar

### Production Considerations

- **API Key Security**: Move the OpenAI API key to Chrome's secure storage
- **Error Handling**: Implement comprehensive error handling and user feedback
- **Performance**: Add request caching and rate limiting
- **Privacy**: Review and enhance data handling practices

## 🎨 UI/UX Features

- **TailwindCSS Styling**: Modern, responsive design
- **Smooth Animations**: Slide transitions and hover effects
- **Loading States**: Beautiful spinners during AI generation
- **Visual Feedback**: Success animations and status indicators
- **Accessibility**: Focus management and keyboard navigation

## 🔧 Architecture

### File Structure
```
├── manifest.json          # Extension configuration
├── content.js             # Gmail integration & sidebar injection
├── sidebar.html           # Main UI interface
├── sidebar.js             # UI logic & OpenAI integration
├── background.js          # Service worker
├── popup.html/js          # Extension popup
├── styles.css             # Custom CSS styles
└── icons/                 # Extension icons
```

### Key Components

1. **Content Script** (`content.js`):
   - Injects sidebar into Gmail
   - Detects email content changes
   - Manages sidebar visibility
   - Handles reply insertion

2. **Sidebar Interface** (`sidebar.html/js`):
   - Tab-based navigation (Compose/Reply)
   - Form handling and validation
   - OpenAI API integration
   - Real-time email content updates

3. **Background Service** (`background.js`):
   - Extension lifecycle management
   - Tab monitoring and content script injection
   - Error handling and analytics

## 🤖 AI Integration

### OpenAI Configuration
- **Model**: GPT-3.5-turbo (configurable)
- **Max Tokens**: 500 (adjustable)
- **Temperature**: 0.7 (balanced creativity)

### Prompt Engineering
- **Tone-Specific Instructions**: Formal, Friendly, Neutral variations
- **Context-Aware Prompts**: Different prompts for compose vs reply
- **Professional Formatting**: Ensures proper email structure

## 🔒 Security & Privacy

- **Minimal Permissions**: Only requests necessary Chrome permissions
- **Content Security**: Proper CSP implementation
- **Data Handling**: No persistent storage of email content
- **API Security**: Secure API key management (needs enhancement for production)

## 📱 Browser Compatibility

- **Chrome**: Fully supported (Manifest V3)
- **Edge**: Compatible (Chromium-based)
- **Firefox**: Not compatible (different extension format)

## 🚀 Future Enhancements

- **Template Library**: Pre-built email templates
- **Conversation History**: Track and improve AI responses
- **Multi-Language Support**: Support for different languages
- **Advanced Customization**: User-defined tones and styles
- **Analytics Dashboard**: Usage statistics and insights

## 🐛 Troubleshooting

### Common Issues

1. **Sidebar Not Appearing**:
   - Refresh Gmail page
   - Check extension is enabled
   - Ensure you're on mail.google.com

2. **Reply Not Working**:
   - Make sure an email is fully opened
   - Try clicking the reply button in Gmail first
   - Check console for error messages

3. **API Errors**:
   - Verify internet connection
   - Check OpenAI API key validity
   - Review API rate limits

## 📄 License

This project is for educational and development purposes. Ensure compliance with OpenAI's usage policies and Chrome Web Store developer agreements before distribution.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with Gmail
5. Submit a pull request

## 📞 Support

For issues and feature requests, please check the troubleshooting section or create an issue in the project repository.