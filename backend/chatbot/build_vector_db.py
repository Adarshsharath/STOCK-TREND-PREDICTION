#!/usr/bin/env python3
"""
Build Vector Database for RAG System
Reads knowledge base and creates persistent Chroma vector database
Uses sentence-transformers for embeddings
"""

import os
import sys
from pathlib import Path
from typing import List
import chromadb
from chromadb.config import Settings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Configuration
KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "knowledge_base.txt")
VECTOR_DB_PATH = os.path.join(os.path.dirname(__file__), "vector_db")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
COLLECTION_NAME = "finsight_knowledge"

def load_knowledge_base(file_path: str) -> str:
    """Load the knowledge base text file"""
    print(f"📖 Loading knowledge base from: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    print(f"✓ Loaded {len(content)} characters")
    return content

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """Split text into chunks for embedding"""
    print(f"✂️  Splitting text into chunks (size={chunk_size}, overlap={chunk_overlap})")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    chunks = text_splitter.split_text(text)
    print(f"✓ Created {len(chunks)} chunks")
    return chunks

def build_vector_database(chunks: List[str]) -> Chroma:
    """Build and persist Chroma vector database"""
    print(f"🔨 Building vector database at: {VECTOR_DB_PATH}")
    
    # Initialize embeddings
    print(f"📊 Loading embedding model: {EMBEDDING_MODEL}")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    # Create vector store with persistence
    print("💾 Creating persistent vector store...")
    vectorstore = Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        persist_directory=VECTOR_DB_PATH,
        collection_name=COLLECTION_NAME
    )
    
    print(f"✓ Vector database created with {len(chunks)} embeddings")
    return vectorstore

def verify_database():
    """Verify the database was created successfully"""
    print("\n🔍 Verifying database...")
    
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    vectorstore = Chroma(
        persist_directory=VECTOR_DB_PATH,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME
    )
    
    # Test query
    test_query = "What trading strategies are available?"
    results = vectorstore.similarity_search(test_query, k=3)
    
    print(f"✓ Database verification successful!")
    print(f"  Test query: '{test_query}'")
    print(f"  Retrieved {len(results)} results")
    print(f"\n  Sample result:")
    print(f"  {results[0].page_content[:200]}...")

def main():
    """Main function to build vector database"""
    print("="*60)
    print("🚀 FinSight AI - Vector Database Builder")
    print("="*60)
    
    try:
        # Load knowledge base
        knowledge_text = load_knowledge_base(KNOWLEDGE_BASE_PATH)
        
        # Chunk text
        chunks = chunk_text(knowledge_text)
        
        # Build vector database
        vectorstore = build_vector_database(chunks)
        
        # Verify
        verify_database()
        
        print("\n" + "="*60)
        print("✅ Vector database built successfully!")
        print(f"📁 Location: {VECTOR_DB_PATH}")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error building vector database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
