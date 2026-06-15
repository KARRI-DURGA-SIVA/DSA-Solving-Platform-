import re

with open('/Users/durgasiva/solving_platform/index.html', 'r') as f:
    content = f.read()

# Find the first header closing and add the toggle
old = '''      </div>
    </div>
  </header>

  <!-- Main Container -->
  <div class="main-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-title">
        <i class="fas fa-tags"></i> Topics
      </div>
      <ul class="category-list" id="categoryList">
        <li class="category-item active" data-category="all">
          <span class="category-name">
            <i class="fas fa-list"></i> All Problems
          </span>
          <span class="category-count" id="count-all">0</span>
        </li>'''

new = '''      </div>
    </div>
    <div class="header-right">
      <div class="theme-toggle" onclick="toggleTheme()">
        <span class="icon"><i class="fas fa-moon"></i></span>
        <span class="label">Dark Mode</span>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <div class="main-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-title">
        <i class="fas fa-tags"></i> Topics
      </div>
      <ul class="category-list" id="categoryList">
        <li class="category-item active" data-category="all">
          <span class="category-name">
            <i class="fas fa-list"></i> All Problems
          </span>
          <span class="category-count" id="count-all">0</span>
        </li>'''

content = content.replace(old, new, 1)

with open('/Users/durgasiva/solving_platform/index.html', 'w') as f:
    f.write(content)

print('Done')