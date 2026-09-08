---
layout: null
sitemap: false
---

var store = [
  {%- for c in site.collections -%}
    {%- if forloop.last -%}
      {%- assign l = true -%}
    {%- endif -%}
    {%- assign docs = c.docs | where_exp: 'doc', 'doc.search != false' -%}
    {%- for doc in docs -%}
      {%- comment -%} 코드블록(<pre class="highlight">...</pre>) 제거: 검색 인덱스 노이즈/용량 축소 {%- endcomment -%}
      {%- assign body = doc.content -%}
      {%- assign segments = body | split: '<pre class="highlight">' -%}
      {%- assign clean = segments[0] -%}
      {%- for seg in segments offset:1 -%}
        {%- assign after = seg | split: '</pre>' -%}
        {%- assign tail = after | slice: 1, 100 | join: '</pre>' -%}
        {%- assign clean = clean | append: ' ' | append: tail -%}
      {%- endfor -%}
      {
        "title": {{ doc.title | jsonify }},
        "excerpt":
          {{ clean |
            replace:"</p>", " " |
            replace:"</h1>", " " |
            replace:"</h2>", " " |
            replace:"</h3>", " " |
            replace:"</h4>", " " |
            replace:"</h5>", " " |
            replace:"</h6>", " " |
            replace:"</li>", " " |
          strip_html | strip_newlines | jsonify }},
        "categories": {{ doc.categories | jsonify }},
        "tags": {{ doc.tags | jsonify }},
        "url": {{ doc.url | absolute_url | jsonify }}
      } {%- unless forloop.last and l -%}, {%- endunless -%}
    {%- endfor -%}
  {%- endfor -%}
]
