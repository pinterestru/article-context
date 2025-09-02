function parseChannels() {
  const items = document.querySelectorAll('.peer-item-box a.text-body')
  const result = []

  items.forEach((el) => {
    const link = el.getAttribute('href') // original link
    const username = link.split('channel/')[1].replace('@', '').replace('/', '') // extract @username

    const name = el.querySelector('.font-16.text-dark')?.textContent.trim()
    const desc = el.querySelector('.font-14.text-muted')?.textContent.trim() || null

    const subsText = el.querySelector('.font-12 b')?.textContent.trim() || '0'
    const subs = parseInt(subsText.replace(/\s+/g, ''), 10)

    const img = el.querySelector('img')?.getAttribute('src') || null
    const imgUrl = img ? (img.startsWith('//') ? 'https:' + img : img) : null

    if (username && imgUrl.startsWith('https://') && subs < 20000 && desc && !desc.includes('"')) {
      result.push({
        url: `https://t.me/${username}`,
        name,
        description: desc,
        subscriberCount: subs,
        avatar: imgUrl,
      })
    }
  })

  console.log('total:', items.length, 'added:', result.length)

  return JSON.stringify(result)
}
parseChannels()

function parseChannelsV2() {
  // Select all channel containers based on the new structure.
  const items = document.querySelectorAll('.card.peer-item-row')
  const result = []

  items.forEach((el) => {
    // Find the anchor tag that contains the channel link to extract the username.
    const linkElement = el.querySelector('a[href*="/channel/"]')
    if (!linkElement) return // Skip if the main link is not found

    const link = linkElement.getAttribute('href') // e.g., https://tgstat.ru/channel/@username/stat
    const usernameMatch = link.match(/@([^/]+)/)
    const username = usernameMatch ? usernameMatch[1] : null

    // Extract channel name.
    const name = el.querySelector('.font-16.text-dark')?.textContent.trim()

    // In the new structure, a direct description is not available.
    // This uses the channel's category as the description.
    const desc = el.querySelector('.font-12.text-dark span.border')?.textContent.trim() || null

    // Extract subscriber count text.
    const subsText = el.querySelector('.font-14.text-dark')?.textContent.trim() || '0'
    const subs = parseInt(subsText.replace(/\s+/g, ''), 10)

    // Extract avatar image URL.
    const img = el.querySelector('img.img-thumbnail')?.getAttribute('src') || null
    const imgUrl = img ? (img.startsWith('//') ? 'https:' + img : img) : null

    // Apply the same filtering logic as the original function.
    if (
      username &&
      imgUrl &&
      imgUrl.startsWith('https://') &&
      subs < 20000 &&
      desc &&
      !desc.includes('"')
    ) {
      result.push({
        url: `https://t.me/${username}`,
        name,
        description: desc,
        subscriberCount: subs,
        avatar: imgUrl,
      })
    }
  })

  console.log('total:', items.length, 'added:', result.length)

  return JSON.stringify(result) // Using indentation for readability
}
parseChannelsV2()
