import json
import os
import re
from pathlib import Path
from datetime import datetime, timedelta
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# Cache configuration
CACHE_DIR = Path("/tmp/scholar_cache")
CACHE_DIR.mkdir(exist_ok=True)
CACHE_DURATION = timedelta(hours=24)  # Cache for 24 hours


def get_cache_file(scholar_id: str) -> Path:
    """Get the cache file path for a given scholar ID."""
    return CACHE_DIR / f"scholar_{scholar_id}.json"


def is_cache_valid(cache_file: Path) -> bool:
    """Check if the cache file exists and is still valid."""
    if not cache_file.exists():
        return False
    
    file_time = datetime.fromtimestamp(cache_file.stat().st_mtime)
    return datetime.now() - file_time < CACHE_DURATION


def load_from_cache(cache_file: Path) -> dict:
    """Load publications from cache file."""
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading cache: {e}")
        return None


def save_to_cache(cache_file: Path, data: dict):
    """Save publications to cache file."""
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Cache saved to {cache_file}")
    except Exception as e:
        logger.error(f"Error saving cache: {e}")


def scrape_scholar_profile(scholar_id: str, max_publications: int = 50):
    """
    Scrape Google Scholar profile using requests and BeautifulSoup.
    This is more reliable than the scholarly library.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    url = f"https://scholar.google.com/citations?user={scholar_id}&hl=en&cstart=0&pagesize={max_publications}"
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract author name
        author_name = "Unknown"
        name_elem = soup.select_one('#gsc_prf_in')
        if name_elem:
            author_name = name_elem.text.strip()
        
        # Extract citation stats
        stats_elements = soup.select('.gsc_rsb_std')
        total_citations = 0
        h_index = 0
        i10_index = 0
        
        if len(stats_elements) >= 3:
            try:
                total_citations = int(stats_elements[0].text.replace(',', ''))
                h_index = int(stats_elements[2].text)
                i10_index = int(stats_elements[4].text)
            except:
                pass
        
        # Extract publications
        publications = []
        pub_rows = soup.select('.gsc_a_tr')
        
        for row in pub_rows[:max_publications]:
            try:
                # Title and link
                title_elem = row.select_one('.gsc_a_at')
                title = title_elem.text.strip() if title_elem else "Untitled"
                pub_link = title_elem.get('href', '') if title_elem else ''
                
                # Authors
                authors_elem = row.select_one('.gs_gray')
                authors = authors_elem.text.strip() if authors_elem else "Unknown"
                
                # Venue
                venue_elems = row.select('.gs_gray')
                venue = venue_elems[1].text.strip() if len(venue_elems) > 1 else "Unknown Venue"
                
                # Year
                year_elem = row.select_one('.gsc_a_y span')
                year = int(year_elem.text) if year_elem and year_elem.text else datetime.now().year
                
                # Citations
                citations_elem = row.select_one('.gsc_a_c')
                citations = 0
                if citations_elem:
                    cit_text = citations_elem.text.strip()
                    if cit_text and cit_text.isdigit():
                        citations = int(cit_text)
                
                # Determine publication type
                pub_type = 'conference'
                venue_lower = venue.lower()
                if 'journal' in venue_lower or 'transactions' in venue_lower or 'letters' in venue_lower:
                    pub_type = 'journal'
                elif 'arxiv' in venue_lower:
                    pub_type = 'preprint'
                
                # Build links
                links = {}
                if pub_link:
                    full_link = f"https://scholar.google.com{pub_link}" if pub_link.startswith('/') else pub_link
                    links['pdf'] = full_link
                
                publication = {
                    'title': title,
                    'authors': authors,
                    'venue': venue,
                    'year': year,
                    'type': pub_type,
                    'citations': citations,
                    'links': links
                }
                
                publications.append(publication)
                
            except Exception as e:
                logger.warning(f"Error parsing publication row: {e}")
                continue
        
        result = {
            'scholar_id': scholar_id,
            'author_name': author_name,
            'total_citations': total_citations,
            'h_index': h_index,
            'i10_index': i10_index,
            'publications': publications,
            'fetched_at': datetime.now().isoformat(),
            'publication_count': len(publications)
        }
        
        return result
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error fetching from Google Scholar: {e}")
        raise Exception(f"Failed to connect to Google Scholar: {str(e)}")
    except Exception as e:
        logger.error(f"Error scraping Google Scholar: {e}")
        raise Exception(f"Failed to parse Google Scholar data: {str(e)}")


async def fetch_scholar_publications(scholar_id: str, max_publications: int = 50):
    """
    Fetch publications from Google Scholar for a given scholar ID.
    Uses caching to avoid frequent requests.
    
    Args:
        scholar_id: The Google Scholar user ID (e.g., 'adgtAm8AAAAJ')
        max_publications: Maximum number of publications to fetch
        
    Returns:
        dict: Contains publications list and metadata
    """
    cache_file = get_cache_file(scholar_id)
    
    # Check cache first
    if is_cache_valid(cache_file):
        logger.info(f"Loading publications from cache for {scholar_id}")
        cached_data = load_from_cache(cache_file)
        if cached_data:
            return cached_data
    
    # Fetch fresh data from Google Scholar
    logger.info(f"Fetching publications from Google Scholar for {scholar_id}")
    
    try:
        result = scrape_scholar_profile(scholar_id, max_publications)
        
        # Save to cache
        save_to_cache(cache_file, result)
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching from Google Scholar: {e}")
        
        # Try to return stale cache if available
        if cache_file.exists():
            logger.info("Returning stale cache due to error")
            cached_data = load_from_cache(cache_file)
            if cached_data:
                cached_data['error'] = f"Using cached data due to error: {str(e)}"
                return cached_data
        
        raise Exception(f"Failed to fetch publications: {str(e)}")


async def clear_cache(scholar_id: str = None):
    """Clear the cache for a specific scholar or all scholars."""
    if scholar_id:
        cache_file = get_cache_file(scholar_id)
        if cache_file.exists():
            cache_file.unlink()
            return {"message": f"Cache cleared for {scholar_id}"}
    else:
        for cache_file in CACHE_DIR.glob("scholar_*.json"):
            cache_file.unlink()
        return {"message": "All caches cleared"}
