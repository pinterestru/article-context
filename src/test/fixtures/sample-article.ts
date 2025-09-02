export const sampleArticle = {
  id: 'sample-1',
  slug: 'complete-guide-to-web-development',
  title: 'The Complete Guide to Modern Web Development',
  excerpt:
    'A comprehensive overview of modern web development tools, frameworks, and best practices for building scalable applications.',
  author: 'Jane Developer',
  publishedAt: '2024-01-15T10:00:00Z',
  tags: ['web development', 'javascript', 'react', 'tutorial'],
  content: `
    <p>Welcome to this comprehensive guide on modern web development. In this article, we'll explore the essential tools, frameworks, and practices that define web development in 2024.</p>
    
    <h2 id="introduction">Introduction</h2>
    <p>The landscape of web development has evolved significantly over the past decade. What was once a simple practice of writing HTML, CSS, and JavaScript has transformed into a complex ecosystem of frameworks, build tools, and deployment strategies.</p>
    
    <blockquote>
      <p>"The best way to predict the future is to invent it." - Alan Kay</p>
    </blockquote>
    
    <h2 id="core-technologies">Core Technologies</h2>
    <p>Let's start with the fundamental technologies that power the modern web:</p>
    
    <h3 id="html5">HTML5 and Semantic Markup</h3>
    <p>HTML5 introduced numerous semantic elements that help structure content meaningfully. Elements like <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;footer&gt;</code> provide clear content structure.</p>
    
    <pre><code>&lt;article&gt;
  &lt;header&gt;
    &lt;h1&gt;Article Title&lt;/h1&gt;
    &lt;time datetime="2024-01-15"&gt;January 15, 2024&lt;/time&gt;
  &lt;/header&gt;
  &lt;section&gt;
    &lt;p&gt;Article content...&lt;/p&gt;
  &lt;/section&gt;
&lt;/article&gt;</code></pre>
    
    <h3 id="css3">CSS3 and Modern Styling</h3>
    <p>CSS has evolved to include powerful features like Grid, Flexbox, and Custom Properties. These tools enable developers to create complex layouts with minimal code.</p>
    
    <ul>
      <li><strong>Flexbox</strong>: One-dimensional layout method</li>
      <li><strong>CSS Grid</strong>: Two-dimensional layout system</li>
      <li><strong>Custom Properties</strong>: Dynamic CSS variables</li>
      <li><strong>Container Queries</strong>: Responsive design based on container size</li>
    </ul>
    
    <h3 id="javascript">JavaScript and ES6+</h3>
    <p>Modern JavaScript (ECMAScript 2015 and beyond) has introduced features that make the language more powerful and developer-friendly:</p>
    
    <ol>
      <li>Arrow functions for concise syntax</li>
      <li>Destructuring for easier data extraction</li>
      <li>Async/await for handling asynchronous operations</li>
      <li>Modules for better code organization</li>
      <li>Template literals for string interpolation</li>
    </ol>
    
    <h2 id="frameworks">Popular Frameworks and Libraries</h2>
    <p>The modern web development ecosystem includes numerous frameworks and libraries. Here's an overview of the most popular ones:</p>
    
    <img src="https://picsum.photos/800/400" alt="Modern web frameworks comparison chart" width="800" height="400" />
    
    <h3 id="react">React</h3>
    <p>React, developed by Facebook, is a component-based library for building user interfaces. Its virtual DOM and declarative approach have made it incredibly popular.</p>
    
    <h3 id="vue">Vue.js</h3>
    <p>Vue.js offers a progressive framework that's easy to adopt incrementally. It combines the best features of React and Angular.</p>
    
    <h3 id="angular">Angular</h3>
    <p>Angular, maintained by Google, is a full-featured framework that includes everything needed for large-scale applications.</p>
    
    <h2 id="best-practices">Best Practices</h2>
    <p>Following best practices ensures your code is maintainable, scalable, and performant:</p>
    
    <h3 id="performance">Performance Optimization</h3>
    <p>Performance is crucial for user experience and SEO. Key strategies include:</p>
    
    <ul>
      <li>Lazy loading images and components</li>
      <li>Code splitting and dynamic imports</li>
      <li>Minification and compression</li>
      <li>Caching strategies</li>
      <li>Optimizing critical rendering path</li>
    </ul>
    
    <img src="https://picsum.photos/600/300" alt="Performance optimization techniques" width="600" height="300" />
    
    <h3 id="accessibility">Accessibility</h3>
    <p>Building accessible websites ensures everyone can use your application:</p>
    
    <blockquote>
      <p>"The power of the Web is in its universality. Access by everyone regardless of disability is an essential aspect." - Tim Berners-Lee</p>
    </blockquote>
    
    <h3 id="security">Security Considerations</h3>
    <p>Security should be a priority from the start. Common security practices include:</p>
    
    <ol>
      <li>Input validation and sanitization</li>
      <li>HTTPS everywhere</li>
      <li>Content Security Policy (CSP)</li>
      <li>Regular dependency updates</li>
      <li>Secure authentication and authorization</li>
    </ol>
    
    <h2 id="tools">Development Tools</h2>
    <p>Modern development relies on various tools to improve productivity:</p>
    
    <h3 id="version-control">Version Control with Git</h3>
    <p>Git is essential for tracking changes and collaborating with teams. Platforms like GitHub, GitLab, and Bitbucket provide additional features for code review and CI/CD.</p>
    
    <h3 id="build-tools">Build Tools and Bundlers</h3>
    <p>Tools like Webpack, Vite, and Parcel help bundle and optimize your code for production:</p>
    
    <pre><code>// vite.config.js
export default {
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true
  }
}</code></pre>
    
    <h3 id="testing">Testing Frameworks</h3>
    <p>Testing ensures your code works as expected. Popular testing frameworks include:</p>
    
    <ul>
      <li><strong>Jest</strong>: JavaScript testing framework</li>
      <li><strong>React Testing Library</strong>: Testing React components</li>
      <li><strong>Cypress</strong>: End-to-end testing</li>
      <li><strong>Playwright</strong>: Cross-browser testing</li>
    </ul>
    
    <h2 id="deployment">Deployment and Hosting</h2>
    <p>Modern deployment options have made it easier than ever to get your application online:</p>
    
    <img src="https://picsum.photos/700/350" alt="Cloud deployment options" width="700" height="350" />
    
    <h3 id="platforms">Popular Platforms</h3>
    <p>Several platforms offer easy deployment for web applications:</p>
    
    <ol>
      <li><strong>Vercel</strong>: Optimized for Next.js and frontend frameworks</li>
      <li><strong>Netlify</strong>: Great for static sites and JAMstack</li>
      <li><strong>AWS</strong>: Comprehensive cloud services</li>
      <li><strong>Google Cloud Platform</strong>: Scalable infrastructure</li>
      <li><strong>Heroku</strong>: Simple deployment for various languages</li>
    </ol>
    
    <h2 id="future">The Future of Web Development</h2>
    <p>As we look ahead, several trends are shaping the future of web development:</p>
    
    <h3 id="emerging-tech">Emerging Technologies</h3>
    <ul>
      <li>WebAssembly for high-performance applications</li>
      <li>Progressive Web Apps (PWAs) for app-like experiences</li>
      <li>AI and machine learning integration</li>
      <li>Web3 and blockchain technologies</li>
      <li>Edge computing and serverless architectures</li>
    </ul>
    
    <h2 id="conclusion">Conclusion</h2>
    <p>Web development continues to evolve at a rapid pace. By understanding the core technologies, following best practices, and staying updated with the latest trends, you can build modern, scalable, and user-friendly web applications.</p>
    
    <p>Remember, the key to success in web development is continuous learning and adaptation. The tools and frameworks may change, but the fundamental principles of creating great user experiences remain constant.</p>
    
    <p><a href="#introduction">Back to top</a></p>
  `,
}
