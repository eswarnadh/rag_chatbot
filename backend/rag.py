from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    AIMessage,
    SystemMessage
)
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
)
from pathlib import Path
import os
from pydantic import SecretStr
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import settings

DOCS_PATH = Path(__file__).parent / "docs"
CHROMA_DB_PATH = Path(__file__).parent / "chroma_db"
print(DOCS_PATH)

vectorstore = None

def load_docx(file_path):
    """
    Custom loader for .docx files using python-docx.
    This is more efficient than using external packages.
    """
    from docx import Document as DocxDocument
    
    # Open the Word document
    doc = DocxDocument(file_path)
    
    # Extract all text from paragraphs
    text = "\n".join([para.text for para in doc.paragraphs])
    
    # Return as LangChain Document
    return [Document(page_content=text, metadata={"source": str(file_path)})]

def load_documents_by_type():
    """Load documents based on file type"""
    documents = []
    
    # Loop through docs folder
    for file_path in DOCS_PATH.glob("*"):
        try:
            if file_path.suffix == ".txt":
                # Use TextLoader for .txt
                loader = TextLoader(str(file_path))
                docs = loader.load()
                documents.extend(docs)
                print(f"Loaded {len(docs)} documents from {file_path.name}")
            
            elif file_path.suffix == ".docx":
                # Use custom loader for .docx
                docs = load_docx(str(file_path))
                documents.extend(docs)
                print(f"Loaded {len(docs)} documents from {file_path.name}")
            
            elif file_path.suffix == ".pdf":
                # Use PyPDFLoader for .pdf
                loader = PyPDFLoader(str(file_path))
                docs = loader.load()
                documents.extend(docs)
                print(f"Loaded {len(docs)} documents from {file_path.name}")
            
        except Exception as e:
            print(f"Error loading {file_path.name}: {e}")
            continue
    
    return documents

def split_into_chunks(documents):
    splitter=RecursiveCharacterTextSplitter(
        chunk_size = 500,
        chunk_overlap = 50,
        separators=["\n\n"," ","\n",""]
    )
    chunks = splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks from documents")
    return chunks

def initialize_chroma():
    global vectorstore

    print("Loading documents...")  
    documents = documents = load_documents_by_type()  
    print(f"Documents loaded: {len(documents)}") 
    
    if not documents:
        print("no docs found")
        return None
    
    print("Splitting into chunks...")  
    chunks = split_into_chunks(documents)
    print(f"Chunks created: {len(chunks)}")  
    
    print("Creating embeddings...")  
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("Initializing Chroma...")  
    vectorstore = Chroma.from_documents(
        documents=chunks,  # ← Make sure this is `chunks` not `documents`
        embedding=embeddings,
        persist_directory=str(CHROMA_DB_PATH)
    )
    print("vector DB initilized successfully")
    return vectorstore

def search_similar_documents(query:str, k:int= 3):
    if vectorstore is None:
        print("no vectorestore noyt initilized")
        return []
    
    results = vectorstore.similarity_search(query,k)
    return results
def get_context_for_query(query: str, k: int = 3):
    """
    Get formatted context from documents to send with ChatGPT.
    
    Returns a string like:
    "Based on the documents:
    
    [Document 1 content]
    
    [Document 2 content]
    
    ..."
    """
    results = search_similar_documents(query, k=k)
    
    if not results:
        return "No relevant documents found."
    
    # Format results into a string
    context = "Based on the following documents:\n\n"
    
    for i, doc in enumerate(results, 1):
        context += f"Document {i}:\n{doc.page_content}\n\n"
    
    return context