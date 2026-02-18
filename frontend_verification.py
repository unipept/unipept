from playwright.sync_api import sync_playwright, expect
import os

def test_file_import_wizard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Increase timeout
        page.set_default_timeout(120000)

        print("Navigating to /mpa...")
        # Navigate to Metaproteomics Analysis
        try:
            page.goto("http://localhost:3000/mpa", timeout=120000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            page.reload()

        print("Waiting for network idle...")
        page.wait_for_load_state("networkidle", timeout=120000)

        print("Page loaded.")

        # Look for "Create new project" button
        print("Looking for 'Create new project' button...")
        try:
            page.get_by_role("button", name="Create new project").click()
        except Exception as e:
            print(f"Could not find 'Create new project': {e}")
            page.wait_for_timeout(2000)
            page.get_by_role("button", name="Create new project").click()

        print("Dialog should be open. Entering project name...")
        # Assume dialog is open
        page.get_by_label("Project name").fill("Test Project")

        # Click "Create project"
        try:
            page.get_by_role("button", name="Create project").click()
        except:
            page.get_by_role("button", name="Create").click()

        print("Project created/started.")

        # Now we should be on /mpa/result/single (mpaSingle)
        # Wait for potential animation or dialog
        page.wait_for_timeout(2000)

        try:
            print("Looking for 'Add sample group'...")
            page.get_by_role("button", name="Add sample group").click()
        except:
            # Maybe "Add group"
            try:
                page.get_by_role("button", name="Add group").click()
            except:
                print("Could not find 'Add group' button. Maybe already open?")
                pass

        # Wait for ManageSampleGroupDialog
        page.wait_for_timeout(1000)

        # Click "Add new sample" inside the dialog
        print("Clicking 'Add new sample' in dialog...")
        try:
            page.get_by_role("dialog").get_by_role("button", name="Add new sample").click()
        except Exception as e:
             print(f"Could not find button in dialog: {e}")
             # Fallback
             page.locator("v-dialog").get_by_text("Add new sample").click()

        # Now AddSampleStepper is shown.
        # Select "Import via File Wizard"
        print("Selecting 'Import via File Wizard'...")
        page.get_by_text("Import via File Wizard").click()

        # Step 2: Upload file.
        # Find file input.
        file_path = os.path.abspath("test_peptides.csv")

        print(f"Uploading file {file_path}...")

        # Handle file chooser
        page.locator("input[type='file']").set_input_files(file_path)

        # Click "Upload file"
        print("Clicking 'Upload file'...")
        page.get_by_role("button", name="Upload file").click()

        # Step 3: ColumnFileImport wizard.
        print("Checking for 'FDR column'...")
        # Check for "FDR column" text.
        expect(page.get_by_text("FDR column")).to_be_visible()

        # Select FDR column.
        print("Selecting FDR column...")
        fdr_col = page.locator(".v-col-md-4").filter(has_text="FDR column")
        fdr_select = fdr_col.locator(".v-select").first
        fdr_select.click()

        # Select "FDR" from dropdown
        print("Selecting 'FDR' option...")
        try:
            page.get_by_role("listbox").get_by_text("FDR", exact=True).click()
        except:
             page.get_by_text("FDR", exact=True).click()

        # Check FDR Threshold dropdown
        print("Checking for FDR Threshold dropdown...")
        page.wait_for_timeout(500)

        # The dropdown label is "FDR Threshold"
        # We can find the select and click it.
        # It's likely the second select in the column (first is column selector).
        fdr_threshold_select = fdr_col.locator(".v-select").nth(1)
        fdr_threshold_select.click()

        # Check for options
        print("Checking options...")
        # Use exact=True to avoid partial matching (e.g. 1% matching 0.1%)
        expect(page.get_by_text("5% FDR", exact=True)).to_be_visible()
        expect(page.get_by_text("1% FDR", exact=True)).to_be_visible()
        expect(page.get_by_text("0.1% FDR", exact=True)).to_be_visible()
        expect(page.get_by_text("Other", exact=True)).to_be_visible()

        # Select "Other"
        page.get_by_text("Other", exact=True).click()

        # Check for custom input
        print("Checking for custom input...")
        # The label is "Custom FDR Threshold"
        custom_input = page.get_by_label("Custom FDR Threshold")
        expect(custom_input).to_be_visible()

        # Check row count text
        print("Checking for row count text...")
        # "xxx rows will be imported"
        # Using a regex or partial text
        expect(page.get_by_text("rows will be imported")).to_be_visible()

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification.png")

        browser.close()

if __name__ == "__main__":
    test_file_import_wizard()
