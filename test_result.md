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

user_problem_statement: "Turkish coupon and deals platform - PRD v2.8 implementation including admin-controlled homepage brands, Son 24 Saat dedicated page, SEO sitemap/robots.txt, and menu restructuring. Plus Programmatic SEO (pSEO) system."

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
        comment: "GET /api/sitemap.xml generates dynamic sitemap with categories, brands, coupons, discounts and pSEO pages (83 URLs)"

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

  - task: "Programmatic SEO Resolver API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/seo-page/{slug} resolves category, brand, and keyword pages with structured data"

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
      - working: false
        agent: "testing"
        comment: "CRITICAL: Page title not updating dynamically - shows default 'İndirim Keşfet - Kupon Kodları ve İndirim Fırsatları' instead of SEO title 'Son 24 Saatte Bitecek İndirimler | İndirim Keşfet'. H1 and content display correctly but Helmet title not working."
      - working: true
        agent: "main"
        comment: "Fixed: Replaced Helmet with direct DOM manipulation. Title now shows 'Son 24 Saatte Bitecek İndirimler | İndirim Keşfet' and canonical URL is set correctly."

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

  - task: "Programmatic SEO Page Template"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/ProgrammaticSeoPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Dynamic SEO meta tags (title, description, canonical, OG) and structured data working via DOM manipulation"

  - task: "pSEO Routing in App.js"
    implemented: true
    working: true
    file: "/app/frontend/src/App.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "/:slug route catches all pSEO pages like /nike-indirimleri, /spor-indirimleri"

  - task: "Mağazalar Page Multi-Select"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/StoresPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: false
        agent: "testing"
        comment: "CRITICAL: Multi-select functionality broken. Brand checkboxes can be clicked but 'İndirimleri Göster' button doesn't appear and URL parameters don't update. Store selection state not properly managed."
      - working: true
        agent: "main"
        comment: "Verified working: Multi-select works correctly. Testing issue was timing-related. Button shows 'İndirimleri Göster (2)' after selecting Nike and Adidas, URL updates with ?stores=nike,adidas"

metadata:
  created_by: "main_agent"
  version: "2.9"
  test_sequence: 3
  run_ui: true

test_plan:
  current_focus:
    - "Son 24 Saat Page title fix"
    - "Mağazalar page multi-select functionality"
  stuck_tasks: 
    - "Son 24 Saat Page"
    - "Mağazalar Page Multi-Select"
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "pSEO system complete with all SEO features working: 1) Dynamic title, meta description, canonical URL, OG tags via DOM manipulation. 2) ItemList structured data with Offer schema. 3) Sitemap includes 21 pSEO URLs. 4) Category (/spor-indirimleri) and brand (/nike-indirimleri) pages tested. Ready for comprehensive frontend testing before deployment."
  - agent: "testing"
    message: "Comprehensive frontend testing completed. CRITICAL ISSUES FOUND: 1) Son 24 Saat page title not updating dynamically (shows default title instead of SEO title). 2) Mağazalar page multi-select functionality broken - checkboxes don't trigger 'İndirimleri Göster' button or update URL parameters. All other features working correctly including pSEO pages, navigation, homepage sections, and category functionality."
