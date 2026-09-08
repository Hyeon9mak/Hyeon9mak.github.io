---
layout: search
title: "Search"
permalink: /search/
sitemap: false
---
{% if site.tags.size > 0 %}
<details class="search-tags">
  <summary class="search-tags__summary">Tags <span class="search-tags__count">{{ site.tags.size }}</span></summary>
  <ul class="search-tags__list">
    {% assign sorted_tags = site.tags | sort %}
    {% for tag in sorted_tags %}
      <li><a href="{{ '/tags/' | relative_url }}#{{ tag[0] | slugify }}">{{ tag[0] }} <span class="search-tags__tagcount">{{ tag[1].size }}</span></a></li>
    {% endfor %}
  </ul>
</details>
{% endif %}
