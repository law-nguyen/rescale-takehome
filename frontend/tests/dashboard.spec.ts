import { test, expect, Page, request } from '@playwright/test'

const JOB_NAME = `TEST ${Date.now()}`

async function createJob(page: Page, name: string): Promise<void> {
  await page.fill('input.job-input', name)
  await page.click('button.btn-submit')
}


test.describe('HPC Job Dashboard', () => {
 
  // ensure that each test waits for the jobs to load properly before starting
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.job-list')
  })

  // clean up the created job after each test
  test.afterEach(async () => {
    const api = await request.newContext()
    const res = await api.get('http://localhost:8000/api/jobs/')
    const data = await res.json()
    const job = data.results.find((j: any) => j.name === JOB_NAME)
    if (job) {
      await api.delete(`http://localhost:8000/api/jobs/${job.id}/`)
    }
  })

  test('creates a new job', async ({ page }) => {
    await createJob(page, JOB_NAME)
    const row = await page.locator('.job-row', { hasText: JOB_NAME })
    await expect(row).toBeVisible()
    await expect(row.locator('.status-label')).toHaveText('Pending')
  })

  test('enforces unqiue naming', async({page}) => {
    // redo the first test
    await createJob(page, JOB_NAME)
    const row = await page.locator('.job-row', { hasText: JOB_NAME })
    await expect(row).toBeVisible()

    // try to create another, and it should give me an error modal
    await page.fill('input.job-input', JOB_NAME)
    await page.click('button.btn-submit')
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.locator('.modal-body')).toContainText('already exists')
  })

  test('updates the test status', async({page}) => {
    // create a test
    await createJob(page, JOB_NAME)
    const row = await page.locator('.job-row', { hasText: JOB_NAME })
    await expect(row).toBeVisible()

    // click the dropdown, click a new status, should see that the dropdown status has changed
    await row.locator('.status-badge').click()
    await expect(page.locator('.status-dropdown')).toBeVisible()
    await page.locator('.dropdown-item', { hasText: 'Completed' }).click()
    await expect(page.locator('.status-dropdown')).not.toBeVisible()
    await expect(row.locator('.status-label')).toHaveText('Completed')
  })

  test('deletes a tests', async({page}) => {
    // create a test
    await createJob(page, JOB_NAME)
    const row = await page.locator('.job-row', { hasText: JOB_NAME })
    await expect(row).toBeVisible()

    // click that job's delete button, a confirmation modal should appear for that specific job
    await row.locator('.delete-btn').click()
    await expect(page.locator('.modal')).toBeVisible()
    const modal = page.locator('.modal')
    await expect(modal.locator('.modal-title')).toHaveText('Delete job?')
    await expect(modal.locator('.modal-body')).toContainText(JOB_NAME)

    // clicking delete should close the modal and remove the row from the page
    await modal.locator('.btn-danger').click()
    await expect(modal).not.toBeVisible()
    await expect(page.locator('.job-row', { hasText: JOB_NAME })).not.toBeVisible()
  })
})