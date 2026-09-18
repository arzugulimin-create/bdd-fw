@home
Feature: Home page navigation tabs

  As a ZincBank visitor
  I want to see the PERSONAL, BUSINESS, CARDS, and COMPANY tabs on the home page
  So that I can navigate to the site's main sections

  @smoke @critical
  Scenario: The home page shows all primary navigation tabs
    Given the user opens the ZincBank home page
    Then the primary navigation should display the following tabs:
      | tab      |
      | PERSONAL |
      | BUSINESS |
      | CARDS    |
      | COMPANY  |

  @smoke
  Scenario Outline: A navigation tab is visible on the home page
    Given the user opens the ZincBank home page
    Then the "<tab>" tab should be visible in the primary navigation

    Examples:
      | tab      |
      | PERSONAL |
      | BUSINESS |
      | CARDS    |
      | COMPANY  |

  @sanity
  Scenario: The tabs are rendered as links within the Primary navigation
    Given the user opens the ZincBank home page
    Then the primary navigation should contain a link for each expected tab
