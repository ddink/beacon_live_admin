import { test, expect } from "../../test-fixtures"
import { syncLV } from "../../utils"
import { dragTo, getDragButton, startDragging, verifyOrder } from "./helpers"

const siteName = "site_a"
const pagePath = "/drag-n-drop"

// The drag button is below the dragged element, so when dragging vertically,
// it means the cursor will be lower than the expected drop position
const dragButtonBottomPosition = 50

test.use({ scenario: "drag_n_drop" })

/*
    Instead of all these steps, we could also go to the edit page directly,
    but it now works with id instead of path which makes it less user friendly
    or making sense whether we're editing the expected page. Path should be unique.
    => await page.goto(`/admin/${siteName}/pages/c10358fe-ba05-4f47-b1b7-d5e52d3c1571?editor=visual`);
*/
test.beforeEach(async ({ page }) => {
  await page.goto(`/admin/${siteName}/pages`)
  await syncLV(page)
  await page.getByRole("searchbox").fill("drag-n-drop")
  // note: it navigates when clicking the td's, not the tr
  await page.getByRole("cell", { name: pagePath, exact: true }).click()
  // Switch to visual editor
  await page.getByRole("button", { name: "Visual Editor" }).click()
})

// Note: while dragging, only the element clones are visible.
// On drop, the clones get removed and the original elements will be visible again
test("It shows clones and placeholder for initiated drop location", async ({ page }) => {
  await syncLV(page)

  const firstItem = page.getByTestId("margin-row-item-1")
  const dragButton = getDragButton(page)

  await firstItem.click()
  await expect(firstItem).toHaveAttribute("data-selected", "true")
  await expect(dragButton).toBeVisible()

  await startDragging(page)

  // Verify that it hides origin elements and shows clones
  await expect(page.getByTestId("margin-row-item-1").and(page.locator(':not([data-is-clone="true"])'))).toBeHidden()
  await expect(page.getByTestId("margin-row-item-2").and(page.locator(':not([data-is-clone="true"])'))).toBeHidden()
  await expect(page.getByTestId("margin-row-item-3").and(page.locator(':not([data-is-clone="true"])'))).toBeHidden()
  await expect(page.getByTestId("margin-row-item-4").and(page.locator(':not([data-is-clone="true"])'))).toBeHidden()
  await expect(page.getByTestId("margin-row-item-5").and(page.locator(':not([data-is-clone="true"])'))).toBeHidden()
  await expect(page.locator('[data-is-clone="true"]')).toHaveCount(5)

  // Move mouse for dragging before it shows placeholder
  await dragTo(page, "margin-row-item-2")

  // Shows placeholder for the currently dragged element
  await expect(page.getByTestId("drag-placeholder")).toBeVisible()

  await page.mouse.up()
})

test("Reordering (horizontally with margin)", async ({ page }) => {
  await syncLV(page)

  const source = page.getByTestId("margin-row-item-1")
  const dragButton = getDragButton(page)

  await verifyOrder(page, "[data-testid^=margin-row-item-]", [
    "margin-row-item-1",
    "margin-row-item-2",
    "margin-row-item-3",
    "margin-row-item-4",
    "margin-row-item-5",
  ])

  await source.click()
  await expect(source).toHaveAttribute("data-selected", "true")
  await expect(dragButton).toBeVisible()
  await expect(dragButton.locator("span")).toHaveClass("hero-arrows-right-left")

  await startDragging(page)
  await dragTo(page, "margin-row-item-3")
  await page.mouse.up()

  await verifyOrder(page, "[data-testid^=margin-row-item-]", [
    "margin-row-item-2",
    "margin-row-item-3",
    "margin-row-item-1",
    "margin-row-item-4",
    "margin-row-item-5",
  ])
})

test("Reordering (vertically with margin)", async ({ page }) => {
  await syncLV(page)

  const source = page.getByTestId("margin-col-item-1")
  const dragButton = getDragButton(page)

  await verifyOrder(page, "[data-testid^=margin-col-item-]", [
    "margin-col-item-1",
    "margin-col-item-2",
    "margin-col-item-3",
    "margin-col-item-4",
    "margin-col-item-5",
  ])

  await source.click()
  await expect(source).toHaveAttribute("data-selected", "true")
  await expect(dragButton).toBeVisible()
  await expect(dragButton.locator("span")).toHaveClass("hero-arrows-up-down")

  await startDragging(page)
  await dragTo(
    page,
    "margin-col-item-3",
    // xPosition in target, use default
    undefined,
    // yPosition in target, add button position threshold
    (y, targetHeight) => y + targetHeight / 2 + dragButtonBottomPosition,
  )
  await page.mouse.up()

  await verifyOrder(page, "[data-testid^=margin-col-item-]", [
    "margin-col-item-2",
    "margin-col-item-3",
    "margin-col-item-1",
    "margin-col-item-4",
    "margin-col-item-5",
  ])
})

test("Reordering (grid, horizontally and vertically)", async ({ page }) => {
  await syncLV(page)

  const source = page.getByTestId("grid-item-1")
  const dragButton = getDragButton(page)

  await verifyOrder(page, "[data-testid^=grid-item-]", [
    "grid-item-1",
    "grid-item-2",
    "grid-item-3",
    "grid-item-4",
    "grid-item-5",
    "grid-item-6",
  ])

  await source.click()
  await expect(source).toHaveAttribute("data-selected", "true")
  await expect(dragButton).toBeVisible()
  await expect(dragButton.locator("span")).toHaveClass("hero-arrows-pointing-out")

  await startDragging(page)
  await dragTo(
    page,
    "grid-item-4",
    // xPosition in target, use default
    undefined,
    // yPosition in target, add button position threshold
    (y, targetHeight) => y + targetHeight / 2 + dragButtonBottomPosition,
  )
  await page.mouse.up()

  await verifyOrder(page, "[data-testid^=grid-item-]", [
    "grid-item-2",
    "grid-item-3",
    "grid-item-4",
    "grid-item-1",
    "grid-item-5",
    "grid-item-6",
  ])
})

test("Persistence on save", async ({ page }) => {
  await syncLV(page)

  const source = page.getByTestId("margin-row-item-1")
  const dragButton = getDragButton(page)

  await verifyOrder(page, "[data-testid^=margin-row-item-]", [
    "margin-row-item-1",
    "margin-row-item-2",
    "margin-row-item-3",
    "margin-row-item-4",
    "margin-row-item-5",
  ])

  await source.click()
  await expect(source).toHaveAttribute("data-selected", "true")
  await expect(dragButton).toBeVisible()

  await startDragging(page)
  await dragTo(page, "margin-row-item-3")
  await page.mouse.up()

  const newOrder = [
    "margin-row-item-2",
    "margin-row-item-3",
    "margin-row-item-1",
    "margin-row-item-4",
    "margin-row-item-5",
  ]

  await verifyOrder(page, "[data-testid^=margin-row-item-]", newOrder)

  await page.getByRole("button", { name: "Save Changes" }).click()
  await expect(page.locator('[id="flash"]')).toContainText("Page saved successfully")

  // Reload page and switch back to visual editor
  await page.reload()
  await syncLV(page)
  await page.getByRole("button", { name: "Visual Editor" }).click()

  await verifyOrder(page, "[data-testid^=margin-row-item-]", newOrder)
})
