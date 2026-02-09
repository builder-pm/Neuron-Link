import { test, expect } from '@playwright/test';

test.describe('NeuronLink Smoke Test', () => {
  test('Full Flow: Connect -> Model -> Analyze -> Chat', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('/');

    // 2. Handle AuthModal: Continue as Guest
    const guestButton = page.getByRole('button', { name: /Continue as Guest/i });
    await expect(guestButton).toBeVisible();
    await guestButton.click();

    // 3. Handle DbCredentialsModal: Save & Connect
    // The modal should open automatically.
    const saveButton = page.getByRole('button', { name: /Save & Connect/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // 4. Verify Modeling view is active and tables are loaded
    // We wait for the 'Structure' tab to be active in the right panel
    await expect(page.getByRole('tab', { name: /Structure/i })).toBeVisible();
    
    // Wait for a table to appear in the list. 'actor' is a common table in dvdrental.
    const actorTable = page.locator('details').filter({ hasText: 'actor' });
    await expect(actorTable).toBeVisible({ timeout: 30000 });

    // 5. Select a table and configure a field
    // Click the checkbox for the actor table
    await actorTable.locator('input[type="checkbox"]').first().click();
    
    // Click a field checkbox (e.g., 'first_name')
    const firstNameField = actorTable.locator('label').filter({ hasText: 'first_name' });
    await expect(firstNameField).toBeVisible();
    await firstNameField.locator('input[type="checkbox"]').click();

    // 6. Switch to Analysis view via Header toggle
    // The button has title "Back to Table View" when in modeling view
    const analysisToggle = page.getByTitle('Back to Table View');
    await expect(analysisToggle).toBeVisible();
    await analysisToggle.click();

    // Verify we are in Analysis view (Sidebar with 'Data Fields' or 'Metrics' should be visible)
    await expect(page.getByText(/Data Fields/i)).toBeVisible();

    // 7. AI Chat Smoke Test
    // Switch to Chat tab in the sidebar
    const chatTab = page.getByRole('button', { name: /Chat/i });
    await expect(chatTab).toBeVisible();
    await chatTab.click();

    // Verify AI Chat is visible (if not locked for guests)
    // For smoke testing, we'll try to input a message. 
    // If it's locked, we might need to handle it or bypass it.
    const chatInput = page.getByLabel('Chat input');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Create a metric for total sales');
      await page.keyboard.press('Enter');

      // Wait for AI response (log container should have messages)
      const chatLog = page.getByRole('log');
      await expect(chatLog).toBeVisible();
      
      // We wait for the model's response. The first message is user, second is model.
      // We use a longer timeout for AI responses
      await expect(chatLog.getByText(/total sales/i)).toHaveCount(2, { timeout: 30000 });
    } else {
      // If locked, we at least verify the lock message
      await expect(page.getByText(/AI Access Restricted/i)).toBeVisible();
    }
  });
});
