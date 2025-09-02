import { describe, it, expect } from 'vitest'
import { parseContentIntoBlocks } from '@/lib/article/block-parser'

describe('Block Parser', () => {
  it('should parse simple content into blocks', () => {
    const html = `
      <p>This is a paragraph.</p>
      <h2>This is a heading</h2>
      <p>Another paragraph.</p>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(3)
    expect(result.blocks[0].type).toBe('content')
    expect(result.blocks[1].type).toBe('heading')
    expect(result.blocks[2].type).toBe('content')
  })

  it('should extract widget blocks', () => {
    const html = `
      <p>Before widget</p>
      <a href="#promocode?code=SAVE20&merchantId=123">
        Click here
      </a>
      <p>After widget</p>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(3)
    expect(result.blocks[0].type).toBe('content')
    expect(result.blocks[1].type).toBe('widget')
    expect(result.blocks[2].type).toBe('content')

    const widgetBlock = result.blocks[1]
    if (widgetBlock.type === 'widget') {
      expect(widgetBlock.config.type).toBe('promocode')
      // The widget config is parsed from URL params and stored as a generic object
      expect(widgetBlock.config).toMatchObject({
        type: 'promocode',
        code: 'SAVE20',
        merchantId: '123',
      })
    }
  })

  it('should extract images as blocks', () => {
    const html = `
      <p>Before image</p>
      <img src="/test.jpg" alt="Test" width="800" height="600" />
      <p>After image</p>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(3)
    expect(result.blocks[1].type).toBe('image')

    const imageBlock = result.blocks[1]
    if (imageBlock.type === 'image') {
      expect(imageBlock.src).toBe('/test.jpg')
      expect(imageBlock.alt).toBe('Test')
      expect(imageBlock.width).toBe(800)
      expect(imageBlock.height).toBe(600)
    }
  })

  it('should handle mixed content correctly', () => {
    const html = `
      <h1>Article Title</h1>
      <p>Introduction paragraph with <strong>bold text</strong>.</p>
      <a href="#promocode?code=DISCOUNT">Get discount</a>
      <h2>Section heading</h2>
      <img src="/hero.jpg" alt="Hero image" />
      <p>Final paragraph.</p>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.metadata.totalBlocks).toBe(6)
    expect(result.metadata.headingCount).toBe(2)
    expect(result.metadata.widgetCount).toBe(1)
    expect(result.metadata.imageCount).toBe(1)

    // Verify block order
    expect(result.blocks[0].type).toBe('heading')
    expect(result.blocks[1].type).toBe('content')
    expect(result.blocks[2].type).toBe('widget')
    expect(result.blocks[3].type).toBe('heading')
    expect(result.blocks[4].type).toBe('image')
    expect(result.blocks[5].type).toBe('content')
  })

  it('should preserve HTML structure in content blocks', () => {
    const html = `
      <div class="custom-class">
        <p>Paragraph in div</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
      </div>
    `

    const result = parseContentIntoBlocks(html)

    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0].type).toBe('content')

    const contentBlock = result.blocks[0]
    if (contentBlock.type === 'content') {
      expect(contentBlock.html).toContain('class="custom-class"')
      expect(contentBlock.html).toContain('<ul>')
      expect(contentBlock.html).toContain('<li>List item 1</li>')
    }
  })
})
