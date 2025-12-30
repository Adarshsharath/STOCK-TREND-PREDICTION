#!/usr/bin/env python3
"""
Load and Query Vector Database for RAG System
Provides functions to query the vector database and retrieve relevant context
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Configuration
VECTOR_DB_PATH = os.path.join(os.path.dirname(__file__), "vector_db")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
COLLECTION_NAME = "finsight_knowledge"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.1-8b-instant"  # Faster model with higher rate limits

class RAGQueryEngine:
    """RAG Query Engine for FinSight AI knowledge base"""
    
    def __init__(self):
        """Initialize the RAG query engine"""
        self.embeddings = None
        self.vectorstore = None
        self.llm = None
        self.qa_chain = None
        self._initialize()
    
    def _initialize(self):
        """Initialize embeddings, vector store, and LLM"""
        try:
            # Load vector store
            if not os.path.exists(VECTOR_DB_PATH):
                print(f"WARNING: Vector database not found at {VECTOR_DB_PATH}")
                print("RAG features will be disabled. Run build_vector_db.py to create it.")
                self.vectorstore = None
                self.retriever = None
                self.qa_chain = None
                return
            
            # Load embeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name=EMBEDDING_MODEL,
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            
            self.vectorstore = Chroma(
                persist_directory=VECTOR_DB_PATH,
                embedding_function=self.embeddings,
                collection_name=COLLECTION_NAME
            )
            
            # Initialize Groq LLM
            if not GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY not found in environment variables")
            
            self.llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=GROQ_MODEL,
                temperature=0.3,
                max_tokens=512,  # Faster responses
                streaming=False
            )
            
            # Create retriever
            self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 4})
            
            # Create prompt template
            template = """You are an expert on FinSight AI trading platform. Answer the question based on the provided context. If you don't know the answer based on the context, say so.

Context: {context}

Question: {question}

Answer:"""
            
            self.prompt = ChatPromptTemplate.from_template(template)
            
            # Create RAG chain using LCEL (LangChain Expression Language)
            def format_docs(docs):
                return "\n\n".join(doc.page_content for doc in docs)
            
            self.qa_chain = (
                {"context": self.retriever | format_docs, "question": RunnablePassthrough()}
                | self.prompt
                | self.llm
                | StrOutputParser()
            )
            
        except Exception as e:
            print(f"Error initializing RAG engine: {e}")
            # Don't raise - allow agent to work without RAG
            self.vectorstore = None
            self.retriever = None
            self.qa_chain = None
    
    def query(self, question: str) -> Dict[str, Any]:
        """
        Query the knowledge base with RAG
        
        Args:
            question: User's question
            
        Returns:
            Dictionary with answer and source documents
        """
        try:
            # Check if RAG is available
            if self.qa_chain is None or self.retriever is None:
                return {
                    "answer": "I don't have access to the knowledge base right now. Please contact support.",
                    "sources": [],
                    "success": False
                }
            
            # Get answer from chain
            answer = self.qa_chain.invoke(question)
            
            # Get source documents separately
            source_docs = self.retriever.invoke(question)
            
            return {
                "answer": answer,
                "sources": [doc.page_content for doc in source_docs],
                "success": True
            }
        except Exception as e:
            return {
                "answer": f"Error querying knowledge base: {str(e)}",
                "sources": [],
                "success": False
            }
    
    def retrieve_context(self, query: str, k: int = 3) -> List[str]:
        """
        Retrieve relevant context without generating answer
        
        Args:
            query: Search query
            k: Number of documents to retrieve
            
        Returns:
            List of relevant text chunks
        """
        try:
            docs = self.vectorstore.similarity_search(query, k=k)
            return [doc.page_content for doc in docs]
        except Exception as e:
            print(f"Error retrieving context: {e}")
            return []

def query_knowledge_base(question: str) -> Dict[str, Any]:
    """
    Convenience function to query the knowledge base
    
    Args:
        question: User's question
        
    Returns:
        Dictionary with answer and sources
    """
    engine = RAGQueryEngine()
    return engine.query(question)

def get_relevant_context(query: str, k: int = 3) -> List[str]:
    """
    Convenience function to get relevant context
    
    Args:
        query: Search query
        k: Number of documents to retrieve
        
    Returns:
        List of relevant text chunks
    """
    engine = RAGQueryEngine()
    return engine.retrieve_context(query, k)

def main():
    """Test the RAG query engine"""
    print("="*60)
    print("🔍 Testing RAG Query Engine")
    print("="*60)
    
    test_questions = [
        "What trading strategies are available in FinSight AI?",
        "How does the MACD strategy work?",
        "What machine learning models are used for predictions?",
        "How do I use the chatbot?"
    ]
    
    engine = RAGQueryEngine()
    
    for question in test_questions:
        print(f"\n❓ Question: {question}")
        result = engine.query(question)
        if result["success"]:
            print(f"✅ Answer: {result['answer'][:300]}...")
        else:
            print(f"❌ Error: {result['answer']}")

if __name__ == "__main__":
    main()
