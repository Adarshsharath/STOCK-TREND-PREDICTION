import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Perplexity AI API Configuration
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY', '')
PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

# Available models to try (in order of preference)
MODELS_TO_TRY = [
    'llama-3.1-sonar-small-128k-online',
    'sonar',
    'sonar-pro'
]

SYSTEM_PROMPT = """You are FinBot, an intelligent financial analyst and AI assistant.
You specialize in explaining investment strategies, stock trends, trading insights, and market analysis.
You have access to real-time information and can provide current market data, news, and analysis.
Respond concisely and use plain English. Always provide accurate and helpful information.
If asked about specific stocks, provide current prices, news, and analysis.
Keep responses focused and actionable for traders and investors."""

def chat_with_perplexity(user_message, conversation_history=None):
    """
    Send a message to Perplexity AI and get a response
    
    Args:
        user_message: User's message
        conversation_history: List of previous messages (optional)
    
    Returns:
        dict with bot response and updated conversation history
    """
    try:
        if not PERPLEXITY_API_KEY:
            return {
                'response': 'Perplexity API key not configured. Please set PERPLEXITY_API_KEY in your .env file.',
                'error': True
            }
        
        # Prepare messages
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Make API request
        headers = {
            'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Try different models until one works
        last_error = None
        response = None
        
        for model_name in MODELS_TO_TRY:
            try:
                payload = {
                    'model': model_name,
                    'messages': messages,
                    'max_tokens': 1000,
                    'temperature': 0.2,
                    'top_p': 0.9,
                    'stream': False
                }
                
                response = requests.post(PERPLEXITY_API_URL, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                # If successful, break the loop
                break
            except requests.exceptions.HTTPError as e:
                # If it's a 400 model error, try next model
                if e.response.status_code == 400:
                    last_error = e
                    continue
                else:
                    # If it's a different error, raise it immediately
                    raise
        else:
            # If all models failed, raise the last error
            if last_error:
                raise last_error
        
        data = response.json()
        bot_response = data['choices'][0]['message']['content']
        
        # Update conversation history
        updated_history = messages[1:]  # Exclude system prompt
        updated_history.append({"role": "assistant", "content": bot_response})
        
        return {
            'response': bot_response,
            'conversation_history': updated_history,
            'error': False
        }
    
    except requests.exceptions.HTTPError as e:
        error_msg = f'Perplexity API Error: {str(e)}'
        try:
            error_detail = e.response.json()
            error_msg += f'\nDetails: {error_detail}'
        except:
            error_msg += f'\nResponse: {e.response.text}'
        return {
            'response': error_msg,
            'error': True
        }
    except requests.exceptions.RequestException as e:
        return {
            'response': f'Network error communicating with Perplexity AI: {str(e)}',
            'error': True
        }
    except Exception as e:
        return {
            'response': f'Unexpected error: {str(e)}',
            'error': True
        }
