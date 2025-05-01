import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from PIL import Image # Requires: pip install Pillow
import io
import os

# --- Configuration ---
HTML_FILE_NAME = "email_thumbnail_static.html"  # Make sure this matches your HTML file name
OUTPUT_FILE_NAME = "laptop_mockup_thumbnail.png"
# Optional: Specify the path to your webdriver if it's not in your system PATH
# WEBDRIVER_PATH = '/path/to/your/chromedriver'
# --- End Configuration ---

# --- Get Absolute Path for HTML File ---
# Assumes the HTML file is in the same directory as the script
script_dir = os.path.dirname(os.path.abspath(__file__))
html_file_path = os.path.join(script_dir, HTML_FILE_NAME)
# Use 'file:///' prefix for local files
html_file_url = f'file:///{html_file_path}'


# --- Setup Selenium Webdriver ---
options = webdriver.ChromeOptions()
options.add_argument('--headless')  # Run Chrome in headless mode (no GUI)
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
# Set a window size large enough to capture the element without scrolling issues
options.add_argument('--window-size=1200,1000')

# Initialize WebDriver (use executable_path if needed)
# driver = webdriver.Chrome(executable_path=WEBDRIVER_PATH, options=options)
try:
    driver = webdriver.Chrome(options=options)
except Exception as e:
    print(f"Error initializing WebDriver: {e}")
    print("Please ensure ChromeDriver is installed and accessible in your PATH,")
    print("or specify its path using WEBDRIVER_PATH in the script.")
    exit()

print(f"Loading HTML file: {html_file_url}")

try:
    # --- Load the HTML File ---
    driver.get(html_file_url)

    # --- Wait for elements/images to potentially load ---
    # Adjust sleep time if images take longer to render in the headless browser
    print("Waiting for page elements to render...")
    time.sleep(3) # Increased wait time

    # --- Locate the Laptop Mockup Element ---
    print("Locating the laptop mockup element...")
    try:
        element = driver.find_element(By.CLASS_NAME, 'laptop-mockup')
        print("Element found.")
    except Exception as e:
        print(f"Error finding element by class name 'laptop-mockup': {e}")
        driver.quit()
        exit()

    # --- Get Screenshot of the Element ---
    print("Taking screenshot of the element...")
    try:
        # Get screenshot of the specific element
        location = element.location
        size = element.size
        png = driver.get_screenshot_as_png() # saves screenshot of entire page
        print(f"Element location: {location}, size: {size}")

    except Exception as e:
        print(f"Error taking screenshot: {e}")
        driver.quit()
        exit()

    # --- Crop the Screenshot to the Element ---
    print("Cropping screenshot...")
    try:
        im = Image.open(io.BytesIO(png)) # uses PIL library to open image in memory

        # Calculate cropping box, considering potential scaling in headless mode
        # It's often safer to capture the element directly if the webdriver supports it,
        # but cropping the full page screenshot is a common fallback.
        # Note: High-DPI displays might affect coordinates. Adjust if necessary.
        device_pixel_ratio = driver.execute_script('return window.devicePixelRatio')
        print(f"Device Pixel Ratio: {device_pixel_ratio}")

        left = location['x'] * device_pixel_ratio
        top = location['y'] * device_pixel_ratio
        right = (location['x'] + size['width']) * device_pixel_ratio
        bottom = (location['y'] + size['height']) * device_pixel_ratio

        # Add some padding if needed, or adjust if cropping is slightly off
        padding = 5 * device_pixel_ratio # Example padding
        left = max(0, left - padding)
        top = max(0, top - padding)
        right = min(im.width, right + padding)
        bottom = min(im.height, bottom + padding)


        print(f"Calculated crop box (pixels): left={left}, top={top}, right={right}, bottom={bottom}")

        im = im.crop((left, top, right, bottom)) # defines crop points

    except Exception as e:
        print(f"Error cropping image: {e}")
        driver.quit()
        exit()

    # --- Save the Cropped Image ---
    output_path = os.path.join(script_dir, OUTPUT_FILE_NAME)
    print(f"Saving cropped image to: {output_path}")
    im.save(output_path) # saves new cropped image
    print("Screenshot saved successfully!")

except Exception as e:
    print(f"An error occurred during the process: {e}")

finally:
    # --- Close the Browser ---
    print("Closing browser.")
    driver.quit()
