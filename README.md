# RAG Chatbot

A production-ready Retrieval-Augmented Generation (RAG) chatbot application built with FastAPI backend and React frontend. The system combines OpenAI's GPT models with ChromaDB for intelligent document-based question answering.

## ✨ Features

### Core Functionality
- **🔍 RAG System**: Retrieval-Augmented Generation for accurate, context-aware responses
- **📄 Multi-Format Support**: Process PDF, DOCX, TXT, and Excel documents
- **🎯 Vector Search**: ChromaDB with HuggingFace embeddings for efficient retrieval
- **🤖 Conversational AI**: Powered by OpenAI GPT models
- **💾 Conversation History**: Persistent chat history with localStorage
- **🗂️ Multiple Conversations**: Create, switch, and manage multiple chat sessions
- **🎨 Modern UI**: Beautiful gradient design with smooth animations
- **⚡ Real-time Responses**: Async processing for fast interactions
- **🔒 CORS Enabled**: Secure cross-origin resource sharing

## 📁 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application with async lifespan
│   ├── config.py            # Configuration (API keys, model selection)
│   ├── rag.py               # RAG implementation with ChromaDB
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (not in git)
│   ├── docs/                # Document storage for RAG
│   │   ├── test.txt
│   │   ├── Audit_Tool_Questionnaire.xlsx
│   │   ├── Finance_Tracker_Project_Documentation(17146).docx
│   │   └── Linear Programming Methodology & Procedure for Airline Roastering.docx
│   ├── chroma_db/           # Vector database persistence
│   └── chatbot/             # Virtual environment (ignored)
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Root component
│   │   ├── ChatContainer.tsx    # Main chat interface with sidebar
│   │   ├── ChatContainer.css    # Styling with gradients
│   │   ├── hooks/
│   │   │   └── useChat.tsx      # Chat logic with conversation management
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/eswarnadh/rag_chatbot.git
cd rag_chatbot
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv chatbot

# Activate virtual environment
# Windows:
chatbot\Scripts\activate
# macOS/Linux:
source chatbot/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo OPENAI_API_KEY=your_api_key_here > .env
echo OPENAI_MODEL=gpt-4o-mini >> .env
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### Running the Application

#### Start Backend Server

```bash
cd backend
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

#### Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### First Time Setup

1. Add your documents to `backend/docs/` folder
2. Start the backend (documents will be automatically processed)
3. Open `http://localhost:5173` in your browser
4. Start chatting!

## 💡 Usage Guide

### Chat Interface Features

1. **💬 Start a Conversation**: Type your question in the input box and press Enter or click Send
2. **➕ New Chat**: Click "New Chat" button in sidebar to start a fresh conversation
3. **🔄 Switch Conversations**: Click any conversation in the sidebar to switch to it
4. **🗑️ Delete Conversations**: Hover over a conversation and click the delete icon
5. **🗂️ Clear Current Chat**: Click "Clear" button in the header
6. **📱 Toggle Sidebar**: Use the toggle button to hide/show the sidebar

### Document Processing

The RAG system automatically processes documents on startup:

- **Supported Formats**: `.txt`, `.pdf`, `.docx`, `.xlsx`
- **Chunking**: Documents split into 500-character chunks with 50-char overlap
- **Embeddings**: HuggingFace `all-MiniLM-L6-v2` model (384 dimensions)
- **Storage**: ChromaDB with persistent storage in `chroma_db/`
- **Retrieval**: Top-3 most relevant chunks retrieved per query

### Adding Your Own Documents

1. Place documents in `backend/docs/` folder
2. Restart backend server
3. Documents will be automatically processed and indexed

## 🔌 API Endpoints

### Health Check
```http
GET /
```
Returns: `{"message": "Rag Bot is Running"}`

### Chat
```http
POST /chat
Content-Type: application/json

{
  "message": "Your question here"
}
```

**Response:**
```json
{
  "reply": "AI-generated response based on document context"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the finance tracker?"}'
```

### API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## ⚙️ Configuration

### Environment Variables

Create `backend/.env` file:

```env
# Required
OPENAI_API_KEY=sk-proj-xxxxxxxx

# Optional
OPENAI_MODEL=gpt-4o-mini    # Default: gpt-4o-mini
```

### RAG Configuration

Edit `backend/rag.py` to customize:

```python
# Chunking parameters
chunk_size = 500         # Size of each text chunk
chunk_overlap = 50       # Overlap between chunks

# Retrieval parameters
k = 3                    # Number of chunks to retrieve

# Embedding model
embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
```

### CORS Settings

For production, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Replace with your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🛠️ Development

### Backend Development

```bash
# Run with auto-reload
uvicorn main:app --reload

# Run on custom port
uvicorn main:app --reload --port 8080

# View API docs
http://localhost:8000/docs
```

### Frontend Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing Documents

Test RAG system directly:

```bash
cd backend
python rag.py
```

## 🚀 Deployment

### Backend Deployment (Heroku)

1. Create `Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set OPENAI_API_KEY=your_key
   git push heroku master
   ```

### Frontend Deployment (Vercel/Netlify)

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to Vercel or Netlify

3. Update API endpoint in frontend to point to deployed backend

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t rag-chatbot-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key rag-chatbot-backend
```

## 🏗️ Architecture

### RAG Pipeline

```
User Query
    ↓
Vector Search (ChromaDB)
    ↓
Top-K Retrieval (k=3)
    ↓
Context Augmentation
    ↓
LLM Generation (OpenAI)
    ↓
Response
```

### Document Processing Flow

```
Documents (docs/)
    ↓
Load by Type (.txt, .pdf, .docx, .xlsx)
    ↓
Split into Chunks (500 chars, 50 overlap)
    ↓
Generate Embeddings (HuggingFace)
    ↓
Store in ChromaDB (persistent)
```

### Conversation Management

- **Storage**: Browser localStorage
- **Persistence**: Survives page refreshes
- **Structure**: Multiple conversations with unique IDs
- **Auto-naming**: First user message becomes title

## 📦 Technologies Used

### Backend
- **FastAPI**: Modern async Python web framework
- **OpenAI API**: GPT models for response generation
- **ChromaDB**: Vector database for embeddings
- **LangChain**: Document processing and RAG orchestration
- **HuggingFace**: Sentence transformers for embeddings
- **PyPDF2**: PDF document parsing
- **python-docx**: Word document parsing
- **Pydantic**: Settings management and validation

### Frontend
- **React 19**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Lightning-fast build tool
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with gradients and animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript strict mode
- Add comments for complex logic
- Test changes before submitting PR

## 🙏 Acknowledgments

- OpenAI for GPT models
- LangChain for RAG framework
- ChromaDB for vector storage
- HuggingFace for embedding models

## 📧 Contact

**Eswarnadh Chillimuntha**
- GitHub: [@eswarnadh](https://github.com/eswarnadh)
- Repository: [rag_chatbot](https://github.com/eswarnadh/rag_chatbot)

## 🐛 Known Issues

- Excel file processing requires `unstructured` and `openpyxl` packages
- Large documents (>10MB) may take longer to process
- First query after startup may be slower due to model loading

## 🔮 Future Enhancements

- [ ] User authentication and multi-tenancy
- [ ] Document upload via UI
- [ ] Real-time streaming responses
- [ ] Support for more document formats (CSV, JSON, HTML)
- [ ] Advanced RAG techniques (hybrid search, re-ranking)
- [ ] Conversation summarization for long chats
- [ ] Export chat history
- [ ] Dark/light theme toggle
- [ ] Mobile app version

---

⭐ **Star this repo** if you found it helpful!
