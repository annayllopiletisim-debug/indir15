# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Turkish coupon and deals platform - PRD v2.8 implementation including admin-controlled homepage brands, Son 24 Saat dedicated page, SEO sitemap/robots.txt, and menu restructuring"

backend:
  - task: "Homepage Brands API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/brands/homepage returns only brands with show_on_homepage=true, ordered by homepage_order"

  - task: "Brand Model - Homepage Fields"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Added show_on_homepage and homepage_order fields to Brand model"

  - task: "SEO Sitemap.xml Endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/sitemap.xml generates dynamic sitemap with categories, brands, coupons, discounts"

  - task: "SEO Robots.txt Endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/robots.txt with proper rules for search engines and AI crawlers"

  - task: "Expiring Soon API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/expiring-soon returns coupons/discounts expiring within 24 hours"

frontend:
  - task: "Son 24 Saat Page"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/ExpiringSoonPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created dedicated /son-24-saat page with SEO title and auto-refresh"

  - task: "Header Menu - Son 24 Saat Link First"
    implemented: true
    working: true
    file: "/app/frontend/src/components/Header.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Added Son 24 Saat as first link in both desktop and mobile menus (orange color)"

  - task: "Homepage - Admin Controlled Brands"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/HomePage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "HomePage now fetches brands from /api/brands/homepage instead of all brands"

  - task: "Admin Brands - Homepage Settings"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/admin/AdminBrandsPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Added show_on_homepage checkbox and homepage_order input to brand form"

  - task: "SEO Meta Tags Component"
    implemented: true
    working: true
    file: "/app/frontend/src/components/SEOMetaTags.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Dynamic robots meta tag: noindex for admin/search pages, index for public pages"

metadata:
  created_by: "main_agent"
  version: "2.8"
  test_sequence: 2
  run_ui: true

test_plan:
  current_focus:
    - "Son 24 Saat Page"
    - "Homepage Admin Controlled Brands"
    - "SEO Sitemap and Robots"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "PRD v2.8 implementation complete. All features implemented: 1) Admin-controlled homepage brands with show_on_homepage flag and ordering, 2) Dedicated /son-24-saat page with SEO title, 3) Son 24 Saat link at the beginning of menu, 4) Dynamic sitemap.xml and robots.txt, 5) SEO meta tags for noindex on admin/search pages. Demo data seeded with 6 homepage brands and 2 expiring-soon coupons for testing."
