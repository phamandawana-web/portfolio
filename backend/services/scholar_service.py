import json
import os
from pathlib import Path
from datetime import datetime, timedelta
from scholarly import scholarly
import logging

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


def extract_publication_info(pub) -> dict:
    """Extract relevant information from a publication."""
    try:
        bib = pub.get('bib', {})
        
        # Extract year
        year = bib.get('pub_year')
        if not year:
            # Try to parse from publication string
            pub_string = bib.get('citation', '')
            try:
                # Look for 4-digit year
                import re
                year_match = re.search(r'\b(19|20)\d{2}\b', pub_string)
                if year_match:
                    year = int(year_match.group())
            except:
                year = None
        
        # Determine publication type
        venue = bib.get('venue', '')
        pub_type = 'conference'
        if 'journal' in venue.lower() or 'transactions' in venue.lower():
            pub_type = 'journal'
        elif 'arxiv' in venue.lower():
            pub_type = 'preprint'
        
        # Build links
        links = {}
        if pub.get('pub_url'):
            links['pdf'] = pub['pub_url']
        if pub.get('eprint_url'):
            links['arxiv'] = pub['eprint_url']
        
        # Get citation count
        citations = pub.get('num_citations', 0)
        
        return {
            'title': bib.get('title', 'Untitled'),
            'authors': bib.get('author', 'Unknown'),
            'venue': venue or 'Unknown Venue',
            'year': int(year) if year else datetime.now().year,
            'type': pub_type,
            'citations': citations,
            'links': links,
            'abstract': bib.get('abstract', '')
        }
    except Exception as e:
        logger.error(f"Error extracting publication info: {e}")
        return None


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
        # Search for the author
        search_query = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(search_query)
        
        publications = []
        pub_count = 0
        
        # Extract publications
        for pub in author.get('publications', []):
            if pub_count >= max_publications:
                break
                
            try:
                # Fill publication details (this makes additional requests)
                filled_pub = scholarly.fill(pub)
                pub_info = extract_publication_info(filled_pub)
                
                if pub_info:
                    publications.append(pub_info)
                    pub_count += 1
                    
            except Exception as e:
                logger.warning(f"Error processing publication: {e}")
                continue
        
        # Sort by year (most recent first)
        publications.sort(key=lambda x: x.get('year', 0), reverse=True)
        
        result = {
            'scholar_id': scholar_id,
            'author_name': author.get('name', 'Unknown'),
            'total_citations': author.get('citedby', 0),
            'h_index': author.get('hindex', 0),
            'i10_index': author.get('i10index', 0),
            'publications': publications,
            'fetched_at': datetime.now().isoformat(),
            'publication_count': len(publications)
        }
        
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
