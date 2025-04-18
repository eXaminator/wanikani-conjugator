# Wanikani Vocab Trainer

A vocabulary trainer application for Wanikani users.

## Project Structure

This project follows a feature-based folder structure:

```
src/
├── features/                  # Feature modules
│   ├── quiz/                  # Quiz feature
│   │   ├── components/        # Quiz-specific components
│   │   ├── hooks/             # Quiz-specific hooks
│   │   └── types/             # Quiz-specific types
│   ├── verb-conjugation/      # Verb conjugation feature
│   │   ├── components/        # Verb conjugation components
│   │   ├── hooks/             # Verb conjugation hooks
│   │   └── types/             # Verb conjugation types
│   └── vocabulary/            # Vocabulary feature
│       ├── components/        # Vocabulary components
│       ├── hooks/             # Vocabulary hooks
│       └── types/             # Vocabulary types
├── shared/                    # Shared resources
│   ├── components/            # Shared UI components
│   ├── hooks/                 # Shared hooks
│   └── types/                 # Shared types
└── assets/                    # Static assets
```

## Features

- **Vocabulary List**: Browse and filter your Wanikani vocabulary
- **Verb Conjugation**: Practice conjugating verbs in different forms
- **Quiz**: Test your knowledge with various quiz types

## Development

### Prerequisites

- Node.js
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies: `npm install` or `yarn`
3. Start the development server: `npm run dev` or `yarn dev`

## License

MIT
