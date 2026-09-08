---
layout: search
title: "Search"
permalink: /search/
sitemap: false
---
{% if site.tags.size > 0 %}
<div class="search-tags">
  <h2 class="search-tags__title">Tags</h2>
  <ul class="search-tags__list">
    {% assign sorted_tags = site.tags | sort %}
    {% for tag in sorted_tags %}
      <li><a href="{{ '/tags/' | relative_url }}#{{ tag[0] | slugify }}">{{ tag[0] }} <span class="search-tags__count">{{ tag[1].size }}</span></a></li>
    {% endfor %}
  </ul>
</div>
{% endif %}
