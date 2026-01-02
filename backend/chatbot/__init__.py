"""
FinSight AI Chatbot Module
Groq-based chatbot with RAG and LangChain agents
"""

from .groq_agent import chat_with_agent, get_agent, FinSightAgent
from .mongo_chat_manager import get_chat_manager, MongoChatManager
from .load_and_query import RAGQueryEngine, query_knowledge_base, get_relevant_context

__all__ = [
    'chat_with_agent',
    'get_agent',
    'FinSightAgent',
    'get_chat_manager',
    'MongoChatManager',
    'RAGQueryEngine',
    'query_knowledge_base',
    'get_relevant_context'
]
