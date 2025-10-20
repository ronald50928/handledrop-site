#!/bin/bash
# Add coming soon banner to all pages

BANNER='    <!-- COMING SOON BANNER - REMOVE WHEN APP LAUNCHES -->
    <div class="coming-soon-banner">
      <div class="wrap">
        <span class="banner-icon">🚀</span>
        <strong>Coming Soon!</strong> We'\''re building the future of trading. Stay tuned for launch.
      </div>
    </div>
    <!-- END COMING SOON BANNER -->'

for file in how-it-works.html safety.html shipping.html pricing.html about.html community.html help.html; do
  if [ -f "$file" ]; then
    # Add banner after <body> tag if not already there
    if ! grep -q "coming-soon-banner" "$file"; then
      sed -i '' "/<body>/a\\
$BANNER
" "$file"
    fi
  fi
done

echo "Banners added to all pages"
