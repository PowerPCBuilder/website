import asyncio
import nest_asyncio
nest_asyncio.apply()

from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig

async def crawl_url(url):
    # Configure the crawler
    crawler_run_config = CrawlerRunConfig(
        css_selector="#main-content div",
        excluded_selector=".advisory-content__specialist,.feedback,.page-index-list",
        excluded_tags=["nav"],
        cache_mode=CacheMode.BYPASS
    )

    async with AsyncWebCrawler() as crawler:
        try:
            # Crawl the URL
            result = await crawler.arun(url=url, config=crawler_run_config)
            
            # Extract and sanitize the metadata title
            original_title = result.metadata.get("title", "Untitled")
            sanitized_title = original_title.replace(" - Coolblue - anything for a smile", "").strip()
            sanitized_filename = sanitized_title.replace(" ", "_").replace("/", "_").replace("?", "")  # File-safe name
            
            # Define the output file path
            output_file = f"{sanitized_filename}.md"
            
            # Write the results to a markdown file
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(f"Please review my Markdown document, keep the existing structure and images, and suggest improvements or additions where needed. Ensure that the overall format and content organization outline remain unchanged, you can add more outline where needed. make the final output looks different with original,  also generate tags based on the article content and add the tags infront of the markdown file under the title line.  and do category of the article to see it's belong to 'help for use', 'help for installation' or 'help for troubleshooting' and mark the category under tags line as well.  give me back with markdown format.\n\n\n")
                f.write(f"---\n")
                f.write(f"title: {sanitized_title}\n")  # Add title as a header
                f.write(f"---\n\n")
                f.write(result.markdown_v2.raw_markdown)
            
            print(f"Results successfully written to: {output_file}")
        
        except Exception as e:
            print(f"An error occurred while processing URL {url}: {e}")

async def main():
    # Predefined list of URLs
    # let arr = []; document.querySelectorAll('#panel-content a').forEach(a=>{!arr.includes(a.href)&&arr.push(a.href);}); 
    urls = ['https://www.coolblue.nl/en/advice/reset-synology-nas.html', 'https://www.coolblue.nl/en/advice/how-do-i-transfer-a-hard-drive-from-synology-nas.html', 'https://www.coolblue.nl/en/advice/synology-nas-setup.html', 'https://www.coolblue.nl/en/advice/synology-nas-install-plex.html', 'https://www.coolblue.nl/en/advice/how-do-you-set-up-your-synology-drive-server.html', 'https://www.coolblue.nl/en/advice/synology-nas-quick-connect.html', 'https://www.coolblue.nl/en/advice/synology-nas-ip-camera.html', 'https://www.coolblue.nl/en/advice/synology-nas-raid-setup.html', 'https://www.coolblue.nl/en/advice/media-streaming-nas.html', 'https://www.coolblue.nl/en/advice/synology-nas-shared-folder.html', 'https://www.coolblue.nl/en/advice/synology-nas-mac-os.html', 'https://www.coolblue.nl/en/advice/synology-nas-save-documents-windows.html', 'https://www.coolblue.nl/en/advice/personal-cloud-nas.html', 'https://www.coolblue.nl/en/advice/back-up-nas.html'];

    if not urls:
        print("No URLs provided. Exiting...")
        return

    # Crawl each URL sequentially
    for url in urls:
        print(f"Crawling URL: {url}")
        await crawl_url(url)

# Run the async function
if __name__ == "__main__":
    asyncio.run(main())
