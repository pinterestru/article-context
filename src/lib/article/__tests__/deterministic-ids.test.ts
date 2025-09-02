import { describe, it, expect } from 'vitest'
import { parseContentIntoBlocks } from '../block-parser'

describe('Deterministic ID generation', () => {
  it('should generate the same IDs for the same content', () => {
    const html = `
      <h1>Test Heading</h1>
      <p>Some content here</p>
      <img src="/test.jpg" alt="Test image">
      <a href="#promocode_list?slug=test.com">Widget</a>
    `

    // Parse the same content multiple times
    const result1 = parseContentIntoBlocks(html)
    const result2 = parseContentIntoBlocks(html)
    const result3 = parseContentIntoBlocks(html)

    // Extract all IDs
    const ids1 = result1.blocks.map((block) => block.id)
    const ids2 = result2.blocks.map((block) => block.id)
    const ids3 = result3.blocks.map((block) => block.id)

    // IDs should be identical across all parses
    expect(ids1).toEqual(ids2)
    expect(ids2).toEqual(ids3)

    // Check specific ID format
    expect(ids1[0]).toMatch(/^heading-\d+-/)
    expect(ids1[1]).toMatch(/^content-\d+-/)
    expect(ids1[2]).toMatch(/^image-\d+-/)
    expect(ids1[3]).toMatch(/^widget-\d+-/)
  })

  it('should generate different IDs for different content', () => {
    const html1 = '<p>Content 1</p>'
    const html2 = '<p>Content 2</p>'

    const result1 = parseContentIntoBlocks(html1)
    const result2 = parseContentIntoBlocks(html2)

    expect(result1.blocks[0].id).not.toEqual(result2.blocks[0].id)
  })
})
