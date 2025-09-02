import { describe, it, expect } from 'vitest'
import { parseContentIntoBlocks } from '../block-parser'

describe('Hash-based widget parsing', () => {
  it('should parse hash-based widget links', () => {
    const html = `
      <p>Check out these promocodes:</p>
      <a href="#promocode_list?slug=umschool.net">промокоды</a>
      <p>More content here</p>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(3)
    expect(result.metadata.widgetCount).toBe(1)

    // Check the widget block
    const widgetBlock = result.blocks[1]
    expect(widgetBlock.type).toBe('widget')
    if (widgetBlock.type === 'widget') {
      expect(widgetBlock.config.type).toBe('promocode_list')
      expect(widgetBlock.config).toHaveProperty('slug', 'umschool.net')
    }
  })

  it('should parse multiple query parameters', () => {
    const html = `
      <a href="#promocode_list?slug=example.com&count=5&layout=grid">Show promocodes</a>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(1)
    const widgetBlock = result.blocks[0]

    if (widgetBlock.type === 'widget') {
      expect(widgetBlock.config.type).toBe('promocode_list')
      expect(widgetBlock.config).toMatchObject({
        slug: 'example.com',
        count: '5',
        layout: 'grid',
      })
    }
  })

  it('should still support data-action widgets', () => {
    const html = `
      <a data-action="promocode_list" data-param-slug="oldformat.com">Old format</a>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(1)
    const widgetBlock = result.blocks[0]

    if (widgetBlock.type === 'widget') {
      expect(widgetBlock.config.type).toBe('promocode_list')
      expect(widgetBlock.config).toHaveProperty('slug', 'oldformat.com')
    }
  })

  it('should handle hash links without parameters', () => {
    const html = `
      <a href="#promocode_list">Simple widget</a>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(1)
    const widgetBlock = result.blocks[0]

    if (widgetBlock.type === 'widget') {
      expect(widgetBlock.config.type).toBe('promocode_list')
      // Should not have any additional properties besides type
      expect(Object.keys(widgetBlock.config)).toEqual(['type'])
    }
  })

  it('should not parse regular anchor links as widgets', () => {
    const html = `
      <a href="#section-1">Go to section</a>
      <a href="https://example.com">External link</a>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0].type).toBe('content')
    expect(result.metadata.widgetCount).toBe(0)
  })
})
