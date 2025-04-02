import os

def update_colors_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Update the accent color
    content = content.replace('--accent-color: #7C3AED;', '--accent-color: #0017d3;')
    # Update the gradient
    content = content.replace(
        '--hero-bg: linear-gradient(135deg, #A78BFA 0%, #7C3ED 100%);',
        '--hero-bg: linear-gradient(135deg, #A78BFA 0%, #0017d3 100%);'
    )
    
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)

# Get all HTML files in the docs directory
docs_dir = "teksum-insights/docs"
for filename in os.listdir(docs_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(docs_dir, filename)
        print(f"Updating colors in {filename}...")
        update_colors_in_file(filepath)

print("Done updating colors in all files!")