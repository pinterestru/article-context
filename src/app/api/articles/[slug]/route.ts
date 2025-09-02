import { type NextRequest, NextResponse } from 'next/server'
import type { ApiResponse, Article } from '@/types/article'

// TODO: Replace this mock endpoint with real API integration

const mockArticles: Record<string, Article> = {
  'getting-started-with-nextjs': {
    id: '1',
    slug: 'getting-started-with-nextjs',
    title: 'Getting Started with Next.js',
    content: `
      <h2>Introduction</h2>
      <p>Next.js is a powerful React framework that enables you to build production-ready applications with ease. In this article, we'll explore the fundamentals of Next.js and how to get started.</p>
      
      <h2>Why Next.js?</h2>
      <p>Next.js provides many benefits out of the box:</p>
      <ul>
        <li>Server-side rendering (SSR)</li>
        <li>Static site generation (SSG)</li>
        <li>API routes</li>
        <li>Built-in optimizations</li>
        <li>TypeScript support</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>To create a new Next.js application, run the following command:</p>
      <pre><code>npx create-next-app@latest my-app</code></pre>
      
      <h2>Conclusion</h2>
      <p>Next.js is an excellent choice for building modern web applications. Its features and optimizations make it a go-to framework for React developers.</p>
    `,
    excerpt:
      'Learn the fundamentals of Next.js and how to build production-ready React applications.',
    author: 'John Doe',
    publishedAt: '2024-01-15T10:00:00Z',
    tags: ['nextjs', 'react', 'javascript', 'web-development'],
  },
  'typescript-best-practices': {
    id: '2',
    slug: 'typescript-best-practices',
    title: 'TypeScript Best Practices for 2024',
    content: `
      <h2>Introduction to TypeScript</h2>
      <p>TypeScript has become the standard for large-scale JavaScript applications. Let's explore the best practices for writing maintainable TypeScript code.</p>
      
      <h2>1. Use Strict Mode</h2>
      <p>Always enable strict mode in your tsconfig.json:</p>
      <pre><code>{
  "compilerOptions": {
    "strict": true
  }
}</code></pre>
      
      <h2>2. Avoid 'any' Type</h2>
      <p>The 'any' type defeats the purpose of TypeScript. Use specific types or 'unknown' when the type is truly unknown.</p>
      
      <h2>3. Leverage Type Inference</h2>
      <p>TypeScript is excellent at inferring types. Don't over-annotate when the compiler can figure it out.</p>
      
      <h2>Conclusion</h2>
      <p>Following these best practices will help you write more maintainable and type-safe code.</p>
    `,
    excerpt:
      'Discover the essential TypeScript best practices for writing maintainable and type-safe code in 2024.',
    author: 'Jane Smith',
    publishedAt: '2024-02-20T14:30:00Z',
    tags: ['typescript', 'javascript', 'best-practices', 'programming'],
  },
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Simulate network delay
  await delay(Math.random() * 1000 + 500)

  const { slug } = await params

  // Simulate random errors for testing
  const errorChance = Math.random()
  if (errorChance < 0.1) {
    // 10% chance of server error
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    )
  } else if (errorChance < 0.15) {
    // 5% chance of timeout (simulate by waiting longer than 3s)
    await delay(4000)
  }

  const article = mockArticles[slug]

  if (!article) {
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: `Article with slug "${slug}" not found`,
        },
      },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<Article>>({
    data: article,
    meta: {
      version: '1.0',
      timestamp: new Date().toISOString(),
    },
  })
}
