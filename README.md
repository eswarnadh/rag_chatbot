# RAG Chatbot

A Retrieval-Augmented Generation (RAG) chatbot application built with FastAPI backend and React frontend. The system uses OpenAI's GPT models combined with ChromaDB for document-based question answering.

## Features

- **Document Processing**: Supports PDF and DOCX document ingestion
- **Vector Search**: Uses ChromaDB for efficient document retrieval
- **Conversational AI**: Powered by OpenAI GPT models
- **Modern UI**: React-based chat interface with TypeScript
- **RESTful API**: FastAPI backend with CORS support

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI application entry point
│   ├── config.py        # Configuration settings (API keys, model selection)
│   ├── rag.py           # RAG implementation with ChromaDB
│   ├── requirements.txt # Python dependencies
│   ├── docs/            # Document storage for RAG
│   │   ├── test.txt
│   │   ├── Audit_Tool_Questionnaire.xlsx
│   │   ├── Finance_Tracker_Project_Documentation(17146).docx
│   │   └── Linear Programming Methodology & Procedure for Airline Roastering.docx
│   └── chroma_db/       # Vector database storage
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── ChatContainer.tsx
│   │   ├── hooks/useChat.tsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv chatbot
   source chatbot/bin/activate  # On Windows: chatbot\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini  # or your preferred model
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend

1. From the backend directory:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

   The backend will start on `http://localhost:8000`

2. API Documentation available at `http://localhost:8000/docs` (Swagger UI)

### Start the Frontend

1. From the frontend directory:
   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Type your questions in the chat interface
3. The system will retrieve relevant information from the uploaded documents and generate responses using AI

## API Endpoints

- `GET /` - Health check endpoint
- `POST /chat` - Send a message to the chatbot

### Chat Request Format

```json
{
  "message": "Your question here"
}
```

### Chat Response Format

```json
{
  "reply": "AI generated response based on document context"
}
```

## Document Processing

The system automatically processes documents in the `backend/docs/` directory during startup. Supported formats:

- Plain text (.txt)
- PDF (.pdf)
- Microsoft Word (.docx)

Documents are split into chunks, embedded using sentence transformers, and stored in ChromaDB for efficient retrieval.

## Configuration

### Backend Configuration

Edit `backend/config.py` or set environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: GPT model to use (default: gpt-4o-mini)

### CORS Settings

The backend is configured to allow all origins for development. For production, update the CORS settings in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Replace with your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Development

### Backend Development

- Run with auto-reload: `uvicorn main:app --reload`
- View API docs: `http://localhost:8000/docs`
- View alternative docs: `http://localhost:8000/redoc`

### Frontend Development

- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint code: `npm run lint`

## Deployment

### Backend Deployment

1. Set environment variables in your deployment platform
2. Use a production ASGI server like Gunicorn:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Frontend Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Serve the `dist` directory using any static file server (nginx, Apache, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Technologies Used

### Backend
- **FastAPI**: Modern Python web framework
- **OpenAI**: AI language models
- **ChromaDB**: Vector database for embeddings
- **LangChain**: Framework for LLM applications
- **Sentence Transformers**: Text embedding models
- **PyPDF2/python-docx**: Document processing

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **ESLint**: Code linting