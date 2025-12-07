"""
Selenium tests for Airline Travel Assistant
Tests two main requirements:
1. One-way flight search
2. Round-trip flight search with two-step itinerary selection
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time


def setup_driver():
    """Initialize Chrome WebDriver"""
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    # Remove headless mode to see the browser
    # options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    return driver


def test_one_way_flight_search(driver):
    """
    Test Requirement 1: One-way flight search
    - Select one-way trip type
    - Enter departure and arrival airports
    - Select date
    - Search for flights
    - Verify results are displayed
    """
    print("\n=== TEST 1: One-Way Flight Search ===")
    
    try:
        # Navigate to the application
        driver.get("http://127.0.0.1:5000")
        time.sleep(2)
        
        # Select one-way trip
        print("Step 1: Selecting one-way trip...")
        trip_type_select = Select(driver.find_element(By.ID, "tripTypeSelect"))
        trip_type_select.select_by_value("2")  # 2 = One-way
        time.sleep(1)
        
        # Verify return date field is hidden
        return_field = driver.find_element(By.ID, "returnField")
        assert "hidden" in return_field.get_attribute("class"), "Return field should be hidden for one-way"
        print("✓ Return date field is hidden")
        
        # Enter departure airport
        print("Step 2: Entering departure airport (JFK)...")
        departure_input = driver.find_element(By.ID, "departureInput")
        departure_input.clear()
        departure_input.send_keys("JFK")
        time.sleep(1)
        
        # Enter arrival airport
        print("Step 3: Entering arrival airport (LAX)...")
        arrival_input = driver.find_element(By.ID, "arrivalInput")
        arrival_input.clear()
        arrival_input.send_keys("LAX")
        time.sleep(1)
        
        # Select departure date (tomorrow)
        print("Step 4: Selecting departure date...")
        departure_date = driver.find_element(By.ID, "departureDate")
        departure_date.send_keys("12/20/2025")
        time.sleep(1)
        
        # Select travelers
        adults_select = Select(driver.find_element(By.ID, "adultsSelect"))
        adults_select.select_by_value("1")
        
        # Select class
        class_select = Select(driver.find_element(By.ID, "classSelect"))
        class_select.select_by_value("1")  # Economy
        
        # Submit search
        print("Step 5: Submitting search...")
        search_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        search_button.click()
        
        # Wait for loading indicator to appear and disappear
        print("Step 6: Waiting for results...")
        WebDriverWait(driver, 3).until(
            EC.visibility_of_element_located((By.ID, "loadingIndicator"))
        )
        WebDriverWait(driver, 30).until(
            EC.invisibility_of_element_located((By.ID, "loadingIndicator"))
        )
        
        # Check if results are displayed
        results_container = driver.find_element(By.ID, "flightResults")
        assert results_container.text != "", "Flight results should be displayed"
        print("Flight results are displayed")
        
        # Check if flight cards exist
        flight_cards = driver.find_elements(By.CSS_SELECTOR, "#flightResults .bg-\\[\\#1a2233\\]")
        assert len(flight_cards) > 0, "At least one flight card should be displayed"
        print(f"Found {len(flight_cards)} flight options")
        
        # Verify "Select Outbound" button exists
        select_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Select Outbound')]")
        assert len(select_buttons) > 0, "Select Outbound buttons should be present"
        print("Select Outbound buttons are present")
        
        print("\nTEST 1 PASSED: One-way flight search works correctly\n")
        return True
        
    except Exception as e:
        print(f"\nTEST 1 FAILED: {str(e)}\n")
        return False


def test_round_trip_flight_search(driver):
    """
    Test Requirement 2: Round-trip flight search with itinerary
    - Select round-trip
    - Enter airports and dates
    - Search and select outbound flight
    - Verify flight added to itinerary
    - Search and select return flight
    - Verify both flights in itinerary
    """
    print("\n=== TEST 2: Round-Trip Flight Search with Itinerary ===")
    
    try:
        # Navigate to the application
        driver.get("http://127.0.0.1:5000")
        time.sleep(2)
        
        # Select round-trip
        print("Step 1: Selecting round-trip...")
        trip_type_select = Select(driver.find_element(By.ID, "tripTypeSelect"))
        trip_type_select.select_by_value("1")  # 1 = Round-trip
        time.sleep(1)
        
        # Verify return date field is visible
        return_field = driver.find_element(By.ID, "returnField")
        assert "hidden" not in return_field.get_attribute("class"), "Return field should be visible for round-trip"
        print("Return date field is visible")
        
        # Enter departure airport
        print("Step 2: Entering departure airport (YYZ)...")
        departure_input = driver.find_element(By.ID, "departureInput")
        departure_input.clear()
        departure_input.send_keys("YYZ")
        time.sleep(1)
        
        # Enter arrival airport
        print("Step 3: Entering arrival airport (YYC)...")
        arrival_input = driver.find_element(By.ID, "arrivalInput")
        arrival_input.clear()
        arrival_input.send_keys("YYC")
        time.sleep(1)
        
        # Select departure date
        print("Step 4: Selecting departure date...")
        departure_date = driver.find_element(By.ID, "departureDate")
        departure_date.clear()
        departure_date.send_keys("12/24/2025")
        time.sleep(1)
        
        # Select return date
        print("Step 5: Selecting return date...")
        return_date = driver.find_element(By.ID, "returnDate")
        return_date.clear()
        return_date.send_keys("12/26/2025")
        time.sleep(1)
        
        # Submit search for outbound flights
        print("Step 6: Searching outbound flights...")
        search_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        search_button.click()
        
        # Wait for results
        WebDriverWait(driver, 3).until(
            EC.visibility_of_element_located((By.ID, "loadingIndicator"))
        )
        WebDriverWait(driver, 30).until(
            EC.invisibility_of_element_located((By.ID, "loadingIndicator"))
        )
        
        # Verify outbound flights are displayed
        flight_cards = driver.find_elements(By.CSS_SELECTOR, "#flightResults .bg-\\[\\#1a2233\\]")
        assert len(flight_cards) > 0, "Outbound flights should be displayed"
        print(f"Found {len(flight_cards)} outbound flight options")
        
        # Select first outbound flight
        print("Step 7: Selecting first outbound flight...")
        select_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Select Outbound')]")
        assert len(select_buttons) > 0, "Select Outbound buttons should exist"
        select_buttons[0].click()
        time.sleep(2)
        
        # Verify itinerary section is visible
        print("Step 8: Verifying itinerary section...")
        itinerary_section = driver.find_element(By.ID, "itinerarySection")
        assert "hidden" not in itinerary_section.get_attribute("class"), "Itinerary should be visible"
        print("Itinerary section is visible")
        
        # Verify outbound flight is in itinerary
        selected_flights = driver.find_element(By.ID, "selectedFlights")
        assert "Outbound" in selected_flights.text, "Outbound label should be in itinerary"
        print("Outbound flight added to itinerary")
        
        # Check for return flight prompt
        results_container = driver.find_element(By.ID, "flightResults")
        assert "return flight" in results_container.text.lower(), "Should prompt for return flight"
        print("System prompts for return flight selection")
        
        # Click "Search Return Flights" button
        print("Step 9: Searching return flights...")
        search_return_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Search Return Flights')]")
        search_return_button.click()
        
        # Wait for return flight results
        WebDriverWait(driver, 3).until(
            EC.visibility_of_element_located((By.ID, "loadingIndicator"))
        )
        WebDriverWait(driver, 30).until(
            EC.invisibility_of_element_located((By.ID, "loadingIndicator"))
        )
        
        # Verify return flights are displayed
        return_flight_cards = driver.find_elements(By.CSS_SELECTOR, "#flightResults .bg-\\[\\#1a2233\\]")
        assert len(return_flight_cards) > 0, "Return flights should be displayed"
        print(f"Found {len(return_flight_cards)} return flight options")
        
        # Select first return flight
        print("Step 10: Selecting first return flight...")
        select_return_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Select Return')]")
        assert len(select_return_buttons) > 0, "Select Return buttons should exist"
        select_return_buttons[0].click()
        time.sleep(2)
        
        # Verify both flights are in itinerary
        print("Step 11: Verifying complete itinerary...")
        selected_flights = driver.find_element(By.ID, "selectedFlights")
        assert "Outbound" in selected_flights.text, "Outbound flight should still be in itinerary"
        assert "Return" in selected_flights.text, "Return flight should be in itinerary"
        print("Both outbound and return flights are in itinerary")
        
        # Verify completion message
        results_container = driver.find_element(By.ID, "flightResults")
        assert "complete" in results_container.text.lower(), "Should show completion message"
        print("Round trip booking complete message displayed")
        
        # Verify total price is shown
        assert "Total:" in results_container.text or "$" in results_container.text, "Total price should be displayed"
        print("Total price is displayed")
        
        print("\nTEST 2 PASSED: Round-trip flight search with itinerary works correctly\n")
        return True
        
    except Exception as e:
        print(f"\nTEST 2 FAILED: {str(e)}\n")
        driver.save_screenshot("test_2_failure.png")
        print("Screenshot saved as test_2_failure.png")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("AIRLINE TRAVEL ASSISTANT - SELENIUM TESTS")
    print("=" * 60)
    
    driver = setup_driver()
    
    try:
        # Run tests
        test1_result = test_one_way_flight_search(driver)
        time.sleep(2)
        
        test2_result = test_round_trip_flight_search(driver)
        time.sleep(2)
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Test 1 (One-way search): {'PASSED' if test1_result else 'FAILED'}")
        print(f"Test 2 (Round-trip with itinerary): {'PASSED' if test2_result else 'FAILED'}")
        print(f"\nOverall: {2 if (test1_result and test2_result) else (1 if (test1_result or test2_result) else 0)}/2 tests passed")
        print("=" * 60)
        
        input("\nPress Enter to close browser...")
        
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
