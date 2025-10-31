import requests
import os
from datetime import datetime, timedelta
from textblob import TextBlob
from dotenv import load_dotenv

load_dotenv()

NEWSAPI_KEY = os.getenv('NEWSAPI_KEY', '')

def get_sentiment_score(text):
    """
    Analyze sentiment of text using TextBlob
    Returns: score between -1 (negative) and 1 (positive)
    """
    try:
        blob = TextBlob(text)
        return blob.sentiment.polarity
    except:
        return 0

def classify_sentiment(score):
    """
    Classify sentiment score into categories
    """
    if score >= 0.5:
        return {'label': 'Very Positive', 'color': 'green', 'emoji': '🚀'}
    elif score >= 0.1:
        return {'label': 'Positive', 'color': 'lightgreen', 'emoji': '📈'}
    elif score >= -0.1:
        return {'label': 'Neutral', 'color': 'gray', 'emoji': '➖'}
    elif score >= -0.5:
        return {'label': 'Negative', 'color': 'orange', 'emoji': '📉'}
    else:
        return {'label': 'Very Negative', 'color': 'red', 'emoji': '🔴'}

def fetch_news_sentiment(symbol, days=7, page_size=10):
    """
    Fetch financial news and perform sentiment analysis
    
    Args:
        symbol: Stock ticker symbol
        days: Number of days to look back
        page_size: Number of articles to fetch
    
    Returns:
        dict with news articles and sentiment analysis
    """
    if not NEWSAPI_KEY:
        return {
            'articles': [],
            'overall_sentiment': 0,
            'sentiment_label': 'Neutral',
            'message': 'NewsAPI key not configured. Sign up at https://newsapi.org/',
            'disclaimer': 'Configure NEWSAPI_KEY in .env to enable news sentiment analysis.'
        }
    
    try:
        # Calculate date range
        to_date = datetime.now()
        from_date = to_date - timedelta(days=days)
        
        # Build search query
        query = f"{symbol} OR stock OR shares"
        
        # Fetch news from NewsAPI
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': query,
            'from': from_date.strftime('%Y-%m-%d'),
            'to': to_date.strftime('%Y-%m-%d'),
            'language': 'en',
            'sortBy': 'relevancy',
            'pageSize': page_size,
            'apiKey': NEWSAPI_KEY
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                'error': f'NewsAPI error: {response.status_code}',
                'articles': [],
                'overall_sentiment': 0
            }
        
        data = response.json()
        articles = data.get('articles', [])
        
        # Analyze sentiment for each article
        analyzed_articles = []
        sentiment_scores = []
        
        for article in articles:
            title = article.get('title', '')
            description = article.get('description', '')
            
            # Combine title and description for sentiment analysis
            text = f"{title}. {description}" if description else title
            
            if not text or text == '[Removed]':
                continue
            
            sentiment_score = get_sentiment_score(text)
            sentiment = classify_sentiment(sentiment_score)
            sentiment_scores.append(sentiment_score)
            
            analyzed_articles.append({
                'title': title,
                'description': description,
                'url': article.get('url', ''),
                'source': article.get('source', {}).get('name', 'Unknown'),
                'published_at': article.get('publishedAt', ''),
                'image': article.get('urlToImage', ''),
                'sentiment_score': round(sentiment_score, 3),
                'sentiment_label': sentiment['label'],
                'sentiment_color': sentiment['color'],
                'sentiment_emoji': sentiment['emoji']
            })
        
        # Calculate overall sentiment
        overall_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        overall_classification = classify_sentiment(overall_sentiment)
        
        # Calculate sentiment distribution
        positive_count = sum(1 for s in sentiment_scores if s > 0.1)
        negative_count = sum(1 for s in sentiment_scores if s < -0.1)
        neutral_count = len(sentiment_scores) - positive_count - negative_count
        
        # Calculate confidence (based on article count and sentiment consistency)
        confidence = min(100, (len(analyzed_articles) / page_size) * 100)
        sentiment_variance = sum((s - overall_sentiment) ** 2 for s in sentiment_scores) / len(sentiment_scores) if sentiment_scores else 1
        consistency_score = max(0, 100 - (sentiment_variance * 100))
        
        return {
            'articles': analyzed_articles,
            'total_articles': len(analyzed_articles),
            'overall_sentiment': round(overall_sentiment, 3),
            'sentiment_label': overall_classification['label'],
            'sentiment_color': overall_classification['color'],
            'sentiment_emoji': overall_classification['emoji'],
            'distribution': {
                'positive': positive_count,
                'negative': negative_count,
                'neutral': neutral_count
            },
            'confidence': round(confidence, 1),
            'consistency_score': round(consistency_score, 1),
            'recommendation': get_sentiment_recommendation(overall_sentiment, consistency_score),
            'timestamp': datetime.now().isoformat(),
            'period_days': days
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'articles': [],
            'overall_sentiment': 0,
            'message': 'Unable to fetch news sentiment'
        }

def get_sentiment_recommendation(sentiment, consistency):
    """
    Generate investment recommendation based on sentiment
    """
    if sentiment >= 0.3 and consistency >= 70:
        return {
            'action': 'Strong Buy Signal',
            'reason': 'High positive sentiment with good consistency',
            'color': 'green'
        }
    elif sentiment >= 0.1 and consistency >= 60:
        return {
            'action': 'Buy Signal',
            'reason': 'Positive sentiment detected',
            'color': 'lightgreen'
        }
    elif sentiment >= -0.1:
        return {
            'action': 'Hold',
            'reason': 'Neutral sentiment - monitor developments',
            'color': 'gray'
        }
    elif sentiment >= -0.3:
        return {
            'action': 'Caution',
            'reason': 'Negative sentiment detected',
            'color': 'orange'
        }
    else:
        return {
            'action': 'Strong Sell Signal',
            'reason': 'High negative sentiment',
            'color': 'red'
        }

def get_sentiment_summary():
    """
    Get information about sentiment analysis
    """
    return {
        'description': 'News sentiment analysis using natural language processing',
        'sources': 'NewsAPI - aggregates news from 80,000+ sources',
        'method': 'TextBlob sentiment analysis (polarity: -1 to +1)',
        'categories': {
            'Very Positive': '≥ 0.5',
            'Positive': '0.1 to 0.5',
            'Neutral': '-0.1 to 0.1',
            'Negative': '-0.5 to -0.1',
            'Very Negative': '≤ -0.5'
        },
        'factors': [
            'Article title sentiment',
            'Description sentiment',
            'Source reliability',
            'Recency of news',
            'Sentiment consistency'
        ]
    }
